import axios from "axios";

// A separate, plain Axios instance (not the one in noteService.js) because
// signup/login requests must NOT carry an Authorization header - there's no
// token yet, and these endpoints are public on the backend anyway
// (see SecurityConfig.java: "/api/auth/**" is permitAll).
const BASE_URL = "http://localhost:8080/api/auth";

const authApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// POST /api/auth/signup -> creates the account and returns { token, id, name, email }
export const signupUser = (name, email, password) =>
  authApi.post("/signup", { name, email, password });

// POST /api/auth/login -> verifies credentials and returns { token, id, name, email }
export const loginUser = (email, password) =>
  authApi.post("/login", { email, password });
