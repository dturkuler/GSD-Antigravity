# OWASP Top 10 Checklist (2021)

Use this checklist during Phase 3 of the Security Audit Workflow to systematically identify common vulnerabilities.

## A01:2021 - Broken Access Control
- [ ] Verify that authorization checks are performed on the server-side, not just in the UI.
- [ ] Ensure users cannot access other users' data by manipulating identifiers (IDOR - Insecure Direct Object Reference).
- [ ] Check that privileged actions require administrative roles.
- [ ] Ensure default deny patterns are applied (access denied unless explicitly granted).

## A02:2021 - Cryptographic Failures
- [ ] Verify sensitive data (passwords, credit cards, healthcare info) is encrypted at rest and in transit.
- [ ] Ensure strong, up-to-date cryptographic algorithms and keys are used (e.g., AES-256, RSA-2048, Argon2).
- [ ] Check that passwords are properly hashed with salt, not stored in plaintext or using weak hashes (e.g., MD5, SHA-1).

## A03:2021 - Injection
- [ ] Check for SQL/NoSQL injection by verifying the use of parameterized queries or ORMs.
- [ ] Look for command injection where user input is passed directly to system shells.
- [ ] Check for LDAP, XML (XXE), or other forms of injection.
- [ ] Ensure all user input is validated, sanitized, or strictly type-checked.

## A04:2021 - Insecure Design
- [ ] Review the architecture for fundamental security flaws or lack of defense-in-depth.
- [ ] Check if business logic can be bypassed or abused (e.g., skipping checkout steps, manipulating prices).
- [ ] Verify that secure defaults are used across the application.

## A05:2021 - Security Misconfiguration
- [ ] Look for unnecessary features, enabled debugging/development modes, or default accounts in production.
- [ ] Check for missing HTTP security headers (e.g., CSP, HSTS, X-Content-Type-Options).
- [ ] Ensure detailed error messages or stack traces are not exposed to users.
- [ ] Verify that CORS policies are restrictive, not using `*` for sensitive endpoints.

## A06:2021 - Vulnerable and Outdated Components
- [ ] Identify dependencies, frameworks, and OS libraries that are out of date or no longer supported.
- [ ] Check if components have known CVEs (Common Vulnerabilities and Exposures).

## A07:2021 - Identification and Authentication Failures
- [ ] Verify that applications protect against automated credential stuffing or brute-force attacks (rate limiting).
- [ ] Ensure sessions are securely managed, have expiration times, and are invalidated on logout.
- [ ] Check if multi-factor authentication (MFA) is implemented where appropriate.

## A08:2021 - Software and Data Integrity Failures
- [ ] Verify that the application does not load unverified plugins, libraries, or modules from untrusted sources.
- [ ] Ensure CI/CD pipelines have integrity checks and access controls.
- [ ] Look for insecure deserialization vulnerabilities where untrusted data is deserialized into objects.

## A09:2021 - Security Logging and Monitoring Failures
- [ ] Check that security-critical events (logins, access failures, high-value transactions) are logged.
- [ ] Ensure logs do not contain sensitive data (e.g., plaintext passwords, full credit card numbers).
- [ ] Verify that logs are generated in a format suitable for centralized monitoring.

## A10:2021 - Server-Side Request Forgery (SSRF)
- [ ] Check if the application fetches remote resources based on user-supplied URLs without validation.
- [ ] Ensure the server cannot be forced to make requests to internal/private networks or cloud metadata APIs (e.g., AWS IMDS).
