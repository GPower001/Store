# StockRoom Inventory

StockRoom is a multi-tenant inventory platform with sales, POS, branches, purchasing, reports, notifications, user roles, subscriptions, and Paystack checkout.

## Project Layout

- `Backend/`: Express, MongoDB, Socket.IO, authentication, subscriptions, and API routes.
- `Frontend/`: React and Vite application.

## Requirements

- Node.js 20 or newer
- MongoDB 6 or newer
- A Paystack account for subscription checkout
- SendGrid credentials for password reset email in production

## Local Setup

1. Install backend dependencies:

	```powershell
	cd Backend
	npm ci
	Copy-Item .env.example .env
	```

2. Fill in `Backend/.env` with a real MongoDB URI, long JWT secret, frontend URLs, and service credentials. Use test keys locally:

	```env
	MONGO_URI=mongodb://127.0.0.1:27017/stockroom
	PORT=5001
	JWT_SECRET=use-a-long-random-secret
	FRONTEND_URL_DEV=http://localhost:5173
	FRONTEND_URL_PROD=https://your-production-frontend.example
	NODE_ENV=development
	PAYSTACK_SECRET_KEY=sk_test_your_key
	SENDGRID_API_KEY=SG.your_key
	SENDGRID_FROM=no-reply@your-verified-domain.example
	```

3. Start the API:

	```powershell
	cd Backend
	npm run dev
	```

4. In a second terminal, install and start the frontend:

	```powershell
	cd Frontend
	npm ci
	npm run dev
	```

The frontend defaults to `http://localhost:5173`; the API defaults to `http://localhost:5001`.

## Validation Commands

Run these before opening a pull request:

```powershell
cd Backend
npm test

cd ..\Frontend
npm run lint
npm run build
```

The backend refuses to start in production when required secrets or service URLs are missing or still contain template placeholders.

## Production Checklist

- Set `NODE_ENV=production` and provide every production variable from `Backend/.env.example`.
- Use managed MongoDB with backups and restricted network access.
- Configure Paystack webhooks to `/api/subscription/webhook`.
- Configure `FRONTEND_URL_PROD` with the real frontend origin.
- Configure SendGrid with a verified sender domain.
- Serve `Frontend/dist` through the production deployment.
- Run backend tests and frontend lint/build in CI before deployment.
- Store secrets in the deployment provider, never in Git.

## API Documentation

When the backend is running, Swagger UI is available at `/api-docs`.

## Contributing

Create a focused branch from the release branch, keep unrelated work out of the change, run the validation commands above, and include tests for behavior changes.
