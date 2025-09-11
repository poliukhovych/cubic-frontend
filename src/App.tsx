//src/App.tsx
import React from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/theme/ThemeProvider";
import "@/theme/theme.css";
import "@/index.css";
import { router } from "@/lib/router";
import { AuthProvider } from "@/types/auth";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
