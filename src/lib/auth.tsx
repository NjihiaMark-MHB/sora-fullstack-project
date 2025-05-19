"use server";

import { cookies } from "next/headers";

// This is a simplified mock authentication system
// In a real application, you would use a proper authentication system

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

// Mock user data
const MOCK_USER: User = {
  id: "user-1",
  name: "Demo User",
  email: "user@example.com",
};

// Mock authentication functions
export async function login({
  email,
  password,
}: LoginCredentials): Promise<User> {
  // In a real app, you would validate credentials against a database
  // For demo purposes, we'll accept any non-empty email/password
  if (!email || !password) {
    throw new Error("Invalid credentials");
  }

  // Set a cookie to simulate authentication
  (
    await // Set a cookie to simulate authentication
    cookies()
  ).set("session", JSON.stringify(MOCK_USER), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  return MOCK_USER;
}

export async function signup({
  name,
  email,
  password,
}: SignupCredentials): Promise<User> {
  // In a real app, you would create a new user in the database
  // For demo purposes, we'll accept any non-empty values
  if (!name || !email || !password) {
    throw new Error("Invalid credentials");
  }

  // Set a cookie to simulate authentication
  (
    await // Set a cookie to simulate authentication
    cookies()
  ).set("session", JSON.stringify(MOCK_USER), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  return MOCK_USER;
}

export async function logout(): Promise<void> {
  // Delete the session cookie
  (
    await // Delete the session cookie
    cookies()
  ).delete("session");
}

export async function getSession(): Promise<User | null> {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session) as User;
  } catch {
    return null;
  }
}
