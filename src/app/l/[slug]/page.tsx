import { redirect } from 'next/navigation'

interface PageProps {
  params: { slug: string }
}

// Esta página apenas redireciona para a API de redirect
// O redirecionamento real acontece no /api/redirect/[slug]
export default function RedirectPage({ params }: PageProps) {
  redirect(`/api/redirect/${params.slug}`)
}

