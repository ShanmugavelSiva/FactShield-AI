# FactShield AI — Database Documentation

## Database: `factshield`

MongoDB Atlas (production) or local MongoDB (development).

---

## Collections

### users

Stores registered user accounts.

```json
{
  "_id": "ObjectId",
  "username": "string (unique)",
  "email": "string (unique)",
  "hashed_password": "string (bcrypt)",
  "full_name": "string",
  "role": "user | admin",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

**Indexes:**
- `email` — unique
- `username` — unique

**Notes:** First registered user automatically receives `admin` role.

---

### predictions

Stores all news analysis results.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users)",
  "news_text": "string (max 5000 chars)",
  "source_url": "string (optional)",
  "prediction": "fake | real",
  "confidence": "float (0-1)",
  "keywords": [{ "word": "string", "influence": "float" }],
  "explanation": "string",
  "created_at": "ISODate"
}
```

**Indexes:**
- `{ user_id: 1, created_at: -1 }` — compound
- `prediction` — single field

---

### verifications

Stores fact verification requests and results.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (ref: users)",
  "claim": "string",
  "status": "verified | unverified | inconclusive",
  "verification_result": "string",
  "sources": ["string (URLs)"],
  "created_at": "ISODate"
}
```

**Indexes:**
- `{ user_id: 1, created_at: -1 }`
- `status`

---

### analytics

Daily aggregated analytics per user.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "date": "YYYY-MM-DD",
  "total": "int",
  "fake_count": "int",
  "real_count": "int"
}
```

**Indexes:**
- `{ user_id: 1, date: -1 }`

---

### notifications

User notifications (extensible for future features).

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "title": "string",
  "message": "string",
  "read": "boolean",
  "created_at": "ISODate"
}
```

**Indexes:**
- `{ user_id: 1, read: 1 }`

---

### activity_logs

Audit trail of user actions.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "action": "string (register|login|predict|verify|summarize)",
  "details": "string",
  "created_at": "ISODate"
}
```

**Indexes:**
- `{ user_id: 1, created_at: -1 }`

---

## Entity Relationship

```
users (1) ──── (N) predictions
users (1) ──── (N) verifications
users (1) ──── (N) analytics
users (1) ──── (N) notifications
users (1) ──── (N) activity_logs
```

## MongoDB Atlas Setup

1. Create cluster at https://cloud.mongodb.com
2. Database Access → Create user with read/write permissions
3. Network Access → Add IP `0.0.0.0/0` (dev) or specific IPs (prod)
4. Connect → Copy connection string
5. Set in `backend/.env`:

```
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=factshield
```
