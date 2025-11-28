// app/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== "undefined") {
      // Check localStorage first
      let token = localStorage.getItem("token");
      
      // If not in localStorage, check cookies
      if (!token) {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
          // Sync to localStorage
          localStorage.setItem("token", token);
        }
      }
      
      if (token) {
        // If logged in (token exists and not expired), redirect to app
        router.push("/app");
      } else {
        // If not logged in, redirect to login
        router.push("/login");
      }
    }
  }, [router]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh" 
    }}>
      <p>Redirecting...</p>
    </div>
  );
}
