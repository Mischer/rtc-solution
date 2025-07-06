RTC-test — Solution

This is the solution for the Sportradar RTC-test, implemented in TypeScript + Express, following TDD principles with over 80% test coverage.
It polls the simulation API every second, parses data, maintains state, logs changes, and exposes a REST endpoint returning active events.

## How to run

Make sure you have Docker and Docker Compose installed.
Run from the project root:

`docker compose up --build`

This starts two services:
•	Simulation API: http://localhost:3000
•	Application: http://localhost:3001/client/state

You can test the endpoint, for example:

`curl http://localhost:3001/client/state`

## How to Run Tests

1. Install dependencies:

`npm install`

2. Run tests:

`npm run test`

3. Run with coverage:

`npm run test --coverage`

Solution Highlights
• TypeScript + Express
• TDD with >80% test coverage
• Logs status and score changes
• REMOVED events are marked internally but excluded from the response
• Clean modular structure (SRP, testable, Docker‑ready)

Delivered by Mikhail Kultyiasau, 2025‑07‑06