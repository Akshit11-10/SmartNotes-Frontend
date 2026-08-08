import { Link, NavLink } from "react-router-dom";
import { Moon, NotebookPen, Plus, Sun, Trash2 } from "lucide-react";

// Top navigation bar shown on every page.
// Uses NavLink so we can highlight whichever link matches the current route.
// darkMode/onToggleDarkMode are passed down from App.jsx, which owns the state.
function Navbar({ darkMode, onToggleDarkMode }) {
  const linkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
        : "text-slate-600 hover:text-brand-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-brand-400 dark:hover:bg-slate-800"
    }`;

  return (
    <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display font-bold text-lg text-slate-800 dark:text-slate-100"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <NotebookPen size={18} strokeWidth={2.25} />
          </span>
          EasyNotes
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClasses}>
            All Notes
          </NavLink>
          <NavLink to="/trash" className={linkClasses}>
            <span className="inline-flex items-center gap-1.5">
              <Trash2 size={14} /> Trash
            </span>
          </NavLink>

          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <NavLink
            to="/notes/new"
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Note
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
