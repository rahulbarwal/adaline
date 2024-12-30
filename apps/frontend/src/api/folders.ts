import { FolderType, ItemType } from "@adaline/shared-types";
import { AxiosInstance } from "axios";
import { ApiClient } from "./client";

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
    folder: Omit<FolderType, "id">,
  ): Promise<ItemType[]> {
    const response = await this.client.post<ItemType[]>("/folders", folder);
    return response.data;
  }
}

export const foldersApi = FoldersApi.getInstance();
