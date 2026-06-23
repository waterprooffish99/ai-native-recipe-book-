"""
Authentication service for handling user authentication operations.

This service handles email/password signup, login, Google OAuth, and session management.
Based on the research findings for FastAPI native authentication with authlib and passlib.
"""
import uuid
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel
import os
from ..models.user import UserCreate, UserInDB, User
from ..models.session import SessionCreate, SessionInDB
import databases


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token configuration
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 7 * 24 * 60  # 7 days


class TokenData(BaseModel):
    """Data stored in JWT token."""
    user_id: str
    email: str


class AuthService:
    """Service class for handling authentication operations."""

    def __init__(self, database: databases.Database):
        self.db = database

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password."""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Hash a plain password using bcrypt."""
        return pwd_context.hash(password, rounds=12)

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get a user by their email address."""
        query = "SELECT * FROM users WHERE email = :email"
        user = await self.db.fetch_one(query=query, values={"email": email})

        if user:
            return UserInDB(
                id=str(user["id"]),
                email=user["email"],
                password_hash=user["password_hash"],
                oauth_provider=user["oauth_provider"],
                oauth_provider_id=user["oauth_provider_id"],
                name=user["name"],
                software_background=user["software_background"],
                hardware_background=user["hardware_background"],
                cooking_level=user["cooking_level"],
                dietary_restrictions=user["dietary_restrictions"],
                preferred_voice=user["preferred_voice"],
                preferred_language=user["preferred_language"],
                recipes_mastered=user["recipes_mastered"],
                last_recipe_viewed=str(user["last_recipe_viewed"]) if user["last_recipe_viewed"] else None,
                onboarding_completed=user["onboarding_completed"],
                created_at=user["created_at"],
                last_login=user["last_login"],
                updated_at=user["updated_at"]
            )
        return None

    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user account with email/password."""
        # Check if user already exists
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("Email already registered")

        # Hash the password
        password_hash = self.get_password_hash(user_data.password)

        # Create user in database
        user_id = str(uuid.uuid4())
        created_at = datetime.utcnow()

        query = """
            INSERT INTO users (
                id, email, password_hash, name, created_at, updated_at
            ) VALUES (
                :id, :email, :password_hash, :name, :created_at, :updated_at
            ) RETURNING id, email, name, created_at, updated_at
        """
        values = {
            "id": user_id,
            "email": user_data.email,
            "password_hash": password_hash,
            "name": user_data.name,
            "created_at": created_at,
            "updated_at": created_at
        }

        result = await self.db.fetch_one(query=query, values=values)

        # Return user object
        return User(
            id=result["id"],
            email=result["email"],
            name=result["name"],
            created_at=result["created_at"],
            updated_at=result["updated_at"],
            onboarding_completed=False
        )

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    async def create_session(self, user_id: str, token: str, device_info: Optional[dict] = None) -> SessionInDB:
        """Create a new session for a user."""
        session_id = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        query = """
            INSERT INTO sessions (
                id, user_id, token, expires_at, device_info, created_at
            ) VALUES (
                :id, :user_id, :token, :expires_at, :device_info, :created_at
            ) RETURNING id, user_id, token, expires_at, device_info, created_at
        """
        values = {
            "id": session_id,
            "user_id": user_id,
            "token": token,
            "expires_at": expires_at,
            "device_info": device_info,
            "created_at": datetime.utcnow()
        }

        result = await self.db.fetch_one(query=query, values=values)

        return SessionInDB(
            id=result["id"],
            user_id=result["user_id"],
            token=result["token"],
            expires_at=result["expires_at"],
            device_info=result["device_info"],
            created_at=result["created_at"]
        )

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password."""
        user = await self.get_user_by_email(email)
        if not user or not user.password_hash:
            return None

        if not self.verify_password(password, user.password_hash):
            return None

        # Update last login time
        update_query = """
            UPDATE users
            SET last_login = :last_login, updated_at = :updated_at
            WHERE id = :user_id
        """
        await self.db.execute(
            query=update_query,
            values={
                "last_login": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "user_id": user.id
            }
        )

        # Return updated user info
        return User(
            id=user.id,
            email=user.email,
            name=user.name,
            software_background=user.software_background,
            hardware_background=user.hardware_background,
            cooking_level=user.cooking_level,
            dietary_restrictions=user.dietary_restrictions,
            preferred_voice=user.preferred_voice,
            preferred_language=user.preferred_language,
            recipes_mastered=user.recipes_mastered,
            onboarding_completed=user.onboarding_completed,
            created_at=user.created_at,
            last_login=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

    async def create_oauth_user(self, email: str, name: str, oauth_provider: str, oauth_provider_id: str) -> User:
        """Create a new user via OAuth if they don't exist, otherwise return existing user."""
        # Check if user already exists
        query = "SELECT * FROM users WHERE oauth_provider = :provider AND oauth_provider_id = :provider_id"
        user = await self.db.fetch_one(
            query=query,
            values={"provider": oauth_provider, "provider_id": oauth_provider_id}
        )

        if user:
            # User already exists via OAuth, return existing user
            return User(
                id=str(user["id"]),
                email=user["email"],
                name=user["name"],
                software_background=user["software_background"],
                hardware_background=user["hardware_background"],
                cooking_level=user["cooking_level"],
                dietary_restrictions=user["dietary_restrictions"],
                preferred_voice=user["preferred_voice"],
                preferred_language=user["preferred_language"],
                recipes_mastered=user["recipes_mastered"],
                onboarding_completed=user["onboarding_completed"],
                created_at=user["created_at"],
                last_login=user["last_login"],
                updated_at=user["updated_at"]
            )

        # Check if user exists with the same email but without OAuth
        existing_user = await self.get_user_by_email(email)
        if existing_user:
            # Link OAuth to existing account
            update_query = """
                UPDATE users
                SET oauth_provider = :oauth_provider, oauth_provider_id = :oauth_provider_id, updated_at = :updated_at
                WHERE email = :email
                RETURNING id, email, name, created_at, updated_at, onboarding_completed, last_login
            """
            updated_user = await self.db.fetch_one(
                query=update_query,
                values={
                    "oauth_provider": oauth_provider,
                    "oauth_provider_id": oauth_provider_id,
                    "email": email,
                    "updated_at": datetime.utcnow()
                }
            )

            return User(
                id=updated_user["id"],
                email=updated_user["email"],
                name=updated_user["name"],
                onboarding_completed=updated_user["onboarding_completed"],
                created_at=updated_user["created_at"],
                last_login=updated_user["last_login"],
                updated_at=updated_user["updated_at"]
            )

        # Create new OAuth user
        user_id = str(uuid.uuid4())
        created_at = datetime.utcnow()

        query = """
            INSERT INTO users (
                id, email, name, oauth_provider, oauth_provider_id, created_at, updated_at
            ) VALUES (
                :id, :email, :name, :oauth_provider, :oauth_provider_id, :created_at, :updated_at
            ) RETURNING id, email, name, created_at, updated_at
        """
        values = {
            "id": user_id,
            "email": email,
            "name": name,
            "oauth_provider": oauth_provider,
            "oauth_provider_id": oauth_provider_id,
            "created_at": created_at,
            "updated_at": created_at
        }

        result = await self.db.fetch_one(query=query, values=values)

        return User(
            id=result["id"],
            email=result["email"],
            name=result["name"],
            created_at=result["created_at"],
            updated_at=result["updated_at"],
            onboarding_completed=False
        )

    def get_google_auth_url(self, state: str) -> str:
        """Generate Google OAuth authorization URL."""
        import urllib.parse
        from authlib.common.urls import add_params_to_uri

        # Google OAuth2 endpoints
        google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"

        # OAuth2 parameters
        params = {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
            "response_type": "code",
            "scope": "openid email profile",
            "state": state
        }

        return add_params_to_uri(google_auth_url, params)

    async def handle_google_oauth_callback(self, code: str) -> tuple[User, str]:
        """Handle Google OAuth callback and return user and JWT token."""
        from authlib.integrations.httpx_client import AsyncOAuth2Client
        import json

        # Exchange authorization code for access token
        oauth = AsyncOAuth2Client(
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
            redirect_uri=os.getenv("GOOGLE_REDIRECT_URI")
        )

        try:
            token = await oauth.fetch_token(
                "https://oauth2.googleapis.com/token",
                code=code,
                grant_type="authorization_code"
            )

            # Get user info from Google
            user_info_response = await oauth.get("https://www.googleapis.com/oauth2/v2/userinfo")
            user_info = user_info_response.json()

            email = user_info.get("email")
            name = user_info.get("name", user_info.get("given_name", "Unknown"))
            google_id = user_info.get("id")

            # Create or get user via OAuth
            user = await self.create_oauth_user(
                email=email,
                name=name,
                oauth_provider="google",
                oauth_provider_id=google_id
            )

            # Create JWT token for the user
            access_token = self.create_access_token(data={"user_id": user.id, "email": user.email})

            # Create session
            await self.create_session(user_id=user.id, token=access_token)

            return user, access_token

        except Exception as e:
            raise ValueError(f"Failed to complete Google OAuth: {str(e)}")

    async def logout_user(self, token: str) -> bool:
        """Logout a user by invalidating their session."""
        # Delete the session from the database
        query = "DELETE FROM sessions WHERE token = :token"
        result = await self.db.execute(query=query, values={"token": token})

        # Return True if a session was deleted (user was logged out), False otherwise
        return result > 0