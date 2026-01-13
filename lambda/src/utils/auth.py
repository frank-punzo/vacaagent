"""
Authentication utilities
"""

import os
import jwt
from typing import Optional, Dict
from jwt import PyJWKClient


def verify_token(auth_header: str) -> Optional[Dict]:
    """
    Verify Cognito JWT token

    Args:
        auth_header: Authorization header value (Bearer <token>)

    Returns:
        User info dict if valid, None if invalid
    """
    try:
        # Extract token from "Bearer <token>" format
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        # Get Cognito configuration
        user_pool_id = os.environ.get('USER_POOL_ID')
        region = os.environ.get('AWS_REGION', 'us-east-1')

        # Build Cognito JWKS URL
        jwks_url = f'https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json'

        # Verify and decode token
        jwks_client = PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        decoded_token = jwt.decode(
            token,
            signing_key.key,
            algorithms=['RS256'],
            options={'verify_exp': True}
        )

        # Extract user info
        user_info = {
            'user_id': decoded_token.get('sub'),
            'email': decoded_token.get('email'),
            'username': decoded_token.get('cognito:username'),
            'token_use': decoded_token.get('token_use')
        }

        return user_info

    except Exception as e:
        print(f"Token verification error: {str(e)}")
        return None


def get_user_id(event: Dict) -> Optional[str]:
    """
    Extract user ID from Lambda event

    Args:
        event: Lambda event dict

    Returns:
        User ID string or None
    """
    user = event.get('user', {})
    return user.get('user_id')
