import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useHideOnScroll } from "@/lib/hooks/useHideOnScroll";
import { useAuth } from "@/types/auth";
import { cls } from "@/lib/utils/cls";
import favicon from "@/assets/favicon.ico";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";

const Header: React.FC = () => {
  const hidden = useHideOnScroll();
  const { user, logout } = useAuth();
  const nav = useNavigate();

  // Тема з контексту (зберігається в localStorage у ThemeProvider)
  const { theme, toggle } = useTheme();

  return (
    <header
      className={cls(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-300 max-w-6xl mx-auto px-4",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className={cls("mt-4 glasscard px-6 py-5 flex items-center justify-between relative")}>
        {/* Logo (left) */}
        <Link to="/" className="flex items-center gap-3 font-semibold text-xl">
          <img src={favicon} alt="Logo" className="h-8 w-8" />
          <span>Cubic Helper</span>
        </Link>

        {/* Nav (center) */}
        <nav className="hidden font-semibold md:flex gap-6 font-semiboldtext-lg absolute left-1/2 -translate-x-1/2">

          {user?.role === "student" && (
            <>
              <NavLink to="/student/schedule">Мій розклад</NavLink>
              <NavLink to="/student/homework">Домашні завдання</NavLink>
               <NavLink to="/student/grades">Оцінки</NavLink>
            </>
          )}
          {user?.role === "teacher" && (
            <>
              <NavLink to="/teacher/schedule">Мій розклад</NavLink>
              <NavLink to="/teacher/students">Студенти</NavLink>
            </>
          )}
          {/* {user?.role === "admin" && (
            <>
              <NavLink to="/admin/teachers">Викладачі</NavLink>
              <NavLink to="/admin/schedule">Розклад</NavLink>
            </>
          )} */}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 text-lg">
          {user ? (
            <button
              className="btn font-semiboldtext-lg px-4 py-2"
              onClick={() => {
                logout();
                nav("/");
              }}
            >
              Вийти
            </button>
          ) : (
            <Link to="/login" className="btn text-lg px-4 py-2">
              Увійти
            </Link>
          )}

          {/* Кнопка перемикання теми (збереження виконує ThemeProvider) */}
          <button onClick={toggle} className="btn p-2" aria-label="Перемкнути тему">
            {theme === "light" ? <Moon className="h-7 w-7" /> : <Sun className="h-7 w-7" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
