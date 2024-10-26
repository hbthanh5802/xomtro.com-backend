import cloudinary from '@/configs/cloudinary.config';
import ApiError from '@/utils/ApiError.helper';
import { generateFileName } from '@/utils/file.helper';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { StatusCodes } from 'http-status-codes';

export type uploadOptions = {
  folder: string;
  publicIdPrefix?: string;
};

export type uploadResponseType = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: 'df6d2f84698927f87222a348da9b561d';
  signature: '04f5ca8974ca55a389366d21fae554bb110de84a';
  width: 300;
  height: 300;
  format: 'jpg';
  resource_type: 'image';
  created_at: '2024-10-26T10:37:37Z';
  tags: [];
  bytes: 8736;
  type: 'upload';
  etag: '2b5d441bbda945cf62cdd93c89bd6c58';
  placeholder: false;
  url: 'http://res.cloudinary.com/dsypumxkl/image/upload/v1729939057/4bdb210a-d8d8-4bed-93a9-cbb48b213937_26-10-2024_17-37-33.jpg';
  secure_url: 'https://res.cloudinary.com/dsypumxkl/image/upload/v1729939057/4bdb210a-d8d8-4bed-93a9-cbb48b213937_26-10-2024_17-37-33.jpg';
  asset_folder: 'avatars';
  display_name: '4bdb210a-d8d8-4bed-93a9-cbb48b213937_26-10-2024_17-37-33';
  original_filename: 'file';
  api_key: '753412343853325';
};

export const uploadImage = (file: Express.Multer.File, options: uploadOptions): Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uniqueFileName = generateFileName(options.publicIdPrefix);
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;

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

    upload_stream.end(file.buffer);
  });
};

export const uploadAvatar = (file: Express.Multer.File, options: uploadOptions) => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uniqueFileName = generateFileName(options.publicIdPrefix);
    const MAX_WIDTH = 300;
    const MAX_HEIGHT = 300;

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

    upload_stream.end(file.buffer);
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
