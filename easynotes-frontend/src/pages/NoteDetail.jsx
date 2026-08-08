import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { getNoteById, deleteNote, togglePinNote } from "../services/noteService";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Detail page: fetches a single note via GET /api/notes/:id.
// This is the simplest example of a "read one" screen backed by the API.
function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getNoteById(id)
      .then((response) => setNote(response.data))
      .catch(() => setError("This note could not be found."))
      .finally(() => setLoading(false));
  }, [id]);

  // Once the note has loaded, show its title in the browser tab instead of a
  // generic label. Resets on unmount so navigating away doesn't leave a stale title.
  useEffect(() => {
    document.title = note ? `${note.title} — EasyNotes` : "EasyNotes";
    return () => {
      document.title = "EasyNotes";
    };
  }, [note]);

  const handleDelete = () => {
    if (!window.confirm("Move this note to Trash? You can restore it later.")) return;
    deleteNote(id)
      .then(() => navigate("/"))
      .catch(() => setError("Could not delete the note. Please try again."));
  };

  // Client-side download - no backend involved. Builds a plain text file in
  // memory (a Blob), creates a temporary object URL for it, and triggers a
  // download via an invisible <a> tag - a standard browser-only pattern.
  const handleDownload = () => {
    const text = `${note.title}\n\n${note.content}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${note.title.trim().replace(/[^a-z0-9]+/gi, "-") || "note"}.txt`;
    link.click();

    URL.revokeObjectURL(url); // free the memory once the download has started
  };

  const handleTogglePin = () => {
    togglePinNote(id)
      .then((response) => setNote(response.data))
      .catch(() => setError("Could not update the pin. Please try again."));
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
      >
        <ArrowLeft size={15} /> Back to notes
      </Link>

      {loading ? (
        <Loader message="Loading note..." />
      ) : error ? (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100 break-words">
              {note.title}
            </h1>
            <button
              onClick={handleTogglePin}
              aria-label={note.pinned ? "Unpin note" : "Pin note"}
              className={`shrink-0 rounded-md p-1.5 transition-colors ${
                note.pinned
                  ? "text-accent-600 dark:text-accent-500"
                  : "text-slate-300 hover:text-accent-500 dark:text-slate-600 dark:hover:text-accent-500"
              }`}
            >
              {note.pinned ? <Pin size={18} fill="currentColor" /> : <PinOff size={18} />}
            </button>
          </div>

          {note.category && (
            <span className="mt-2 inline-block rounded-full bg-brand-50 dark:bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-400">
              {note.category}
            </span>
          )}

          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            Created {formatDate(note.createdAt)} &middot; Updated{" "}
            {formatDate(note.updatedAt)}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {note.content}
          </p>

          <div className="mt-6 flex gap-2">
            <Link
              to={`/notes/${note.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Pencil size={15} /> Edit
            </Link>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Download size={15} /> Download
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteDetail;
