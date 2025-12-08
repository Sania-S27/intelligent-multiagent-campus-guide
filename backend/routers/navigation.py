from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import database, schemas, models
from agents import navigation_agent

router = APIRouter()

@router.get("/locations", response_model=List[schemas.Location])
def get_all_locations(db: Session = Depends(database.get_db)):
    """Fetches all locations for map markers."""
    locations = navigation_agent.get_all_db_locations(db)
    # Convert latitude/longitude from Decimal to float
    return [
        schemas.Location(
            id=loc.id,
            name=loc.name,
            latitude=float(loc.latitude),
            longitude=float(loc.longitude)
        ) for loc in locations
    ]

@router.get("/paths", response_model=List[schemas.RoutePath])
def get_all_paths(db: Session = Depends(database.get_db)):
    """Fetches all pre-defined paths for map polylines."""
    routes = navigation_agent.get_all_db_paths(db)
    # Use the custom from_orm method in the schema to handle JSON
    return [schemas.RoutePath.from_orm(route) for route in routes]
# ... (imports) ...

@router.post("/calculate-route", response_model=schemas.RouteGeometry)
def get_calculated_route(
    request: schemas.RouteRequest, 
    db: Session = Depends(database.get_db)
):
    dest_loc = db.query(models.Location).filter(models.Location.name == request.destination_name).first()
    if not dest_loc:
        raise HTTPException(status_code=404, detail="Destination location not found")

    route_data = navigation_agent.get_walking_route(
        start_lng=request.start_lng,
        start_lat=request.start_lat,
        end_lng=float(dest_loc.longitude),
        end_lat=float(dest_loc.latitude)
    )
    
    if not route_data:
        raise HTTPException(status_code=500, detail="Could not calculate route")
        
    # VVV THIS IS THE CHANGE VVV
    # Pass the full dictionary {"geometry": ..., "bbox": ..., "duration": ...}
    return schemas.RouteGeometry(**route_data)
    # ^^^ END OF CHANGE ^^^