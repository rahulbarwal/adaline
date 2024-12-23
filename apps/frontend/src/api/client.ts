import axios, { AxiosInstance } from "axios";

export class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: "/api",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}
