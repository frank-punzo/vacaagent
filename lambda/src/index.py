"""
VacaAgent Lambda Function Handler
Main entry point for all API requests
"""

import json
import os
from typing import Dict, Any
from routes import router
from utils.response import create_response
from utils.auth import verify_token


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler function
    Routes requests to appropriate handlers
    """
    try:
        # Extract request details
        http_method = event.get('requestContext', {}).get('http', {}).get('method', '')
        route_key = event.get('routeKey', '')
        path = event.get('rawPath', '')
        headers = event.get('headers', {})
        body = event.get('body', '{}')

        # Parse body
        try:
            body_json = json.loads(body) if body else {}
        except json.JSONDecodeError:
            body_json = {}

        # Health check endpoint (no auth required)
        if path == '/health':
            return create_response(200, {'status': 'healthy', 'service': 'vacaagent-api'})

        # Extract and verify authorization token
        auth_header = headers.get('authorization', '')
        if not auth_header:
            return create_response(401, {'error': 'Missing authorization header'})

        # Verify JWT token
        user_info = verify_token(auth_header)
        if not user_info:
            return create_response(401, {'error': 'Invalid or expired token'})

        # Add user info to event for use in route handlers
        event['user'] = user_info
        event['body_json'] = body_json

        # Route the request
        response = router.route(http_method, path, event)

        return response

    except Exception as e:
        print(f"Unhandled error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})
