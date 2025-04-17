import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the location the user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);

    if (success && localStorage.getItem("userEmail")) {
      // Navigate to the page they were trying to access, or home if none specified
      navigate(from, { replace: true });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-medium">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Bunify
          </h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Email address
              </label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="accent"
            disabled={loading}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-sm text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-accent hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
