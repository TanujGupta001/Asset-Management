# Enterprise IT Asset Management System

A production-ready enterprise IT Asset Management (ITAM) system built with Next.js 15 App Router, TypeScript, TailwindCSS, Shadcn UI, and Supabase (PostgreSQL).

## Features

- **Dashboard** — Real-time stats, charts, recent activities, warranty alerts, repair tracking
- **Asset Management** — Full CRUD for IT assets with serial numbers, warranty, licenses, and assignment tracking
- **Asset Views** — Filter by status (Active, WFH, Repair, Idle, Disposed) or by department
- **Movement Tracking** — In/Out log with automatic asset status updates
- **Transfer Management** — Asset transfers between departments with automatic updates
- **Software Licenses** — Independent license register with masked product keys
- **Warranty Tracking** — Sorted by expiry with color-coded status badges
- **Extra Inventory** — Inventory items, department headcount, spare devices
- **Telephones & Printers** — Separate registers with status tracking
- **Summary Report** — Printable A4 report with charts and CSV export
- **Excel Import/Export** — Full workbook support with 10 sheets via SheetJS
- **Authentication** — Single admin account with middleware-protected routes
- **Dark/Light Mode** — Corporate navy/crimson theme
- **Responsive** — Works on mobile, tablet, and desktop

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn UI
- **Database**: PostgreSQL (Supabase)
- **ORM**: Supabase JS Client
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table
- **Charts**: Recharts
- **Excel**: SheetJS (xlsx)
- **Icons**: Lucide React
- **Dates**: date-fns
- **State**: Zustand (UI state)
- **Toasts**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd it-asset-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Default Login

- **Username**: `admin`
- **Password**: `admin123`

## Database Schema

The system uses 12 normalized tables:

| Table | Description |
|-------|-------------|
| departments | Company departments |
| employees | Staff records |
| vendors | Suppliers |
| assets | IT assets with full details |
| movements | In/out movement log |
| transfers | Inter-department transfers |
| software_licenses | Software license register |
| inventory_items | Extra inventory items |
| telephones | Telephone register |
| printers | Printer register |
| audit_logs | Audit trail |
| admin_users | Admin authentication |

All tables include `id`, `created_at`, and `updated_at` fields with automatic timestamp triggers.

## Project Structure

```
app/
  (dashboard)/        # Protected pages with shared layout
    dashboard/
    assets/
    tracking/
    reports/
    licenses/
    warranty/
    inventory/
    telephones-printers/
    import-export/
    settings/
  api/                # REST API routes
  login/              # Authentication page
components/
  ui/                 # Shadcn UI components
  shared/             # Reusable components (StatCard, DataTable, etc.)
  layout/             # Sidebar, Navbar
  modals/             # Add Asset, Add Employee, Movement, Transfer, License
  tables/             # Client-side table components
  charts/             # Chart components
  reports/            # Report components
lib/                  # Utilities, Supabase client, auth, services
hooks/                # Custom React hooks
actions/              # Server actions
schemas/              # Zod validation schemas
store/                # Zustand stores
types/                # TypeScript type definitions
```

## API Endpoints

- `GET/POST /api/assets`
- `GET/POST /api/employees`
- `GET/POST /api/licenses`
- `GET/POST /api/transfers`
- `GET/POST /api/movements`
- `GET/POST /api/inventory`
- `GET/POST /api/telephones`
- `GET/POST /api/printers`

## Excel Import/Export

### Export
Generates a 10-sheet workbook:
- Assets, Status, Departments, Movements, Transfers, Licenses, Inventory, Telephone, Printer, Warranty

### Import
- **Assets**: Match by Asset Tag (update existing, insert new)
- **Licenses**: Match by Product Key
- **Movements**: Appended to log
- **Transfers**: Appended to log
- **Inventory/Telephones/Printers**: Inserted as new records

## Docker Support

```bash
docker build -t it-asset-manager .
docker run -p 3000:3000 it-asset-manager
```

## License

This project is licensed for enterprise internal use.
