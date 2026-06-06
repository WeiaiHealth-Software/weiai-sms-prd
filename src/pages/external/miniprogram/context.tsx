import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type MiniprogramAppContextValue = {
  isLoggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
  toastMsg: string;
  showToast: (msg: string) => void;
};

const STORAGE_KEY = "weiai.miniprogram.isLoggedIn";

const MiniprogramAppContext = createContext<MiniprogramAppContextValue | null>(null);

export function MiniprogramProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    setIsLoggedIn(raw === "1");
  }, []);

  const setLoggedIn = useCallback((v: boolean) => {
    setIsLoggedIn(v);
    window.localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(""), 1500);
  }, []);

  const value = useMemo<MiniprogramAppContextValue>(
    () => ({ isLoggedIn, setLoggedIn, toastMsg, showToast }),
    [isLoggedIn, setLoggedIn, toastMsg, showToast]
  );

  return <MiniprogramAppContext value={value}>{children}</MiniprogramAppContext>;
}

export function useMiniprogramApp() {
  const ctx = useContext(MiniprogramAppContext);
  if (!ctx) throw new Error("useMiniprogramApp must be used within MiniprogramProvider");
  return ctx;
}

