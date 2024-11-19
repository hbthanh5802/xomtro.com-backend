import axiosRequest from '@/configs/axiosClient.config';
import { env } from '@/configs/env.config';
import {
  DistanceMatrixGeocodeResponse,
  GeocodeMapGeoCodeResponseType,
  GoongAutoCompleteResponseType,
  GoongDistanceMatrixResponseType,
  GoongGeocodeResponse,
  GoongGeocodeReverseResponse,
  geocodingResponseType,
  geocodingReverseResponseType
} from '@/types/location.type';
import ApiError from '@/utils/ApiError.helper';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const geocodingByDistanceMatrix = async (address: string) => {
  try {
    const response = await axiosRequest<DistanceMatrixGeocodeResponse>({
      url: 'https://api.distancematrix.ai/maps/api/geocode/json',
      params: {
        address,
        key: env.DISTANCEMETRIX_GEOCODING_API_KEY,
        region: 'vn'
      }
    });
    const { result, status } = response;
    if (status !== 'OK') {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const responseData: geocodingResponseType = {
      longitude: result[0].geometry.location.lng,
      latitude: result[0].geometry.location.lat,
      placeId: result[0].place_id,
      displayName: result[0].formatted_address
    };

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const geocodingByGeocodeMap = async (address: string) => {
  try {
    const response = await axiosRequest<GeocodeMapGeoCodeResponseType[]>({
      url: 'https://geocode.maps.co/search',
      params: {
        q: address,
        api_key: env.GEOCODEMAP_API_KEY
      }
    });

    if (!response.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }
    response.sort((a: GeocodeMapGeoCodeResponseType, b: GeocodeMapGeoCodeResponseType) => b.importance - a.importance);
    const responseData: geocodingResponseType = {
      longitude: Number(response[0].lon),
      latitude: Number(response[0].lat),
      placeId: response[0].place_id.toString(),
      displayName: response[0].display_name,
      accuracy: response[0].importance
    };

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const geocodingByGoong = async (address: string) => {
  try {
    const response = await axiosRequest<GoongGeocodeResponse>({
      url: 'https://rsapi.goong.io/geocode',
      params: {
        address: address,
        api_key: env.GOONG_API_KEY
      }
    });

    if (!response.results.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const result = response.results[0];
    const responseData: geocodingResponseType = {
      longitude: Number(result.geometry.location.lng),
      latitude: Number(result.geometry.location.lat),
      placeId: result.place_id,
      googleMapReference: result.reference,
      displayName: result.formatted_address
    };

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const geocodingReverseByGoong = async (latitude: number, longitude: number) => {
  try {
    const response = await axiosRequest<GoongGeocodeReverseResponse>({
      url: 'https://rsapi.goong.io/geocode',
      params: {
        api_key: env.GOONG_API_KEY,
        latlng: `${latitude},${longitude}`
      }
    });
    const { results, status } = response;

    if (status !== 'OK') {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    const responseData: geocodingReverseResponseType = {
      placeId: results[0].place_id,
      longitude: results[0].geometry.location.lng,
      latitude: results[0].geometry.location.lat,
      displayAddress: results[0].formatted_address,
      addressComponents: results[0].address_components.map(({ long_name }) => long_name),
      googleMapsReference: results[0].reference
    };

    return responseData;
  } catch (error) {
    throw error;
  }
};

export type locationAutoCompleteRequestPayload = {
  searchValue: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  limit?: number;
  moreCompound?: boolean;
  radius?: number;
};

export const locationAutoCompleteByGoong = async (payload: locationAutoCompleteRequestPayload) => {
  try {
    const response = await axiosRequest<GoongAutoCompleteResponseType>({
      url: 'https://rsapi.goong.io/place/autocomplete',
      params: {
        api_key: env.GOONG_API_KEY,
        input: payload.searchValue,
        ...(payload.location && { location: `${payload.location.latitude},${payload.location.longitude}` }),
        ...(payload.limit && { limit: payload.limit }),
        ...(payload.radius && { radius: payload.radius }),
        more_compound: true
      }
    });

    if (!response.predictions.length || response.status !== 'OK') {
      throw new ApiError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
    }

    return response;
  } catch (error) {
    throw error;
  }
};

export type distanceMatrixRequestPayload = {
  origins: string;
  destinations: string;
  vehicle?: string;
};

export const distanceMatrixByGoong = async (payload: distanceMatrixRequestPayload) => {
  return axiosRequest<GoongDistanceMatrixResponseType>({
    url: 'https://rsapi.goong.io/distancematrix',
    params: { ...payload, api_key: env.GOONG_API_KEY }
  });
};
