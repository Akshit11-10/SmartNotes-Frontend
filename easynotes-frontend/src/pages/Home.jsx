import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, FileText, Plus, Search } from "lucide-react";
import { getAllNotes, deleteNote, togglePinNote } from "../services/noteService";
import NoteCard from "../components/NoteCard";
import SkeletonCard from "../components/SkeletonCard";
import ErrorMessage from "../components/ErrorMessage";

const PAGE_SIZE = 8;
const CATEGORIES = ["Personal", "Work", "Ideas", "Other"];

// Maps a friendly sort label to the sortBy/sortDir params NoteController expects.
const SORT_OPTIONS = {
  newest: { sortBy: "updatedAt", sortDir: "desc", label: "Newest first" },
  oldest: { sortBy: "updatedAt", sortDir: "asc", label: "Oldest first" },
  title: { sortBy: "title", sortDir: "asc", label: "Title (A-Z)" },
};

const selectClasses =
  "rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 " +
  "text-slate-700 dark:text-slate-200 py-2 pl-3 pr-8 text-sm shadow-sm outline-none " +
  "focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20";

// Home page: fetches notes from GET /api/notes - all filtering (search term,
// category), sorting, and pagination happen on the backend. This component's
// job is just to hold the current filter/page state and re-fetch when it changes.
function Home() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState(""); // what the user is typing
  const [query, setQuery] = useState(""); // debounced value actually sent to the API
  const [category, setCategory] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });

  // A small polish touch: keep the browser tab title in sync with the page.
  useEffect(() => {
    document.title = "EasyNotes — Your Notes";
  }, []);

  // Debounce: wait 400ms after the user stops typing before updating `query`.
  // Without this, every keystroke would fire a network request.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(0); // a new search always starts back at page 1
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 whenever the filters themselves change (not on every page click).
  useEffect(() => {
    setPage(0);
  }, [category, sortOption]);

  const fetchNotes = () => {
    setLoading(true);
    setError("");
    const { sortBy, sortDir } = SORT_OPTIONS[sortOption];

    getAllNotes({ page, size: PAGE_SIZE, sortBy, sortDir, query, category })
      .then((response) => {
        // Defensive: if the backend hasn't been updated to return a paginated
        // Page<Note> yet (still sending a plain array), fall back gracefully
        // instead of crashing the whole page.
        const data = response.data;
        const content = Array.isArray(data) ? data : data?.content ?? [];
        const totalPages = Array.isArray(data) ? 1 : data?.totalPages ?? 1;
        const totalElements = Array.isArray(data) ? data.length : data?.totalElements ?? content.length;

        setNotes(content);
        setPageInfo({ totalPages, totalElements });
      })
      .catch(() =>
        setError("Could not load notes. Is the backend running on port 8080?")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, category, sortOption]);

  const handleDelete = (id) => {
    if (!window.confirm("Move this note to Trash? You can restore it later.")) return;
    deleteNote(id)
      .then(fetchNotes)
      .catch(() => setError("Could not delete the note. Please try again."));
  };

  const handleTogglePin = (id) => {
    togglePinNote(id)
      .then(fetchNotes)
      .catch(() => setError("Could not update the pin. Please try again."));
  };

  const hasActiveFilters = query || category;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100">
            Your Notes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {pageInfo.totalElements} note{pageInfo.totalElements !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Filter bar: search (debounced), category, sort - all drive the backend query */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search notes..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2 pl-9 pr-3 text-sm shadow-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-500/20"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectClasses}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className={selectClasses}
        >
          {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={fetchNotes} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : notes.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-16 text-center">
          {hasActiveFilters ? (
            <>
              <Search className="mx-auto text-slate-300 dark:text-slate-600" size={36} strokeWidth={1.5} />
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                No notes match your filters.
              </p>
            </>
          ) : (
            <>
              <FileText className="mx-auto text-slate-300 dark:text-slate-600" size={40} strokeWidth={1.5} />
              <p className="mt-3 text-slate-500 dark:text-slate-400">You don't have any notes yet.</p>
              <Link
                to="/notes/new"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
              >
                <Plus size={16} /> Create your first note
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>

          {pageInfo.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Page {page + 1} of {pageInfo.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageInfo.totalPages - 1, p + 1))}
                disabled={page >= pageInfo.totalPages - 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
