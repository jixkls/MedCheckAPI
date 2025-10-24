const API_URL = 'http://localhost:3000/v1';

let AUTH_TOKEN = localStorage.getItem('token') ?? '';

export function setAuthToken(token: string) {
    AUTH_TOKEN = token;
    localStorage.setItem('token', token);
}

async function apiFetch(path: string, options: RequestInit = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
        ...(options.headers || {}),
    };
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// Auth
export async function login(email: string, password: string) {
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data.user;
}

export async function register(nome: string, email: string, password: string) {
    const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nome, email, password }),
    });
    setAuthToken(data.token);
    return data.user;
}

export async function getMe() {
    return apiFetch('/users/me');
}

// Médicos
export async function getDoctors() {
    return apiFetch('/doctors');
}

export async function addDoctor(data: any) {
    return apiFetch('/doctors', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateDoctor(id: number, data: any) {
    return apiFetch(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function removeDoctor(id: number) {
    return apiFetch(`/doctors/${id}`, { method: 'DELETE' });
}

// Especialidades
export async function getSpecialties() {
    return apiFetch('/specialties');
}