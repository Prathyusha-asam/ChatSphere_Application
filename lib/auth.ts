import {createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged,User, fetchSignInMethodsForEmail,} from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile } from "./firestore";
 import { sendPasswordResetEmail } from "firebase/auth";

//region Input Validation Helpers
/**
* Validates email format
*/
function validateEmail(email: string): void {
  if (!email || !email.includes("@")) {
    throw new Error("Invalid email address");
  }
}
/**
* Validates password length
*/
function validatePassword(password: string): void {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
}
//endregion Input Validation Helpers
 
export async function forgotPassword(email: string): Promise<void> {
  try {
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }

    await sendPasswordResetEmail(auth, email, {
      // optional – redirect after reset
      url: `${window.location.origin}/auth/login`,
      handleCodeInApp: false,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("auth/user-not-found")) {
        throw new Error("No account found with this email");
      }
      throw new Error(error.message);
    }
    throw new Error("Failed to send reset email");
  }
}
//region Sign Up
/**
* Registers a new user with email & password
* Also creates user profile in Firestore
*/
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  try {
    validateEmail(email);
    validatePassword(password);
   
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await createUserProfile(
      user.uid,
      user.email ?? "",
      displayName
    );
    return user;
  } catch (error: unknown) {
    if (error instanceof Error) {
     if (error.message.includes("auth/email-already-in-use")) {
        throw new Error("Email already exists");
      }
      throw new Error(error.message);
    }
    throw new Error("Sign up failed");
  }
}

//endregion Sign Up
 
//region Login
/**
* Logs in an existing user
*/
export async function login(
  email: string,
  password: string
): Promise<User> {
  try {
    validateEmail(email);
    validatePassword(password);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Login failed");
  }
}
//endregion Login
 
//region Logout
/**
* Logs out the currently authenticated user
*/
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Logout failed");
  }
}
//endregion Logout
 
//region Get Current User
/**
* Returns the currently authenticated user
* Resolves to null if no user is logged in
*/
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    try {
      onAuthStateChanged(auth, (user) => {
        resolve(user);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        reject(error);
      } else {
        reject(new Error("Failed to get current user"));
      }
    }
  });
}
//endregion Get Current User