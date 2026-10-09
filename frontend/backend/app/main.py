from pathlib import Path
from datetime import datetime, timezone, timedelta
import ipaddress
import json
import re
import socket
from urllib.parse import urljoin, urlparse
import joblib
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

from google import genai
# =========================================================
# APP
# =========================================================
app = FastAPI(title="FactShield AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# =========================================================
# PATHS
# =========================================================
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "ml_model" / "fake_news_model.pkl"
VECTORIZER_PATH = BASE_DIR / "ml_model" / "tfidf_vectorizer.pkl"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
PREDICTIONS_FILE = DATA_DIR / "predictions.json"
VERIFICATIONS_FILE = DATA_DIR / "verifications.json"
ACTIVITY_FILE = DATA_DIR / "activity.json"
# =========================================================
# JSON STORAGE
# =========================================================
def load_json_list(file_path: Path):
    if not file_path.exists():
        return []
    try:
        with file_path.open("r", encoding="utf-8") as file:
            data = json.load(file)
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []
def save_json_list(file_path: Path, data):
    try:
        with file_path.open("w", encoding="utf-8") as file:
            json.dump(
                data,
                file,
                indent=2,
                ensure_ascii=False
            )
    except OSError as error:
        print(f"Could not save {file_path}: {error}")
predictions_db = load_json_list(PREDICTIONS_FILE)
verifications_db = load_json_list(VERIFICATIONS_FILE)
activity_db = load_json_list(ACTIVITY_FILE)
# =========================================================
# MACHINE LEARNING MODEL
# =========================================================
print("Loading Fake News Detection model...")
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)
print("Fake News Detection model loaded successfully.")
# =========================================================
# GEMINI SUMMARIZATION (keeps the backend lightweight)
# =========================================================

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")


def generate_summary(article_text: str) -> str:
    """Generate a concise summary using Gemini instead of loading a local LLM."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Summarization is not configured: GEMINI_API_KEY is missing.",
        )

    # Limit input length to control latency and API usage on the free backend.
    bounded_text = article_text[:12000]
    prompt = (
        "Summarize the following news article in 3-5 concise sentences. "
        "Preserve the article's key claims and important details. "
        "Do not add facts that are not in the article. If the text is uncertain, "
        "keep that uncertainty in the summary. Return only the summary.\n\n"
        f"ARTICLE:\n{bounded_text}"
    )

    client = genai.Client(api_key=api_key)
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        summary = (response.text or "").strip()
        if not summary:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty summary. Please try again.",
            )
        return summary
    except HTTPException:
        raise
    except Exception as error:
        # Keep detailed provider errors in Render logs, not in the public response.
        print(f"Gemini summarization error: {error}")
        raise HTTPException(
            status_code=502,
            detail="Summary generation failed. Check the backend logs and try again.",
        ) from error
    finally:
        client.close()


# =========================================================
# TEXT CLEANING
# =========================================================
def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(
        r"http\S+|www\S+|https\S+",
        " ",
        text
    )
    text = re.sub(
        r"[^a-zA-Z\s]",
        " ",
        text
    )
    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()
    return text
# =========================================================
# ACTIVITY LOGGER
# =========================================================
def add_activity(action: str, details: str):
    activity_db.append(
        {
            "action": action,
            "details": details,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    )
    if len(activity_db) > 100:
        del activity_db[:-100]
    save_json_list(
        ACTIVITY_FILE,
        activity_db
    )
# =========================================================
# ID GENERATOR
# =========================================================
def get_next_id(records):
    if not records:
        return 1
    return max(
        int(item.get("id", 0))
        for item in records
    ) + 1
# =========================================================
# KEYWORDS
# =========================================================
def extract_keywords(features, top_n=8):
    try:
        feature_names = vectorizer.get_feature_names_out()
        row = features.tocoo()
        coefficients = model.coef_[0]
        scored = []
        for feature_index, value in zip(
            row.col,
            row.data
        ):
            contribution = float(
                value * coefficients[feature_index]
            )
            scored.append(
                {
                    "word": str(
                        feature_names[feature_index]
                    ),
                    "influence": contribution
                }
            )
        scored.sort(
            key=lambda item: abs(item["influence"]),
            reverse=True
        )
        return scored[:top_n]
    except Exception as error:
        print(f"Keyword extraction error: {error}")
        return []
# =========================================================
# URL SECURITY
# =========================================================
def is_safe_public_url(url: str) -> bool:
    """
    Only allow HTTP/HTTPS URLs pointing to public internet
    addresses. This prevents the deployed API from fetching
    localhost/private network resources.
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"}:
            return False
        hostname = parsed.hostname
        if not hostname:
            return False
        # Direct IP address
        try:
            address = ipaddress.ip_address(hostname)
            if (
                address.is_private
                or address.is_loopback
                or address.is_link_local
                or address.is_multicast
                or address.is_reserved
            ):
                return False
            return True
        except ValueError:
            # Normal domain name
            pass
        resolved_addresses = socket.getaddrinfo(
            hostname,
            None
        )
        for result in resolved_addresses:
            resolved_ip = result[4][0]
            try:
                address = ipaddress.ip_address(resolved_ip)
                if (
                    address.is_private
                    or address.is_loopback
                    or address.is_link_local
                    or address.is_multicast
                    or address.is_reserved
                ):
                    return False
            except ValueError:
                return False
        return True
    except Exception:
        return False
# =========================================================
# WEBPAGE EXTRACTION
# =========================================================
def extract_article_from_html(html: str):
    soup = BeautifulSoup(
        html,
        "html.parser"
    )
    # Remove non-content elements
    for tag in soup([
        "script",
        "style",
        "noscript",
        "nav",
        "footer",
        "header",
        "form",
        "aside",
        "svg",
        "iframe"
    ]):
        tag.decompose()
    title = ""
    if soup.title:
        title = soup.title.get_text(
            " ",
            strip=True
        )
    # Prefer <article>
    article = soup.find("article")
    if article:
        article_text = article.get_text(
            " ",
            strip=True
        )
        if len(article_text) >= 200:
            return title, article_text
    # Fallback: collect meaningful paragraphs
    paragraphs = []
    for paragraph in soup.find_all("p"):
        text = paragraph.get_text(
            " ",
            strip=True
        )
        text = re.sub(
            r"\s+",
            " ",
            text
        ).strip()
        if len(text) >= 30:
            paragraphs.append(text)
    # Remove duplicate paragraphs
    unique_paragraphs = []
    for paragraph in paragraphs:
        if paragraph not in unique_paragraphs:
            unique_paragraphs.append(paragraph)
    article_text = " ".join(
        unique_paragraphs
    )
    return title, article_text
def fetch_article(url: str):
    """
    Fetch a public webpage and extract readable article text.
    Follows a small number of redirects while re-validating
    every destination.
    """
    current_url = url
    max_redirects = 3
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/140 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml"
    }
    session = requests.Session()
    for _ in range(max_redirects + 1):
        if not is_safe_public_url(current_url):
            raise ValueError(
                "The provided URL is not a valid public webpage."
            )
        response = session.get(
            current_url,
            headers=headers,
            timeout=15,
            allow_redirects=False
        )
        # Handle redirects manually
        if response.status_code in {
            301,
            302,
            303,
            307,
            308
        }:
            location = response.headers.get(
                "Location"
            )
            if not location:
                raise ValueError(
                    "The webpage returned an invalid redirect."
                )
            current_url = urljoin(
                current_url,
                location
            )
            continue
        response.raise_for_status()
        content_type = (
            response.headers.get(
                "content-type",
                ""
            ).lower()
        )
        if (
            "text/html" not in content_type
            and "application/xhtml+xml" not in content_type
        ):
            raise ValueError(
                "The provided URL does not point to an HTML webpage."
            )
        # Prevent unnecessarily large downloads
        content_length = response.headers.get(
            "content-length"
        )
        if content_length:
            try:
                if int(content_length) > 2_000_000:
                    raise ValueError(
                        "The webpage is too large to process."
                    )
            except ValueError:
                pass
        if len(response.content) > 2_000_000:
            raise ValueError(
                "The webpage is too large to process."
            )
        encoding = (
            response.encoding
            or response.apparent_encoding
            or "utf-8"
        )
        html = response.content.decode(
            encoding,
            errors="ignore"
        )
        title, article_text = extract_article_from_html(
            html
        )
        if len(article_text.split()) < 30:
            raise ValueError(
                "Could not extract enough readable article text "
                "from this webpage."
            )
        return {
            "final_url": current_url,
            "title": title,
            "text": article_text
        }
    raise ValueError(
        "Too many webpage redirects."
    )
# =========================================================
# PREDICTION HELPER
# =========================================================
def run_prediction(news_text: str):
    cleaned_text = clean_text(news_text)
    if not cleaned_text:
        return {
            "prediction": "UNKNOWN",
            "confidence": 0.0,
            "fake_probability": 0.0,
            "real_probability": 0.0,
            "explanation": (
                "The submitted text does not contain enough "
                "usable text."
            ),
            "keywords": []
        }
    features = vectorizer.transform(
        [cleaned_text]
    )
    prediction_value = int(
        model.predict(features)[0]
    )
    probabilities = model.predict_proba(
        features
    )[0]
    fake_probability = float(
        probabilities[0]
    )
    real_probability = float(
        probabilities[1]
    )
    if prediction_value == 0:
        prediction = "FAKE"
        confidence = fake_probability
        explanation = (
            "The machine learning model identified patterns in "
            "the article that are more similar to the fake-news "
            "examples used during training."
        )
    else:
        prediction = "REAL"
        confidence = real_probability
        explanation = (
            "The machine learning model identified patterns in "
            "the article that are more similar to the real-news "
            "examples used during training."
        )
    keywords = extract_keywords(
        features
    )
    return {
        "prediction": prediction,
        "confidence": confidence,
        "fake_probability": fake_probability,
        "real_probability": real_probability,
        "explanation": explanation,
        "keywords": keywords
    }
# =========================================================
# HOME
# =========================================================
@app.get("/")
def home():
    return {
        "message": "FactShield AI Backend Running"
    }
# =========================================================
# PROFILE / AUTH
# =========================================================
current_user = {
    "id": 1,
    "full_name": "Sam kumar",
    "username": "sam",
    "email": "sam@gmail.com",
    "role": "admin",
}
@app.get("/auth/me")
def get_current_user():
    return current_user
@app.put("/auth/me")
def update_current_user(data: dict):
    full_name = data.get("full_name")
    username = data.get("username")
    email = data.get("email")
    if full_name is not None:
        full_name = str(full_name).strip()
        if full_name:
            current_user["full_name"] = full_name
    if username is not None:
        username = str(username).strip()
        if username:
            current_user["username"] = username
    if email is not None:
        email = str(email).strip()
        if email:
            current_user["email"] = email
    add_activity(
        "Profile",
        "User profile updated"
    )
    return current_user
# =========================================================
# DASHBOARD
# =========================================================
@app.get("/dashboard/stats")
def dashboard_stats():
    fake_count = sum(
        1
        for item in predictions_db
        if str(
            item.get("prediction", "")
        ).upper() == "FAKE"
    )
    real_count = sum(
        1
        for item in predictions_db
        if str(
            item.get("prediction", "")
        ).upper() == "REAL"
    )
    total_predictions = len(
        predictions_db
    )
    total_verifications = len(
        verifications_db
    )
    today = datetime.now(
        timezone.utc
    ).date()
    active_today = 0
    for item in predictions_db:
        try:
            item_date = datetime.fromisoformat(
                item["created_at"].replace(
                    "Z",
                    "+00:00"
                )
            ).date()
            if item_date == today:
                active_today += 1
        except (
            KeyError,
            ValueError,
            TypeError
        ):
            continue
    return {
        "total_users": 1,
        "total_predictions": total_predictions,
        "total_verifications": total_verifications,
        "active_today": active_today,
        "fake": fake_count,
        "real": real_count
    }
@app.get("/dashboard/charts")
def dashboard_charts():
    fake_count = sum(
        1
        for item in predictions_db
        if str(
            item.get("prediction", "")
        ).upper() == "FAKE"
    )
    real_count = sum(
        1
        for item in predictions_db
        if str(
            item.get("prediction", "")
        ).upper() == "REAL"
    )
    today = datetime.now(
        timezone.utc
    ).date()
    weekly = []
    for offset in range(6, -1, -1):
        current_date = (
            today - timedelta(days=offset)
        )
        fake_for_day = 0
        real_for_day = 0
        for item in predictions_db:
            try:
                item_date = datetime.fromisoformat(
                    item["created_at"].replace(
                        "Z",
                        "+00:00"
                    )
                ).date()
                if item_date == current_date:
                    prediction = str(
                        item.get(
                            "prediction",
                            ""
                        )
                    ).upper()
                    if prediction == "FAKE":
                        fake_for_day += 1
                    elif prediction == "REAL":
                        real_for_day += 1
            except (
                KeyError,
                ValueError,
                TypeError
            ):
                continue
        weekly.append(
            {
                "day": current_date.strftime("%a"),
                "date": current_date.isoformat(),
                "fake": fake_for_day,
                "real": real_for_day
            }
        )
    return {
        "fake": fake_count,
        "real": real_count,
        "distribution": {
            "fake": fake_count,
            "real": real_count
        },
        "weekly": weekly,
        "weekly_activity": weekly,
        "activity": weekly
    }
# =========================================================
# TEXT PREDICTION
# =========================================================
@app.post("/predict")
def predict(data: dict):
    news_text = data.get(
        "news_text",
        ""
    ).strip()
    if not news_text:
        return {
            "prediction": "UNKNOWN",
            "confidence": 0.0,
            "news_text": "",
            "fake_probability": 0.0,
            "real_probability": 0.0,
            "explanation": (
                "Please enter a news article or claim."
            ),
            "keywords": []
        }
    result = run_prediction(
        news_text
    )
    prediction_record = {
        "id": get_next_id(
            predictions_db
        ),
        "news_text": news_text,
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "fake_probability": result[
            "fake_probability"
        ],
        "real_probability": result[
            "real_probability"
        ],
        "explanation": result[
            "explanation"
        ],
        "keywords": result[
            "keywords"
        ],
        "created_at": datetime.now(
            timezone.utc
        ).isoformat()
    }
    predictions_db.append(
        prediction_record
    )
    save_json_list(
        PREDICTIONS_FILE,
        predictions_db
    )
    add_activity(
        "Prediction",
        f"{result['prediction']} news prediction executed"
    )
    return prediction_record
# =========================================================
# URL PREDICTION
# =========================================================
@app.post("/predict/url")
def predict_url(data: dict):
    url = data.get(
        "url",
        ""
    ).strip()
    if not url:
        return {
            "prediction": "UNKNOWN",
            "confidence": 0.0,
            "url": "",
            "news_text": "",
            "explanation": (
                "Please enter a valid news URL."
            ),
            "keywords": []
        }
    parsed = urlparse(url)
    if parsed.scheme not in {
        "http",
        "https"
    }:
        return {
            "prediction": "UNKNOWN",
            "confidence": 0.0,
            "url": url,
            "news_text": "",
            "explanation": (
                "Only HTTP and HTTPS URLs are supported."
            ),
            "keywords": []
        }
    try:
        article = fetch_article(
            url
        )
        extracted_text = article[
            "text"
        ]
        result = run_prediction(
            extracted_text
        )
        prediction_record = {
            "id": get_next_id(
                predictions_db
            ),
            "news_text": extracted_text,
            "prediction": result[
                "prediction"
            ],
            "confidence": result[
                "confidence"
            ],
            "fake_probability": result[
                "fake_probability"
            ],
            "real_probability": result[
                "real_probability"
            ],
            "explanation": result[
                "explanation"
            ],
            "keywords": result[
                "keywords"
            ],
            "url": url,
            "source_url": article[
                "final_url"
            ],
            "source_title": article[
                "title"
            ],
            "created_at": datetime.now(
                timezone.utc
            ).isoformat()
        }
        predictions_db.append(
            prediction_record
        )
        save_json_list(
            PREDICTIONS_FILE,
            predictions_db
        )
        add_activity(
            "URL Prediction",
            (
                f"{result['prediction']} prediction executed "
                f"for {article['final_url']}"
            )
        )
        return prediction_record
    except requests.Timeout:
        return {
            "prediction": "UNKNOWN",
            "confidence": 0.0,
            "url": url,
            "news_text": "",
            "explanation": (
                "The webpage took too long to respond. "
                "Please try another news URL."
            ),
            "keywords": []
        }
    except requests.RequestException as error:
        print(
            f"URL request error: {error}"
        )
        return {
            "prediction": "UNKNOWN",
            "confidence": 0.0,
            "url": url,
            "news_text": "",
            "explanation": (
                "Unable to fetch the webpage. "
                "Please check the URL and try again."
            ),
            "keywords": []
        }
    except ValueError as error:
        return {
            "prediction": "UNKNOWN",
            "confidence": 0.0,
            "url": url,
            "news_text": "",
            "explanation": str(error),
            "keywords": []
        }
    except Exception as error:
        print(
            f"URL prediction error: {error}"
        )
        return {
            "prediction": "UNKNOWN",
            "confidence": 0.0,
            "url": url,
            "news_text": "",
            "explanation": (
                "The article could not be processed. "
                "Please try another webpage."
            ),
            "keywords": []
        }
# =========================================================
# FACT VERIFICATION
# =========================================================
@app.post("/verify")
def verify(data: dict):
    claim = data.get(
        "claim",
        ""
    ).strip()
    if not claim:
        return {
            "claim": "",
            "result": "UNKNOWN",
            "confidence": 0.0,
            "explanation": (
                "Please enter a claim to verify."
            )
        }
    result = "Needs Review"
    confidence = 0.50
    explanation = (
        "The claim was received successfully, but live "
        "trusted-source verification is not connected yet. "
        "Treat this result as a review signal rather than "
        "a confirmed fact."
    )
    verification_record = {
        "id": get_next_id(
            verifications_db
        ),
        "claim": claim,
        "result": result,
        "confidence": confidence,
        "explanation": explanation,
        "created_at": datetime.now(
            timezone.utc
        ).isoformat()
    }
    verifications_db.append(
        verification_record
    )
    save_json_list(
        VERIFICATIONS_FILE,
        verifications_db
    )
    add_activity(
        "Verification",
        "Fact verification request submitted"
    )
    return verification_record
@app.get("/verify/history")
def verify_history():
    items = sorted(
        verifications_db,
        key=lambda item: item.get(
            "created_at",
            ""
        ),
        reverse=True
    )
    return {
        "items": items
    }
# =========================================================
# AI SUMMARIZER
# =========================================================
@app.post("/summarize")
def summarize(data: dict):
    text = str(data.get("text", "")).strip()

    if not text:
        return {"summary": "No text provided"}

    # Keep the existing short-input behavior and avoid unnecessary API calls.
    if len(text.split()) < 25:
        return {"summary": text}

    summary = generate_summary(text)
    return {"summary": summary}


# =========================================================
# PREDICTION HISTORY
# =========================================================
@app.get("/history")
def history():
    items = sorted(
        predictions_db,
        key=lambda item: item.get(
            "created_at",
            ""
        ),
        reverse=True
    )
    return {
        "items": items
    }
@app.get("/history/{prediction_id}")
def history_by_id(
    prediction_id: int
):
    for item in predictions_db:
        if int(
            item.get(
                "id",
                0
            )
        ) == prediction_id:
            return item
    return {
        "detail": "Prediction not found"
    }
@app.delete("/history/{prediction_id}")
def delete_history(
    prediction_id: int
):
    original_length = len(
        predictions_db
    )
    predictions_db[:] = [
        item
        for item in predictions_db
        if int(
            item.get(
                "id",
                0
            )
        ) != prediction_id
    ]
    if len(
        predictions_db
    ) == original_length:
        return {
            "message": "Prediction not found",
            "id": prediction_id
        }
    save_json_list(
        PREDICTIONS_FILE,
        predictions_db
    )
    add_activity(
        "Delete",
        f"Prediction {prediction_id} deleted"
    )
    return {
        "message": "Prediction deleted",
        "id": prediction_id
    }
# =========================================================
# ADMIN
# =========================================================
@app.get("/admin/stats")
def admin_stats():
    fake_count = sum(
        1
        for item in predictions_db
        if str(
            item.get(
                "prediction",
                ""
            )
        ).upper() == "FAKE"
    )
    real_count = sum(
        1
        for item in predictions_db
        if str(
            item.get(
                "prediction",
                ""
            )
        ).upper() == "REAL"
    )
    return {
        "total_users": 1,
        "total_predictions": len(
            predictions_db
        ),
        "total_verifications": len(
            verifications_db
        ),
        "active_today": len(
            predictions_db
        ),
        "fake": fake_count,
        "real": real_count
    }
@app.get("/admin/users")
def admin_users():
    return {
        "users": [
            {
                "id": current_user[
                    "id"
                ],
                "username": current_user[
                    "username"
                ],
                "role": current_user[
                    "role"
                ],
                "created_at": (
                    "2026-10-08T00:00:00+00:00"
                )
            }
        ]
    }
@app.get("/admin/activity")
def admin_activity():
    logs = sorted(
        activity_db,
        key=lambda item: item.get(
            "created_at",
            ""
        ),
        reverse=True
    )
    return {
        "logs": logs
    }
