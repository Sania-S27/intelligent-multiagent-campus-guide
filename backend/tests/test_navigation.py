from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app  # Ensure this imports your FastAPI app instance correctly

client = TestClient(app)

# --- Mock Data ---
# This simulates what Mapbox returns, so we don't hit the real API
MOCK_MAPBOX_RESPONSE = {
    "routes": [
        {
            "geometry": {
                "coordinates": [[75.90, 14.44], [75.91, 14.45]],
                "type": "LineString"
            },
            "duration": 300.5, # 5 minutes
            "distance": 500.0,
            "bbox": [75.90, 14.44, 75.91, 14.45]
        }
    ],
    "code": "Ok"
}

def test_calculate_route_success():
    """
    Test that the /calculate-route endpoint correctly processes a valid request.
    It mocks the external Mapbox API call.
    """
    # We patch 'requests.get' so it returns our MOCK_MAPBOX_RESPONSE instead of calling the internet
    with patch('requests.get') as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = MOCK_MAPBOX_RESPONSE

        # Define the input payload (what the frontend sends)
        payload = {
            "start_lat": 14.4451,
            "start_lng": 75.9003,
            "destination_name": "Canteen" 
        }

        # Make a request to our own API
        response = client.post("/api/navigation/calculate-route", json=payload)

        # --- Assertions (The Verification) ---
        # 1. Check if the API returned a 200 OK status
        assert response.status_code == 200
        
        # 2. Check if the response data matches what we expect
        data = response.json()
        assert "geometry" in data
        assert "duration" in data
        
        # 3. Verify the logic extracted the correct values
        assert data["geometry"]["type"] == "LineString"
        assert data["duration"] == 300.5

def test_calculate_route_invalid_destination():
    """
    Test that asking for a non-existent location returns a 404 error.
    This ensures our database validation logic works.
    """
    payload = {
        "start_lat": 14.4451,
        "start_lng": 75.9003,
        "destination_name": "Mars Colony Base" # Invalid location
    }

    response = client.post("/api/navigation/calculate-route", json=payload)
    
    # Verify we get a 404 Not Found
    assert response.status_code == 404
    assert response.json()["detail"] == "Destination location not found"