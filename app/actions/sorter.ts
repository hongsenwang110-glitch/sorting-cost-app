'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// TX Sorters
export async function getTXSorters() {
  return await prisma.tXSorter.findMany({ orderBy: { name: 'asc' } })
}

export async function createTXSorter(data: { name: string, hourlyWage: number }) {
  await prisma.tXSorter.create({ data })
  revalidatePath('/admin/sorters')
}

export async function updateTXSorter(id: number, data: { name?: string, hourlyWage?: number, active?: boolean }) {
  await prisma.tXSorter.update({ where: { id }, data })
  revalidatePath('/admin/sorters')
}

export async function deleteTXSorter(id: number) {
  await prisma.tXSorter.delete({ where: { id } })
  revalidatePath('/admin/sorters')
}

// CA Sorters (Restored)
export async function getCASorters() {
    return await prisma.cASorter.findMany({ orderBy: { name: 'asc' } })
}

export async function createCASorter(data: { name: string, hourlyWage: number, role: string }) {
    await prisma.cASorter.create({ data })
    revalidatePath('/admin/sorters')
}

export async function updateCASorter(id: number, data: { name?: string, hourlyWage?: number, role?: string, active?: boolean }) {
    await prisma.cASorter.update({ where: { id }, data })
    revalidatePath('/admin/sorters')
}

export async function deleteCASorter(id: number) {
    await prisma.cASorter.delete({ where: { id } })
    revalidatePath('/admin/sorters')
}

// NJ Sorters
export async function getNJSorters() {
    return await prisma.nJSorter.findMany({ orderBy: { name: 'asc' } })
}

export async function createNJSorter(data: { name: string, hourlyWage: number, type: string }) {
    await prisma.nJSorter.create({ data })
    revalidatePath('/admin/sorters')
}

export async function updateNJSorter(id: number, data: { name?: string, hourlyWage?: number, type?: string, active?: boolean }) {
    await prisma.nJSorter.update({ where: { id }, data })
    revalidatePath('/admin/sorters')
}

export async function deleteNJSorter(id: number) {
    await prisma.nJSorter.delete({ where: { id } })
    revalidatePath('/admin/sorters')
}
