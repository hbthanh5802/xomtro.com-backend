export const WHITELIST_DOMAIN = ['http://localhost:4444'];

export const generateSlug = (str: string) => {
  if (!str) return '';
  // Transform to lowercase
  str = str.toLowerCase();

  // Remove notes
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');

  // Delete all special symbols
  str = str.replace(/([^0-9a-z-\s])/g, '');

  // Replace all white space to '-'
  str = str.replace(/(\s+)/g, '-');

  // Remove '-' symbol
  str = str.replace(/-+/g, '-');

  // Delete consecutive '-' characters
  str = str.replace(/^-+/g, '');

  // Delete consecutive characters at the end
  str = str.replace(/-+$/g, '');

  return str;
};

export const cleanObject = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null && value !== '' && !Number.isNaN(value))
  );
};
