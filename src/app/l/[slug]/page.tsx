import { redirect } from 'next/navigation'

interface PageProps {
  params: { slug: string }
}

// Esta página redireciona para a API de redirect
// A API tem melhor suporte para operações assíncronas
export default function RedirectPage({ params }: PageProps) {
  const { slug } = params
  redirect(`/api/redirect/${slug}`)
}

