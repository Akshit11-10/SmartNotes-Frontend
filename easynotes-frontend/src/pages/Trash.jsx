import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { getTrash, restoreNote, permanentlyDeleteNote } from "../services/noteService";
import TrashCard from "../components/TrashCard";
import SkeletonCard from "../components/SkeletonCard";
import ErrorMessage from "../components/ErrorMessage";

const PAGE_SIZE = 8;

// Trash page: mirrors Home.jsx's data-fetching pattern, but talks to
// GET /api/notes/trash instead of GET /api/notes. Notes end up here after a
// "soft delete" from Home/NoteDetail - they can be restored or removed for good.
function Trash() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });

  useEffect(() => {
    document.title = "Trash — EasyNotes";
  }, []);

  const fetchTrash = () => {
    setLoading(true);
    setError("");
    getTrash({ page, size: PAGE_SIZE })
      .then((response) => {
        const data = response.data;
        setNotes(data?.content ?? []);
        setPageInfo({
          totalPages: data?.totalPages ?? 1,
          totalElements: data?.totalElements ?? 0,
        });
      })
      .catch(() => setError("Could not load the trash. Is the backend running?"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRestore = (id) => {
    restoreNote(id)
      .then(fetchTrash)
      .catch(() => setError("Could not restore the note. Please try again."));
  };

  const handleDeleteForever = (id) => {
    if (
      !window.confirm(
        "Permanently delete this note? This cannot be undone - it will be gone for good."
      )
    )
      return;

    permanentlyDeleteNote(id)
      .then(fetchTrash)
      .catch(() => setError("Could not delete the note. Please try again."));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
      >
        <ArrowLeft size={15} /> Back to notes
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100 mt-3 mb-1">
        Trash
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {pageInfo.totalElements} note{pageInfo.totalElements !== 1 ? "s" : ""} in the trash
      </p>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={fetchTrash} />
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
          <Trash2 className="mx-auto text-slate-300 dark:text-slate-600" size={40} strokeWidth={1.5} />
          <p className="mt-3 text-slate-500 dark:text-slate-400">Trash is empty.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map((note) => (
              <TrashCard
                key={note.id}
                note={note}
                onRestore={handleRestore}
                onDeleteForever={handleDeleteForever}
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

export default Trash;
