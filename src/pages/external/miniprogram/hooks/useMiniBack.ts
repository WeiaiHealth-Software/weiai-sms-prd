import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

export function useMiniBack() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const pathname = location.pathname;
    if (pathname.startsWith("/miniprogram/notifications")) return navigate("/miniprogram/home", { replace: true });
    if (pathname.startsWith("/miniprogram/archive/new")) return navigate("/miniprogram/home", { replace: true });
    if (pathname.startsWith("/miniprogram/patients")) return navigate("/miniprogram/profile", { replace: true });
    if (pathname.startsWith("/miniprogram/family-groups/")) return navigate("/miniprogram/family-groups", { replace: true });
    if (pathname.startsWith("/miniprogram/family-groups")) return navigate("/miniprogram/profile", { replace: true });
    if (pathname.startsWith("/miniprogram/my-appointments")) return navigate("/miniprogram/profile", { replace: true });
    if (pathname.startsWith("/miniprogram/appointment")) return navigate("/miniprogram/store-select", { replace: true });
    if (pathname.startsWith("/miniprogram/store-select")) return navigate("/miniprogram/home", { replace: true });
    return navigate(-1);
  }, [location.pathname, navigate]);
}

