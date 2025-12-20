/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    // Google Maps API is loaded dynamically via @googlemaps/js-api-loader
    google?: typeof google
  }
}

// Export empty object to make this a module
export {}
