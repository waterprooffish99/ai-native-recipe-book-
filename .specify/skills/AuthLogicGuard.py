"""
AuthLogicGuard - Security Rules Documentation

This skill documents the authentication security rules implemented in the Global Plate onboarding infrastructure.
It serves as a reference for the security measures in place for user authentication and session management.
"""

name = "AuthLogicGuard"
version = "1.0.0"
description = "Security rules documentation for authentication logic"

# Security Rules Implemented
SECURITY_RULES = {
    "password_policy": {
        "min_length": 8,
        "requirements": ["at least one number OR special character"],
        "hashing_algorithm": "bcrypt",
        "hashing_rounds": 12,
        "storage": "password_hash field in users table (never plain text)"
    },
    "jwt_security": {
        "algorithm": "HS256",
        "expiration": "7 days",
        "secret_storage": "environment variable (JWT_SECRET)",
        "token_validation": "middleware checks token validity and expiration"
    },
    "user_validation": {
        "email_format": "RFC 5322 compliant via EmailStr validator",
        "duplicate_prevention": "check for existing email before creation",
        "oauth_protection": "CSRF state parameter for OAuth flows"
    },
    "session_management": {
        "storage": "sessions table in Neon Postgres",
        "expiration_handling": "automatic cleanup of expired sessions",
        "concurrent_sessions": "multiple sessions per user allowed",
        "logout_invalidation": "session token deleted from database on logout"
    },
    "input_validation": {
        "cooking_levels": ["Absolute Beginner", "Beginner", "Beginner+"],
        "voice_personalities": ["arlow", "silas", "hugo", "omar", "felix", "elara", "maya"],
        "languages": ["en", "ur", "ar", "es", "fr", "fa"],
        "enum_validation": "all enum fields validated with Pydantic validators"
    },
    "database_security": {
        "connection": "asyncpg with databases library for async operations",
        "sql_injection": "parameterized queries prevent injection attacks",
        "connection_pooling": "automatic with databases library"
    }
}

# Security Implementation Details
IMPLEMENTATION_DETAILS = {
    "password_handling": {
        "hashing_library": "passlib[bcrypt]",
        "comparison": "constant-time comparison to prevent timing attacks",
        "storage": "hashed in database, never in logs or memory longer than necessary"
    },
    "oauth_flow": {
        "library": "authlib for OAuth2 integration",
        "state_parameter": "required for CSRF protection",
        "redirect_uri_validation": "must match registered URI exactly"
    },
    "rate_limiting": {
        "status": "planned for future implementation",
        "scope": ["authentication endpoints", "session creation"]
    }
}

def get_security_summary():
    """Return a summary of implemented security measures."""
    return {
        "password_policy": SECURITY_RULES["password_policy"],
        "jwt_security": SECURITY_RULES["jwt_security"],
        "user_validation": SECURITY_RULES["user_validation"],
        "session_management": SECURITY_RULES["session_management"],
        "input_validation": SECURITY_RULES["input_validation"],
        "database_security": SECURITY_RULES["database_security"]
    }

def validate_security_compliance():
    """Validate that all security rules are properly implemented."""
    # This would contain logic to verify that the implementation matches the security rules
    # For now, it just returns True to indicate that the rules are documented
    return True

# Export the security rules for use in other parts of the system
security_rules = SECURITY_RULES
implementation_details = IMPLEMENTATION_DETAILS

if __name__ == "__main__":
    print("AuthLogicGuard - Authentication Security Rules")
    print("=" * 50)
    print("Security Summary:")
    for category, rules in get_security_summary().items():
        print(f"\n{category.replace('_', ' ').title()}:")
        for rule, value in rules.items():
            print(f"  - {rule.replace('_', ' ').title()}: {value}")