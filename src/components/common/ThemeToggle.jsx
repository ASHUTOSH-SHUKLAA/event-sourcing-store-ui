import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="group flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-strong)] text-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-card)] active:scale-95"
    >
      {isDark ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

export default ThemeToggle;
