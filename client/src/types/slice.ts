import type { UserInfo } from "firebase/auth";

export interface UserData {
  providerData: UserInfo[] | null;
  accessToken: string | null;
}

export interface UserState {
  data: UserData | null;
  loading: boolean;
  error: string | null;
}

export interface Source {
  id: string;
  title: string;
  type: "PDF" | "URL" | "Text";
  content: string;
  createdAt: string;
}

export interface EmbeddingState {
  sources: Source[];
  isLoading: boolean;
  error: string | null;
}