import sharp, { ResizeOptions } from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export const generateFileName = (fileName?: string) => {
  return `${fileName ? fileName + '_' : ''}${uuidv4()}`;
};

export const optimizeImage = async (buffer: Buffer, options?: ResizeOptions): Promise<Buffer> => {
  const MAX_WIDTH = options?.width || 1920;
  const MAX_HEIGHT = options?.height || 1080;

  try {
    return await sharp(buffer)
      .resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: 'contain'
      })
      .webp({
        quality: 85,
        effort: 4, // Giảm nỗ lực để tăng tốc xử lý
        smartSubsample: true,
        nearLossless: false // Loại bỏ gần-lossless nếu muốn tối ưu hơn nữa
      })
      .toBuffer();
  } catch (error) {
    throw new Error('Image processing failed');
  }
};
