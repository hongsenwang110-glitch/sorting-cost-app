import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalculationResult } from "@/lib/calc"

export function ResultsPanel({ result }: { result: CalculationResult | null }) {
  if (!result) return null

  return (
    <Card className="mt-6 border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle>Daily Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
           <div className="text-sm font-medium text-muted-foreground">Total Cost (Raw)</div>
           <div className="text-2xl font-bold">${result.totalCost.toFixed(2)}</div>
        </div>
        <div>
           <div className="text-sm font-medium text-muted-foreground">Loaded Cost (w/ Markup)</div>
           <div className="text-2xl font-bold">${result.loadedCost.toFixed(2)}</div>
        </div>
        <div>
           <div className="text-sm font-medium text-muted-foreground">Cost Per Box</div>
           <div className={`text-2xl font-bold ${result.costPerBox === null ? 'text-red-500' : ''}`}>
             {result.costPerBox !== null ? `$${result.costPerBox.toFixed(4)}` : 'N/A (No Packages)'}
           </div>
        </div>
        <div>
           <div className="text-sm font-medium text-muted-foreground">Efficiency</div>
           <div className={`text-2xl font-bold ${result.efficiency === null ? 'text-red-500' : ''}`}>
             {result.efficiency !== null ? `${result.efficiency.toFixed(1)}` : 'N/A (No Hours)'}
           </div>
           <div className="text-xs text-muted-foreground">boxes / hour</div>
        </div>
      </CardContent>
    </Card>
  )
}

