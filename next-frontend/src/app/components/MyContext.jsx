"use client";

import { createContext, useState } from "react";

export const MyContext = createContext("");

export function MyContextProvider({ children }) {
  const [state, setState] = useState({
    messages: [],
    threadId: null,
    isLoading: false,
  });

  const value = {
    ...state,
    setState,
  };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}