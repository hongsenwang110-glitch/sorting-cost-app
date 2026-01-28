'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

function toUTC(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export async function getRegionConfig(region: string) {
  return await prisma.regionConfig.findUniqueOrThrow({ where: { region } })
}

export async function getDailyEntry(region: string, date: Date) {
  const utcDate = toUTC(date)
  
  return await prisma.dailyEntry.findUnique({
    where: {
      region_date: {
        region,
        date: utcDate
      }
    },
    include: {
      txShifts: { include: { sorter: true } },
      caShifts: { include: { sorter: true } }, // CA Individual Shifts restored
      njShifts: { include: { sorter: true } }
    }
  })
}

export async function saveTXEntry(
  date: Date,
  packages: number,
  shifts: { sorterId: number; hours: number }[]
) {
  const region = 'TX'
  const utcDate = toUTC(date)

  const res = await prisma.$transaction(async (tx) => {
    const entry = await tx.dailyEntry.upsert({
      where: { region_date: { region, date: utcDate } },
      create: { region, date: utcDate, packages },
      update: { packages }
    })

    await tx.tXShift.deleteMany({ where: { dailyEntryId: entry.id } })
    
    if (shifts.length > 0) {
      const sorterIds = shifts.map(s => s.sorterId)
      const sorters = await tx.tXSorter.findMany({ where: { id: { in: sorterIds } } })
      
      const shiftData = shifts.map(s => {
        const sorter = sorters.find(so => so.id === s.sorterId)
        return {
          dailyEntryId: entry.id,
          sorterId: s.sorterId,
          hours: s.hours,
          hourlyWage: sorter?.hourlyWage || 0
        }
      })

      await tx.tXShift.createMany({ data: shiftData })
    }
    
    return entry
  })
  
  revalidatePath('/data-entry')
  return res
}

// CA Saved as Individual Shifts (Restored)
export async function saveCAEntry(
  date: Date,
  packages: number,
  shifts: { sorterId: number; hours: number }[]
) {
  const region = 'CA'
  const utcDate = toUTC(date)

  const res = await prisma.$transaction(async (tx) => {
    const entry = await tx.dailyEntry.upsert({
      where: { region_date: { region, date: utcDate } },
      create: { region, date: utcDate, packages },
      update: { packages }
    })

    await tx.cAShift.deleteMany({ where: { dailyEntryId: entry.id } })
    
    if (shifts.length > 0) {
      const sorterIds = shifts.map(s => s.sorterId)
      const sorters = await tx.cASorter.findMany({ where: { id: { in: sorterIds } } })
      
      const shiftData = shifts.map(s => {
        const sorter = sorters.find(so => so.id === s.sorterId)
        return {
            dailyEntryId: entry.id,
            sorterId: s.sorterId,
            hours: s.hours,
            hourlyWage: sorter?.hourlyWage || 0
        }
      })

      await tx.cAShift.createMany({ data: shiftData })
    }
    
    return entry
  })
  
  revalidatePath('/data-entry')
  return res
}

export async function saveNJEntry(
  date: Date,
  packages: number,
  shifts: { sorterId: number; hours: number }[]
) {
  const region = 'NJ'
  const utcDate = toUTC(date)

  const res = await prisma.$transaction(async (tx) => {
    const entry = await tx.dailyEntry.upsert({
      where: { region_date: { region, date: utcDate } },
      create: { region, date: utcDate, packages },
      update: { packages }
    })

    await tx.nJShift.deleteMany({ where: { dailyEntryId: entry.id } })
    
    if (shifts.length > 0) {
        const sorterIds = shifts.map(s => s.sorterId)
        const sorters = await tx.nJSorter.findMany({ where: { id: { in: sorterIds } } })
        
        const shiftData = shifts.map(s => {
          const sorter = sorters.find(so => so.id === s.sorterId)
          return {
              dailyEntryId: entry.id,
              sorterId: s.sorterId,
              hours: s.hours,
              hourlyWage: sorter?.hourlyWage || 0
          }
        })

        await tx.nJShift.createMany({ data: shiftData })
    }
    
    return entry
  })
  
  revalidatePath('/data-entry')
  return res
}

export async function getAnalyticsData(startDate: Date, endDate: Date, regions: string[]) {
  const start = toUTC(startDate)
  const end = toUTC(endDate)

  const entries = await prisma.dailyEntry.findMany({
    where: {
      region: { in: regions },
      date: { gte: start, lte: end }
    },
    include: {
      txShifts: { include: { sorter: true } },
      caShifts: { include: { sorter: true } }, // Updated to include caShifts relation
      njShifts: { include: { sorter: true } }
    },
    orderBy: { date: 'asc' }
  })
  
  const configs = await prisma.regionConfig.findMany({ where: { region: { in: regions } } })
  
  return { entries, configs }
}
