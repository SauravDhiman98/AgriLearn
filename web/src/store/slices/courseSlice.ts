import { createSlice } from '@reduxjs/toolkit'

interface CourseState {
  filters: {
    category: string | null
    language: string | null
    level: string | null
    keyword: string
  }
}

const initialState: CourseState = {
  filters: { category: null, language: null, level: null, keyword: '' },
}

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters(state) {
      state.filters = initialState.filters
    },
  },
})

export const { setFilters, resetFilters } = courseSlice.actions
export default courseSlice.reducer
