"""
Vacation controller - handles CRUD operations for vacations
"""

from typing import Dict, Any
from utils.response import success_response, created_response, not_found, bad_request, server_error
from utils.database import execute_query, execute_insert
from utils.auth import get_user_id
from datetime import datetime


def list_vacations(event: Dict[str, Any]) -> Dict[str, Any]:
    """List all vacations for the authenticated user"""
    try:
        user_id = get_user_id(event)

        query = """
            SELECT v.*, COUNT(DISTINCT vm.user_id) as member_count
            FROM vacations v
            LEFT JOIN vacation_members vm ON v.id = vm.vacation_id
            WHERE v.id IN (SELECT vacation_id FROM vacation_members WHERE user_id = %s)
            GROUP BY v.id
            ORDER BY v.start_date DESC
        """

        vacations = execute_query(query, (user_id,))

        return success_response(vacations or [])

    except Exception as e:
        print(f"Error listing vacations: {str(e)}")
        return server_error()


def get_vacation(event: Dict[str, Any]) -> Dict[str, Any]:
    """Get a specific vacation by ID"""
    try:
        vacation_id = event.get('path_parameters', {}).get('id')
        user_id = get_user_id(event)

        # Check if user is a member of this vacation
        member_check = execute_query(
            "SELECT 1 FROM vacation_members WHERE vacation_id = %s AND user_id = %s",
            (vacation_id, user_id),
            fetch_one=True
        )

        if not member_check:
            return not_found('Vacation not found or access denied')

        # Get vacation details
        query = """
            SELECT v.*,
                   COUNT(DISTINCT vm.user_id) as member_count,
                   COUNT(DISTINCT e.id) as event_count,
                   COUNT(DISTINCT ex.id) as excursion_count
            FROM vacations v
            LEFT JOIN vacation_members vm ON v.id = vm.vacation_id
            LEFT JOIN events e ON v.id = e.vacation_id
            LEFT JOIN excursions ex ON v.id = ex.vacation_id
            WHERE v.id = %s
            GROUP BY v.id
        """

        vacation = execute_query(query, (vacation_id,), fetch_one=True)

        if not vacation:
            return not_found('Vacation not found')

        return success_response(vacation)

    except Exception as e:
        print(f"Error getting vacation: {str(e)}")
        return server_error()


def create_vacation(event: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new vacation"""
    try:
        user_id = get_user_id(event)
        body = event.get('body_json', {})

        # Validate required fields
        required_fields = ['name', 'location', 'start_date', 'end_date']
        for field in required_fields:
            if not body.get(field):
                return bad_request(f'Missing required field: {field}')

        # Insert vacation
        query = """
            INSERT INTO vacations (name, location, description, start_date, end_date, vibe, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        vacation_id = execute_insert(query, (
            body['name'],
            body['location'],
            body.get('description'),
            body['start_date'],
            body['end_date'],
            body.get('vibe'),
            user_id
        ))

        # Add creator as a member
        execute_query(
            "INSERT INTO vacation_members (vacation_id, user_id, role) VALUES (%s, %s, %s)",
            (vacation_id, user_id, 'owner')
        )

        # Get the created vacation
        vacation = execute_query(
            "SELECT * FROM vacations WHERE id = %s",
            (vacation_id,),
            fetch_one=True
        )

        return created_response(vacation, 'Vacation created successfully')

    except Exception as e:
        print(f"Error creating vacation: {str(e)}")
        return server_error()


def update_vacation(event: Dict[str, Any]) -> Dict[str, Any]:
    """Update a vacation"""
    try:
        vacation_id = event.get('path_parameters', {}).get('id')
        user_id = get_user_id(event)
        body = event.get('body_json', {})

        # Check if user is a member
        member_check = execute_query(
            "SELECT role FROM vacation_members WHERE vacation_id = %s AND user_id = %s",
            (vacation_id, user_id),
            fetch_one=True
        )

        if not member_check:
            return not_found('Vacation not found or access denied')

        # Build update query dynamically based on provided fields
        update_fields = []
        params = []

        allowed_fields = ['name', 'location', 'description', 'start_date', 'end_date', 'vibe']

        for field in allowed_fields:
            if field in body:
                update_fields.append(f"{field} = %s")
                params.append(body[field])

        if not update_fields:
            return bad_request('No fields to update')

        params.append(vacation_id)

        query = f"""
            UPDATE vacations
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """

        execute_query(query, tuple(params))

        # Get updated vacation
        vacation = execute_query(
            "SELECT * FROM vacations WHERE id = %s",
            (vacation_id,),
            fetch_one=True
        )

        return success_response(vacation, 'Vacation updated successfully')

    except Exception as e:
        print(f"Error updating vacation: {str(e)}")
        return server_error()


def delete_vacation(event: Dict[str, Any]) -> Dict[str, Any]:
    """Delete a vacation (owner only)"""
    try:
        vacation_id = event.get('path_parameters', {}).get('id')
        user_id = get_user_id(event)

        # Check if user is the owner
        member_check = execute_query(
            "SELECT role FROM vacation_members WHERE vacation_id = %s AND user_id = %s",
            (vacation_id, user_id),
            fetch_one=True
        )

        if not member_check or member_check['role'] != 'owner':
            return not_found('Vacation not found or insufficient permissions')

        # Delete vacation (cascade will delete related records)
        execute_query("DELETE FROM vacations WHERE id = %s", (vacation_id,))

        return success_response({}, 'Vacation deleted successfully')

    except Exception as e:
        print(f"Error deleting vacation: {str(e)}")
        return server_error()
