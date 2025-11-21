import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Toggle
      aria-label="Toggle theme"
      className="rounded-full p-2 text-foreground hover:bg-background/80 hover:text-foreground border-border/30 glass glass-card backdrop-blur-sm border"
      pressed={theme === "dark"}
      onPressedChange={() => toggle()}
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-foreground" />
      ) : (
        <Sun className="h-5 w-5 text-foreground" />
      )}
    </Toggle>
  );
}

export function ThemeToggleButton() {
  const { theme, toggle } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full text-foreground hover:scale-110 animate-in spin-in-3 hover:bg-background/80 hover:text-foreground border-border/30 glass glass-card backdrop-blur-sm"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5 text-foreground" />
      ) : (
        <Sun className="h-5 w-5 text-foreground" />
      )}
    </Button>
  );
}