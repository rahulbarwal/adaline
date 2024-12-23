import { FileType } from "@adaline/shared-types";
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

  public async createFile(file: Omit<FileType, "id">): Promise<FileType> {
    const response = await this.client.post<FileType>("/files", file);
    return response.data;
  }

  public async reorderFiles(
    folderId: string,
    fileIds: string[]
  ): Promise<FileType[]> {
    const response = await this.client.patch<FileType[]>(
      `/folders/${folderId}/files/reorder`,
      {
        fileIds,
      }
    );
    return response.data;
  }
}

export const filesApi = FilesApi.getInstance();
