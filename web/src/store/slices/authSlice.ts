import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '../../api/services'

interface User {
  id: number; email: string; firstName: string; lastName: string
  role: string; avatarUrl?: string; preferredLanguage: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const savedToken = localStorage.getItem('accessToken')
const savedUser = localStorage.getItem('user')

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  accessToken: savedToken,
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!savedToken,
  loading: false,
  error: null,
}

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.login(email, password)
      return res.data
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; code?: string }
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        return rejectWithValue('Cannot reach the server. Please check your connection.')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Invalid email or password'
      )
    }
  }
)

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (data: Parameters<typeof authApi.register>[0], { rejectWithValue }) => {
    try {
      const res = await authApi.register(data)
      return res.data
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; code?: string }
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        return rejectWithValue('Cannot reach the server. Please check your connection.')
      }
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      )
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null          // Clear any stale error
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    },
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      localStorage.setItem('accessToken', action.payload.accessToken)
      localStorage.setItem('refreshToken', action.payload.refreshToken)
    },
  },
  extraReducers: (builder) => {
    const handleAuthFulfilled = (state: AuthState, action: PayloadAction<{
      accessToken: string; refreshToken: string; user: User
    }>) => {
      state.loading = false
      state.error = null
      state.isAuthenticated = true
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      localStorage.setItem('accessToken', action.payload.accessToken)
      localStorage.setItem('refreshToken', action.payload.refreshToken)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    }

    builder
      .addCase(loginAsync.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginAsync.fulfilled, handleAuthFulfilled)
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string
      })
      .addCase(registerAsync.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerAsync.fulfilled, handleAuthFulfilled)
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string
      })
  },
})

export const { logout, setTokens } = authSlice.actions
export default authSlice.reducer
