// Geolocation utilities for QR scanning validation

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  code: number;
  message: string;
}

// Earth's radius in meters
const EARTH_RADIUS = 6371000;

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @returns distance in meters
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}

/**
 * Check if a location is within a certain radius of another location
 */
export function isWithinRadius(
  userLocation: Coordinates,
  targetLocation: Coordinates,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLocation, targetLocation);
  return distance <= radiusMeters;
}

/**
 * Get the current position of the user
 */
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'La geolocalización no está soportada en este navegador',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'El usuario denegó el acceso a la ubicación';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'La información de ubicación no está disponible';
            break;
          case error.TIMEOUT:
            message = 'La solicitud de ubicación expiró';
            break;
          default:
            message = 'Error desconocido al obtener la ubicación';
        }
        reject({ code: error.code, message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Watch the user's position continuously
 */
export function watchPosition(
  onSuccess: (coords: Coordinates) => void,
  onError: (error: LocationError) => void
): number | null {
  if (!navigator.geolocation) {
    onError({
      code: 0,
      message: 'La geolocalización no está soportada en este navegador',
    });
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      let message: string;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'El usuario denegó el acceso a la ubicación';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'La información de ubicación no está disponible';
          break;
        case error.TIMEOUT:
          message = 'La solicitud de ubicación expiró';
          break;
        default:
          message = 'Error desconocido al obtener la ubicación';
      }
      onError({ code: error.code, message });
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    }
  );
}

/**
 * Stop watching the user's position
 */
export function clearWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Validate if user can scan QR based on location
 */
export async function validateLocationForQR(
  targetLocation: Coordinates | null | undefined,
  maxDistanceMeters: number = 30
): Promise<{ valid: boolean; distance?: number; error?: string; userLocation?: Coordinates }> {
  // If no target location is set, allow scanning (for backward compatibility)
  if (!targetLocation || !targetLocation.latitude || !targetLocation.longitude) {
    return { valid: true };
  }

  try {
    const userLocation = await getCurrentPosition();
    const distance = calculateDistance(userLocation, targetLocation);
    
    if (distance <= maxDistanceMeters) {
      return { valid: true, distance, userLocation };
    }
    
    return {
      valid: false,
      distance,
      error: `Estás a ${formatDistance(distance)} de la ubicación. Debes estar a menos de ${maxDistanceMeters} metros para escanear.`,
      userLocation,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'No se pudo obtener tu ubicación. Por favor, habilita los permisos de ubicación.',
    };
  }
}
