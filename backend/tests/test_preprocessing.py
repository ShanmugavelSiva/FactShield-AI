"""ML preprocessing tests."""
from services.preprocessing import preprocess_text


def test_preprocess_empty():
    assert preprocess_text("") == ""
    assert preprocess_text(None) == ""


def test_preprocess_removes_urls():
    result = preprocess_text("Check this http://fake.com/news story")
    assert "http" not in result


def test_preprocess_lowercase():
    result = preprocess_text("BREAKING NEWS Today")
    assert result == result.lower()


def test_preprocess_basic():
    result = preprocess_text("The government announced new policy today.")
    assert len(result) > 0
