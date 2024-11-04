import axiosRequest from '@/configs/axiosClient.config';
import {
  distanceMatrixByGoong,
  distanceMatrixRequestPayload,
  geocodingByDistanceMatrix,
  geocodingByGeocodeMap,
  geocodingReverseByGoong,
  locationAutoCompleteByGoong,
  locationAutoCompleteRequestPayload
} from '@/services/location.service';
import {
  autoCompleteResponseType,
  distanceResponseType,
  getDistrictsListType,
  getWardListType,
  locationResponseType,
  searchDivisionType,
  vehicleType
} from '@/types/location.type';
import ApiError from '@/utils/ApiError.helper';
import { ApiResponse } from '@/utils/ApiResponse.helper';
import { NextFunction, Request, Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export const getProvincesList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listResult = await axiosRequest<locationResponseType[]>({
      url: 'https://provinces.open-api.vn/api/p/',
      method: 'GET'
    });
    return new ApiResponse(StatusCodes.OK, 'Get provinces successfully!', listResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const getDistrictsList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listResult = await axiosRequest<locationResponseType>({
      url: 'https://provinces.open-api.vn/api/d/'
    });
    return new ApiResponse(StatusCodes.OK, 'Get provinces successfully!', listResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const getWardsList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listResult = await axiosRequest<locationResponseType>({ url: 'https://provinces.open-api.vn/api/w/' });
    return new ApiResponse(StatusCodes.OK, 'Get provinces successfully!', listResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const getDistrictsByProvinceCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provinceCode } = req.query;
    if (!provinceCode) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }
    const provinceListResult = await axiosRequest<getDistrictsListType>({
      url: 'https://provinces.open-api.vn/api/p/' + provinceCode,
      params: { depth: 2 }
    });
    return new ApiResponse(StatusCodes.OK, 'Get provinces successfully!', provinceListResult.districts).send(res);
  } catch (error) {
    next(error);
  }
};

export const getWardsByDistrictCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { districtCode } = req.query;
    if (!districtCode) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }
    const provinceListResult = await axiosRequest<getWardListType>({
      url: 'https://provinces.open-api.vn/api/d/' + districtCode,
      params: { depth: 2 }
    });
    return new ApiResponse(StatusCodes.OK, 'Get provinces successfully!', provinceListResult.wards).send(res);
  } catch (error) {
    next(error);
  }
};

export const searchLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { searchValue, division } = req.query;
    if (
      !searchValue ||
      !searchValue.toString().trim() ||
      !division ||
      !Object.values(searchDivisionType).includes(division as searchDivisionType)
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const searchResult = await axiosRequest({
      url: `https://provinces.open-api.vn/api/${division}/search/`,
      method: 'GET',
      params: {
        q: searchValue
      }
    });
    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, searchResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const getGeocodingFromAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.query;
    if (!address) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `"address" parameter is required.`);
    }

    const apiServices = [
      () => geocodingByDistanceMatrix(address as string),
      () => geocodingByGeocodeMap(address as string)
    ];

    const randomApiServiceIndex = Math.floor(Math.random() * apiServices.length);
    const response = await apiServices[randomApiServiceIndex]();

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, {
      ...response,
      apiIndex: randomApiServiceIndex
    }).send(res);
  } catch (error) {
    next(error);
  }
};

export const getGeocodingReverseFromDimension = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { longitude, latitude } = req.query;
    if (!longitude || !latitude) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Dimension of location is required');
    }

    const geocdingReverseResult = await geocodingReverseByGoong(Number(latitude), Number(longitude));

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, geocdingReverseResult).send(res);
  } catch (error) {
    next(error);
  }
};

export const getAutoCompleteFromSearchValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { searchValue, longitude, latitude, limit, radius } = req.query;
    if (!searchValue) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'searchValue is required');
    }

    const searchPayload: locationAutoCompleteRequestPayload = {
      searchValue: searchValue as string,
      limit: Number(limit),
      location: {
        longitude: Number(longitude),
        latitude: Number(latitude)
      },
      radius: Number(radius)
    };
    const result = await locationAutoCompleteByGoong(searchPayload);
    const { predictions } = result;
    const responseData: autoCompleteResponseType[] = predictions.map((prediction) => {
      const { description, place_id, reference, compound, terms, structured_formatting } = prediction;
      return {
        description: description,
        placeId: place_id,
        googleMapReference: reference,
        province: compound.province,
        district: compound.district,
        ward: compound.commune,
        matches: terms,
        mainText: structured_formatting.main_text,
        subText: structured_formatting.secondary_text
      };
    });

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, responseData).send(res);
  } catch (error) {
    next(error);
  }
};

export const getDistanceMatrixFromDimensions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { origins, destinations, vehicle } = req.query;
    if (!origins || (Array.isArray(origins) && !origins.length)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Origins value is invalid, must be string<latitude,longitude>|string array same format'
      );
    }

    if (!destinations || (Array.isArray(destinations) && !destinations.length)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Destinations value is invalid, must be string<latitude,longitude>|string array same format'
      );
    }

    if (vehicle && !Object.values(vehicleType).includes(vehicle as vehicleType)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Vehicle value is invalid, can be  |car |truck |taxi |bike |hd');
    }

    const requestPayload: distanceMatrixRequestPayload = {
      origins: Array.isArray(origins) ? origins.join(' | ') : (origins as string),
      destinations: Array.isArray(destinations) ? destinations.join(' | ') : (destinations as string),
      ...(vehicle && { vehicle: vehicle as string })
    };
    const response = await distanceMatrixByGoong(requestPayload);
    const responseData: distanceResponseType[] = response.rows[0].elements.map((distanceData) => {
      const { distance, duration } = distanceData;
      return { distance, duration };
    });

    return new ApiResponse(StatusCodes.OK, ReasonPhrases.OK, responseData).send(res);
  } catch (error) {
    next(error);
  }
};
