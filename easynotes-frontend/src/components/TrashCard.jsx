import { RotateCcw, Trash2 } from "lucide-react";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// A note card variant used only on the Trash page. Deliberately separate from
// NoteCard - the actions here are different (Restore / Delete Forever instead
// of View / Edit / Delete), so reusing NoteCard with a bunch of conditional
// props would be more confusing than just having a second, simpler component.
function TrashCard({ note, onRestore, onDeleteForever }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 opacity-80">
      <div>
        <h3 className="font-display text-lg font-semibold text-slate-600 dark:text-slate-300 line-clamp-1">
          {note.title}
        </h3>
        <p className="mt-2 text-sm text-slate-400 dark:text-slate-500 line-clamp-3 whitespace-pre-line">
          {note.content}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Deleted &middot; last updated {formatDate(note.updatedAt)}
        </p>

        <div className="mt-3 flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => onRestore(note.id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-brand-600 dark:text-brand-400 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/10"
          >
            <RotateCcw size={15} /> Restore
          </button>
          <button
            onClick={() => onDeleteForever(note.id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <Trash2 size={15} /> Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrashCard;
