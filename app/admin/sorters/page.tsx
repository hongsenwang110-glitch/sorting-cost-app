import { getTXSorters, getCASorters, getNJSorters } from "@/app/actions/sorter"
import { SortersTable } from "./sorters-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminSortersPage(props: { searchParams?: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams
  const defaultTab = searchParams?.tab || "tx"
  
  const [txSorters, caSorters, njSorters] = await Promise.all([
    getTXSorters(),
    getCASorters(),
    getNJSorters()
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Manage Sorters</h1>
        
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList>
                <TabsTrigger value="tx">TX Sorters</TabsTrigger>
                <TabsTrigger value="ca">CA Sorters</TabsTrigger>
                <TabsTrigger value="nj">NJ Sorters</TabsTrigger>
            </TabsList>
            <TabsContent value="tx">
                <SortersTable region="TX" data={txSorters} />
            </TabsContent>
             <TabsContent value="ca">
                <SortersTable region="CA" data={caSorters} />
            </TabsContent>
            <TabsContent value="nj">
                <SortersTable region="NJ" data={njSorters} />
            </TabsContent>
        </Tabs>
    </div>
  )
}
