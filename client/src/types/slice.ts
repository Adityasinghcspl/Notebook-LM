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

export interface CollectionList{
  name: string
}

export interface CollectionListState{
  data: CollectionList[];
  selectedCollection: string | null;
  isLoading: boolean;
  error: string | null;
}