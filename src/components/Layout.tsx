import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Aurora from "./Aurora";

const Layout: React.FC = () => {
  return (
    <div className="relative flex flex-col min-h-dvh text-[var(--text)]">
      {/* 🔮 Глобальний фон-аврора */}
        <Aurora /> {/* легка GPU-анімація */}


      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-4 pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
