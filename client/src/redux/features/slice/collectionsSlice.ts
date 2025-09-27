import { RESTServerRoute } from "@/types/server";
import type { CollectionList, CollectionListState } from "@/types/slice";
import { RestClientBuilder } from "@/utils/RestClient";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";

const initialState: CollectionListState = {
  data: [],
  selectedCollection: null,
  isLoading: false,
  error: null,
};


// Define the return type (string message for success)
export const deleteCollection = createAsyncThunk<
  string, // ✅ return type (API success message)
  string, // ✅ argument type (collectionName)
  { rejectValue: string; state: RootState } // ✅ reject type
>(
  "collections/deleteCollection",
  async (collectionName, { rejectWithValue, getState }) => {
    try {
      const { user } = getState();
      const accessToken = user.data?.accessToken || "";
      const response = await RestClientBuilder.instance()
        .withHeader("Authorization", accessToken)
        .build()
        .delete<{ message: string }>(
          RESTServerRoute.REST_DELETE_COLLECTION(collectionName)
        );

      return response.message || `Collection ${collectionName} deleted successfully`;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || `Failed to delete ${collectionName}`
      );
    }
  }
);

export const getAllCollectionList = createAsyncThunk<
  CollectionList[], // return type
  void,             // argument type
  { rejectValue: string, state: RootState } // reject type
>(
  "collections/getAllCollectionList",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState() as any; // type RootState if you have
      const accessToken = user.data?.accessToken || "";

      const response = await RestClientBuilder.instance()
        .withHeader("Authorization", accessToken)
        .build()
        .get<CollectionList[]>(RESTServerRoute.REST_GET_COLLECTIONS);

      return response as CollectionList[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Backend Server Error" );
    }
  }
);

// ✅ Slice
const collectionSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {
    clearCollections: (state) => {
      state.data = [];
      state.error = null;
      state.isLoading = false;
    },
    setSelectedCollection: (state, action: PayloadAction<string | null>) => {
      state.selectedCollection = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCollectionList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllCollectionList.fulfilled, (state, action: PayloadAction<CollectionList[]>) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(getAllCollectionList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // delete
    builder.addCase(deleteCollection.pending, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(deleteCollection.fulfilled, (state, action) => {
      state.isLoading = false;
      // remove the deleted collection from state
      state.data = state.data.filter(
        (c) => c.name !== action.meta.arg
      );
    });
    builder.addCase(deleteCollection.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to delete collection";
    });
  },
});

// ✅ Exports
export const { clearCollections, setSelectedCollection } = collectionSlice.actions;
export default collectionSlice.reducer;
