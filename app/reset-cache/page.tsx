'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isBrowser } from '@/lib/clientUtils';

export default function ResetCache() {
  const router = useRouter();
  const [message, setMessage] = useState('Limpando cache local...');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!isBrowser) return;

    try {
      // Limpar localStorage
      localStorage.clear();
      
      // Limpar sessionStorage
      sessionStorage.clear();
      
      // Tentar limpar service workers se existirem
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      
      // Adicionar mensagem de sucesso
      setMessage('Cache local limpo com sucesso!');
      setStatus('success');
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      setMessage('Erro ao limpar cache. Tente novamente ou limpe o cache manualmente.');
      setStatus('error');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="mb-6">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        )}
        {status === 'success' && (
          <div className="text-5xl mb-4">✅</div>
        )}
        {status === 'error' && (
          <div className="text-5xl mb-4">❌</div>
        )}
      </div>
      
      <h1 className={`text-2xl font-bold mb-4 ${
        status === 'success' ? 'text-green-600' : 
        status === 'error' ? 'text-red-600' : 'text-blue-600'
      }`}>
        {message}
      </h1>
      
      <p className="mb-6 text-lg text-gray-700">
        {status === 'success' ? 'Redirecionando para a página inicial...' : 
         status === 'error' ? 'Tente as instruções abaixo:' : 'Por favor, aguarde...'}
      </p>
      
      {status === 'error' && (
        <div className="max-w-md text-left bg-gray-100 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Para limpar o cache manualmente:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Abra as ferramentas de desenvolvedor (F12 ou Ctrl+Shift+I)</li>
            <li>Vá para a aba "Application" ou "Aplicativo"</li>
            <li>No painel esquerdo, selecione "Storage" ou "Armazenamento"</li>
            <li>Clique em "Clear site data" ou "Limpar dados do site"</li>
            <li>Recarregue a página</li>
          </ol>
        </div>
      )}
      
      <button 
        onClick={() => router.push('/')}
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Voltar à página inicial
      </button>
    </div>
  );
} 