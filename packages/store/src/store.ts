import { configureStore } from '@reduxjs/toolkit';
import { cartReducer } from './features/cartSlice';
import { ordersReducer } from './features/ordersSlice';
import { sessionReducer } from './features/sessionSlice';

export function createAppStore() {
  const preloadedState = localStorage.getItem('byteevolvr_cart')
    ? { cart: JSON.parse(localStorage.getItem('byteevolvr_cart')!) }
    : undefined;

  const store = configureStore({
    reducer: {
      cart: cartReducer,
      orders: ordersReducer,
      session: sessionReducer,
    },
    preloadedState,
  });

  store.subscribe(() => {
    localStorage.setItem('byteevolvr_cart', JSON.stringify(store.getState().cart));
  });

  return store;
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
