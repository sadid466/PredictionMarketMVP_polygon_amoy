import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useWallet } from "../utils/wallet";

const userLinks = [
  { label: "Dashboard", href: "/", icon: DashboardIcon },
  { label: "Explore Markets", href: "/explore", icon: CompassIcon },
  { label: "My Bets", href: "/portfolio", icon: WalletIcon }
];

const adminLinks = [{ label: "Admin Panel", href: "/admin", icon: ShieldIcon }];

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.7 6.2-6.3 2.8 2.8-6.3z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="2.5" y="5.5" width="19" height="13" rx="3" />
      <path d="M16 12h5.5" />
      <circle cx="16.7" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 5 6v6c0 5 3.2 8.7 7 9.9 3.8-1.2 7-4.9 7-9.9V6z" />
    </svg>
  );
}

function NavItem({ href, label, Icon, active }) {
  return (
    <Link
      href={href}
      className={
        "group flex items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-sm font-medium uppercase tracking-[0.12em] transition-all duration-300 " +
        (active
          ? "border-violet-500 bg-violet-100/70 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
          : "border-transparent text-slate-500 hover:border-slate-300 hover:bg-white/60 hover:text-slate-900 dark:text-slate-300 dark:hover:border-violet-500/60 dark:hover:bg-white/5 dark:hover:text-white")
      }
    >
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/70 text-slate-600 transition-colors group-hover:text-slate-900 dark:bg-white/5 dark:text-slate-100 dark:group-hover:text-white">
        <Icon />
      </span>
      <span>{label}</span>
    </Link>
  );
}

function truncateAddress(addr) {
  if (!addr) return "Not Connected";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Layout({ children }) {
  const router = useRouter();
  const { address } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const syncAdmin = () => setIsAdmin(localStorage.getItem("is_admin") === "true");
    syncAdmin();
    window.addEventListener("storage", syncAdmin);
    window.addEventListener("admin-auth", syncAdmin);
    return () => {
      window.removeEventListener("storage", syncAdmin);
      window.removeEventListener("admin-auth", syncAdmin);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100 text-slate-900 dark:bg-slate-950 dark:from-slate-900 dark:via-[#0a0a0a] dark:to-black dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-24 h-80 w-80 rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-500/20" />
        <div className="absolute bottom-0 right-12 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />
      </div>

      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex h-full flex-col px-4 py-6">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-700/90 dark:text-cyan-300/80">Control Node</p>
            <h1 className="mt-2 text-xl font-bold tracking-wide text-slate-900 dark:text-white [text-shadow:none]">
              Prediction Market
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Deep Tech Trading Hub</p>
          </div>

          <nav className="mt-6 flex flex-col gap-2">
            {userLinks.map((item) => (
              <NavItem
                key={item.href + item.label}
                href={item.href}
                label={item.label}
                Icon={item.icon}
                active={router.pathname === item.href}
              />
            ))}
          </nav>

          {isAdmin && (
            <div className="mt-6">
              <p className="px-1 text-[10px] uppercase tracking-[0.3em] text-violet-600 dark:text-violet-300">Admin</p>
              <nav className="mt-2 flex flex-col gap-2">
                {adminLinks.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    Icon={item.icon}
                    active={router.pathname === item.href}
                  />
                ))}
              </nav>
            </div>
          )}

          <div className="mt-auto rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Wallet
            </p>
            <p className="mt-3 font-mono text-sm text-slate-900 dark:text-slate-100">{truncateAddress(address)}</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-500">
              Connected account used for all markets.
            </p>
          </div>
        </div>
      </aside>

      <main className="relative ml-64 min-h-screen p-8 pt-24">{children}</main>
    </div>
  );
}