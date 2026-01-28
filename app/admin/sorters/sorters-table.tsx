'use client'
import { useState } from 'react'
import { TXSorter, CASorter, NJSorter } from '@prisma/client'
import { 
    createTXSorter, updateTXSorter, deleteTXSorter,
    createCASorter, updateCASorter, deleteCASorter,
    createNJSorter, updateNJSorter, deleteNJSorter 
} from '@/app/actions/sorter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Trash2 } from 'lucide-react'

// Generic Sorter type union
type Sorter = TXSorter | CASorter | NJSorter

export function SortersTable({ region, data }: { region: 'TX' | 'CA' | 'NJ', data: Sorter[] }) {
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Sorter | null>(null)
    const [formData, setFormData] = useState({ name: '', hourlyWage: 15, role: 'Sorter', type: 'FullTime' })

    const handleSave = async () => {
        if (region === 'TX') {
            if (editing) await updateTXSorter(editing.id, { name: formData.name, hourlyWage: formData.hourlyWage })
            else await createTXSorter({ name: formData.name, hourlyWage: formData.hourlyWage })
        } else if (region === 'CA') {
             if (editing) await updateCASorter(editing.id, { name: formData.name, hourlyWage: formData.hourlyWage, role: formData.role })
            else await createCASorter({ name: formData.name, hourlyWage: formData.hourlyWage, role: formData.role })
        } else if (region === 'NJ') {
            if (editing) await updateNJSorter(editing.id, { name: formData.name, hourlyWage: formData.hourlyWage, type: formData.type })
            else await createNJSorter({ name: formData.name, hourlyWage: formData.hourlyWage, type: formData.type })
        }
        
        setOpen(false)
        setEditing(null)
        setFormData({ name: '', hourlyWage: 15, role: 'Sorter', type: 'FullTime' })
    }

    const startEdit = (sorter: Sorter) => {
        setEditing(sorter)
        setFormData({ 
            name: sorter.name, 
            hourlyWage: sorter.hourlyWage,
            role: 'role' in sorter ? (sorter as CASorter).role : 'Sorter',
            type: 'type' in sorter ? (sorter as NJSorter).type : 'FullTime'
        })
        setOpen(true)
    }

    const startCreate = () => {
        setEditing(null)
        setFormData({ name: '', hourlyWage: 15, role: 'Sorter', type: 'FullTime' })
        setOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return
        if (region === 'TX') await deleteTXSorter(id)
        if (region === 'CA') await deleteCASorter(id)
        if (region === 'NJ') await deleteNJSorter(id)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{region} List</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={startCreate}>Add Sorter</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editing ? 'Edit Sorter' : 'Add Sorter'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Hourly Wage</Label>
                                <Input type="number" step="0.5" value={formData.hourlyWage} onChange={e => setFormData({...formData, hourlyWage: Number(e.target.value)})} />
                            </div>
                            {region === 'CA' && (
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sorter">Sorter</SelectItem>
                                            <SelectItem value="Leader">Leader</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {region === 'NJ' && (
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FullTime">Full Time</SelectItem>
                                            <SelectItem value="PartTime">Part Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <Button onClick={handleSave} className="w-full">Save</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Hourly Wage</TableHead>
                            {region === 'CA' && <TableHead>Role</TableHead>}
                            {region === 'NJ' && <TableHead>Type</TableHead>}
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(sorter => (
                            <TableRow key={sorter.id}>
                                <TableCell>{sorter.name}</TableCell>
                                <TableCell>${sorter.hourlyWage.toFixed(2)}</TableCell>
                                {region === 'CA' && <TableCell>{(sorter as CASorter).role}</TableCell>}
                                {region === 'NJ' && <TableCell>{(sorter as NJSorter).type === 'PartTime' ? 'Part Time' : 'Full Time'}</TableCell>}
                                <TableCell>{sorter.active ? 'Active' : 'Inactive'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="icon" variant="ghost" onClick={() => startEdit(sorter)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(sorter.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">No sorters found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
