# deeporigin-api_automation

DummyJSON Products — API Automation (Cypress + TypeScript)
API regression tests for the DummyJSON Products endpoints (and auth).
Stack: Cypress 13, TypeScript 5, Zod (runtime schema validation).

# What’s covered

Auth: POST /auth/login, GET /auth/me
Products: GET /products, GET /products/{id}, search, categories, category listing
Query params: limit, skip, select
Error case: 404 for invalid id
CRUD echoes: POST /products/add, PUT, PATCH, DELETE (DummyJSON echoes and does not persist)

# Prerequisites
Node.js 18+ (recommend LTS)
npm 9+ (comes with Node)
Internet access (public API)

# Getting started
# clone your repo
git clone git@github.com-carlos110889:carlosalmeida8908/deeporigin-api_automation.git
cd deeporigin-api_automation

# install dependencies
npm ci  # or: npm install

Run Cypress:

# interactive runner
npx cypress open     # then pick E2E → browser → run the spec

# headless
npx cypress run

