import { RESTServerRoute } from "@/types/server";
import { RestClientBuilder } from "@/utils/RestClient";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";


// ✅ Async thunk to upload based on type
export const uploadSource = createAsyncThunk<
  any, // return type
  { activeTab: "upload" | "url" | "text"; title: string; url?: string; text?: string; file?: File | null }, // args
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
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload source");
    }
  }
);

