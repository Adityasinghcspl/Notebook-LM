
import { RESTServerRoute } from "@/types/server";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Key } from "react";

export interface ChatMessage {
  id?: Key | null | undefined;
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
};

// 🔹 Thunk for sending chat message and reading streamed response
export const sendMessage = createAsyncThunk<
  void,
  { collectionName: string; message: string },
  { rejectValue: string }
>("chat/sendMessage", async ({ collectionName, message }, { dispatch, rejectWithValue, getState }) => {
  try {
    const { user } = getState() as any;
    const accessToken = user.data?.accessToken || "";
    dispatch(addMessage({ role: "user", content: message })); // Add user message immediately

    // 🚀 STEP 1: Use native fetch for streaming
    const url = import.meta.env.VITE_API_REST_ENDPOINT + RESTServerRoute.REST_CHAT;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
    const body = JSON.stringify({ collectionName, message });

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });
    console.log(response.body,"response");
    // STEP 2: Handle non-streaming HTTP errors (4xx/5xx)
    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
    }

    // STEP 3: Setup reader and buffer for SSE parsing
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantReply = "";
    let buffer = ""; // Buffer to handle incomplete SSE lines

    // STEP 4: Read and process stream chunks
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and add to the buffer
      buffer += decoder.decode(value, { stream: true });

      // Process lines delimited by '\n'
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Store the last, potentially incomplete line

      for (const line of lines) {
        // Look for the required SSE prefix
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6).trim();

          if (jsonStr === "[DONE]") {
            // Server-side end signal (redundant with 'done' but good practice)
            break;
          }

          try {
            const event = JSON.parse(jsonStr);
            // 💡 Extract the actual text from the "text-delta" event type
            if (event.type === "text-delta" && event.delta) {
              assistantReply += event.delta;
              // Update state in Redux immediately for streaming effect
              dispatch(updateAssistantMessage(assistantReply));
            }
          } catch (e) {
            console.error("Failed to parse SSE JSON line:", jsonStr, e);
          }
        }
      }
    }

    dispatch(finalizeAssistantMessage());
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to send message");
  }
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    updateAssistantMessage: (state, action: PayloadAction<string>) => {
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg?.role === "assistant") {
        lastMsg.content = action.payload;
      } else {
        state.messages.push({ role: "assistant", content: action.payload });
      }
    },
    finalizeAssistantMessage: () => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Chat request failed";
      });
  },
});

export const { addMessage, updateAssistantMessage, finalizeAssistantMessage } =
  chatSlice.actions;

export default chatSlice.reducer;
