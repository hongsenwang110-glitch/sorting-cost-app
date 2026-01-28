-- CreateTable
CREATE TABLE "RegionConfig" (
    "region" TEXT NOT NULL,
    "normalHours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "otMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "markup" DOUBLE PRECISION NOT NULL DEFAULT 1.3,
    "ownHourly" DOUBLE PRECISION,
    "ywHourly" DOUBLE PRECISION,
    "ownMarkup" DOUBLE PRECISION,
    "ywMarkup" DOUBLE PRECISION,
    "sorterHourly" DOUBLE PRECISION,
    "leaderHourly" DOUBLE PRECISION,

    CONSTRAINT "RegionConfig_pkey" PRIMARY KEY ("region")
);

-- CreateTable
CREATE TABLE "TXSorter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyWage" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TXSorter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CASorter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyWage" DOUBLE PRECISION NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Sorter',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CASorter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NJSorter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyWage" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FullTime',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NJSorter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" SERIAL NOT NULL,
    "region" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "packages" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TXShift" (
    "id" SERIAL NOT NULL,
    "dailyEntryId" INTEGER NOT NULL,
    "sorterId" INTEGER NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "hourlyWage" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "TXShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CAShift" (
    "id" SERIAL NOT NULL,
    "dailyEntryId" INTEGER NOT NULL,
    "sorterId" INTEGER NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "hourlyWage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CAShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NJShift" (
    "id" SERIAL NOT NULL,
    "dailyEntryId" INTEGER NOT NULL,
    "sorterId" INTEGER NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "hourlyWage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "NJShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_region_date_key" ON "DailyEntry"("region", "date");

-- AddForeignKey
ALTER TABLE "TXShift" ADD CONSTRAINT "TXShift_dailyEntryId_fkey" FOREIGN KEY ("dailyEntryId") REFERENCES "DailyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TXShift" ADD CONSTRAINT "TXShift_sorterId_fkey" FOREIGN KEY ("sorterId") REFERENCES "TXSorter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CAShift" ADD CONSTRAINT "CAShift_dailyEntryId_fkey" FOREIGN KEY ("dailyEntryId") REFERENCES "DailyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CAShift" ADD CONSTRAINT "CAShift_sorterId_fkey" FOREIGN KEY ("sorterId") REFERENCES "CASorter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NJShift" ADD CONSTRAINT "NJShift_dailyEntryId_fkey" FOREIGN KEY ("dailyEntryId") REFERENCES "DailyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NJShift" ADD CONSTRAINT "NJShift_sorterId_fkey" FOREIGN KEY ("sorterId") REFERENCES "NJSorter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
