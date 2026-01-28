# Dispatch Labor Cost App

Internal web app for tracking daily sorting labor data and calculating cost metrics for TX, CA, and NJ regions.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Run the migration to create the SQLite database (`dev.db`):
   ```bash
   npx prisma migrate dev --name init
   ```
   
   Seed the database with initial configuration and TX sorters:
   ```bash
   npx prisma db seed
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Data Entry
- **TX**: Individual sorter tracking. Select sorters, input hours. Validates hours (0-24).
- **CA**: Aggregated input for Sorters (count/hours) and Leaders.
- **NJ**: Aggregated input for Own Labor vs Agency (YW) Labor.

### Calculations
- Automatic OT calculation based on region rules (e.g. >8h, multipliers).
- Weighted average costs for CA/NJ based on thresholds.
- Cost Per Box (Loaded Cost / Packages).
- Efficiency (Packages / Total Hours).

### Analytics
- Date range filtering.
- Multi-region comparison.
- Charts for Daily Loaded Cost, Cost Per Box, Efficiency.
- Detailed data table.

### Admin
- Manage TX Sorter list (Add/Edit/Delete active sorters).
