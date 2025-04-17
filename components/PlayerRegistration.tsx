import { useState } from 'react';

interface PlayerRegistrationProps {
  onPlayerRegistered: () => void;
}

export default function PlayerRegistration({ onPlayerRegistered }: PlayerRegistrationProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar jogador');
      }

      setSuccess('Jogador registrado com sucesso!');
      setName('');
      setEmail('');
      
      if (onPlayerRegistered) {
        onPlayerRegistered();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao registrar o jogador');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-wood-light p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-wood-dark">Registrar Novo Jogador</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-wood-dark mb-1">
            Nome *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-wood-dark mb-1">
            Email (opcional)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-wood-medium rounded-md focus:outline-none focus:ring-2 focus:ring-wood-dark"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !name}
          className="w-full bg-wood-dark text-white py-2 px-4 rounded-md hover:bg-wood-medium focus:outline-none focus:ring-2 focus:ring-wood-dark disabled:opacity-50"
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Jogador'}
        </button>
      </form>
    </div>
  );
} 