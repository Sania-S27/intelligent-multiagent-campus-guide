import React from 'react';
import ReactDOM from 'react-dom/client';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);