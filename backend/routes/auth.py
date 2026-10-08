"""Authentication routes."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from bson import ObjectId

from database.connection import get_db
from middleware.rate_limit import limiter
from models.schemas import UserRegister, UserLogin, UserUpdate, TokenResponse, UserResponse
from utils.auth import hash_password, verify_password, create_access_token, get_current_user, user_to_response
from utils.logger import log_activity

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(request: Request, user_data: UserRegister):
    db = get_db()

    if await db.users.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await db.users.find_one({"username": user_data.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    user_count = await db.users.count_documents({})
    role = "admin" if user_count == 0 else "user"

    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "role": role,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    await log_activity(str(result.inserted_id), "register", f"User {user_data.username} registered")

    return TokenResponse(
        access_token=token,
        user=user_to_response(user_doc),
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("20/minute")
async def login(request: Request, credentials: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": credentials.email})

    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    await log_activity(str(user["_id"]), "login", f"User {user['username']} logged in")

    return TokenResponse(
        access_token=token,
        user=user_to_response(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return user_to_response(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    update_fields = {}

    if update_data.username and update_data.username != current_user["username"]:
        existing = await db.users.find_one({"username": update_data.username})
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        update_fields["username"] = update_data.username

    if update_data.email and update_data.email != current_user["email"]:
        existing = await db.users.find_one({"email": update_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        update_fields["email"] = update_data.email

    if update_data.full_name:
        update_fields["full_name"] = update_data.full_name

    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc)
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_fields},
        )
        current_user.update(update_fields)

    return user_to_response(current_user)
