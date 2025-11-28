// app/app/page.jsx
"use client";

import React from "react";
import App from "../components/App";
import { MyContextProvider } from "../components/MyContext";

export default function AppPage() {
  return (
    <MyContextProvider>
      <App />
    </MyContextProvider>
  );
}
