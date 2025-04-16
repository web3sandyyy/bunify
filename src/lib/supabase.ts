import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key not found in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  email: string;
  password: string;
}

// Register a new user
export const signUp = async (email: string, password: string) => {
  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // Error other than "not found"
      return { data: null, error: checkError };
    }

    if (existingUser) {
      return {
        data: null,
        error: { message: "User already exists with this email" },
      };
    }

    // Insert new user
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Store user email in localStorage for session management
    localStorage.setItem("userEmail", email);

    return { data: { user: { email } }, error: null };
  } catch (error) {
    console.error("Error during signup:", error);
    return { data: null, error: { message: "An unexpected error occurred" } };
  }
};

// Sign in user
export const signIn = async (email: string, password: string) => {
  try {
    // Check if user exists and password matches
    const { data, error } = await supabase
      .from("users")
      .select("email, password")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error) {
      return { data: null, error: { message: "Invalid email or password" } };
    }

    if (!data) {
      return { data: null, error: { message: "Invalid email or password" } };
    }

    // Store user email in localStorage for session management
    localStorage.setItem("userEmail", email);

    return { data: { user: { email: data.email } }, error: null };
  } catch (error) {
    console.error("Error during signin:", error);
    return { data: null, error: { message: "An unexpected error occurred" } };
  }
};

// Sign out user
export const signOut = async () => {
  try {
    // Remove user email from localStorage
    localStorage.removeItem("userEmail");
    return { error: null };
  } catch (error) {
    console.error("Error during signout:", error);
    return { error: { message: "An unexpected error occurred" } };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const email = localStorage.getItem("userEmail");

    if (!email) {
      return { user: null, error: null };
    }

    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (error) {
      return { user: null, error };
    }

    return { user: { email: data.email }, error: null };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, error: { message: "An unexpected error occurred" } };
  }
};

// Save media file
export const saveMedia = async (
  fileUrl: string,
  fileType: "image" | "video"
) => {
  try {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
      return { data: null, error: { message: "User not authenticated" } };
    }

    const { data, error } = await supabase
      .from("media")
      .insert([
        {
          user_email: userEmail,
          file_url: fileUrl,
          file_type: fileType,
        },
      ])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error saving media:", error);
    return { data: null, error: { message: "An unexpected error occurred" } };
  }
};

// Get user media
export const getUserMedia = async () => {
  try {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
      return { data: null, error: { message: "User not authenticated" } };
    }

    const { data, error } = await supabase
      .from("media")
      .select("*")
      .eq("user_email", userEmail)
      .order("uploaded_at", { ascending: false });

    return { data, error };
  } catch (error) {
    console.error("Error getting user media:", error);
    return { data: null, error: { message: "An unexpected error occurred" } };
  }
};
