import { RESTServerRoute } from "@/types/server";
import type { EmbeddingState, Source } from "@/types/slice";
import { RestClientBuilder } from "@/utils/RestClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";

const initialState: EmbeddingState = {
  sources: [],
  isLoading: false,
  error: null,
};

// ✅ Async thunk to upload based on type
export const uploadSource = createAsyncThunk<
  any, // return type
  { activeTab: "upload" | "url" | "text"; title: string; url?: string; text?: string; file?: File }, // args
  { rejectValue: string, state: RootState } // thunkAPI types
>(
  "embedding/uploadSource",
  async ({ activeTab, title, url, text, file }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      const accessToken = user.data?.accessToken || "";
      let response;

      if (activeTab === "url" && url?.trim()) {

        response = await RestClientBuilder.instance()
          .withHeader("Authorization", accessToken)
          .build()
          .post(RESTServerRoute.REST_UPLOAD_URL, { title: title.trim(), url });

      } else if (activeTab === "text" && text?.trim()) {

        response = await RestClientBuilder.instance()
          .withHeader("Authorization", accessToken)
          .build()
          .post(RESTServerRoute.REST_UPLOAD_CONTENT, { title: title.trim(), content: text });

      } else if (activeTab === "upload" && file) {
        const formData = new FormData();
        formData.append("pdf", file);
        formData.append("title", title.trim());

        response = await RestClientBuilder.instance()
          .withHeader("Authorization", accessToken)
          .withContentType("multipart/form-data")
          .build()
          .post(RESTServerRoute.REST_UPLOAD_PDF, formData);
      } else {
        return rejectWithValue("Please provide all required information");
      }

      // if (!response) {
      //   throw new Error(`Upload failed: ${response.statusText}`);
      // }

      // const data = await response.json();

      // const source: Source = {
      //   id: data.id || Date.now().toString(),
      //   title: title.trim(),
      //   type: activeTab === "upload" ? "PDF" : activeTab === "url" ? "URL" : "Text",
      //   content: activeTab === "url" ? url || "" : activeTab === "text" ? text || "" : file?.name || "",
      //   createdAt: new Date().toISOString(),
      // };

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload source");
    }
  }
);

const embeddingSlice = createSlice({
  name: "embedding",
  initialState,
  reducers: {
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadSource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadSource.fulfilled, (state, action: PayloadAction<Source>) => {
        state.isLoading = false;
        state.sources.unshift(action.payload);
      })
      .addCase(uploadSource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { resetError } = embeddingSlice.actions;
export default embeddingSlice.reducer;
