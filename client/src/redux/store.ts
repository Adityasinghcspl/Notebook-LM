import {configureStore} from '@reduxjs/toolkit';
import rootReducer from './features/rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Subscribe strictly to chat changes and persist to localStorage
store.subscribe(() => {
  const currentState = store.getState();
  const chatState = currentState.chat;
  // We only want to store the sessions and activeSessionId to keep it lean. No loading state.
  localStorage.setItem('notebooklm_chat_history', JSON.stringify({
    sessions: chatState.sessions,
    activeSessionId: chatState.activeSessionId
  }));
});