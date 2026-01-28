import { getRegionConfig } from "@/app/actions/entry"
import { getNJSorters } from "@/app/actions/sorter"
import { NJForm } from "./nj-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NJPage() {
  const [config, sorters] = await Promise.all([
    getRegionConfig("NJ"),
    getNJSorters()
  ])

  return (
    <div className="max-w-4xl mx-auto">
       <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">NJ Daily Entry</h2>
             <Link href="/admin/sorters?tab=nj">
                <Button variant="outline" size="sm">Manage Sorters List</Button>
            </Link>
       </div>
       <NJForm config={config} sorters={sorters} />
    </div>
  )
}

