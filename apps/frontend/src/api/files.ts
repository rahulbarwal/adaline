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

  public async createFile(file: Omit<FileType, "id">): Promise<ItemType[]> {
    const response = await this.client.post<ItemType[]>("/files", {
      ...file,
      folderId: "0", // Default to root folder
    });
    return response.data;
  }

  public async getRootFiles(): Promise<FileType[]> {
    const response = await this.client.get<FileType[]>("/files/root");
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
