#!/usr/bin/env node

/**
 * Example API Server for Vite Applications
 * 
 * This demonstrates how to create an API backend that serves
 * @countrystatecity/countries data to your Vite frontend.
 * 
 * Usage:
 *   node example-api-server.js
 * 
 * Then in your Vite app:
 *   fetch('http://localhost:3001/api/countries')
 */

import { createServer } from 'http';
import { getCountries, getCountryByCode, getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries';

const PORT = 3001;

const server = createServer(async (req, res) => {
  // Enable CORS for Vite dev server
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    
    // GET /api/countries
    if (url.pathname === '/api/countries') {
      const countries = await getCountries();
      res.writeHead(200);
      res.end(JSON.stringify(countries));
      return;
    }

    // GET /api/countries/:code
    const countryMatch = url.pathname.match(/^\/api\/countries\/([A-Z]{2})$/);
    if (countryMatch) {
      const country = await getCountryByCode(countryMatch[1]);
      if (country) {
        res.writeHead(200);
        res.end(JSON.stringify(country));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Country not found' }));
      }
      return;
    }

    // GET /api/countries/:code/states
    const statesMatch = url.pathname.match(/^\/api\/countries\/([A-Z]{2})\/states$/);
    if (statesMatch) {
      const states = await getStatesOfCountry(statesMatch[1]);
      res.writeHead(200);
      res.end(JSON.stringify(states));
      return;
    }

    // GET /api/countries/:code/states/:stateCode/cities
    const citiesMatch = url.pathname.match(/^\/api\/countries\/([A-Z]{2})\/states\/([^\/]+)\/cities$/);
    if (citiesMatch) {
      const cities = await getCitiesOfState(citiesMatch[1], citiesMatch[2]);
      res.writeHead(200);
      res.end(JSON.stringify(cities));
      return;
    }

    // 404 Not Found
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error', message: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET http://localhost:${PORT}/api/countries`);
  console.log(`  GET http://localhost:${PORT}/api/countries/US`);
  console.log(`  GET http://localhost:${PORT}/api/countries/US/states`);
  console.log(`  GET http://localhost:${PORT}/api/countries/US/states/CA/cities`);
  console.log('');
  console.log('Use these endpoints from your Vite frontend:');
  console.log('  fetch("http://localhost:3001/api/countries")');
});
