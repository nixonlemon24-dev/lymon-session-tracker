import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useConvexAuth } from "@convex-dev/auth/react";

function AuthRedirectWatcher() {
  const { isAuthenticated } = useConvexAuth();
  const location = useLocation();

  useEffect(() => {
    const publicRoutes = ["/login", "/", "/create-account"];
    if (isAuthenticated && publicRoutes.includes(location.pathname)) {
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated, location.pathname]);

  return null;
}

export default AuthRedirectWatcher;