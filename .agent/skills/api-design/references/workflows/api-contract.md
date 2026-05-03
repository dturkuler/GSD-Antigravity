# API Contract Workflow

This workflow guides the AI through designing a robust, consumer-friendly API contract.

## Phase 1: Requirements Gathering
- Identify the primary consumers of the API (e.g., internal web app, mobile app, public developers).
- Determine the core data entities involved.
- List the required operations (CRUD + specific business logic actions).

## Phase 2: Resource Modeling
- Define the base resources.
- Establish URI patterns following RESTful conventions (e.g., `/users/{id}/orders`).
- Decide on naming conventions for paths, query parameters, and payload keys (e.g., `kebab-case` for URLs, `camelCase` for JSON keys).

## Phase 3: Endpoint Definition
For each required operation, explicitly define:
- **HTTP Method** (GET, POST, PUT, PATCH, DELETE)
- **Path** (including path variables)
- **Query Parameters** (e.g., filtering, sorting)
- **Required Headers** (e.g., `Content-Type`, `Authorization`, custom headers)

## Phase 4: Request/Response Schemas
- Define the exact JSON structure for request payloads.
- Define the exact JSON structure for successful response payloads.
- Specify data types (string, integer, boolean, array, object) and denote required vs. optional fields.
- Provide concrete JSON examples for both request and response.

## Phase 5: Error Handling
- Define a standardized error response shape (e.g., `{ "error": { "code": "...", "message": "...", "details": [] } }`).
- Map specific error conditions to appropriate HTTP status codes (e.g., 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity).
- Create a catalog of application-specific error codes if necessary.

## Phase 6: Authentication & Authorization
- Determine the authentication scheme (e.g., Bearer Token, Session Cookie, API Key).
- Document which scopes or roles are required to access specific endpoints.

## Phase 7: Versioning Strategy
- Decide how the API will handle backwards-incompatible changes.
- Choose a versioning method: URL-based (e.g., `/v1/users`), Header-based (e.g., `Accept-Version: v1`), or Query-based.

## Phase 8: Rate Limiting & Pagination
- If applicable, define rate limits (e.g., 100 requests per minute).
- Define the pagination scheme for list endpoints (Cursor-based vs. Offset-based) and standard query parameters (`limit`, `offset`, `cursor`).

## Phase 9: Specification Assembly
- Compile all defined elements into the structured specification document.
- Use `@references/templates/api-spec-template.md` as the baseline structure.

## Phase 10: Review Gate
- Present the completed `API-SPEC.md` to the user.
- Await explicit user approval before beginning any TDD or implementation phases based on this contract.
