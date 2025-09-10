import axios, { type AxiosInstance } from 'axios';

export class RestClientBuilder {
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({ withCredentials: true });
    this.axiosInstance.defaults.baseURL = import.meta.env.VITE_API_REST_ENDPOINT;
  }

  static instance(): RestClientBuilder {
    return new RestClientBuilder();
  }

  // withBaseUrl(baseUrl: string): RestClientBuilder {
  //   this.axiosInstance.defaults.baseURL = baseUrl;
  //   return this;
  // }

  withHeader(key: string, value: string): RestClientBuilder {
    if (key.toLowerCase() === 'authorization') {
      value = `Bearer ${value}`;
    }
    this.axiosInstance.defaults.headers.common = {
      ...this.axiosInstance.defaults.headers.common,
      [key]: value,
    };
    return this;
  }

  withParams(params: Record<string, any>): RestClientBuilder {
    this.axiosInstance.defaults.params = {
      ...this.axiosInstance.defaults.params,
      ...params,
    };
    return this;
  }

  withContentType(contentType: string): RestClientBuilder {
    this.axiosInstance.defaults.headers.common['Content-Type'] = contentType;
    return this;
  }

  build(): RestClient {
    // Default to application/json if not set manually
    if (!this.axiosInstance.defaults.headers.common['Content-Type']) {
      this.axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';
    }
    return new RestClient(this.axiosInstance);
  }
}

class RestClient {
  private axios: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axios = axiosInstance;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.axios.get<T>(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any = {}): Promise<T> {
    try {
      const response = await this.axios.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any = {}): Promise<T> {
    try {
      const response = await this.axios.put<T>(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T>(endpoint: string, data: any = {}): Promise<T> {
    try {
      const response = await this.axios.patch<T>(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.axios.delete<T>(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
