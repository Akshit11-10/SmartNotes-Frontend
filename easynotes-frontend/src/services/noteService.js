import axios from "axios";

// Base URL of the Spring Boot backend.
// The backend exposes all note endpoints under /api (see NoteController.java).
const BASE_URL = "http://localhost:8080/api";

// A single Axios instance shared by every API call in this app.
// Centralizing it here means if the backend URL ever changes,
// we only update it in one place.
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const TOKEN_KEY = "easynotes-token";

// Request interceptor: attaches "Authorization: Bearer <token>" to every
// outgoing request, if we have one. This runs for every single call below -
// none of the functions need to know or care about the token themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: if the backend ever responds 401 (no token, expired
// token, or a tampered token - see AuthEntryPointJwt.java), that means the
// session is no longer valid. We clear it and fire a window event instead of
// calling AuthContext directly - noteService.js is a plain module, not a
// React component, so it can't use the useAuth hook. AuthContext listens for
// this event and reacts by logging out and redirecting to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("easynotes-user");
      window.dispatchEvent(new Event("easynotes:unauthorized"));
    }
    return Promise.reject(error);
  }
);

// ---- Note API calls ----
// Each function maps 1:1 to an endpoint in NoteController.java

// GET /api/notes -> paginated + sorted + optionally filtered notes.
// `params` can include: page, size, sortBy, sortDir, query, category
// (all optional - the backend has sensible defaults for each).
// The response body is a Spring Data `Page` object: { content, totalPages, totalElements, number, ... }
export const getAllNotes = (params = {}) => api.get("/notes", { params });

// GET /api/notes/{id} -> returns a single note
export const getNoteById = (id) => api.get(`/notes/${id}`);

// POST /api/notes -> creates a new note. Body: { title, content, category }
export const createNote = (note) => api.post("/notes", note);

// PUT /api/notes/{id} -> updates an existing note (full replace).
// Body: { title, content, category, pinned }
export const updateNote = (id, note) => api.put(`/notes/${id}`, note);

// PUT /api/notes/{id}/pin -> flips the pinned flag on the backend
// without needing to resend the rest of the note's fields.
export const togglePinNote = (id) => api.put(`/notes/${id}/pin`);

// GET /api/notes/trash -> paginated list of soft-deleted notes
export const getTrash = (params = {}) => api.get("/notes/trash", { params });

// PUT /api/notes/{id}/restore -> brings a note back out of the trash
export const restoreNote = (id) => api.put(`/notes/${id}/restore`);

// DELETE /api/notes/{id}/permanent -> actually removes the row (only used from the Trash page)
export const permanentlyDeleteNote = (id) => api.delete(`/notes/${id}/permanent`);

// DELETE /api/notes/{id} -> soft delete (the backend just flags it and moves it to the trash)
export const deleteNote = (id) => api.delete(`/notes/${id}`);

export default api;
