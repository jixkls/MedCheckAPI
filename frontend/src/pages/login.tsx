import { useState } from 'react';
import { login } from '../api';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await login(email, password);
            onLogin();
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
    <input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
    <button type="submit">Entrar</button>
    {error && <div style={{color: 'red'}}>{error}</div>}
    </form>
    );
    }
