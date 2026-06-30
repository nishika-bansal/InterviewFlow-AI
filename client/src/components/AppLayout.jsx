import {
  BarChart3,
  FileText,
  History,
  LogOut,
  Menu,
  Moon,
  PenLine,
  Sparkles,
  Sun,
  UserRound,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/resumes", label: "Resumes", icon: FileText },
  { to: "/interview", label: "Interview", icon: Sparkles },
  { to: "/history", label: "History", icon: History },
  { to: "/cover-letter", label: "Cover Letter", icon: PenLine },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("ifai_theme") === "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("ifai_theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">IF</span>
          <div>
            <strong>InterviewFlow AI</strong>
            <small>{user?.profile?.targetRole || "Interview Prep"}</small>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="ghost-button sidebar-logout" type="button" onClick={logout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-only"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            title="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <strong>{user?.name}</strong>
            <small>{user?.email}</small>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => setDark((value) => !value)}
            title="Theme"
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
