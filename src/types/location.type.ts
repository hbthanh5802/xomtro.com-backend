export type divisionType =
  | 'tỉnh'
  | 'thành phố trung ương'
  | 'huyện'
  | 'quận'
  | 'thành phố'
  | 'thị xã'
  | 'xã'
  | 'thị trấn'
  | 'phường';

export type locationResponseType = {
  name: string;
  code: number;
  division_type: string;
  codename: divisionType;
  phone_code: number;
};

export type districtResponseType = locationResponseType & {
  province_code: number;
};

export type wardResponseType = locationResponseType & {
  district_code: number;
};

export type getDistrictsListType = locationResponseType & {
  districts: districtResponseType[];
};

export type getWardListType = districtResponseType & {
  wards: districtResponseType[];
};

export enum searchDivisionType {
  PROVINCE = 'p',
  DISTRICT = 'd',
  WARD = 'w'
}
