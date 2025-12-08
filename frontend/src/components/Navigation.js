import React, { useState, useEffect, useRef } from 'react';
// All imports are from the default 'react-map-gl'
import Map, { 
    Marker, 
    Popup, 
    Source, 
    Layer, 
    GeolocateControl 
} from 'react-map-gl';

// Import the LngLatBounds class directly
import { LngLatBounds } from 'mapbox-gl'; 

// This will make 'react-map-gl' use the 'mapbox-gl' engine
import 'mapbox-gl/dist/mapbox-gl.css';

import { getLocations, calculateRoute } from '../api'; 

// VVV PASTE YOUR TOKEN HERE VVV
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2FuaWEtMjciLCJhIjoiY21oc3k3eGFqMGxubTJvc2RmbmR0dG43ZCJ9.l4n65M2HJU4Etzb97CsA0Q'; 
// ^^^ PASTE YOUR TOKEN HERE ^^^

// Style for the calculated route
const calculatedRouteStyle = {
  id: 'calculated-route-layer',
  type: 'line',
  paint: {
    'line-color': '#FF0000', // Bright red
    'line-width': 6,
    'line-opacity': 0.9
  }
};

// Helper to format duration
const formatDuration = (seconds) => {
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
};

// Helper to get bounds
function getBoundsFromGeometry(geometry) {
  const coordinates = geometry.coordinates;
  const bounds = new LngLatBounds(coordinates[0], coordinates[0]);
  for (const coord of coordinates) {
    bounds.extend(coord);
  }
  return bounds.toArray();
}


const Navigation = ({ destinationToNavigate, clearDestinationToNavigate }) => {
  const [viewState, setViewState] = useState({
    longitude: 75.9034410,
    latitude: 14.4442918,
    zoom: 16.5
  });

  const [locations, setLocations] = useState([]); 
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [calculatedRoute, setCalculatedRoute] = useState(null); 
  const [destination, setDestination] = useState(null); 
  const [currentPosition, setCurrentPosition] = useState(null);
  
  const [isNavigating, setIsNavigating] = useState(false); 
  const [routeDuration, setRouteDuration] = useState(null); 
  
  const mapRef = useRef(null);
  const geolocateControlRef = useRef(null); 

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locRes = await getLocations();
        setLocations(locRes.data);
      } catch (err) {
        console.error("Failed to load map data", err);
      }
    };
    loadLocations();
  }, []);

  //
  // VVV THIS IS THE FIX VVV
  //
  useEffect(() => {
    if (destinationToNavigate) {
      console.log("Navigation Agent: Received request for:", destinationToNavigate);
      
      setDestination(destinationToNavigate);

      // Wait a bit for the map to load, then try to trigger location
      const timer = setTimeout(() => {
        // CRITICAL SAFETY CHECK: Ensure the ref exists before calling trigger()
        if (geolocateControlRef.current) {
          geolocateControlRef.current.trigger();
        } else {
            console.warn("Geolocate control not ready yet.");
        }
      }, 1000); // Wait 1 second to be safe
      
      clearDestinationToNavigate();
      return () => clearTimeout(timer);
    }
  }, [destinationToNavigate, clearDestinationToNavigate]);
  // ^^^ END OF FIX ^^^


  const updateRoute = async (currentCoords, isFirstLoad = false) => {
    // Use either the state destination OR the prop destination if state isn't set yet
    const targetDest = destination || destinationToNavigate;
    
    if (!targetDest) return; 

    try {
      const map = mapRef.current.getMap(); 

      if (map) {
        if (map.getLayer(calculatedRouteStyle.id)) {
          map.removeLayer(calculatedRouteStyle.id);
        }
        if (map.getSource('calculated-route')) {
          map.removeSource('calculated-route');
        }
      }

      const response = await calculateRoute({
        start_lat: currentCoords.latitude,
        start_lng: currentCoords.longitude,
        destination_name: targetDest
      });
      
      const routeData = response.data;
      
      setCalculatedRoute({
        type: 'Feature',
        geometry: routeData.geometry
      });
      
      setRouteDuration(routeData.duration);

      if (isFirstLoad && mapRef.current) {
        const bounds = getBoundsFromGeometry(routeData.geometry);
        mapRef.current.getMap().fitBounds(
          bounds,
          { padding: 60, duration: 1000 }
        );
      }

    } catch (err) {
      console.error("Failed to recalculate route", err);
    }
  };

  const handleGetDirections = () => {
    if (!destination) {
      alert("Please select a destination first.");
      return;
    }
    if (!currentPosition) {
      alert("Please click the 📍 'Find Me' button to get your location first.");
      return;
    }
    
    setIsNavigating(false); 
    updateRoute(currentPosition, true); 
  };
  
  const handleStartTravel = () => {
    setIsNavigating(true);
    if (geolocateControlRef.current) {
      geolocateControlRef.current.trigger();
    }
  };
  
  const handleStopTravel = () => {
    setIsNavigating(false);
  };

  const handleDestinationSelect = (e) => {
    const newDestination = e.target.value;
    setDestination(newDestination);
    setCalculatedRoute(null);
    setRouteDuration(null);
    setIsNavigating(false); 
  };

  return (
    <div className="navigation-container" style={{ height: '100%', width: '100%' }}>
      
      <div className="nav-controls">
        <select 
            id="destination-select" 
            className="nav-select" 
            onChange={handleDestinationSelect}
            value={destination || ""} // Control the value
        >
          <option value="">Select a Destination...</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.name}>
              {loc.name}
            </option>
          ))}
        </select>
        
        {calculatedRoute && !isNavigating && (
          <div className="route-info">
            Estimated time: <strong>{formatDuration(routeDuration)}</strong>
          </div>
        )}
        {!isNavigating && (
          <button className="nav-button get-directions" onClick={handleGetDirections}>
            Get Directions
          </button>
        )}
        {calculatedRoute && !isNavigating && (
          <button className="nav-button start-travel" onClick={handleStartTravel}>
            Start Travel
          </button>
        )}
        {isNavigating && (
          <button className="nav-button stop-travel" onClick={handleStopTravel}>
            Stop
          </button>
        )}
      </div>

      <Map
        ref={mapRef} 
        mapboxAccessToken={MAPBOX_TOKEN}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12?access_token=${MAPBOX_TOKEN}`}
      >
        
        <GeolocateControl
          ref={geolocateControlRef}
          position="top-right"
          trackUserLocation={isNavigating}
          showUserHeading={true}
          onGeolocate={(e) => {
            const newPos = e.coords;
            setCurrentPosition(newPos);
            // If navigating OR just arrived from Events tab
            if (isNavigating || (destinationToNavigate && !calculatedRoute)) {
              updateRoute(newPos, true); // Treat as first load to zoom
            }
          }}
        />

        {locations.map(loc => (
          <Marker
            key={loc.id}
            longitude={loc.longitude}
            latitude={loc.latitude}
            anchor="center"
          >
            <div
              style={{ width: '30px', height: '30px', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredLocation(loc)}
              onMouseLeave={() => setHoveredLocation(null)}
            />
          </Marker>
        ))}
        {hoveredLocation && (
          <Popup
            longitude={hoveredLocation.longitude}
            latitude={hoveredLocation.latitude}
            onClose={() => setHoveredLocation(null)}
            anchor="bottom"
            closeButton={false}
            offset={10}
          >
            <strong>{hoveredLocation.name}</strong>
          </Popup>
        )}
        
        {calculatedRoute && (
          <Source id="calculated-route" type="geojson" data={calculatedRoute}>
            <Layer {...calculatedRouteStyle} />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default Navigation;