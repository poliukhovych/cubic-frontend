//src/components/Footer.tsx
import React from "react";

const Footer: React.FC = () => (
  <footer className="glasscard backdrop-blur-sm mt-12 text-sm text-[var(--muted)]">
    <div className="mx-auto max-w-6xl px-4 py-8">
      © {new Date().getFullYear()} Faculty Helper
    </div>
  </footer>
);

export default Footer;
