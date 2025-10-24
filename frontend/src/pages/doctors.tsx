import { useEffect, useState } from 'react';
import { getDoctor, addDoctor, updateDoctor, removeDoctor } from '../api';

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [form, setForm] = useState({ nome: '', crm: '', specialtyId: '' });
    const [editId, setEditId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    async function loadDoctors() {
        setLoading(true);
        try {
            setDoctors(await getDoctor());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDoctors();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editId) {
            await updateDoctor(editId, form);
            setEditId(null);
        } else {
            await addDoctor(form);
        }
        setForm({ nome: '', crm: '', specialtyId: '' });
        loadDoctors();
    }

    function handleEdit(doc: any) {
        setEditId(doc.id);
        setForm({ nome: doc.nome, crm: doc.crm, specialtyId: doc.specialtyId });
    }

    async function handleDelete(id: number) {
        await removeDoctor(id);
        loadDoctors();
    }

    return (
        <div>
            <h2>Médicos</h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                <input placeholder="CRM" value={form.crm} onChange={e => setForm(f => ({ ...f, crm: e.target.value }))} />
                <input placeholder="Especialidade ID" value={form.specialtyId} onChange={e => setForm(f => ({ ...f, specialtyId: e.target.value }))} />
                <button type="submit">{editId ? 'Salvar' : 'Cadastrar'}</button>
                {editId && <button type="button" onClick={() => { setEditId(null); setForm({ nome: '', crm: '', specialtyId: '' }); }}>Cancelar</button>}
            </form>
            {loading ? <div>Carregando...</div> : (
                <ul>
                    {doctors.map(doc => (
                        <li key={doc.id}>
                            <b>{doc.nome}</b> - CRM: {doc.crm} - Esp: {doc.specialtyId}
                            <button onClick={() => handleEdit(doc)}>Editar</button>
                            <button onClick={() => handleDelete(doc.id)}>Excluir</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
