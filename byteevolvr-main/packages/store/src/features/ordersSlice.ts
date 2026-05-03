import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  trackingId?: string;
}

interface OrdersState {
  items: OrderSummary[];
  loading: boolean;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<OrderSummary[]>) => {
      state.items = action.payload;
    },
    setOrdersLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addOrder: (state, action: PayloadAction<OrderSummary>) => {
      state.items.unshift(action.payload);
    },
  },
});

export const { setOrders, setOrdersLoading, addOrder } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;
