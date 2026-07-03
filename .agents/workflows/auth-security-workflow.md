# Authentication & Security Workflow

When modifying authentication logic or adding protected resources:

1. **Architect** (`/architect`):
   - Identify which roles/permissions are required to access the resource.
   - Determine if it's Server-Side protection (Middleware/API) or Client-Side protection (UI hiding).

2. **Develop**:
   - Always enforce Server-Side protection first using Auth.js.
   - Use `getServerSession` tai `auth()` in Next.js Server Components and API Routes.
   - Never expose sensitive data (passwords, tokens) to the client.
   - Validate that users can only access their own data (Tenant isolation).

3. **Review & Imprint** (`/review`, `/remember` save):
   - Double-check for IDOR (Insecure Direct Object Reference) vulnerabilities.
   - Output security findings to a Walkthrough artifact.
