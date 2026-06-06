const axios = require('axios');
const AppError = require('../utils/AppError');

class MapplsService {
  constructor() {
    this.clientId = process.env.MAPPLS_CLIENT_ID;
    this.clientSecret = process.env.MAPPLS_CLIENT_SECRET;
    this.restKey = process.env.MAPPLS_REST_KEY;
    this.token = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.token && this.tokenExpiry > Date.now()) {
      return this.token;
    }

    try {
      const response = await axios.post('https://outpost.mappls.com/api/security/oauth/token', null, {
        params: {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.token = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Subtract 1 min for safety
      return this.token;
    } catch (error) {
      console.error('Mappls Token Error:', error.message);
      // Fallback or throw
      return null;
    }
  }

  async getRoute(origin, destination) {
    // origin, destination: { lat, lng }
    try {
      const token = await this.getAccessToken();
      const url = `https://apis.mappls.com/advancedmaps/v1/${this.restKey}/route_adv/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
      
      const response = await axios.get(url, {
        params: {
          overview: 'full',
          geometries: 'polyline', // or 'geojson'
          steps: true
        }
      });

      if (response.data.code !== 'Ok') {
        throw new Error('Mappls Route API failed: ' + response.data.code);
      }

      return response.data.routes[0];
    } catch (error) {
      console.error('Mappls Route Error:', error.message);
      // Deterministic fallback if API fails
      return null;
    }
  }

  async getDistanceMatrix(origin, destination) {
    try {
      const url = `https://apis.mappls.com/advancedmaps/v1/${this.restKey}/distance_matrix/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
      const response = await axios.get(url);

      if (response.data.code !== 'Ok') {
        throw new Error('Mappls Distance Matrix API failed');
      }

      return response.data.results.distances[0][1]; // Returns { distance, duration }
    } catch (error) {
      console.error('Mappls Distance Matrix Error:', error.message);
      return null;
    }
  }

  // Helper to decode polyline if needed, or we just use GeoJSON if API supports it well
  // For simplicity in simulation, we can ask for geometries: 'geojson' or decode polyline
}

module.exports = new MapplsService();
