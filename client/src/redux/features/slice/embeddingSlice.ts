import { RESTServerRoute } from "@/types/server";
import { RestClientBuilder } from "@/utils/RestClient";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";

export const uploadSource = createAsyncThunk<
  any, // Return type
  {
    activeTab: "upload" | "url" | "text";
    title: string;
    fileType?: "pdf" | "vtt";
    url?: string;
    text?: string;
    file?: File | File[] | null;
  }, // Arguments
  { rejectValue: string; state: RootState } // thunkAPI types
>(
  "embedding/uploadSource",
  async ({ activeTab, title, fileType, url, text, file }, { getState, rejectWithValue }) => {
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
        formData.append("title", title.trim());

        if (fileType === "pdf" && file instanceof File) {
          formData.append("pdf", file);
          response = await RestClientBuilder.instance()
            .withHeader("Authorization", accessToken)
            .withContentType("multipart/form-data")
            .build()
            .post(RESTServerRoute.REST_UPLOAD_PDF, formData);
        } else if (fileType === "vtt" && Array.isArray(file) && file.length > 0) {
          file.forEach((f) => formData.append("vtt", f));
          response = await RestClientBuilder.instance()
            .withHeader("Authorization", accessToken)
            .withContentType("multipart/form-data")
            .build()
            .post(RESTServerRoute.REST_UPLOAD_VTT, formData);
        } else {
          return rejectWithValue("Invalid file type or files missing");
        }
      } else {
        return rejectWithValue("Please provide all required information");
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload source");
    }
  }
);

