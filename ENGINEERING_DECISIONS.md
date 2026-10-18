# Engineering Decisions — OpsRadar

## 1. Project Overview

OpsRadar is a full-stack incident management application designed to help teams track incidents, monitor their status and severity, and organize incident response activities.

The application follows a client-server architecture. The frontend communicates with a backend API, and the backend uses a PostgreSQL database to persist application data.

## 2. Technology Choices

### Frontend: React and Vite

React was selected to build a component-based user interface. It allows the application to organize its interface into reusable components and manage interactive views.

Vite was selected as the frontend development and build tool because it provides fast development startup and an optimized production build.

### Backend: Node.js and Express

Node.js provides the JavaScript runtime for the backend. Express handles HTTP requests, API routes, middleware, and responses.

A REST API separates frontend presentation from backend business logic and makes the backend independently accessible.

### Database: PostgreSQL

PostgreSQL was selected as the relational database because incident management involves structured records and relationships between users, teams, incidents, comments, and activity records.

### ORM: Prisma

Prisma provides a schema-based way to define database models and query PostgreSQL from the backend. Database migrations help maintain and apply changes to the database schema in a controlled manner.

### Authentication and Validation

JSON Web Tokens (JWT) are used for token-based authentication. Passwords are hashed with bcryptjs rather than stored as plain text.

Zod is used to validate request data so that invalid input can be rejected before it is processed.

CORS is configured to control which frontend origins can access the API from a browser.

## 3. Architecture

The application has three main layers:

1. **Frontend:** React interface that displays application data and accepts user input.
2. **Backend API:** Express routes and application logic that handle requests, validation, and authentication.
3. **Database:** PostgreSQL persistence managed through Prisma.

The frontend sends HTTP requests to the backend. The backend processes requests and interacts with the database when required.

Keeping these layers separate makes the application easier to maintain, test, and deploy independently.

## 4. Data and Incident Management

The Prisma data model includes users, teams, team memberships, incidents, activities, and comments.

Incident severity is represented using defined values: CRITICAL, HIGH, MEDIUM, and LOW.

Incident status is represented using defined values: OPEN, INVESTIGATING, MITIGATED, RESOLVED, and CLOSED.

Using defined values helps maintain consistency in the data stored and processed by the application.

## 5. API Design

The backend exposes REST endpoints for authentication and incident operations.

Incident endpoints include:

- `GET /api/incidents` — retrieve incidents.
- `POST /api/incidents` — create an incident.
- `GET /api/incidents/:id` — retrieve a specific incident.
- `PATCH /api/incidents/:id` — update an incident.

Authentication endpoints include registration, login, and retrieval of the authenticated user's information.

HTTP methods are used according to the intended operation. Request validation and appropriate error responses help make API behaviour more predictable.

## 6. Deployment Decisions

The backend is deployed on Render and uses a hosted PostgreSQL database. The frontend is deployed separately.

Environment variables are used for configuration such as the database connection, JWT secret, and allowed frontend origin. Secret values are not intended to be committed to the public repository.

The backend listens on the host and port configured by the deployment environment. Database migrations are applied during deployment using Prisma.

Separating frontend and backend deployment allows each service to be built and updated independently.

## 7. Security Considerations

The following measures are used or configured in the application:

- Password hashing using bcryptjs.
- JWT-based authentication.
- Request validation using Zod.
- Environment variables for sensitive configuration.
- CORS configuration for the frontend origin.
- Database schema migrations managed through Prisma.

These measures provide a baseline for application security. They do not replace a complete security audit or production hardening.

## 8. Testing Approach

Automated tests are important for verifying application behaviour and preventing regressions.

The backend project includes a test command using Vitest. Supertest is available for testing HTTP endpoints.

Important behaviours to test include:

- Successful and unsuccessful authentication.
- Request validation and error handling.
- Incident creation and retrieval.
- Incident updates.
- Handling of invalid or missing incident identifiers.

The existence of a test command does not by itself establish that every behaviour above has been tested. The test suite should be executed and its results reviewed before submission.

## 9. Known Limitations

- The application is a project implementation and has not been independently security-audited for production use.
- The free hosting instance may become inactive and take additional time to respond to the first request after inactivity.
- The free hosted database has a limited service lifetime and may require migration or a plan change to maintain long-term availability.
- Automated test coverage must be assessed against the implemented features; not every possible failure scenario is necessarily covered.
- The application may require additional monitoring, logging, backup, recovery, and operational controls before being used for critical production incident response.

## 10. Future Improvements

Potential improvements include:

- Expand automated tests for authentication, authorization, and incident workflows.
- Add stronger observability through structured logs and application metrics.
- Improve database backup and recovery procedures.
- Review access control for sensitive incident operations.
- Add pagination and filtering for large incident lists.
- Introduce CI checks for tests, linting, and production builds.

## Conclusion

OpsRadar uses a separated React frontend, Express backend, and PostgreSQL data layer. Prisma provides database access and migrations, while JWT, bcryptjs, and Zod support authentication and input validation.

The architecture prioritizes separation of responsibilities, maintainability, and straightforward deployment. Further testing, security review, and operational improvements are recommended before production use.