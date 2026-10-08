import os
import re
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


# =========================================================
# 1. File paths
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FAKE_FILE = os.path.join(BASE_DIR, "Fake.csv")
TRUE_FILE = os.path.join(BASE_DIR, "True.csv")

MODEL_DIR = os.path.join(BASE_DIR, "app", "ml_model")
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_FILE = os.path.join(MODEL_DIR, "fake_news_model.pkl")
VECTORIZER_FILE = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")


# =========================================================
# 2. Text cleaning
# =========================================================

def clean_text(text):
    text = str(text).lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\S+|https\S+", " ", text)

    # Remove special characters and numbers
    text = re.sub(r"[^a-zA-Z\s]", " ", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


# =========================================================
# 3. Load datasets
# =========================================================

print("\nLoading datasets...")

fake_df = pd.read_csv(FAKE_FILE)
true_df = pd.read_csv(TRUE_FILE)

print(f"Fake articles loaded: {len(fake_df)}")
print(f"Real articles loaded: {len(true_df)}")


# =========================================================
# 4. Add labels
# =========================================================

fake_df["label"] = 0
true_df["label"] = 1


# =========================================================
# 5. Combine datasets
# =========================================================

df = pd.concat([fake_df, true_df], ignore_index=True)

print(f"Total articles: {len(df)}")


# =========================================================
# 6. Prepare article content
# =========================================================

df["title"] = df["title"].fillna("")
df["text"] = df["text"].fillna("")

df["content"] = df["title"] + " " + df["text"]


# =========================================================
# 7. Clean dataset
# =========================================================

print("\nCleaning dataset...")

df["content"] = df["content"].apply(clean_text)

# Remove empty articles
df = df[df["content"].str.strip() != ""]

# Remove duplicate articles
df = df.drop_duplicates(subset=["content"])

print(f"Articles after cleaning: {len(df)}")


# =========================================================
# 8. Prepare features and labels
# =========================================================

X = df["content"]
y = df["label"]


# =========================================================
# 9. Train-test split
# =========================================================

print("\nSplitting dataset...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")


# =========================================================
# 10. TF-IDF Feature Extraction
# =========================================================

print("\nCreating TF-IDF features...")

vectorizer = TfidfVectorizer(
    max_features=50000,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.95,
    sublinear_tf=True
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

print(f"Training feature shape: {X_train_tfidf.shape}")
print(f"Testing feature shape: {X_test_tfidf.shape}")


# =========================================================
# 11. Train Logistic Regression
# =========================================================

print("\nTraining Fake News Detection model...")

model = LogisticRegression(
    max_iter=2000,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train_tfidf, y_train)


# =========================================================
# 12. Evaluate model
# =========================================================

print("\nEvaluating model...")

y_pred = model.predict(X_test_tfidf)

accuracy = accuracy_score(y_test, y_pred)

print("\n========================================")
print("MODEL TRAINING COMPLETED")
print("========================================")

print(f"\nAccuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=["FAKE", "REAL"]
    )
)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# =========================================================
# 13. Save trained model
# =========================================================

print("\nSaving trained model...")

joblib.dump(model, MODEL_FILE)
joblib.dump(vectorizer, VECTORIZER_FILE)

print("\nModel saved:")
print(MODEL_FILE)

print("\nVectorizer saved:")
print(VECTORIZER_FILE)

print("\n✅ FactShield AI ML model is ready!")