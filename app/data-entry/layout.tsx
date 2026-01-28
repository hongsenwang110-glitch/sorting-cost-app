import { RegionTabs } from "./region-tabs"

export default function DataEntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Entry</h1>
        <RegionTabs />
      </div>
      {children}
    </div>
  )
}

