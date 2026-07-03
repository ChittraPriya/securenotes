import { redirect } from 'next/navigation'

export default async function ShareLegacyPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  redirect(`/share/${token}`)
}
