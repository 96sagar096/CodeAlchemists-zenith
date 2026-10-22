# CodeAlchemists Zenith

CodeAlchemists Zenith is a civic complaint management platform for reporting,
tracking, and resolving local infrastructure issues. Citizens can submit
complaints with descriptions, locations, coordinates, and optional photo
evidence. Officers can review incoming complaints, update their status, and
submit resolution evidence.

The application is organized as a React frontend and a Spring Boot backend.
The frontend also includes local mock complaint data so the user interface can
be explored when the backend is unavailable.

## Features

### Citizen experience

- Register and log in as a citizen
- Submit a complaint with:
  - Title and description
  - Category and location
  - GPS coordinates
  - Optional photo/proof
- View dashboard statistics and recent complaints
- Search and filter complaint history
- Open a complaint to view its details and status timeline
- Track statuses such as `Submitted`, `Assigned`, `In Progress`, and `Resolved`

### Officer experience

- Log in through the officer portal
- View the complaint queue and operational dashboard
- Search complaints by incident ID, department, or description
- Inspect complaint details, priority, category, location, and evidence
- Update complaint status
- Resolve complaints with resolution evidence

The interface includes AI triage information such as category, severity,
priority, department, and recommended operational resources. Gemini support is
configured in the backend for AI-assisted functionality.

## Tech stack

- **Frontend:** React 19, React Router, Vite, Tailwind CSS, Axios
- **Backend:** Spring Boot 4, Spring Web MVC, Spring Data JPA, Spring Security
- **Database:** MySQL
- **Authentication:** JWT
- **AI integration:** Google Gemini Java SDK
- **Validation and tooling:** Jakarta Bean Validation, Lombok, Oxlint

## Repository structure

```text
.
├── Backend/
│   ├── pom.xml
│   └── src/
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
└── ai_module/
```

The main frontend routes are:

| Route | Purpose |
| --- | --- |
| `/login` | Citizen login |
| `/register` | Citizen registration view |
| `/dashboard` | Citizen complaint dashboard |
| `/submit` | Submit a new complaint |
| `/history` | View complaint history |
| `/complaints/:id` | View a citizen complaint |
| `/officerLogin` | Officer login |
| `/officer` | Officer dashboard |
| `/officer/complaints` | Officer complaint queue |
| `/AdminComplaintDetails/:id` | Officer complaint details and actions |

## Prerequisites

- Java 21
- Node.js and npm
- MySQL 8 or a compatible MySQL server
- A Gemini API key if Gemini-backed functionality is enabled

## Configuration

### Backend

The backend reads its database and service configuration from
`Backend/src/main/resources/application.properties`.

Before starting the backend:

1. Create or provide a MySQL server.
2. Configure the database URL, username, and password for your local
   environment.
3. Set `GEMINI_API_KEY` in the environment if Gemini integration is required.
4. Use a private JWT secret and do not commit credentials to the repository.

The default backend port is `8080`. The configured database name is
`JharkhandComplaint_db`, and Hibernate is configured to update the schema
automatically during development.

### Frontend

The frontend reads the backend base URL from `VITE_API_URL`. Create
`frontend/.env.local` with a value appropriate for your local setup:

```dotenv
VITE_API_URL=http://localhost:8080
```

Do not commit `.env.local` or other files containing secrets.

## Running locally

Open two terminals from the repository root.

### 1. Start the backend

On Windows:

```powershell
cd Backend
.\mvnw.cmd spring-boot:run
```

On macOS/Linux:

```bash
cd Backend
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Vite will print the local development URL, normally
`http://localhost:5173`.

## Useful commands

Run these commands from `frontend/`:

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run lint      # Run Oxlint
npm run preview   # Preview the production build locally
```

Run these commands from `Backend/`:

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

Use `./mvnw` instead on macOS/Linux.

## Backend API surface

The frontend currently uses the following backend endpoints:

- `POST /api/auth/login` and `POST /api/auth/register` for citizen
  authentication
- `POST /api/admin/login` for officer authentication
- `POST /api/complaint/registerComplaint` to submit a complaint
- `GET /api/complaint/my` to list the signed-in citizen's complaints
- `GET /api/complaint/my/{id}` to view a citizen complaint
- `GET /api/adminInfo/complaints` to list complaints for officers
- `PATCH /api/complaint/{id}/status` to update complaint status
- `POST /api/complaint/{id}/resolve` to resolve a complaint and upload
  resolution evidence

Authentication tokens are stored by the frontend in browser local storage for
the current application flow.

## Development notes

- Complaint photos and resolution evidence are uploaded as multipart form data.
- The backend accepts uploads up to 5 MB per file and 6 MB per request.
- The frontend's `src/data/mockData.js` provides fallback complaint records for
  local UI development.
- Keep database credentials, JWT secrets, and Gemini keys outside source
  control.

## Team

Developed by **CodeAlchemists**.
