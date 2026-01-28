import { getRegionConfig } from "@/app/actions/entry"
import { getCASorters } from "@/app/actions/sorter"
import { CAForm } from "./ca-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CAPage() {
  const [config, sorters] = await Promise.all([
    getRegionConfig("CA"),
    getCASorters()
  ])

  return (
    <div className="max-w-4xl mx-auto">
       <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">CA Daily Entry</h2>
            <Link href="/admin/sorters?tab=ca">
                <Button variant="outline" size="sm">Manage Sorters List</Button>
            </Link>
       </div>
       <CAForm config={config} sorters={sorters} />
    </div>
  )
}

