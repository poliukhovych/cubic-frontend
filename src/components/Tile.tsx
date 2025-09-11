// src/components/Tile.tsx
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  to: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  bg?: string; // шлях до фонового зображення
};

const Tile: React.FC<Props> = ({ to, title, subtitle, icon, bg }) => (
  <Link
    to={to}
    className="glasscard p-5 hover-lift "
    style={
      bg
        ? {
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
          }
        : {}
    }
  >
    {bg && <div className="absolute inset-0 bg-black/40" />} {/* затемнення */}
    <div className="relative z-10">
      <div className="text-3xl mb-3">{icon ?? "🧩"}</div>
      <div className="font-semibold text-lg">{title}</div>
      {subtitle && <div className="text-sm opacity-90 mt-1">{subtitle}</div>}
    </div>
  </Link>
);

export default Tile;
