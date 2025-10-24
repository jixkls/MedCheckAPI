import { useState } from 'react';
import LoginPage from './pages/login.tsx';

export default function App() {
    const [logged, setLogged] = useState(!!localStorage.getItem('token'));
    return logged ? (
        <div>Bem-vindo! (em breve, dashboard)</div>
    ) : (
        <LoginPage onLogin={() => setLogged(true)} />
    );
}