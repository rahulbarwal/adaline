import { FolderType } from "@adaline/shared-types";
import { ApiClient } from "./client";
import { AxiosInstance } from "axios";

export class FoldersApi {
  private static instance: FoldersApi;
  private client: AxiosInstance;

  private constructor() {
    this.client = ApiClient.getInstance().getClient();
  }

  public static getInstance(): FoldersApi {
    if (!FoldersApi.instance) {
      FoldersApi.instance = new FoldersApi();
    }
    return FoldersApi.instance;
  }

  public async createFolder(
    folder: Omit<FolderType, "id">
  ): Promise<FolderType> {
    const response = await this.client.post<FolderType>("/folders", folder);
    return response.data;
  }

  public async toggleFolder(
    folderId: string,
    isOpen: boolean
  ): Promise<FolderType> {
    const response = await this.client.patch<FolderType>(
      `/folders/${folderId}/toggle`,
      {
        isOpen,
      }
    );
    return response.data;
  }

  public async reorderFolders(folderIds: string[]): Promise<FolderType[]> {
    const response = await this.client.patch<FolderType[]>("/folders/reorder", {
      folderIds,
    });
    return response.data;
  }
}

export const foldersApi = FoldersApi.getInstance();
