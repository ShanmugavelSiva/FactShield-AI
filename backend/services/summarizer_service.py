"""Text summarization service using extractive summarization."""
import re
from collections import Counter


def summarize_text(text: str, num_sentences: int = 3) -> dict:
    sentences = _split_sentences(text)
    if len(sentences) <= num_sentences:
        return {
            "summary": text.strip(),
            "original_length": len(text),
            "summary_length": len(text),
        }

    word_freq = _compute_word_frequencies(text)
    sentence_scores = {}

    for i, sentence in enumerate(sentences):
        words = re.findall(r'\w+', sentence.lower())
        if not words:
            continue
        score = sum(word_freq.get(w, 0) for w in words) / len(words)
        sentence_scores[i] = score

    top_indices = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:num_sentences]
    top_indices.sort()

    summary = " ".join(sentences[i] for i in top_indices)

    return {
        "summary": summary,
        "original_length": len(text),
        "summary_length": len(summary),
    }


def _split_sentences(text: str) -> list:
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 10]


def _compute_word_frequencies(text: str) -> dict:
    words = re.findall(r'\w+', text.lower())
    stopwords = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "to", "of", "in", "for",
        "on", "with", "at", "by", "from", "as", "into", "through", "during",
        "before", "after", "above", "below", "between", "out", "off", "over",
        "under", "again", "further", "then", "once", "here", "there", "when",
        "where", "why", "how", "all", "each", "every", "both", "few", "more",
        "most", "other", "some", "such", "no", "nor", "not", "only", "own",
        "same", "so", "than", "too", "very", "just", "because", "but", "and",
        "or", "if", "while", "about", "up", "down", "that", "this", "it",
        "its", "he", "she", "they", "them", "their", "what", "which", "who",
        "whom", "these", "those", "am", "i", "you", "we", "my", "your", "his",
        "her", "our", "said", "says", "also", "new", "one", "two", "according",
    }
    filtered = [w for w in words if w not in stopwords and len(w) > 2]
    freq = Counter(filtered)
    max_freq = max(freq.values()) if freq else 1
    return {word: count / max_freq for word, count in freq.items()}
