import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode'; // Importa jwt-decode
import { CalendarIcon, Trash2, Eye } from 'lucide-react';

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pega o token do localStorage e decodifica
  const token = localStorage.getItem('token');
  let emailPrestador = '';

  if (token) {
    try {
      const decoded = jwtDecode(token);
      emailPrestador = decoded.email; // pega o email do token decodificado
    } catch (error) {
      console.error('Token inválido', error);
    }
  }

  useEffect(() => {
    async function fetchAgendamentos() {
      if (!emailPrestador) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:3000/agendamentos?emailPrestador=${emailPrestador}`);
        setAgendamentos(res.data);
      } catch (err) {
        console.error('Erro ao buscar agendamentos', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgendamentos();
  }, [emailPrestador]); // atualiza se emailPrestador mudar

  const cancelarAgendamento = async (eventId) => {
    try {
      await axios.delete(`http://localhost:3000/agendamentos/${eventId}`);
      setAgendamentos(prev => prev.filter(a => a.id !== eventId));
    } catch (err) {
      console.error('Erro ao cancelar agendamento', err);
    }
  };

  if (loading) return <p className="text-center mt-10">Carregando agendamentos...</p>;

  if (!emailPrestador) return <p className="text-center mt-10 text-red-500">Usuário não autenticado.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Seus Agendamentos</h2>
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Início</th>
              <th className="px-4 py-2">Fim</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.length === 0 && (
              <tr><td colSpan="5" className="text-center p-4">Nenhum agendamento encontrado.</td></tr>
            )}
            {agendamentos.map((ag) => (
              <tr key={ag.id} className="border-t">
                <td className="px-4 py-3">{ag.cliente}</td>
                <td className="px-4 py-3">{new Date(ag.inicio).toLocaleDateString()}</td>
                <td className="px-4 py-3">{new Date(ag.inicio).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
                <td className="px-4 py-3">{new Date(ag.fim).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
                <td className="px-4 py-3 flex gap-3">
                  <button
                    onClick={() => cancelarAgendamento(ag.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Cancelar agendamento"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="text-blue-500 hover:text-blue-700" title="Ver detalhes">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
