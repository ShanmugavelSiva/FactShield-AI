"""Text preprocessing for fake news detection (backend copy)."""
import re

try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize

    try:
        _STOP_WORDS = set(stopwords.words("english"))
    except LookupError:
        nltk.download("stopwords", quiet=True)
        nltk.download("punkt", quiet=True)
        _STOP_WORDS = set(stopwords.words("english"))
except ImportError:
    _STOP_WORDS = set()


def preprocess_text(text: str) -> str:
    if not text or not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"@\w+|#\w+", "", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    if _STOP_WORDS:
        try:
            tokens = word_tokenize(text)
            tokens = [t for t in tokens if t not in _STOP_WORDS and len(t) > 2]
            text = " ".join(tokens)
        except Exception:
            words = text.split()
            words = [w for w in words if w not in _STOP_WORDS and len(w) > 2]
            text = " ".join(words)

    return text
