const API_URL = 'http://localhost:3000/v1';

let token = localStorage.getItem('token') ?? '';

export function setToken(val: string) {
    token = val;
    localStorage.setItem('token', val);
}

async function apiFetch(path: string, options: RequestInit = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };
    const resp = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!resp.ok) throw new Error(await resp.text());
    return resp.json();
}

// Só pra exemplo
    export async function login(email: string, password: string) {
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data.user;
}

export async function getMe() {
    return apiFetch('/users/me');
}


export async function getDoctor(): Promise<any[]> {
    const resp = await apiFetch('/doctors');
    return resp;
}


export async function addDoctor(){
    console.log("Aaaah")
}
export async function updateDoctor(){
    console.log("Aaaah")
}
export async function removeDoctor(){
    console.log("Aaaah")
}