"""
API Route Handler
Maps HTTP methods and paths to controller functions
"""

from typing import Dict, Any
from controllers import (
    vacations,
    events,
    excursions,
    members,
    photos,
    chat,
    recommendations,
    packing,
    itinerary
)
from utils.response import create_response


class Router:
    """Simple router to map requests to handlers"""

    def __init__(self):
        self.routes = {
            # Vacation routes
            'GET /vacations': vacations.list_vacations,
            'POST /vacations': vacations.create_vacation,
            'GET /vacations/{id}': vacations.get_vacation,
            'PUT /vacations/{id}': vacations.update_vacation,
            'DELETE /vacations/{id}': vacations.delete_vacation,

            # Member routes
            'GET /vacations/{vacation_id}/members': members.list_members,
            'POST /vacations/{vacation_id}/members': members.add_member,
            'DELETE /vacations/{vacation_id}/members/{member_id}': members.remove_member,

            # Event routes
            'GET /vacations/{vacation_id}/events': events.list_events,
            'POST /vacations/{vacation_id}/events': events.create_event,
            'PUT /vacations/{vacation_id}/events/{event_id}': events.update_event,
            'DELETE /vacations/{vacation_id}/events/{event_id}': events.delete_event,

            # Excursion routes
            'GET /vacations/{vacation_id}/excursions': excursions.list_excursions,
            'POST /vacations/{vacation_id}/excursions': excursions.create_excursion,
            'PUT /vacations/{vacation_id}/excursions/{excursion_id}': excursions.update_excursion,
            'DELETE /vacations/{vacation_id}/excursions/{excursion_id}': excursions.delete_excursion,

            # Photo routes
            'GET /vacations/{vacation_id}/photos': photos.list_photos,
            'POST /vacations/{vacation_id}/photos': photos.upload_photo,
            'DELETE /vacations/{vacation_id}/photos/{photo_id}': photos.delete_photo,
            'GET /vacations/{vacation_id}/photos/{photo_id}/url': photos.get_photo_url,

            # Chat routes
            'GET /vacations/{vacation_id}/messages': chat.list_messages,
            'POST /vacations/{vacation_id}/messages': chat.send_message,
            'DELETE /vacations/{vacation_id}/messages/{message_id}': chat.delete_message,

            # Packing list routes
            'GET /vacations/{vacation_id}/packing': packing.get_packing_list,
            'POST /vacations/{vacation_id}/packing': packing.add_packing_item,
            'PUT /vacations/{vacation_id}/packing/{item_id}': packing.update_packing_item,
            'DELETE /vacations/{vacation_id}/packing/{item_id}': packing.delete_packing_item,

            # Itinerary routes
            'GET /vacations/{vacation_id}/itinerary': itinerary.get_itinerary,
            'POST /vacations/{vacation_id}/itinerary': itinerary.create_itinerary,
            'PUT /vacations/{vacation_id}/itinerary/{itinerary_id}': itinerary.update_itinerary,

            # Recommendations routes
            'GET /vacations/{vacation_id}/recommendations': recommendations.get_recommendations,
        }

    def route(self, method: str, path: str, event: Dict[str, Any]) -> Dict[str, Any]:
        """Route request to appropriate handler"""
        # Try exact match first
        route_key = f"{method} {path}"
        if route_key in self.routes:
            return self.routes[route_key](event)

        # Try pattern matching for parameterized routes
        for pattern, handler in self.routes.items():
            if self._match_pattern(pattern, route_key, event):
                return handler(event)

        return create_response(404, {'error': 'Route not found'})

    def _match_pattern(self, pattern: str, route_key: str, event: Dict[str, Any]) -> bool:
        """Match route pattern with parameters"""
        pattern_parts = pattern.split('/')
        route_parts = route_key.split('/')

        if len(pattern_parts) != len(route_parts):
            return False

        params = {}
        for i, part in enumerate(pattern_parts):
            if part.startswith('{') and part.endswith('}'):
                param_name = part[1:-1]
                params[param_name] = route_parts[i]
            elif part != route_parts[i]:
                return False

        event['path_parameters'] = params
        return True


router = Router()
