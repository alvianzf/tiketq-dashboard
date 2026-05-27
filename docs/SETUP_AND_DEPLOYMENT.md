# Setup & Deployment

## Environment Variables
The application requires specific environment variables to function correctly, which define the endpoints to the backend APIs. Create a `.env` file based on `.env.example`.

## Build for Production
To build the application for a production environment, run:
```bash
npm run build
```
This leverages Vite to bundle the application into the `dist/` directory.

## Deployment
The compiled static assets in the `dist/` directory can be deployed to any static hosting provider, including Vercel, Netlify, or standard Nginx servers.
