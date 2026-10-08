"""Fact verification service."""
import re

# Known fact-checking knowledge base (expandable)
FACT_DATABASE = {
    "earth is flat": {"status": "unverified", "result": "Scientific consensus confirms Earth is an oblate spheroid.", "sources": ["https://www.nasa.gov/earth"]},
    "vaccines cause autism": {"status": "unverified", "result": "Multiple large-scale studies found no link between vaccines and autism.", "sources": ["https://www.cdc.gov/vaccinesafety/concerns/autism.html"]},
    "drinking bleach cures": {"status": "unverified", "result": "Drinking bleach is extremely dangerous and can cause severe injury or death.", "sources": ["https://www.fda.gov/consumers/consumer-updates/danger-bleach"]},
    "climate change is a hoax": {"status": "unverified", "result": "97% of climate scientists agree climate change is real and human-caused.", "sources": ["https://climate.nasa.gov/evidence/"]},
    "5g causes coronavirus": {"status": "unverified", "result": "5G technology does not cause COVID-19. Viruses spread through respiratory droplets.", "sources": ["https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters"]},
}


def verify_claim(claim: str) -> dict:
    claim_lower = claim.lower().strip()

    for key, data in FACT_DATABASE.items():
        if key in claim_lower or _fuzzy_match(key, claim_lower):
            return {
                "status": data["status"],
                "verification_result": data["result"],
                "sources": data["sources"],
            }

    # Heuristic analysis for unknown claims
    sensational_words = ["miracle", "secret", "they don't want", "shocking", "hidden truth", "cover-up"]
    has_sensational = any(w in claim_lower for w in sensational_words)

    if has_sensational:
        return {
            "status": "inconclusive",
            "verification_result": (
                "This claim contains sensational language commonly found in misinformation. "
                "We could not verify it against our knowledge base. "
                "Please consult reputable fact-checking organizations like Snopes, PolitiFact, or Reuters Fact Check."
            ),
            "sources": [
                "https://www.snopes.com",
                "https://www.politifact.com",
                "https://www.reuters.com/fact-check/",
            ],
        }

    return {
        "status": "inconclusive",
        "verification_result": (
            "We could not find sufficient evidence to verify or debunk this claim. "
            "Consider checking multiple credible sources before sharing."
        ),
        "sources": [
            "https://www.snopes.com",
            "https://www.politifact.com",
        ],
    }


def _fuzzy_match(key: str, claim: str) -> bool:
    key_words = set(re.findall(r'\w+', key))
    claim_words = set(re.findall(r'\w+', claim))
    overlap = key_words & claim_words
    return len(overlap) >= len(key_words) * 0.7
