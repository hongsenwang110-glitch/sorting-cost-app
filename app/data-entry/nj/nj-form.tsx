'use client'
import { useState, useEffect, useMemo } from 'react'
import { RegionConfig, NJSorter } from '@prisma/client'
import { getDailyEntry, saveNJEntry } from '@/app/actions/entry'
import { calculateNJ } from '@/lib/calc'
import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ResultsPanel } from '@/components/results-panel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Plus } from 'lucide-react'

export function NJForm({ config, sorters }: { config: RegionConfig, sorters: NJSorter[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [packages, setPackages] = useState(0)
    const [rows, setRows] = useState<{ sorterId: string; hours: number }[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Load data
    useEffect(() => {
        if (!date) return
        setLoading(true)
        getDailyEntry('NJ', date).then(entry => {
            if (entry) {
                setPackages(entry.packages)
                if (entry.njShifts && entry.njShifts.length > 0) {
                     setRows(entry.njShifts.map(s => ({ sorterId: s.sorterId.toString(), hours: s.hours })))
                } else {
                    setRows([])
                }
                setLastSaved(entry.updatedAt)
            } else {
                setPackages(0)
                setRows([])
                setLastSaved(null)
            }
            setLoading(false)
        })
    }, [date])

    // Calculation
    const calculated = useMemo(() => {
        const shifts = rows.map(r => {
            const sorter = sorters.find(s => s.id.toString() === r.sorterId)
            return { 
                hours: r.hours, 
                hourlyWage: sorter?.hourlyWage || 0
            }
        })
        return calculateNJ(packages, shifts, config)
    }, [packages, rows, config, sorters])

    const handleAddRow = (type: string) => {
        // Pre-select first sorter of that type if available to be helpful? No, keep it empty.
        setRows([...rows, { sorterId: '', hours: 0 }])
    }

    const handleRemoveRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index))
    }

    const handleRowChange = (index: number, field: 'sorterId' | 'hours', value: string | number) => {
        const newRows = [...rows]
        // @ts-expect-error dynamic assignment
        newRows[index] = { ...newRows[index], [field]: value }
        setRows(newRows)
    }

    const handleSave = async () => {
        if (!date) return
        setSaving(true)
        try {
            const shifts = rows
                .filter(r => r.sorterId && r.hours > 0)
                .map(r => ({ sorterId: parseInt(r.sorterId), hours: r.hours }))
            
            await saveNJEntry(date, packages, shifts)
            setLastSaved(new Date())
            alert('Entry saved successfully')
        } catch (e) {
            console.error(e)
            alert('Error saving')
        }
        setSaving(false)
    }
    
    // Split logic
    const fullTimeSorters = sorters.filter(s => s.type === 'FullTime' || !s.type)
    const partTimeSorters = sorters.filter(s => s.type === 'PartTime')
    
    // We need to render rows that belong to specific categories based on selected sorter
    // But rows initially have no sorterId. We can't strictly separate them unless we track "type" in row state.
    // However, if we just show two tables, we can filter existing rows by the type of the selected sorter.
    // What about empty rows? We can add a "type" to the row state to know which table it belongs to before selection.
    
    // Better approach:
    // Update state to include 'type' for the row
    // When loading data, look up sorter type.
    
    const [rowsWithType, setRowsWithType] = useState<{ id: string, sorterId: string, hours: number, type: string }[]>([])

    // Sync rowsWithType with rows on load
    useEffect(() => {
       const enriched = rows.map((r, i) => {
           const sorter = sorters.find(s => s.id.toString() === r.sorterId)
           return { 
               id: i.toString(), // temp id
               sorterId: r.sorterId, 
               hours: r.hours, 
               type: sorter?.type || 'FullTime' 
           }
       })
       // Only update if length differs or significant change (to avoid loop), strict equality check is hard here.
       // Actually, we should just manage state locally as `rows` and derive UI.
       // But adding a new row needs to know which table it was added from.
    }, [rows, sorters])

    // Let's refactor to use a single `localRows` state that includes type.
    const [localRows, setLocalRows] = useState<{ sorterId: string; hours: number; type: string }[]>([])

    useEffect(() => {
        if (loading) return
        
        // Transform loaded rows
        const mapped = rows.map(r => {
             const sorter = sorters.find(s => s.id.toString() === r.sorterId)
             return { sorterId: r.sorterId, hours: r.hours, type: sorter?.type || 'FullTime' }
        })
        setLocalRows(mapped)
    }, [rows, loading, sorters])

    // Update parent state when local changes? No, handleSave uses localRows.
    // Wait, calculation uses `rows`. We should sync back or update `calculated` to use `localRows`.
    
    const calculatedLocal = useMemo(() => {
        const shifts = localRows.map(r => {
            const sorter = sorters.find(s => s.id.toString() === r.sorterId)
            return { 
                hours: r.hours, 
                hourlyWage: sorter?.hourlyWage || 0
            }
        })
        return calculateNJ(packages, shifts, config)
    }, [packages, localRows, config, sorters])
    
    const handleSaveLocal = async () => {
        if (!date) return
        setSaving(true)
        try {
            const shifts = localRows
                .filter(r => r.sorterId && r.hours > 0)
                .map(r => ({ sorterId: parseInt(r.sorterId), hours: r.hours }))
            
            await saveNJEntry(date, packages, shifts)
            setLastSaved(new Date())
            alert('Entry saved successfully')
        } catch (e) {
            console.error(e)
            alert('Error saving')
        }
        setSaving(false)
    }

    const addLocalRow = (type: string) => {
        setLocalRows([...localRows, { sorterId: '', hours: 0, type }])
    }
    
    const updateLocalRow = (index: number, field: string, val: any) => {
        const newRows = [...localRows]
        // @ts-expect-error dynamic
        newRows[index] = { ...newRows[index], [field]: val }
        setLocalRows(newRows)
    }
    
    const removeLocalRow = (index: number) => {
        setLocalRows(localRows.filter((_, i) => i !== index))
    }

    const renderTable = (title: string, type: string, availableSorters: NJSorter[]) => {
        const tableRows = localRows.map((r, i) => ({ ...r, originalIndex: i })).filter(r => r.type === type)
        
        return (
            <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <Label>{title}</Label>
                    <Button size="sm" variant="outline" onClick={() => addLocalRow(type)}><Plus className="w-4 h-4 mr-2"/> Add Row</Button>
                 </div>
                 <div className="rounded-md border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="w-[100px]">Wage</TableHead>
                            <TableHead className="w-[150px]">Hours</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableRows.map((row) => {
                            const selectedSorter = sorters.find(s => s.id.toString() === row.sorterId)
                            return (
                                <TableRow key={row.originalIndex}>
                                    <TableCell>
                                        <Select value={row.sorterId} onValueChange={v => updateLocalRow(row.originalIndex, 'sorterId', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Person" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSorters.filter(s => s.active).map(s => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>${selectedSorter?.hourlyWage.toFixed(2) || '-'}</TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number" 
                                            min="0" max="24" step="0.5"
                                            value={row.hours}
                                            onChange={e => updateLocalRow(row.originalIndex, 'hours', Number(e.target.value))}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeLocalRow(row.originalIndex)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {tableRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">No rows added</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
                 </div>
            </div>
        )
    }

    if (loading) return <div className="p-10 text-center">Loading entry...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <DatePicker date={date} setDate={setDate} />
                    {lastSaved && <span className="text-sm text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</span>}
                </div>
                <Button onClick={handleSaveLocal} disabled={saving || !date}>
                    {saving ? 'Saving...' : 'Save Entry'}
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-6">
                        <div className="flex flex-col space-y-2">
                            <Label>Packages Processed</Label>
                            <Input 
                                type="number" 
                                value={packages} 
                                onChange={e => setPackages(Number(e.target.value))} 
                                className="max-w-xs"
                            />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            {renderTable("Full Time Sorters", "FullTime", fullTimeSorters)}
                            {renderTable("Part Time Sorters", "PartTime", partTimeSorters)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ResultsPanel result={calculatedLocal} />
        </div>
    )
}
