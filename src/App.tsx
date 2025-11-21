import React from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/theme/ThemeProvider";
import "@/styles.css"; // ← один-єдиний вхідний CSS
import { router } from "@/lib/router";
import { AuthProvider } from "@/types/auth";
import { Toaster } from "@/components/ui/sonner";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
