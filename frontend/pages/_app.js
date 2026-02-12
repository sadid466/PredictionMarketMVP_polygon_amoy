import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import { WalletProvider, useWallet } from "../utils/wallet";
import Layout from "../components/Layout";

function ThemeAndWallet({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { address, connect, disconnect, switchWallet } = useWallet();
  const router = useRouter();
  const [walletOpen, setWalletOpen] = useState(false);
  const walletMenuRef = useRef(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const adminMenuRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const applyTheme = (dark) => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    setIsDark(dark);
    applyTheme(dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    applyTheme(newDark);
  };

  useEffect(() => {
    if (!walletOpen) return;
    const handleClick = (e) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(e.target)) {
        setWalletOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setWalletOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [walletOpen]);

  useEffect(() => {
    const syncAdmin = () => setIsAdmin(localStorage.getItem("is_admin") === "true");
    syncAdmin();
    window.addEventListener("storage", syncAdmin);
    window.addEventListener("admin-auth", syncAdmin);
    window.addEventListener("focus", syncAdmin);
    return () => {
      window.removeEventListener("storage", syncAdmin);
      window.removeEventListener("admin-auth", syncAdmin);
      window.removeEventListener("focus", syncAdmin);
    };
  }, []);

  useEffect(() => {
    if (!adminOpen) return;
    const handleClick = (e) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) {
        setAdminOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setAdminOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [adminOpen]);

  const handleAdminLogout = () => {
    localStorage.removeItem("is_admin");
    sessionStorage.removeItem("admin_session");
    setIsAdmin(false);
    window.dispatchEvent(new Event("admin-auth"));
    setAdminOpen(false);
    if (router.pathname.startsWith("/admin")) {
      router.replace("/");
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="relative min-h-screen">
        <div className="absolute top-6 right-6 z-50 flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          <div ref={adminMenuRef} className="relative">
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-700 backdrop-blur-xl transition-all duration-300 hover:border-slate-300 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-violet-500/50 dark:hover:bg-white/10"
              onClick={() => setAdminOpen((v) => !v)}
              title="Admin Options"
            >
              Admin
            </button>
            {adminOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-[1001] min-w-[200px] rounded-xl border border-slate-200 bg-white/80 p-2 shadow-xl shadow-slate-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-violet-500/20">
                <button
                  className="mb-2 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-violet-500/50 dark:hover:bg-white/10"
                  onClick={() => {
                    setAdminOpen(false);
                    router.push("/admin");
                  }}
                >
                  {isAdmin ? "Admin Panel" : "Sign in as Admin"}
                </button>
                {isAdmin && (
                  <button
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-violet-500/50 dark:hover:bg-white/10"
                    onClick={handleAdminLogout}
                  >Sign out Admin</button>
                )}
              </div>
            )}
          </div>

          {address ? (
            <div ref={walletMenuRef} className="relative shrink-0">
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm text-cyan-700 backdrop-blur-xl transition-all duration-300 hover:border-cyan-300 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-cyan-300 dark:hover:border-cyan-400/60 dark:hover:bg-white/10"
                onClick={() => setWalletOpen((v) => !v)}
                title="Wallet Menu"
              >
                {address.slice(0, 6)}...{address.slice(-4)}
              </button>
              {walletOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[1001] min-w-[180px] rounded-xl border border-slate-200 bg-white/80 p-2 shadow-xl shadow-slate-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-violet-500/20">
                  <button
                    className="mb-2 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-violet-500/50 dark:hover:bg-white/10"
                    onClick={() => {
                      setWalletOpen(false);
                      switchWallet();
                    }}
                    title="Switch Wallet"
                  >
                    Switch Wallet
                  </button>
                  <button
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-violet-500/50 dark:hover:bg-white/10"
                    onClick={() => {
                      setWalletOpen(false);
                      disconnect();
                    }}
                    title="Disconnect"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xl shadow-slate-200/50 transition-all duration-300 hover:from-violet-500 hover:to-indigo-500 dark:shadow-violet-500/20 shrink-0"
              onClick={connect}
              title="Connect Wallet"
            >
              Connect Wallet
            </button>
          )}

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-lg text-slate-700 backdrop-blur-xl transition-all duration-300 hover:border-slate-300 hover:text-violet-600 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:border-violet-500/60 dark:hover:text-violet-300 shrink-0"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {isDark ? "\u2600" : "\u263D"}
          </button>
        </div>

        <Layout>{children}</Layout>
      </div>
    </>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <ThemeAndWallet>
        <Component {...pageProps} />
      </ThemeAndWallet>
    </WalletProvider>
  );
}
