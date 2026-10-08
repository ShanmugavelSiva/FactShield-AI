"""URL content extraction service."""
import logging
import re

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


async def extract_article_from_url(url: str) -> str:
    headers = {
        "User-Agent": "FactShieldAI/1.0 (News Analysis Bot)",
    }
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
        tag.decompose()

    article = soup.find("article")
    if article:
        text = article.get_text(separator=" ", strip=True)
    else:
        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text(strip=True) for p in paragraphs)

    text = re.sub(r'\s+', ' ', text).strip()

    if len(text) < 50:
        raise ValueError("Could not extract sufficient text from the URL")

    return text[:10000]
