import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApi } from '../../services/api'
import apiClient from '../../services/api'

interface User {
  id: number; email: string; firstName: string; lastName: string
  role: string; avatarUrl?: string; preferredLanguage: string
}

interface AuthState {
  user: User | null; accessToken: string | null; refreshToken: string | null
  isAuthenticated: boolean; loading: boolean; error: string | null
  sessionRestored: boolean
}

const initialState: AuthState = {
  user: null, accessToken: null, refreshToken: null,
  isAuthenticated: false, loading: false, error: null,
  sessionRestored: false,
}

// Called once on app startup — reads saved token and fetches user profile.
// IMPORTANT: Redux store token is null at this point, so we pass the token
// directly in the Authorization header instead of relying on the interceptor.
export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const accessToken = await AsyncStorage.getItem('accessToken')
  if (!accessToken) return null
  try {
    const res = await apiClient.get('/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return { accessToken, user: res.data }
  } catch {
    // Token expired or invalid — clear storage
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken'])
    return null
  }
})

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.login(email, password)
      await AsyncStorage.setItem('accessToken', res.data.accessToken)
      await AsyncStorage.setItem('refreshToken', res.data.refreshToken)
      return res.data
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (data: Parameters<typeof authApi.register>[0], { rejectWithValue }) => {
    try {
      const res = await authApi.register(data)
      await AsyncStorage.setItem('accessToken', res.data.accessToken)
      await AsyncStorage.setItem('refreshToken', res.data.refreshToken)
      return res.data
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null; state.accessToken = null; state.refreshToken = null
      state.isAuthenticated = false
      Promise.all([
        AsyncStorage.removeItem('accessToken'),
        AsyncStorage.removeItem('refreshToken'),
      ]).catch(() => {})
    },
    hydrateAuth(state, action: PayloadAction<{ accessToken: string; user: User }>) {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.sessionRestored = true
        if (action.payload) {
          state.accessToken = action.payload.accessToken
          state.user = action.payload.user
          state.isAuthenticated = true
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.sessionRestored = true
      })
      .addCase(loginAsync.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false; state.isAuthenticated = true
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.user = action.payload.user
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string
      })
      .addCase(registerAsync.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false; state.isAuthenticated = true
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.user = action.payload.user
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string
      })
  },
})

export const { logout, hydrateAuth } = authSlice.actions
export default authSlice.reducer

