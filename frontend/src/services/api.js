/**
 * Centralized API client for AI Resume Analyzer backend.
 */

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const RESUMES_BASE_URL = `${API_ROOT}/api/v1/resumes`;
const AUTH_BASE_URL = `${API_ROOT}/api/v1/auth`;
const TOKEN_STORAGE_KEY = 'resume_ai_auth_token';
const USER_STORAGE_KEY = 'resume_ai_auth_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

function getAuthHeaders() {
  const token = getStoredToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// =================== AUTHENTICATION API ===================

export async function login({ email, password }) {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed. Please check credentials.');
  }

  setStoredToken(data.data.token);
  setStoredUser(data.data.user);
  return data.data;
}

export async function register({ email, fullName, password }) {
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, fullName, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed.');
  }

  setStoredToken(data.data.token);
  setStoredUser(data.data.user);
  return data.data;
}

export async function getMe() {
  const token = getStoredToken();
  if (!token) return null;

  const response = await fetch(`${AUTH_BASE_URL}/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    clearAuth();
    return null;
  }

  const data = await response.json();
  setStoredUser(data.data);
  return data.data;
}

// =================== RESUME ANALYSIS API ===================

export async function extractResumeText(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${RESUMES_BASE_URL}/extract-text`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to extract resume text.');
  }
  return data.data;
}

export async function analyzeFull({ resumeText, jobDescription, save = true, candidateName = '', jobTitle = '' }) {
  const fullPath = `${RESUMES_BASE_URL}/analyze-full`;
  const url = fullPath.startsWith('http') ? new URL(fullPath) : new URL(`${window.location.origin}${fullPath}`);
  url.searchParams.append('save', save);
  if (candidateName) url.searchParams.append('candidateName', candidateName);
  if (jobTitle) url.searchParams.append('jobTitle', jobTitle);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ resumeText, jobDescription }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to analyze resume.');
  }
  return data.data;
}

export async function getHistory(page = 0, size = 10) {
  const response = await fetch(`${RESUMES_BASE_URL}/history?page=${page}&size=${size}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch history.');
  }
  return data.data;
}

export async function getHistoryById(id) {
  const response = await fetch(`${RESUMES_BASE_URL}/history/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch historical record.');
  }
  return data.data;
}

export async function deleteHistory(id) {
  const response = await fetch(`${RESUMES_BASE_URL}/history/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete record.');
  }
  return data;
}

export async function sendChatMessage({ message, conversationHistory = [], context = null }) {
  const response = await fetch(`${RESUMES_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      message,
      conversationHistory,
      context,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send chat message.');
  }
  return data.data;
}


