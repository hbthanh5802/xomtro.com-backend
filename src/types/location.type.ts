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

// DistanceMatrix.ai
type DistanceMatrixStatusResponse =
  | 'OK'
  | 'ZERO_RESULTS'
  | 'OVER_DAILY_LIMIT'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ERROR';

type DistanceMatrixGeocodeResultType =
  | 'street_address'
  | 'route'
  | 'intersection'
  | 'political'
  | 'country'
  | 'administrative_area_level_1'
  | 'administrative_area_level_2'
  | 'administrative_area_level_3'
  | 'administrative_area_level_4'
  | 'administrative_area_level_5'
  | 'colloquial_area'
  | 'locality'
  | 'sublocality'
  | 'sublocality_level_1'
  | 'sublocality_level_2'
  | 'sublocality_level_3'
  | 'sublocality_level_4'
  | 'sublocality_level_5'
  | 'neighborhood'
  | 'premise'
  | 'subpremise'
  | 'postcode'
  | 'natural_feature'
  | 'airport'
  | 'park'
  | 'point_of_interest';

type DistanceMatrixGeocodeLocationType = 'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: DistanceMatrixGeocodeResultType[];
}

interface Geometry {
  location: {
    lat: number;
    lng: number;
  };
  location_type: DistanceMatrixGeocodeLocationType;
  viewport: {
    northeast: {
      lat: number;
      lng: number;
    };
    southwest: {
      lat: number;
      lng: number;
    };
  };
}

interface DistanceMatrixGeocodeResult {
  address_components: AddressComponent[] | null;
  formatted_address: string;
  geometry: Geometry;
  place_id: string;
  plus_code?: {
    compound_code?: string;
    global_code?: string;
  };
  types: DistanceMatrixGeocodeResultType[];
}

export interface DistanceMatrixGeocodeResponse {
  result: DistanceMatrixGeocodeResult[];
  status: DistanceMatrixStatusResponse;
}

// Geocode.map.io
export type GeocodeMapGeoCodeResponseType = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
};

// Goong.io
export interface GoongGeocodeResponse {
  results: Array<{
    address_components: { long_name: string; short_name: string }[];
    formatted_address: string;
    geometry: { location: { lat: number; lng: number }; boundary: any };
    place_id: string;
    reference: string;
    plus_code: { compound_code: string; global_code: string };
    compound: { district: string; commune: string; province: string };
    types: string[];
    name: string;
    address: string;
  }>;
  status: DistanceMatrixStatusResponse;
}

export type GoongGeocodeReverseResponse = {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
    }>;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    reference: string;
    plus_code?: {
      compound_code?: string;
      global_code?: string;
    };
    types: string[];
  }>;
  status: DistanceMatrixStatusResponse;
};

export type GoongAutoCompleteResponseType = {
  predictions: Array<{
    description: string;
    matched_substrings: any[];
    place_id: string;
    reference: string;
    structured_formatting: {
      main_text: string;
      main_text_matched_substrings: any[];
      secondary_text: string;
      secondary_text_matched_substrings: any[];
    };
    has_children: boolean;
    plus_code: { compound_code: string; global_code: string };
    compound: {
      district: string;
      commune: string;
      province: string;
    };
    terms: { offset: number; value: string }[];
    types: string[];
    distance_meters: number | null;
  }>;
  status: DistanceMatrixStatusResponse;
};

export type GoongDistanceMatrixResponseType = {
  rows: {
    elements: {
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
      status: DistanceMatrixStatusResponse;
    }[];
  }[];
};

//
export type geocodingResponseType = {
  longitude: number;
  latitude: number;
  displayName?: string;
  googleMapReference?: string;
  placeId?: string;
  accuracy?: number;
};

export type geocodingReverseResponseType = {
  placeId: string;
  googleMapsReference?: string;
  displayAddress: string;
  addressComponents: string[];
  longitude: number;
  latitude: number;
};

export type autoCompleteResponseType = {
  description: string;
  placeId: string;
  googleMapReference?: string;
  mainText: string;
  subText: string;
  district?: string;
  province?: string;
  ward?: string;
  matches?: Array<{
    offset: number;
    value: string;
  }>;
};

export type distanceResponseType = {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
};

export enum vehicleType {
  TRUCK = 'truck',
  CAR = 'car',
  HD = 'hd',
  BIKE = 'bike',
  TAXI = 'taxi'
}
