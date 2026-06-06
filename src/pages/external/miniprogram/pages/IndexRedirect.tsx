import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMiniprogramApp } from "../context";

export default function IndexRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useMiniprogramApp();

  useEffect(() => {
    navigate(
      { pathname: isLoggedIn ? "/miniprogram/home" : "/miniprogram/login", search: location.search },
      { replace: true }
    );
  }, [isLoggedIn, location.search, navigate]);

  return null;
}

