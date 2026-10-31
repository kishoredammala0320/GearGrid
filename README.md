# GearGrid ⚙️📦
A Hyper-Local Peer-to-Peer Campus Marketplace for Students

GearGrid is a secure, campus-exclusive platform designed for college students to rent or sell gear (electronics, books, lab equipment, etc.) to their peers. Built to function flawlessly behind restrictive campus firewalls, it features a direct P2P UPI payment model and a unique 4-digit OTP verification system to ensure safe physical hand-offs.

---

## ✨ Key Features

* **🎓 Campus-Exclusive Access: Authentication is strictly managed via Clerk, ensuring only verified students can access the marketplace.

* **🔐 Secure Physical Hand-off (Escrow Alternative): When a buyer reserves an item, they receive a secure 4-digit OTP. The transaction is only marked complete when the buyer physically meets the owner, inspects the item, and provides the OTP.

* **💸 Direct P2P UPI Payments: Zero-fee, direct peer-to-peer UPI payments. Buyers pay owners directly via their preferred UPI app during the physical meetup.

* **🛡️ Campus Wi-Fi Resilient: Built using Neon Serverless PostgreSQL with a custom HTTP/WebSocket driver adapter. It routes database traffic entirely over Port 443, completely bypassing the standard Port 5432 firewall blocks common on university Wi-Fi networks.

* **🔄 Smart State Management: Listings dynamically transition between ACTIVE, RESERVED, and RENTED_SOLD based on the real-time transaction status.

---

## 🛠 Tech Stack

* **Framework: Next.js (App Router)

* **Database: Neon Serverless PostgreSQL

* **ORM: Prisma (with @prisma/adapter-neon for Edge compatibility)

* **Authentication: Clerk

* **Styling: Tailwind CSS

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kishoredammala0320/geargrid.git
cd geargrid
```
### 2. Install dependencies

```bash
npm install
```
### 3. Set up environment variables
Create a .env file in the root directory and add your specific keys:
```bash
# Database (Neon Serverless Postgres)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_pub_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
```
### 4. Initialize the database
Generate the Prisma client (configured with driver adapters) and push the schema to your Neon database:
```bash
npx prisma generate
npx prisma db push
```
### 5. Run the development server
```bash
npm run dev
```
Open http://localhost:3000 in your browser to see the marketplace.
