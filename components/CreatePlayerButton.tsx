'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CreatePlayerButtonProps {
  className?: string;
  label?: string;
}

export default function CreatePlayerButton({ 
  className = '', 
  label = 'Cadastrar Jogador' 
}: CreatePlayerButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    try {
      router.push('/?showRegistration=true');
      toast.success('Formulário de cadastro aberto');
    } catch (error) {
      console.error('Erro ao abrir cadastro:', error);
      
      // Fallback manual se o router falhar
      window.location.href = '/?showRegistration=true';
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`bg-wood-dark text-white py-2 px-4 rounded-md hover:bg-wood-medium focus:outline-none focus:ring-2 focus:ring-wood-dark ${className}`}
    >
      {label}
    </button>
  );
} 