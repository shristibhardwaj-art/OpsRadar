# OpsRadar — Incident Command Center

OpsRadar is a full-stack incident management dashboard designed to help engineering teams track incidents, manage incident status, and coordinate responses through a centralized interface.

## Features

- **User Authentication:** Register and log in securely using password hashing and JWT authentication.
- **Incident Management:** Create, view, and update incidents.
- **Severity Tracking:** Classify incidents as Critical, High, Medium, or Low.
- **Status Management:** Track incidents through Open, Investigating, Mitigated, Resolved, and Closed.
- **Activity History:** Maintain a record of incident changes.
- **Team-Based Access:** Associate incidents with teams and apply role-based access controls.
- **Comments:** Support discussion associated with incident details.
- **Optimistic Concurrency:** Use version checks to help prevent conflicting updates.
- **Dashboard:** View incident information and summary statistics in one place.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- JSON Web Tokens (JWT)
- bcryptjs
- Zod
- CORS

### Database
- PostgreSQL
- Prisma ORM 6

## Project Structure

```text
OpsRadar/
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   ├── prisma.config.ts
│   └── package.json
└── .gitignore
```

## Prerequisites

Before running the application, install:

- Node.js
- npm
- PostgreSQL
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/shristibhardwaj-art/OpsRadar.git
cd OpsRadar
```

### 2. Set Up the Backend

Open a terminal and run these commands one at a time:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder and configure your local PostgreSQL connection and JWT secret:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_long_random_secret"
CLIENT_URL="http://localhost:5173"
PORT=8080
```

Replace the example values with your own configuration. Never commit your `.env` file or publish your secrets.

Generate the Prisma client:

```bash
npx prisma generate
```

Apply the database migrations:

```bash
npx prisma migrate deploy
```

Start the backend:

```bash
npm run dev
```

The backend should run at `http://localhost:8080`.

### 3. Set Up the Frontend

Open a second terminal in the project root and run:

```bash
cd client
npm install
```

If the frontend supports the `VITE_API_URL` environment variable, create a `.env.local` file inside `client`:

```env
VITE_API_URL=http://127.0.0.1:8080/api
```

Start the frontend:

```bash
npm run dev
```

Open the URL displayed in the terminal. The default Vite address is usually `http://localhost:5173`.

## API Endpoints

The backend API uses the `/api` prefix.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Retrieve the current user's details |
| GET | `/api/incidents` | List accessible incidents |
| POST | `/api/incidents` | Create an incident |
| GET | `/api/incidents/:id` | Retrieve incident details |
| PATCH | `/api/incidents/:id` | Update an incident |

Authentication and authorization requirements apply to protected endpoints.

## Incident Severity

- **Critical:** An incident requiring immediate attention.
- **High:** A significant issue requiring prompt investigation.
- **Medium:** An issue requiring timely resolution.
- **Low:** A minor issue with comparatively low impact.

## Incident Status

- **Open:** The incident has been reported.
- **Investigating:** The incident is being investigated.
- **Mitigated:** The immediate impact has been reduced or controlled.
- **Resolved:** The incident has been resolved.
- **Closed:** The incident lifecycle is complete.

## Database Models

The Prisma schema includes:

- **User:** Stores user account information and roles.
- **Team:** Represents an engineering team.
- **TeamMember:** Connects users with teams.
- **Incident:** Stores incident information, severity, status, and version.
- **Activity:** Records incident-related changes.
- **Comment:** Stores comments associated with incidents.

Supported user roles include `ADMIN`, `RESPONDER`, and `VIEWER`.

## Available Scripts

### Backend

Run these commands from the `server` directory:

```bash
npm run dev
npm start
npm test
npm run test:watch
```

### Frontend

Run these commands from the `client` directory:

```bash
npm run dev
npm run build
npm run preview
```

## Security Considerations

- Use strong, unique secrets for authentication.
- Keep database credentials in environment variables.
- Never expose backend secrets in frontend code.
- Use HTTPS in production.
- Validate input and enforce authorization on the server.
- Review database permissions and authentication behavior before production use.

## Future Enhancements

- Real-time incident updates.
- Email and messaging notifications.
- Advanced incident analytics.
- Incident assignment and escalation workflows.
- Improved filtering, searching, and reporting.
- Automated testing and continuous integration.

## License

No open-source license has been specified for this project yet.
