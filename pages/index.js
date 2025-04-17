import dynamic from 'next/dynamic'

// Carregamento dinâmico do componente principal com SSR desabilitado
const HomePage = dynamic(() => import('../app/page'), { ssr: false })

export default function Home() {
  return <HomePage />
} 