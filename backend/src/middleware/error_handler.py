"""
T021: Base Error Handling Middleware
Provides centralized error handling for FastAPI application
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback
import logging

logger = logging.getLogger(__name__)


class APIError(Exception):
    """Base API Error class"""

    def __init__(self, status_code: int, message: str, details: dict = None):
        self.status_code = status_code
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class RecipeNotFoundError(APIError):
    """Raised when a recipe is not found"""

    def __init__(self, recipe_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=f"Recipe not found: {recipe_id}",
            details={"recipe_id": recipe_id}
        )


class TranslationNotFoundError(APIError):
    """Raised when a translation is not available"""

    def __init__(self, recipe_id: str, language_code: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=f"Translation not found for recipe {recipe_id} in language {language_code}",
            details={"recipe_id": recipe_id, "language_code": language_code}
        )


class InvalidLanguageError(APIError):
    """Raised when an invalid language code is provided"""

    def __init__(self, language_code: str, supported_languages: list):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=f"Invalid language code: {language_code}",
            details={
                "language_code": language_code,
                "supported_languages": supported_languages
            }
        )


class InvalidDifficultyError(APIError):
    """Raised when an invalid difficulty level is provided"""

    def __init__(self, difficulty: str, supported_difficulties: list):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=f"Invalid difficulty level: {difficulty}",
            details={
                "difficulty": difficulty,
                "supported_difficulties": supported_difficulties
            }
        )


async def api_error_handler(request: Request, exc: APIError):
    """Handle custom API errors"""
    logger.error(f"API Error: {exc.message}", extra={
        "status_code": exc.status_code,
        "details": exc.details,
        "path": request.url.path
    })

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "code": exc.__class__.__name__,
            "details": exc.details
        }
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    logger.warning(f"HTTP Exception: {exc.detail}", extra={
        "status_code": exc.status_code,
        "path": request.url.path
    })

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "code": "HTTPException",
            "details": {}
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors"""
    logger.warning("Validation Error", extra={
        "errors": exc.errors(),
        "path": request.url.path
    })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "code": "ValidationError",
            "details": {
                "validation_errors": exc.errors()
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(
        "Unexpected Error",
        exc_info=True,
        extra={
            "path": request.url.path,
            "exception_type": type(exc).__name__
        }
    )

    # Don't expose internal error details in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "code": "InternalServerError",
            "details": {}
        }
    )


def register_error_handlers(app):
    """Register all error handlers with FastAPI app"""
    app.add_exception_handler(APIError, api_error_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
