import openmeteo_requests
import requests_cache
from retry_requests import retry

def get_current_weather(latitude: float, longitude: float) -> str:
    """
    Fetches the current weather for a specific lat/lng.
    For BIET campus, lat=14.444, lng=75.903
    """
    try:
        cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
        retry_session = retry(cache_session, tries=5, backoff_factor=0.2)
        openmeteo = openmeteo_requests.Client(session=retry_session)

        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude, "longitude": longitude,
            "current": ["temperature_2m", "precipitation", "wind_speed_10m"]
        }
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]

        current = response.Current()
        temp = current.Variables(0).Value()
        precip = current.Variables(1).Value()
        wind = current.Variables(2).Value()

        return (
            f"The current weather at the campus is {temp:.1f}°C "
            f"with {precip:.1f} mm of precipitation and "
            f"wind speeds of {wind:.1f} km/h."
        )
    except Exception as e:
        return f"I'm sorry, I couldn't fetch the current weather: {e}"