import time
from typing import Dict, Any
import jwt
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from src.config import CLERK_JWKS_URL

security = HTTPBearer()

# In-memory cache for JWKS keys to ensure p95 latency stays under 500ms
_jwks_cache: Dict[str, Any] = {}
_jwks_cache_expiry: float = 0
JWKS_CACHE_TTL = 3600  # Cache keys for 1 hour

async def get_jwks() -> Dict[str, Any]:
    """Fetches and caches Clerk JWKS keys."""
    global _jwks_cache, _jwks_cache_expiry
    now = time.time()
    
    # Return cached keys if valid
    if _jwks_cache and now < _jwks_cache_expiry:
        return _jwks_cache

    if not CLERK_JWKS_URL:
        # Fallback to empty if not configured (to allow local dev without Clerk)
        return {}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(CLERK_JWKS_URL)
            response.raise_for_status()
            jwks = response.json()
            # Cache the keys map indexed by kid
            _jwks_cache = {key["kid"]: key for key in jwks.get("keys", [])}
            _jwks_cache_expiry = now + JWKS_CACHE_TTL
            return _jwks_cache
    except Exception as e:
        # Fall back to existing cache if server is down
        if _jwks_cache:
            return _jwks_cache
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Clerk JWKS: {str(e)}"
        )

async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """FastAPI dependency to verify Clerk JWT token from Authorization header.

    Raises:
        HTTPException: 401 Unauthorized if token is missing, invalid, or expired.
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization token"
        )
        
    # Local dev fallback stability check: if CLERK_JWKS_URL is not set, allow token through as mock user
    if not CLERK_JWKS_URL:
        return {"sub": "mock_user_id", "email": "mock@example.com"}

    try:
        # Decode token header to locate kid
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing kid header"
            )

        # Retrieve public key list
        jwks = await get_jwks()
        jwk = jwks.get(kid)
        if not jwk:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: kid not found in JWKS"
            )

        # Convert JWK to RSA public key using PyJWT helper
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)

        # Verify signatures and standard claims
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unauthorized: {str(e)}"
        )
