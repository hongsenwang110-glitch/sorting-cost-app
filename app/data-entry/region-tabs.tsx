'use client'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter } from "next/navigation"

export function RegionTabs() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Extract region from path
  const segments = pathname.split('/')
  const currentRegion = segments[segments.length - 1]?.toLowerCase()
  
  // If currentRegion is not one of the tabs, default to tx or keep it loose
  const activeTab = ['tx', 'ca', 'nj'].includes(currentRegion) ? currentRegion : 'tx'

  return (
    <Tabs value={activeTab} onValueChange={(val) => router.push(`/data-entry/${val}`)}>
      <TabsList>
        <TabsTrigger value="tx">TX</TabsTrigger>
        <TabsTrigger value="ca">CA</TabsTrigger>
        <TabsTrigger value="nj">NJ</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

