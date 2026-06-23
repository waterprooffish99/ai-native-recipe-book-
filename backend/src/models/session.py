"""
Session model for managing user sessions with JWT tokens.

This model represents an active user session with JWT token and expiration.
Based on the data model defined in the specification.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import uuid


class Session(BaseModel):
    """
    Represents an active user session with JWT token and expiration.
    """
    id: str
    user_id: str  # UUID as string
    token: str
    expires_at: datetime
    device_info: Optional[dict] = None
    created_at: datetime

    def is_expired(self) -> bool:
        """
        Check if the session has expired.
        """
        return datetime.utcnow() > self.expires_at


class SessionCreate(BaseModel):
    """
    Schema for creating a new session.
    """
    user_id: str  # UUID as string
    token: str
    expires_at: datetime
    device_info: Optional[dict] = None


class SessionInDB(Session):
    """
    Schema for session data as stored in the database.
    """
    pass