import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SessionUser {
  id: string;
  email: string;
  fullName?: string;
  role?: 'customer' | 'admin';
}

interface SessionState {
  user: SessionUser | null;
  token: string | null;
}

const initialState: SessionState = {
  user: null,
  token: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<SessionState>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearSession: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setSession, clearSession } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
