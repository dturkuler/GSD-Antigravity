# Security Audit Workflow

This workflow guides the AI through a structured security review of the codebase.

## Phase 1: Scope Definition
- Identify the specific files, modules, or directories to be audited.
- Note the technology stack in use (e.g., Node.js, Express, React, etc.).
- Define the threat model (e.g., public-facing API, internal admin dashboard).

## Phase 2: Secrets Scan
- Check for hardcoded credentials, API keys, access tokens, passwords, and database connection strings.
- Look in source code, configuration files, environment variable templates, and `.json`/`.yml` files.

## Phase 3: OWASP Top 10 Scan
- Conduct a systematic check against each category in the OWASP Top 10 checklist.
- Refer to `@references/checklists/owasp-top-10.md` for specific vulnerability details.

## Phase 4: Dependency Audit
- Check `package.json` or equivalent dependency files for known vulnerable libraries.
- If applicable, execute `npm audit` or similar tools and analyze the output.

## Phase 5: Configuration Review
- Review CORS (Cross-Origin Resource Sharing) policies.
- Check CSP (Content Security Policy) headers.
- Verify TLS/SSL settings and HTTP security headers (e.g., Strict-Transport-Security, X-Frame-Options).
- Ensure secure cookie flags (Secure, HttpOnly, SameSite) are used.

## Phase 6: Input Validation
- Look for areas where user input is processed without validation or sanitization.
- Check for potential SQL/NoSQL injection, Cross-Site Scripting (XSS), Command Injection, and Path Traversal vulnerabilities.

## Phase 7: Authentication & Authorization
- Review session management and token handling (e.g., JWT signing algorithms, expiration).
- Verify that proper authorization checks are in place before accessing sensitive resources.
- Look for potential privilege escalation vectors.

## Phase 8: Findings Assembly
- Compile all discovered vulnerabilities and risks into the `SECURITY-REVIEW.md` report.
- Assign a severity rating (CRITICAL, HIGH, MEDIUM, LOW, INFO) to each finding.

## Phase 9: Remediation Plan
- For each finding in the report, provide actionable, concrete steps to fix the issue.
- Include code examples demonstrating the secure implementation where relevant.
