# FactShield AI — API Documentation

Base URL: `http://localhost:8000` (development)

Interactive docs: `http://localhost:8000/docs`

## Authentication

All protected endpoints require JWT Bearer token:

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Health

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | No | API info |
| GET | `/health` | No | Health check |

### Authentication

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and get JWT |
| GET | `/auth/me` | Yes | Get current user profile |
| PUT | `/auth/me` | Yes | Update profile |

**Register Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secure123",
  "full_name": "John Doe"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "secure123"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Prediction

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/predict` | Yes | Analyze news text |
| POST | `/predict/url` | Yes | Analyze article from URL |

**Predict Request:**
```json
{
  "news_text": "Your news article text here..."
}
```

**Predict Response:**
```json
{
  "prediction": "fake",
  "confidence": 0.87,
  "keywords": [
    { "word": "shocking", "influence": -0.45 },
    { "word": "secret", "influence": -0.38 }
  ],
  "explanation": "Classified as FAKE with 87.0% confidence...",
  "id": "prediction_id"
}
```

### Verification

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/verify` | Yes | Verify a factual claim |
| GET | `/verify/history` | Yes | Verification history |

### Summarization

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/summarize` | Yes | Summarize article text |

### Dashboard

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/dashboard/stats` | Yes | User statistics |
| GET | `/dashboard/charts` | Yes | Chart data |

### History

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/history` | Yes | Prediction history |
| GET | `/history/{id}` | Yes | Single prediction |
| DELETE | `/history/{id}` | Yes | Delete prediction |

### Admin

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin/stats` | Admin | System statistics |
| GET | `/admin/users` | Admin | All users |
| GET | `/admin/activity` | Admin | Activity logs |

---

## Error Responses

```json
{
  "detail": "Error message here"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized / invalid token |
| 403 | Forbidden / admin only |
| 404 | Resource not found |
| 429 | Rate limit exceeded |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Register | 10/minute |
| Login | 20/minute |
| Predict | 30/minute |
| Predict URL | 15/minute |
| Verify | 20/minute |
| Summarize | 20/minute |
