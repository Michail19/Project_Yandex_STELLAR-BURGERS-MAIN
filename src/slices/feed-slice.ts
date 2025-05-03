import { TOrdersData } from '@utils-types';
import { getFeedsApi } from '@api';
import {
  createSlice,
  createAsyncThunk,
  SerializedError
} from '@reduxjs/toolkit';
import { RootState } from "../services/store";

interface FeedState {
  items: TOrdersData | null;
  loading: boolean;
  error: SerializedError | null;
}

const initialState: FeedState = {
  items: null,
  loading: false,
  error: null
};

export const feedThunk = createAsyncThunk(
  'feed/fetch',
  async () => await getFeedsApi()
);

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(feedThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(feedThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(feedThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error;
      });
  }
});

export const selectFeed = (state: RootState) => state.feed.items;
export const selectLoading = (state: RootState) => state.feed.loading;
export const selectError = (state: RootState) => state.feed.error;
export const selectOrders = (state: RootState) => state.feed?.orders || [];

// export const feedReducer = feedSlice.reducer;
export default feedSlice.reducer;
