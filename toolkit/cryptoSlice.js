import { createSlice } from '@reduxjs/toolkit';

export const coinsSlice = createSlice({
  name: 'coins',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setCoins: (state, action) => {
      state.list = action.payload;
      state.status = 'succeeded';
    },
    resetCoins: (state) => {
      state.list = [];
      state.status = 'idle';
      state.error = null;
    },
    updateCoin: (state, action) => {
      const index = state.list.findIndex(coin => coin.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = {...state,...action.payload};
      }
    },
  },
});

export const { setCoins, resetCoins, updateCoin } = coinsSlice.actions;
export default coinsSlice.reducer;