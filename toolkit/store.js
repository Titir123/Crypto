import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import coinsSlice from "./cryptoSlice";

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, coinsSlice);

export const store = configureStore({
  reducer: {
   coins:persistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for redux-persist actions
    }),
});

export const persistor = persistStore(store);