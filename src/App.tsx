import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SplashScreenProvider } from "./context/SplashScreenContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Reels from "./components/Reels";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

// This component handles redirection based on authentication status
function RedirectBasedOnAuth() {
  const { user } = useAuth();
  const location = useLocation();

  // If user is not authenticated and trying to access a protected route
  if (
    !user &&
    location.pathname !== "/login" &&
    location.pathname !== "/register"
  ) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated and trying to access login/register
  if (
    user &&
    (location.pathname === "/login" || location.pathname === "/register")
  ) {
    return <Navigate to="/" replace />;
  }

  // For any other invalid routes, redirect to home
  return <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <SplashScreenProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Reels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reel/:id"
              element={
                <ProtectedRoute>
                  <Reels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/camera"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* Catch all invalid routes and redirect */}
            <Route path="*" element={<RedirectBasedOnAuth />} />
          </Routes>
        </Router>
        <Toaster />
      </SplashScreenProvider>
    </AuthProvider>
  );
}

export default App;
