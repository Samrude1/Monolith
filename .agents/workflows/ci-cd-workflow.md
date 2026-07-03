# CI/CD & Deployment Workflow

When making changes that affect the build pipeline, GitHub Actions, or AWS deployment:

1. **Architect** (`/architect`):
   - Identify what part of the pipeline needs changing (Linting, Testing, Building, Deploying).
   - If AWS permissions are needed, define the IAM policies securely (Principle of Least Privilege).

2. **Develop**:
   - Modify the `.github/workflows/` YAML files or AWS CDK/Terraform scripts.
   - Ensure that secrets are properly injected from GitHub Secrets.
   - Do NOT hardcode credentials. Use OIDC integration for AWS if possible.

3. **Review** (`/review`):
   - Validate the YAML syntax or deployment script logic.
   - Output the review using a `walkthrough.md` Artifact.

4. **Imprint** (`/remember` save):
   - Save the state at the end of the session.
