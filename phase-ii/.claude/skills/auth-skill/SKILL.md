Skill name: Auth Skill

Purpose:
Enable secure implementation, analysis, and validation of user authentication
and authorization flows in software systems.

Scope:
This skill focuses exclusively on identity, credential handling, and access
control mechanisms. It does not handle UI, business logic, or unrelated system
features.

Capabilities:
- Design and implement signup flows
- Design and implement signin/login flows
- Secure password hashing and verification
- JWT token generation, signing, validation, and expiration handling
- Token refresh and logout handling where specified
- Integration with Better Auth (or equivalent authentication frameworks)
- Role-based or permission-based access control (when required)

Security principles enforced:
- Never store or transmit plain-text passwords
- Always hash passwords using industry-standard algorithms
- Enforce least-privilege access
- Ensure tokens are signed, verified, and time-bound
- Fail securely and explicitly
- Avoid insecure defaults and hardcoded secrets

Input handling:
- Accepts user credentials, tokens, and identity-related data
- Delegates strict input checking to Validation Skill
- Rejects invalid or insecure inputs deterministically

Constraints:
- Authentication logic only
- No UI or presentation concerns
- No business-domain logic
- No speculative or unnecessary features

Dependencies:
- Validation Skill (mandatory for all inputs)
- Secure configuration for secrets and keys

Output standards:
- Deterministic, auditable authentication behavior
- Clear success and failure states
- Security decisions traceable to best practices
- Minimal, readable, and maintainable logic

Success definition:
- Signup and signin flows are secure and correct
- Passwords are properly hashed and verified
- JWT tokens are correctly issued and validated
- Better Auth integration follows security best practices
- No authentication bypass or insecure handling exists
