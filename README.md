# ByteEvolvr Platform

A modular monorepo architecture for ByteEvolvr Enterprises, featuring a business website, an admin panel, and a unified backend.

## 🏗️ Project Structure

- **/apps**
  - `frontend`: Business website (React + Vite)
  - `admin`: Administration panel (React + Vite)
  - `shop`: E-commerce application (React + Vite)
- **/backend**
  - Node.js & Express API server
- **/packages**
  - `ui`: Shared design system and components
  - `api-client`: Shared API integration logic
  - `config`: Shared ESLint, Prettier, and TypeScript configs
- **/scripts**
  - Utility and deployment scripts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Single Command Execution (Development)

To start all services (frontend, admin, shop, backend) simultaneously:

```bash
npm install
npm run dev
```

### Individual Service Scripts

- `npm run dev:frontend` - Start business website
- `npm run dev:admin` - Start admin panel
- `npm run dev:backend` - Start API server

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, React Query
- **Backend**: Node.js, Express, Razorpay, Shiprocket
- **Monorepo**: npm workspaces, Concurrently
- **Icons**: Lucide React
- **SEO**: React Helmet Async

## 🔒 Security & Best Practices

- **CORS**: Configured with allowed origins.
- **Rate Limiting**: Implemented for API protection.
- **Input Sanitization**: Handled on both client and server.
- **SEO**: Open Graph and Twitter tags implemented.

## 📦 Deployment

### Docker (Recommended)

Build and run the entire stack using Docker Compose:

```bash
docker-compose up --build
```

### Platform Specifics

- **Vercel**: Deploy `apps/frontend` and `apps/admin` as separate Vercel projects from the same GitHub repository. See `docs/vercel-deployment.md`.
- **AWS/VPS**: Deploy using the provided `docker-compose.yml` or manual Node.js setup for the backend.

## 🎨 Design System

The project uses a **Deep Tech** dark aesthetic:

- **Primary**: #1A4FD6
- **Background**: #04080F
- **Fonts**: Manrope (Display), DM Sans (Body)
- **Shared UI**: Located in `/packages/ui`

---

Built with ❤️ by ByteEvolvr Team
