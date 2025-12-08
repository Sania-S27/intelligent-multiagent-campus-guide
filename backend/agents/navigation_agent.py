
import os
import requests # <-- Add this import
from sqlalchemy.orm import Session
import models

MAPBOX_TOKEN = os.getenv("REACT_APP_MAPBOX_TOKEN")
def get_all_db_locations(db: Session):
    """Fetches all locations from the DB."""
    return db.query(models.Location).order_by(models.Location.name.asc()).all()

def get_all_db_paths(db: Session):
    """Fetches all pre-defined paths from the DB."""
    return db.query(models.Route).all()
# ... (your existing get_all_db_locations and get_all_db_paths functions) ...
def get_walking_route(start_lng: float, start_lat: float, end_lng: float, end_lat: float):
    """
    Calculates a walking route using the Mapbox Directions API.
    """
    if not MAPBOX_TOKEN:
        print("Error: Mapbox token not configured on backend.")
        return None

    url = f"https://api.mapbox.com/directions/v5/mapbox/walking/{start_lng},{start_lat};{end_lng},{end_lat}"
    params = {
        "alternatives": "false",
        "geometries": "geojson", 
        "overview": "full",
        "steps": "false",
        "access_token": MAPBOX_TOKEN
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if response.status_code != 200 or 'routes' not in data or not data['routes']:
            print(f"Error from Mapbox API: {data.get('message', 'No route found')}")
            return None
            
        # VVV THIS IS THE CHANGE VVV
        route_data = data['routes'][0]
        route_geometry = route_data['geometry']
        route_duration = route_data['duration'] # Get duration in seconds
        
        # Return only geometry and duration
        return {"geometry": route_geometry, "duration": route_duration}
        # ^^^ END OF CHANGE ^^^

    except Exception as e:
        # This will now print the *real* error if something else fails
        print(f"Error calculating route: {e}") 
        return None
def get_location_coords_by_name(db: Session, name: str):
    """Fetches coordinates for a location name from the DB."""
    location = db.query(models.Location).filter(models.Location.name == name).first()
    if not location:
        return None
    # Mapbox API uses (lng, lat)
    return (float(location.longitude), float(location.latitude))


def get_simple_route_info(db: Session, origin_name: str, destination_name: str):
    """
    Called by Support Agent: Calculates duration/distance between two named points.
    """
    origin_coords = get_location_coords_by_name(db, origin_name)
    dest_coords = get_location_coords_by_name(db, destination_name)

    if not origin_coords or not dest_coords:
        return None

    # Route coordinates string (lng,lat;lng,lat)
    coords_str = f"{origin_coords[0]},{origin_coords[1]};{dest_coords[0]},{dest_coords[1]}"

    url = f"https://api.mapbox.com/directions/v5/mapbox/walking/{coords_str}"
    params = {
        "access_token": MAPBOX_TOKEN,
        "steps": "false",
        "geometries": "polyline", # Request simplified geometry for smaller response
    }

    try:
        response = requests.get(url, params=params).json()

        if response.get('code') != 'Ok' or not response.get('routes'):
            return None

        route = response['routes'][0]

        return {
            "duration": route['duration'], # in seconds
            "distance": route['distance'] # in meters
        }

    except Exception as e:
        print(f"Error in simple route calculation: {e}")
        return None    