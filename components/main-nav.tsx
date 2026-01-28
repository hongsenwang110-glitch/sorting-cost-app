'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";

export function MainNav() {
  const pathname = usePathname()
  const { user } = useUser()
  const isAdmin = user?.primaryEmailAddress?.emailAddress === 'garywang@xlmiles.com'

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 border-b px-6 h-16 bg-white">
      <div className="font-bold text-xl mr-4">Sorting Cost App</div>
      <Link
        href="/data-entry"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/data-entry") ? "text-black" : "text-muted-foreground"
        )}
      >
        Data Entry
      </Link>
      <Link
        href="/analytics"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/analytics") ? "text-black" : "text-muted-foreground"
        )}
      >
        Analytics
      </Link>
      <div className="ml-auto flex items-center gap-4">
         {isAdmin && (
             <Link
                href="/admin/sorters"
                className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/admin") ? "text-black" : "text-muted-foreground"
                )}
            >
                Admin (Manage Sorters)
            </Link>
         )}
        <SignedIn>
            <UserButton />
        </SignedIn>
        <SignedOut>
            <SignInButton />
        </SignedOut>
      </div>
    </nav>
  )
}

