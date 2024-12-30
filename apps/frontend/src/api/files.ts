import { FileType, ItemType } from "@adaline/shared-types";
import { ApiClient } from "./client";
import { AxiosInstance } from "axios";

export class FilesApi {
  private static instance: FilesApi;
  private client: AxiosInstance;

  private constructor() {
    this.client = ApiClient.getInstance().getClient();
  }

  public static getInstance(): FilesApi {
    if (!FilesApi.instance) {
      FilesApi.instance = new FilesApi();
    }
    return FilesApi.instance;
  }

  public async getRootFiles(): Promise<FileType[]> {
    const response = await this.client.get<FileType[]>("/files/root");
    return response.data;
  }

  // Add the new transfer method
  public async transferFile(
    fileId: string,
    targetFolderId: string,
    newOrder: number,
  ): Promise<ItemType[]> {
    const response = await this.client.post<ItemType[]>("/files/transfer", {
      fileId,
      targetFolderId,
      newOrder,
    });
    return response.data;
  }
}

export const filesApi = FilesApi.getInstance();
