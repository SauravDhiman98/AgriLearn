import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi, userApi } from '../../api/services'

interface User {
  id: number; email: string; firstName: string; lastName: string
  role: string; avatarUrl?: string; preferredLanguage: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  // True once the stored token has been verified against the backend (or
  // there was none to verify). PrivateRoute waits for this before deciding
  // whether to grant/deny access, so a stale/forged token can't bypass login.
  sessionChecked: boolean
  loading: boolean
  error: string | null
}

const savedToken = localStorage.getItem('accessToken')
const savedUser = localStorage.getItem('user')

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  accessToken: savedToken,
  refreshToken: localStorage.getItem('refreshToken'),
  // Presence of a token is only a *hint* — it is not proof of a valid session.
  // verifySession() confirms (or clears) this against the backend on app load.
  isAuthenticated: !!savedToken,
  sessionChecked: !savedToken,
  loading: false,
  error: null,
}

// Confirms the locally stored token actually belongs to a valid session on
// this backend/database. Without this check, any leftover or tampered token
// in localStorage (e.g. left over from a previous deployment on the same
// domain) would let PrivateRoute grant access without a real login.
export const verifySession = createAsyncThunk(
  'auth/verifySession',
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.getMe()
      return res.data as User
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

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
      state.sessionChecked = true
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
      state.sessionChecked = true
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
      .addCase(verifySession.fulfilled, (state, action: PayloadAction<User>) => {
        // Token is valid on this backend — confirm auth and refresh cached user.
        state.isAuthenticated = true
        state.sessionChecked = true
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(verifySession.rejected, (state) => {
        // Token is stale/invalid on this backend (e.g. server/DB was replaced) —
        // clear it so PrivateRoute stops granting access without a real login.
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.sessionChecked = true
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      })
  },
})

export const { logout, setTokens } = authSlice.actions
export default authSlice.reducer
