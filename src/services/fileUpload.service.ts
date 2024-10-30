import cloudinary from '@/configs/cloudinary.config';
import ApiError from '@/utils/ApiError.helper';
import { generateFileName, optimizeImage } from '@/utils/file.helper';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { StatusCodes } from 'http-status-codes';

export type uploadOptions = {
  folder: string;
  publicIdPrefix?: string;
};

export const uploadImage = (file: Express.Multer.File, options: uploadOptions): Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>(async (resolve, reject) => {
    const uniqueFileName = generateFileName(options.publicIdPrefix);
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;

    const optimizedBuffer = await optimizeImage(file.buffer);

    const upload_stream = cloudinary.uploader.upload_stream(
      {
        asset_folder: options.folder,
        public_id: uniqueFileName,
        transformation: [
          {
            width: MAX_WIDTH,
            height: MAX_HEIGHT,
            crop: 'limit'
          },
          {
            quality: 'auto:good',
            fetch_format: 'auto'
          }
        ]
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Upload image failed!'));
        }
        if (result) {
          resolve(result);
        }
      }
    );

    upload_stream.end(optimizedBuffer);
  });
};

export const uploadAvatar = (file: Express.Multer.File, options: uploadOptions) => {
  return new Promise<UploadApiResponse>(async (resolve, reject) => {
    const uniqueFileName = generateFileName(options.publicIdPrefix);
    const MAX_WIDTH = 300;
    const MAX_HEIGHT = 300;

    const optimizedBuffer = await optimizeImage(file.buffer);

    const upload_stream = cloudinary.uploader.upload_stream(
      {
        asset_folder: options.folder,
        public_id: uniqueFileName,
        transformation: [
          {
            width: MAX_WIDTH,
            height: MAX_HEIGHT,
            crop: 'thumb',
            gravity: 'face'
          },
          {
            quality: 'auto:good',
            fetch_format: 'auto'
          }
        ]
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Upload avatar failed!'));
        }
        if (result) {
          resolve(result);
        }
      }
    );

    upload_stream.end(optimizedBuffer);
  });
};

export const uploadVideo = (file: Express.Multer.File, options: uploadOptions) => {
  return new Promise((resolve, reject) => {
    const uniqueFileName = generateFileName(options.publicIdPrefix);
    const MAX_WIDTH = 1280;
    const MAX_HEIGHT = 720;

    const upload_stream = cloudinary.uploader.upload_stream(
      {
        asset_folder: options.folder,
        public_id: uniqueFileName,
        transformation: [
          {
            quality: 'auto',
            fetch_format: 'auto',
            width: MAX_WIDTH,
            height: MAX_HEIGHT,
            crop: 'scale',
            bit_rate: '500k',
            audio_codec: 'aac',
            audio_bit_rate: '64k',
            fps: 24
          }
        ]
      },
      (error: any, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Upload video failed!'));
        }
        resolve(result);
      }
    );

    upload_stream.end(file.buffer);
  });
};

export const deleteResource = async (name: string, type: 'image' | 'video') => {
  return cloudinary.uploader.destroy(name, { resource_type: type });
};

export const uploadImageFromUrl = async (url: string, options: uploadOptions) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uniqueFileName = generateFileName(options.publicIdPrefix);
    const MAX_WIDTH = 300;
    const MAX_HEIGHT = 300;

    const uploadResponse = cloudinary.uploader.upload(
      url,
      {
        asset_folder: options.folder,
        public_id: uniqueFileName,
        transformation: [
          {
            width: MAX_WIDTH,
            height: MAX_HEIGHT,
            crop: 'thumb',
            gravity: 'face'
          },
          {
            quality: 'auto:good',
            fetch_format: 'auto'
          }
        ]
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Upload avatar failed!'));
        }
        if (result) {
          resolve(result);
        }
      }
    );
  });
};
