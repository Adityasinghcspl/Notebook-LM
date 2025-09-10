import type { UserData, UserState } from "@/types/slice";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserData>) {
      state.data = action.payload;
      console.log(action.payload,"<UserData>  ");
      state.loading = false;
      state.error = null;
    },
    clearUser(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;