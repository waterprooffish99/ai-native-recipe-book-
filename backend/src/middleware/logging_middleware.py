"""Request logging middleware for FastAPI application."""

import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests and their response times."""

    def __init__(self, app):
        super().__init__(app)
        self.logger = logging.getLogger("request_logger")

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process incoming request and log details."""
        start_time = time.time()

        # Get client IP
        client_host = request.client.host if request.client else "unknown"
        client_port = request.client.port if request.client else "unknown"

        # Log the incoming request
        self.logger.info(
            f"REQUEST: {request.method} {request.url.path} "
            f"from {client_host}:{client_port} "
            f"with headers: {dict(request.headers)}"
        )

        try:
            # Process the request
            response = await call_next(request)
        except Exception as e:
            # Log the error
            self.logger.error(f"ERROR processing request: {str(e)}")
            raise e
        finally:
            # Calculate processing time
            processing_time = time.time() - start_time

            # Log the response
            self.logger.info(
                f"RESPONSE: {response.status_code} for {request.method} {request.url.path} "
                f"processed in {processing_time:.3f}s for user_id: {getattr(request.state, 'user_id', 'anonymous')}"
            )

        return response