import axiosRequest from '@/configs/axiosClient.config';
import {
  districtResponseType,
  getDistrictsListType,
  getWardListType,
  locationResponseType,
  searchDivisionType
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
