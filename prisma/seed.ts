import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Region Configs
  await prisma.regionConfig.upsert({
    where: { region: 'TX' },
    update: {},
    create: {
      region: 'TX',
      normalHours: 8,
      otMultiplier: 1.5,
      markup: 1.3,
    },
  })

  await prisma.regionConfig.upsert({
    where: { region: 'CA' },
    update: {},
    create: {
      region: 'CA',
      normalHours: 8,
      otMultiplier: 1.5,
      markup: 1.3,
      sorterHourly: 18,
      leaderHourly: 19,
    },
  })

  await prisma.regionConfig.upsert({
    where: { region: 'NJ' },
    update: {},
    create: {
      region: 'NJ',
      normalHours: 8,
      otMultiplier: 1.5,
      // NJ doesn't use a single markup, but specific ones. We store defaults anyway.
      markup: 1.3, 
      ownHourly: 17,
      ywHourly: 19.5,
      ownMarkup: 1.25,
      ywMarkup: 1.38,
    },
  })

  // TX Sorters
  const sorters = [
    { name: 'John Doe', hourlyWage: 15.0 },
    { name: 'Jane Smith', hourlyWage: 16.5 },
    { name: 'Bob Johnson', hourlyWage: 15.0 },
  ]

  for (const s of sorters) {
    const exists = await prisma.tXSorter.findFirst({ where: { name: s.name } })
    if (!exists) {
      await prisma.tXSorter.create({ data: s })
    }
  }

  console.log('Seeding completed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

