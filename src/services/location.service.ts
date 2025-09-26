import "server-only";
import { db } from "@/db";
import { locations } from "@/db/schemas/users-schema";
import {
  CreateLocationInput,
  UpdateLocationInput,
  Location,
} from "@/models/location.model";
import { eq, sql, and, or } from "drizzle-orm";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

export class LocationService {
  static async getLocationById(id: string): Promise<Location | null> {
    const location = await db.query.locations.findFirst({
      where: eq(locations.id, id),
    });
    return location || null;
  }

  static async getLocationsByUserId(userId: string): Promise<Location[]> {
    const userLocations = await db.query.locations.findMany({
      where: eq(locations.userId, userId),
      orderBy: locations.createdAt,
    });
    return userLocations;
  }

  static async getAllLocations(
    limit: number = 10,
    offset: number = 0
  ): Promise<Location[]> {
    const allLocations = await db.query.locations.findMany({
      limit: limit,
      offset: offset,
      orderBy: locations.createdAt,
    });
    return allLocations;
  }

  static async createLocation(
    locationData: CreateLocationInput
  ): Promise<Location> {
    const newLocation = await db.transaction(async (tx) => {
      const [returned] = await tx
        .insert(locations)
        .values(locationData)
        .$returningId();

      return await tx.query.locations.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, returned.id);
        },
      });
    });
    if (!newLocation) {
      throw new Error("Failed to create location.");
    }
    return newLocation;
  }

  static async updateLocation(
    id: string,
    updateData: UpdateLocationInput
  ): Promise<Location | null> {
    const updatedLocation = await db.transaction(async (tx) => {
      await tx
        .update(locations)
        .set({ ...updateData, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(locations.id, id));

      return await tx.query.locations.findFirst({
        where(fields, { eq }) {
          return eq(fields.id, id);
        },
      });
    });
    return updatedLocation || null;
  }

  static async deleteLocation(id: string): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return result[0].affectedRows > 0;
  }

  // Example: Deactivate a location
  static async deactivateLocation(id: string): Promise<Location | null> {
    const [updatedLocation] = await db
      .update(locations)
      .set({ isActive: false })
      .where(eq(locations.id, id))
      .$returningId();

    return updatedLocation
      ? await this.getLocationById(updatedLocation.id)
      : null;
  }

  /**
   * Calculate distance between two points using Haversine formula.
   * Returns distance in kilometers.
   */
  static calculateDistance(
    point1: LocationCoordinates,
    point2: LocationCoordinates
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians.
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearby location IDs within a specified radius.
   * Uses privacy-preserving approach by working with location IDs rather than exact coordinates.
   */
  static async findNearbyLocationIds(
    centerLocation: string | LocationCoordinates,
    radiusKm: number = 10
  ): Promise<string[]> {
    let centerCoords: LocationCoordinates;

    // If centerLocation is a string, try to find it in the database
    if (typeof centerLocation === "string") {
      const locationResult = await db
        .select({
          latitude: locations.latitude,
          longitude: locations.longitude,
        })
        .from(locations)
        .where(
          or(
            eq(locations.id, centerLocation),
            eq(locations.name, centerLocation),
            eq(locations.city, centerLocation)
          )
        )
        .limit(1);

      if (!locationResult.length || !locationResult[0].latitude || !locationResult[0].longitude) {
        return [];
      }

      centerCoords = {
        latitude: locationResult[0].latitude,
        longitude: locationResult[0].longitude,
      };
    } else {
      centerCoords = centerLocation;
    }

    // Get all active locations with coordinates
    const allLocations = await db
      .select({
        id: locations.id,
        latitude: locations.latitude,
        longitude: locations.longitude,
      })
      .from(locations)
      .where(
        and(
          eq(locations.isActive, true),
          sql`${locations.latitude} IS NOT NULL`,
          sql`${locations.longitude} IS NOT NULL`
        )
      );

    // Filter locations within radius
    const nearbyLocationIds: string[] = [];

    for (const location of allLocations) {
      if (location.latitude && location.longitude) {
        const distance = this.calculateDistance(centerCoords, {
          latitude: location.latitude,
          longitude: location.longitude,
        });

        if (distance <= radiusKm) {
          nearbyLocationIds.push(location.id);
        }
      }
    }

    return nearbyLocationIds;
  }

  /**
   * Find nearby locations with full details and distance information.
   */
  static async findNearbyLocations(
    centerLocation: string | LocationCoordinates,
    radiusKm: number = 10,
    limit: number = 50
  ): Promise<LocationSearchResult[]> {
    let centerCoords: LocationCoordinates;

    // If centerLocation is a string, try to find it in the database
    if (typeof centerLocation === "string") {
      const locationResult = await db
        .select({
          latitude: locations.latitude,
          longitude: locations.longitude,
        })
        .from(locations)
        .where(
          or(
            eq(locations.id, centerLocation),
            eq(locations.name, centerLocation),
            eq(locations.city, centerLocation)
          )
        )
        .limit(1);

      if (!locationResult.length || !locationResult[0].latitude || !locationResult[0].longitude) {
        return [];
      }

      centerCoords = {
        latitude: locationResult[0].latitude,
        longitude: locationResult[0].longitude,
      };
    } else {
      centerCoords = centerLocation;
    }

    // Get all active locations with coordinates
    const allLocations = await db
      .select({
        id: locations.id,
        name: locations.name,
        address: locations.address,
        city: locations.city,
        state: locations.state,
        country: locations.country,
        latitude: locations.latitude,
        longitude: locations.longitude,
      })
      .from(locations)
      .where(
        and(
          eq(locations.isActive, true),
          sql`${locations.latitude} IS NOT NULL`,
          sql`${locations.longitude} IS NOT NULL`
        )
      );

    // Calculate distances and filter
    const nearbyLocations: LocationSearchResult[] = [];

    for (const location of allLocations) {
      if (location.latitude && location.longitude) {
        const distance = this.calculateDistance(centerCoords, {
          latitude: location.latitude,
          longitude: location.longitude,
        });

        if (distance <= radiusKm) {
          nearbyLocations.push({
            id: location.id,
            name: location.name,
            address: location.address,
            city: location.city,
            state: location.state,
            country: location.country,
            latitude: location.latitude,
            longitude: location.longitude,
            distance,
          });
        }
      }
    }

    // Sort by distance and limit results
    return nearbyLocations
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, limit);
  }

  /**
   * Search locations by name, city, or address.
   */
  static async searchLocations(
    query: string,
    limit: number = 20
  ): Promise<LocationSearchResult[]> {
    const searchResults = await db
      .select({
        id: locations.id,
        name: locations.name,
        address: locations.address,
        city: locations.city,
        state: locations.state,
        country: locations.country,
        latitude: locations.latitude,
        longitude: locations.longitude,
      })
      .from(locations)
      .where(
        and(
          eq(locations.isActive, true),
          or(
            sql`${locations.name} LIKE ${`%${query}%`}`,
            sql`${locations.city} LIKE ${`%${query}%`}`,
            sql`${locations.address} LIKE ${`%${query}%`}`,
            sql`${locations.state} LIKE ${`%${query}%`}`
          )
        )
      )
      .limit(limit);

    return searchResults;
  }

  /**
   * Create a privacy-preserving location hash for recommendation algorithms.
   * This allows for location-based recommendations without exposing exact coordinates.
   */
  static createLocationHash(coordinates: LocationCoordinates, precision: number = 3): string {
    // Round coordinates to specified precision to create location clusters
    const roundedLat = Math.round(coordinates.latitude * Math.pow(10, precision)) / Math.pow(10, precision);
    const roundedLon = Math.round(coordinates.longitude * Math.pow(10, precision)) / Math.pow(10, precision);
    
    // Create a hash from the rounded coordinates
    return `${roundedLat}_${roundedLon}`;
  }

  /**
   * Get location clusters for privacy-preserving recommendations.
   * Groups nearby locations into clusters to protect user privacy.
   */
  static async getLocationClusters(
    radiusKm: number = 5,
    precision: number = 3
  ): Promise<Map<string, string[]>> {
    const allLocations = await db
      .select({
        id: locations.id,
        latitude: locations.latitude,
        longitude: locations.longitude,
      })
      .from(locations)
      .where(
        and(
          eq(locations.isActive, true),
          sql`${locations.latitude} IS NOT NULL`,
          sql`${locations.longitude} IS NOT NULL`
        )
      );

    const clusters = new Map<string, string[]>();

    for (const location of allLocations) {
      if (location.latitude && location.longitude) {
        const hash = this.createLocationHash(
          { latitude: location.latitude, longitude: location.longitude },
          precision
        );

        if (!clusters.has(hash)) {
          clusters.set(hash, []);
        }
        clusters.get(hash)!.push(location.id);
      }
    }

    return clusters;
  }

  /**
   * Calculate location-based relevance score for recommendations.
   * Uses distance decay function to score items based on proximity.
   */
  static calculateLocationRelevanceScore(
    userLocation: LocationCoordinates,
    itemLocation: LocationCoordinates,
    maxDistance: number = 50
  ): number {
    const distance = this.calculateDistance(userLocation, itemLocation);
    
    if (distance > maxDistance) {
      return 0;
    }

    // Use exponential decay function for relevance scoring
    // Score ranges from 1.0 (same location) to 0.0 (max distance)
    const decayFactor = 0.1; // Adjust this to control how quickly relevance decreases
    const score = Math.exp(-decayFactor * distance);
    
    return Math.round(score * 1000) / 1000; // Round to 3 decimal places
  }

  /**
   * Get popular locations based on listing activity.
   */
  static async getPopularLocations(limit: number = 10): Promise<LocationSearchResult[]> {
    // This would typically join with listings table to count activity
    // For now, we'll return locations with the most recent activity
    const popularLocations = await db
      .select({
        id: locations.id,
        name: locations.name,
        address: locations.address,
        city: locations.city,
        state: locations.state,
        country: locations.country,
        latitude: locations.latitude,
        longitude: locations.longitude,
      })
      .from(locations)
      .where(eq(locations.isActive, true))
      .limit(limit);

    return popularLocations;
  }

  /**
   * Validate coordinates are within reasonable bounds.
   */
  static validateCoordinates(coordinates: LocationCoordinates): boolean {
    const { latitude, longitude } = coordinates;
    
    return (
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Get approximate location for privacy (rounds to nearest city/area).
   */
  static getApproximateLocation(
    coordinates: LocationCoordinates,
    precision: number = 1
  ): LocationCoordinates {
    return {
      latitude: Math.round(coordinates.latitude * Math.pow(10, precision)) / Math.pow(10, precision),
      longitude: Math.round(coordinates.longitude * Math.pow(10, precision)) / Math.pow(10, precision),
    };
  }
}
