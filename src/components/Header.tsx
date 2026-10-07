import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useHideOnScroll } from "@/lib/hooks/useHideOnScroll";
import { useAuth } from "@/types/auth";
import { cls } from "@/lib/utils/cls";
import favicon from "@/assets/favicon.ico";
import { LogOut } from "lucide-react";
import { ThemeToggleButton } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/theme/ThemeProvider";

const Header: React.FC = () => {
  const hidden = useHideOnScroll();
  const { user, logout } = useAuth();
  useTheme();
  const nav = useNavigate();

  return (
    <header
      className={cls(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-300 max-w-6xl mx-auto px-4",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="mt-4 glass glass-card px-6 py-4 flex items-center justify-between relative transition-all duration-300 animate-in fade-in slide-in-from-top-4 rounded-xl">
        {/* Logo (left) */}
        <Link to="/" className="flex items-center gap-3 font-semibold text-xl">
          <img src={favicon} alt="Logo" className="h-8 w-8 transition-transform duration-300 hover:scale-110 animate-in spin-in-3" />
          <span className="transition-colors duration-300 hover:text-primary text-foreground">
            Cubic Helper
          </span>
        </Link>

        {/* Nav (center) */}
        <nav className="hidden font-semibold md:flex gap-6 absolute left-1/2 -translate-x-1/2 text-foreground">
          {user?.role === "student" && (
            <>
              <NavLink className="transition-colors duration-300 hover:text-primary hover:scale-105 transition-transform text-foreground" to="/student/schedule">Мій розклад</NavLink>
              <NavLink className="transition-colors duration-300 hover:text-primary hover:scale-105 transition-transform text-foreground" to="/student/homework">Домашні завдання</NavLink>
              <NavLink className="transition-colors duration-300 hover:text-primary hover:scale-105 transition-transform text-foreground" to="/student/grades">Оцінки</NavLink>
            </>
          )}
          {user?.role === "teacher" && (
            <>
              <NavLink className="transition-colors duration-300 hover:text-primary hover:scale-105 transition-transform text-foreground" to="/teacher/schedule">Мій розклад</NavLink>
              <NavLink className="transition-colors duration-300 hover:text-primary hover:scale-105 transition-transform text-foreground" to="/teacher/students">Студенти</NavLink>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <Button
              variant="outline"
              className="gap-2 hover:scale-105 transition-transform text-foreground hover:bg-background/80 hover:text-foreground border-border/30 glass glass-card backdrop-blur-sm"
              onClick={() => {
                logout();
                nav("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-foreground">Вийти</span>
            </Button>
          ) : (
            <Button asChild className="hover:scale-105 transition-transform hover:bg-primary/90 glass glass-card backdrop-blur-sm border border-primary/20">
              <Link to="/login" className="text-primary-foreground">Увійти</Link>
            </Button>
          )}

          {/* Theme toggle button */}
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
