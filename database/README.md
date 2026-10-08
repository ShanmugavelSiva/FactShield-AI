# FactShield AI — Database

MongoDB schemas and configuration reference.

## Status

**Phase 1:** Folder created. Full integration in **Phase 4**.

## Database Name

`factshield`

## Collections

### users

```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "hashed_password": "string",
  "full_name": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### news_history

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "news_text": "string",
  "prediction": "fake | real",
  "confidence": "float",
  "keywords": ["string"],
  "explanation": "string",
  "created_at": "datetime"
}
```

### fact_verification

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "claim": "string",
  "verification_result": "string",
  "sources": ["string"],
  "status": "verified | unverified | inconclusive",
  "created_at": "datetime"
}
```

## Local MongoDB Setup

```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verify connection
mongosh
> show dbs
```

## MongoDB Atlas (Production — Phase 12)

1. Create free cluster at https://cloud.mongodb.com
2. Create database user
3. Whitelist IP (0.0.0.0/0 for dev)
4. Copy connection string to `backend/.env`
