import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCurrentUser, signIn, signOut, signUp } from "../lib/supabase";

// Define custom user type to match our simplified model
interface User {
  email: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        setLoading(true);
        const { user, error } = await getCurrentUser();

        if (error) {
          console.error("Error fetching user:", error);
        } else if (user) {
          setUser(user as User);
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        return false;
      } else if (data?.user) {
        setUser(data.user as User);
        return true;
      }
      return false;
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await signUp(email, password);

      if (error) {
        setError(error.message);
        return false;
      } else if (data?.user) {
        setUser(data.user as User);
        return true;
      }
      return false;
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Registration error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await signOut();

      if (error) {
        setError(error.message);
        return false;
      } else {
        setUser(null);
        return true;
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Logout error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
