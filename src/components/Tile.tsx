// src/components/Tile.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Props = {
  to: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  bg?: string; // шлях до фонового зображення
};

const Tile: React.FC<Props> = ({ to, title, subtitle, icon, bg }) => (
  <Link to={to} className="block transition-all duration-300 hover:scale-105">
    <Card className="h-full overflow-hidden border-none shadow-md" 
      style={
        bg
          ? {
              backgroundImage: `url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      {bg && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10">
        <CardHeader>
          <div className="text-3xl mb-2 text-foreground">
            {icon ? (
              React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, { 
                    className: `${(icon as any).props?.className ?? ''} transition-transform duration-300 hover:scale-110` 
                  })
                : icon
            ) : "🧩"}
          </div>
          <CardTitle className={bg ? "text-white" : "text-foreground"}>{title}</CardTitle>
          {subtitle && (
            <CardDescription className={bg ? "text-white/80" : "text-foreground/80"}>
              {subtitle}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
        </CardContent>
      </div>
    </Card>
  </Link>
);

export default Tile;
