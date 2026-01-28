'use client'
import { useState, useEffect, useMemo } from 'react'
import { RegionConfig, CASorter } from '@prisma/client'
import { getDailyEntry, saveCAEntry } from '@/app/actions/entry'
import { calculateCA } from '@/lib/calc'
import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ResultsPanel } from '@/components/results-panel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Plus } from 'lucide-react'

export function CAForm({ config, sorters }: { config: RegionConfig, sorters: CASorter[] }) {
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
        getDailyEntry('CA', date).then(entry => {
            if (entry) {
                setPackages(entry.packages)
                if (entry.caShifts && entry.caShifts.length > 0) {
                     setRows(entry.caShifts.map(s => ({ sorterId: s.sorterId.toString(), hours: s.hours })))
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
                hourlyWage: sorter?.hourlyWage || 0,
                role: sorter?.role
            }
        })
        return calculateCA(packages, shifts, config)
    }, [packages, rows, config, sorters])

    const handleAddRow = () => {
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
            
            await saveCAEntry(date, packages, shifts)
            setLastSaved(new Date())
            alert('Entry saved successfully')
        } catch (e) {
            console.error(e)
            alert('Error saving')
        }
        setSaving(false)
    }
    
    if (loading) return <div className="p-10 text-center">Loading entry...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <DatePicker date={date} setDate={setDate} />
                    {lastSaved && <span className="text-sm text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</span>}
                </div>
                <Button onClick={handleSave} disabled={saving || !date}>
                    {saving ? 'Saving...' : 'Save Entry'}
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4">
                        <div className="flex flex-col space-y-2">
                            <Label>Packages Processed</Label>
                            <Input 
                                type="number" 
                                value={packages} 
                                onChange={e => setPackages(Number(e.target.value))} 
                                className="max-w-xs"
                            />
                        </div>
                        
                        <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <Label>Sorters & Leaders</Label>
                                <Button size="sm" variant="outline" onClick={handleAddRow}><Plus className="w-4 h-4 mr-2"/> Add Row</Button>
                             </div>
                             <div className="rounded-md border">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="w-[100px]">Role</TableHead>
                                        <TableHead className="w-[100px]">Wage</TableHead>
                                        <TableHead className="w-[150px]">Hours</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row, i) => {
                                        const selectedSorter = sorters.find(s => s.id.toString() === row.sorterId)
                                        return (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Select value={row.sorterId} onValueChange={v => handleRowChange(i, 'sorterId', v)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Person" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {sorters.filter(s => s.active).map(s => (
                                                                <SelectItem key={s.id} value={s.id.toString()}>{s.name} ({s.role})</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>{selectedSorter?.role || '-'}</TableCell>
                                                <TableCell>${selectedSorter?.hourlyWage.toFixed(2) || '-'}</TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="number" 
                                                        min="0" max="24" step="0.5"
                                                        value={row.hours}
                                                        onChange={e => handleRowChange(i, 'hours', Number(e.target.value))}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRow(i)}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    {rows.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No rows added</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                             </Table>
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ResultsPanel result={calculated} />
        </div>
    )
}
