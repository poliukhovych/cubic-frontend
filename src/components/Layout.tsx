import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Aurora from "./Aurora";

const Layout: React.FC = () => {
  return (
    <div className="relative flex min-h-dvh flex-col text-[var(--text)]">
      {/* 🔮 Глобальний фон-аврора */}
      <Aurora /> {/* легка GPU-анімація */}

      <Header />
      {/* grow = займи все що залишилось, щоб футер пішов вниз */}
      <main className="flex-grow mx-auto w-full max-w-6xl px-4 pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
