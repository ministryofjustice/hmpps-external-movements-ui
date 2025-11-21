# HMPPS External Movements UI

[![Ministry of Justice Repository Compliance Badge](https://github-community.service.justice.gov.uk/repository-standards/api/hmpps-external-movements-ui/badge?style=flat)](https://github-community.service.justice.gov.uk/repository-standards/hmpps-external-movements-ui)
[![Docker Repository on ghcr](https://img.shields.io/badge/ghcr.io-repository-2496ED.svg?logo=docker)](https://ghcr.io/ministryofjustice/hmpps-external-movements-ui)

A frontend application for HMPPS prison staff to manage and track external prisoner movements.

## Overview

This service allows prison staff to:
- Record and manage external prisoner movements
- Track prisoner movements in and out of prisons
- View movement history and audit logs

## Getting Started

### Installation

```bash
npm ci
```
### Configuration
Create a copy of the `.env.example` file:
```bash
cp .env.example .env
```

Update the environment variables in `.env` to match your environment.

### Running Locally
Using Docker compose:

```bash
docker compose pull
docker compose up
```

Or run the application directly:

```bash
npm run start:dev
```

The application will be available at http://localhost:3000

## Development

### Build

```bash
npm run build
```

### Run Tests

#### Unit Tests
`npm run test`

#### Integration Tests
For local running, start a wiremock instance by:

```bash
docker compose -f docker-compose-test.yml up
```

Then run the server in test mode by:
```bash
npm run start-feature:dev
npm run int-test
```

Or run tests with the Playwright UI:
`npm run int-test-ui`

By default, playwright will run in 8 parallel workers. This can be changed by setting the `PARALLEL_WORKERS` environment variable in your shell (ie, `~/.zshrc` or `~/.zprofile`).

### Code Quality
```bash
npm run lint

npm run lint-fix
```

### Syncing API Types With Swagger

Run `npm run swagger-external-movements` to pull the latest typedefs from the api backend.

## Deployment
This application is deployed to the Cloud Platform using Helm charts located in helm_deploy/. Environment configurations:
- Dev: [values-dev.yaml](helm_deploy/values-dev.yaml)
- Pre-production: [values-preprod.yaml](helm_deploy/values-preprod.yaml)
- Production: [values-prod.yaml](helm_deploy/values-prod.yaml)

## Project Structure
```
├── server/              # Server-side code
│   ├── routes/          # Route controllers and views
│   ├── services/        # Business logic
│   ├── data/            # Data access layer
│   ├── middleware/      # Express middleware
│   └── views/           # Nunjucks templates
├── assets/              # Frontend assets (JS, SCSS, images)
├── integration_tests/   # Playwright integration tests
├── esbuild/             # Build configuration
└── helm_deploy/         # Kubernetes deployment configs
```

## License
MIT License — see [LICENSE](LICENSE) for more details.

## Support
For issues or questions, contact the HMPPS Digital team.
