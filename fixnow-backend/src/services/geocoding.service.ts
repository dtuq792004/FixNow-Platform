import axios from "axios";

type AddressInput = {
  addressLine?: string;
  ward?: string;
  district?: string;
  city?: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
};

export type GeocodingResult = {
  latitude: number;
  longitude: number;
  displayName?: string;
};

export async function geocodeAddress(address: AddressInput): Promise<GeocodingResult | null> {
  const query = [
    address.addressLine,
    address.ward,
    address.district,
    address.city,
    "Việt Nam",
  ].filter(Boolean).join(", ");

  if (!address.addressLine || !address.city) return null;

  try {
    const response = await axios.get<NominatimResult[]>(
      `${process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org"}/search`,
      {
        params: {
          q: query,
          format: "jsonv2",
          limit: 1,
          countrycodes: "vn",
          addressdetails: 1,
          ...(process.env.NOMINATIM_EMAIL ? { email: process.env.NOMINATIM_EMAIL } : {}),
        },
        headers: {
          "Accept-Language": "vi,en;q=0.8",
          "User-Agent": process.env.GEOCODING_USER_AGENT || "FixNow-Platform/1.0",
        },
        timeout: 8000,
      },
    );

    const match = response.data[0];
    if (!match) return null;

    const latitude = Number(match.lat);
    const longitude = Number(match.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    return { latitude, longitude, displayName: match.display_name };
  } catch (error) {
    console.warn("Geocoding failed:", error instanceof Error ? error.message : error);
    return null;
  }
}
