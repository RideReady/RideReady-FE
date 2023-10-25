import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './Components/App/App';
import { inject } from '@vercel/analytics';

if (window.location.host === 'www.ridereadybike.com') {
  inject();
}

let cspContent = "";

const environment = import.meta.env.VITE_ENV;

if (environment === 'development') {
  cspContent = `default-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' http://localhost:5173; img-src 'self' http://localhost:5173; connect-src 'self' http://localhost:5173 http://localhost:5001 http://www.strava.com ; font-src 'self' style-src 'self';`;
} else {
  cspContent = `default-src 'self'; script-src 'self' https://www.ridereadybike.com ; img-src 'self' https://www.ridereadybike.com; connect-src 'self' https://www.ridereadybike.com http://www.strava.com https://vercel.live/; frame-src https://vercel.live/ ; font-src 'self' style-src 'self';`;
}

document.getElementById('csp-meta-tag').setAttribute('content', cspContent);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BrowserRouter>
);

