import type { VisitLocation } from '../types';

// Resolves to the current coordinates, or null if the browser doesn't
// support geolocation, permission is denied, or it times out — callers
// should treat a visit's location as optional and submit without it
// rather than block on this.
export function getCurrentLocation(): Promise<VisitLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => resolve(null),
      { timeout: 5000 },
    );
  });
}
