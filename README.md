# Simple HTTP Server

Simple HTTP server with no external dependencies.

## Features
- **Static File Serving:** Automatically serves files from the `public` directory.
- **Route Handling:** Includes a route for checking server health.
- **Logging:** Basic logging for both successful operations and errors.

## Prerequisites
- [Node.js](https://nodejs.org/en/) installed on your system.

## Setup and Installation
No external dependencies are required. Except for Development:

* Playwright Tests
* ESLint
* Prettier

## Usage

```
npm run test        # Run Playwright tests
npm run lint:watch  # Run ESLint in watch mode
npm run test:watch  # Run Playwright tests in watch mode
npm run start       # Start the server
```

## License
MIT