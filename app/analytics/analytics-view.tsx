'use client'
import { useState, useEffect, useMemo } from 'react'
import { getAnalyticsData } from '@/app/actions/entry'
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calculateTX, calculateCA, calculateNJ } from '@/lib/calc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AnalyticsView() {
   const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['TX', 'CA', 'NJ'])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
      if (!date?.from || !date?.to) return
      setLoading(true)
      getAnalyticsData(date.from, date.to, selectedRegions).then(({ entries, configs }) => {
          const processed = entries.map(entry => {
              const config = configs.find(c => c.region === entry.region)
              if (!config) return null
              
              let result = null
              if (entry.region === 'TX') {
                  const shifts = entry.txShifts.map(s => ({ hours: s.hours, hourlyWage: s.hourlyWage || s.sorter.hourlyWage }))
                  result = calculateTX(entry.packages, shifts, config)
              } else if (entry.region === 'CA') {
                  // Handle both old and new data structure if necessary, but strictly new schema uses caShifts (list)
                  // If caShift (single) exists, use it? The query includes caShift (singular) from old code, I should update the query.
                  // But wait, I updated the query in actions/entry.ts to include caShifts (plural).
                  // I need to update the query usage here too? No, the action returns `entries` with included relations.
                  // But the type in `entry` might be inferred from prisma client.
                  
                  // New logic: Use caShifts array
                  const shifts = (entry.caShifts || []).map(s => ({ 
                      hours: s.hours, 
                      hourlyWage: s.hourlyWage,
                      role: s.sorter.role 
                  }))
                  
                  // Fallback for migration period (if needed, but we dropped table) -> We dropped table, so no fallback needed.
                  if (shifts.length > 0) {
                      result = calculateCA(entry.packages, shifts, config)
                  }
              } else if (entry.region === 'NJ') {
                  const shifts = (entry.njShifts || []).map(s => ({
                      hours: s.hours,
                      hourlyWage: s.hourlyWage
                  }))
                   if (shifts.length > 0) {
                      result = calculateNJ(entry.packages, shifts, config)
                  }
              }

              if (!result) return null

              return {
                  date: format(new Date(entry.date), 'yyyy-MM-dd'),
                  region: entry.region,
                  ...result
              }
          }).filter(Boolean)
          
          setData(processed as any[])
          setLoading(false)
      })
  }, [date, selectedRegions])

  const chartData = useMemo(() => {
      const map = new Map()
      data.forEach(d => {
          if (!map.has(d.date)) map.set(d.date, { date: d.date })
          const item = map.get(d.date)
          item[`${d.region}_cost`] = d.loadedCost
          item[`${d.region}_cpb`] = d.costPerBox
          item[`${d.region}_eff`] = d.efficiency
      })
      return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [data])

  const toggleRegion = (region: string) => {
      if (selectedRegions.includes(region)) {
          setSelectedRegions(selectedRegions.filter(r => r !== region))
      } else {
          setSelectedRegions([...selectedRegions, region])
      }
  }

  const colors: Record<string, string> = { TX: '#2563eb', CA: '#dc2626', NJ: '#16a34a' }

  return (
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
             <div className="flex items-center gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>

                <div className="flex gap-4">
                    {['TX', 'CA', 'NJ'].map(r => (
                        <div key={r} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`r-${r}`} 
                                checked={selectedRegions.includes(r)}
                                onCheckedChange={() => toggleRegion(r)}
                            />
                            <Label htmlFor={`r-${r}`}>{r}</Label>
                        </div>
                    ))}
                </div>
             </div>
          </div>

          <div className="grid gap-6">
             {/* Charts */}
             <Card>
                 <CardHeader><CardTitle>Daily Loaded Cost</CardTitle></CardHeader>
                 <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {selectedRegions.includes('TX') && <Line type="monotone" dataKey="TX_cost" stroke={colors.TX} name="TX Cost" />}
                            {selectedRegions.includes('CA') && <Line type="monotone" dataKey="CA_cost" stroke={colors.CA} name="CA Cost" />}
                            {selectedRegions.includes('NJ') && <Line type="monotone" dataKey="NJ_cost" stroke={colors.NJ} name="NJ Cost" />}
                        </LineChart>
                    </ResponsiveContainer>
                 </CardContent>
             </Card>

             <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader><CardTitle>Cost Per Box</CardTitle></CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {selectedRegions.includes('TX') && <Line type="monotone" dataKey="TX_cpb" stroke={colors.TX} name="TX CPB" />}
                                {selectedRegions.includes('CA') && <Line type="monotone" dataKey="CA_cpb" stroke={colors.CA} name="CA CPB" />}
                                {selectedRegions.includes('NJ') && <Line type="monotone" dataKey="NJ_cpb" stroke={colors.NJ} name="NJ CPB" />}
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Efficiency (Box/Hr)</CardTitle></CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {selectedRegions.includes('TX') && <Line type="monotone" dataKey="TX_eff" stroke={colors.TX} name="TX Eff" />}
                                {selectedRegions.includes('CA') && <Line type="monotone" dataKey="CA_eff" stroke={colors.CA} name="CA Eff" />}
                                {selectedRegions.includes('NJ') && <Line type="monotone" dataKey="NJ_eff" stroke={colors.NJ} name="NJ Eff" />}
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
             </div>
             
             {/* Table */}
             <Card>
                 <CardHeader><CardTitle>Daily Data</CardTitle></CardHeader>
                 <CardContent>
                     <Table>
                         <TableHeader>
                             <TableRow>
                                 <TableHead>Date</TableHead>
                                 <TableHead>Region</TableHead>
                                 <TableHead>Total Cost</TableHead>
                                 <TableHead>Loaded Cost</TableHead>
                                 <TableHead>Cost/Box</TableHead>
                                 <TableHead>Efficiency</TableHead>
                             </TableRow>
                         </TableHeader>
                         <TableBody>
                             {data.map((row, i) => (
                                 <TableRow key={i}>
                                     <TableCell>{row.date}</TableCell>
                                     <TableCell>{row.region}</TableCell>
                                     <TableCell>${row.totalCost.toFixed(2)}</TableCell>
                                     <TableCell>${row.loadedCost.toFixed(2)}</TableCell>
                                     <TableCell>{row.costPerBox ? `$${row.costPerBox.toFixed(3)}` : '-'}</TableCell>
                                     <TableCell>{row.efficiency ? row.efficiency.toFixed(1) : '-'}</TableCell>
                                 </TableRow>
                             ))}
                         </TableBody>
                     </Table>
                 </CardContent>
             </Card>
          </div>
      </div>
  )
}

