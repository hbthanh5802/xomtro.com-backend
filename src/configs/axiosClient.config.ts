import axios, { AxiosRequestConfig } from 'axios';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const axiosClient = axios.create();

axiosClient.interceptors.request.use(
  (configs) => {
    if (configs.data) {
      configs.headers['Content-Type'] = 'application/json';
    }
    return configs;
  },
  (error) => {
    throw error;
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    throw error;
  }
);

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  method?: HTTPMethod;
}

const axiosRequest = <T>(config: CustomAxiosRequestConfig): Promise<T> => {
  return axiosClient(config) as Promise<T>;
};

export default axiosRequest;
