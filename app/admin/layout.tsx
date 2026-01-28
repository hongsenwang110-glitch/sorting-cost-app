import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const ADMIN_EMAILS = ['garywang@xlmiles.com']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  
  if (!user) return redirect('/')

  const email = user.emailAddresses[0]?.emailAddress
  if (!ADMIN_EMAILS.includes(email)) {
    return redirect('/')
  }

  return <>{children}</>
}

