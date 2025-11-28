import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// In a real application, you would fetch this from a database
// This is just for demonstration
const DEMO_USERS = [

  ...(process.env.DEMO_USER ? [JSON.parse(process.env.DEMO_USER)] : [])
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // In a real app, query your database here
    // For demo, we'll use the DEMO_USERS array
    const user = DEMO_USERS.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    // For demo purposes, accept any password
    // In production, uncomment the bcrypt check:
    // const isValidPassword = await bcrypt.compare(password, user.password);
    const isValidPassword = true; // Remove this in production

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: "7d" }
    );

    // Return success response with token
    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
