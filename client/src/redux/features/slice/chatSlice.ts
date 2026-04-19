
import { RESTServerRoute } from "@/types/server";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts: { type: "text"; text: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  collectionName: string;
  messages: ChatMessage[];
  updatedAt: number;
}

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  loading: boolean;
  error: string | null;
}

let initialSessions: ChatSession[] = [];
let initialActiveSession: string | null = null;
try {
  const stored = localStorage.getItem('notebooklm_chat_history');
  if (stored) {
    const parsed = JSON.parse(stored);
    initialSessions = parsed.sessions || [];
    initialActiveSession = parsed.activeSessionId || null;
  }
} catch (e) {}

const initialState: ChatState = {
  sessions: initialSessions,
  activeSessionId: initialActiveSession,
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
    dispatch(addMessage({ id: crypto.randomUUID(), role: "user", content: message, parts: [{ type: "text", text: message }], collectionName })); // Add user message immediately

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
    console.log(response.body, "response");
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
    createNewSession: (state, action: PayloadAction<string>) => {
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        title: `Chat - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        collectionName: action.payload,
        messages: [],
        updatedAt: Date.now(),
      };
      state.sessions.unshift(newSession);
      state.activeSessionId = newSession.id;
    },
    setActiveSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = null;
      }
    },
    addMessage: (state, action: PayloadAction<ChatMessage & { collectionName: string }>) => {
      const { collectionName, ...message } = action.payload;
      let session = state.sessions.find(s => s.id === state.activeSessionId);
      
      // Auto-create session if none active or collection mismatch
      if (!session || session.collectionName !== collectionName) {
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: `Chat - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          collectionName: collectionName,
          messages: [],
          updatedAt: Date.now(),
        };
        state.sessions.unshift(newSession);
        state.activeSessionId = newSession.id;
        session = newSession;
      }
      
      session.messages.push(message);
      session.updatedAt = Date.now();
    },
    updateAssistantMessage: (state, action: PayloadAction<string>) => {
      const session = state.sessions.find(s => s.id === state.activeSessionId);
      if (!session) return;
      
      const lastMsg = session.messages[session.messages.length - 1];
      if (lastMsg?.role === "assistant") {
        lastMsg.content = action.payload;
        lastMsg.parts = [{ type: "text", text: action.payload }];
      } else {
        session.messages.push({ 
          id: crypto.randomUUID(), 
          role: "assistant", 
          content: action.payload, 
          parts: [{ type: "text", text: action.payload }] 
        });
      }
      session.updatedAt = Date.now();
    },
    finalizeAssistantMessage: () => { },
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

export const { 
  addMessage, 
  updateAssistantMessage, 
  finalizeAssistantMessage,
  createNewSession,
  setActiveSession,
  deleteSession
} = chatSlice.actions;

export default chatSlice.reducer;
