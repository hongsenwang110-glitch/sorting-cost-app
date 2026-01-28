import { getRegionConfig } from "@/app/actions/entry"
import { getTXSorters } from "@/app/actions/sorter"
import { TXForm } from "./tx-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function TXPage() {
  const [config, sorters] = await Promise.all([
    getRegionConfig("TX"),
    getTXSorters()
  ])

  return (
    <div className="max-w-4xl mx-auto">
       <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">TX Daily Entry</h2>
            <Link href="/admin/sorters">
                <Button variant="outline" size="sm">Manage Sorters List</Button>
            </Link>
       </div>
       <TXForm config={config} sorters={sorters} />
    </div>
  )
}

