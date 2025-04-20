import Link from 'next/link';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-8"></div>
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Carregando o jogo...</h1>
      <p className="text-gray-600 mb-8 max-w-md text-center">
        Aguarde enquanto configuramos sua sala de jogo. Isso pode levar alguns segundos.
      </p>
      
      <Link 
        href="/"
        className="mt-4 text-blue-600 hover:underline"
      >
        Voltar para a página inicial
      </Link>
    </div>
  );
} 