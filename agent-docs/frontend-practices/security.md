# 🔐 Security

In Rootstock, local mode can model authentication and authorization for
experience work, but it is never the trust boundary. Real authentication,
authorization, persistence, secrets, auditability, and monitoring are
foundation concerns. Components and feature hooks depend on auth/data ports;
local and API adapters provide the implementation selected by the composition
root.

## Auth

NOTE: While managing authentication on the client side is crucial, it is equally vital to implement robust security measures on the server to protect resources. Client-side authentication enhances user experience and complements server-side security measures.

Protecting resources comprises two key components:

### Authentication

Authentication is the process of verifying the identity of a user. In single-page applications (SPAs), the prevalent method of authenticating users is through JSON Web Tokens ([JWT](https://jwt.io/)). When a user logs in or registers, they receive a token that is stored within the application. Subsequently, for each authenticated request, the token is sent in the header or via a cookie along with the request to validate the user's identity and access permissions.

Do not put real bearer tokens or secret-bearing credentials in browser storage.
For production auth, prefer server-managed `HttpOnly` cookies or equivalent
backend-controlled sessions. Browser-local auth state is acceptable for local
mode fixtures and demos only.

#### `localStorage` vs cookie for storing tokens

Storing authentication tokens in localStorage can pose a security risk, especially in the context of Cross-Site Scripting ([XSS](https://owasp.org/www-community/attacks/xss/)) vulnerabilities, potentially leading to token theft by malicious actors.

Opting to store tokens in cookies, configured with the `HttpOnly` attribute, can enhance security as they are inaccessible to client-side JavaScript. In a Rootstock app, the real API should enforce the secure cookie behavior, and frontend code should interact through the auth port rather than reading or writing secret-bearing tokens directly.

In addition to securely storing tokens, it's crucial to protect the entire application from Cross-Site Scripting (XSS) attacks. One key strategy is to sanitize all user inputs before displaying them in the application. By carefully sanitizing inputs, you can reduce the risk of XSS vulnerabilities, making the application more resilient to malicious attacks and enhancing overall security for users.

[HTML Sanitization Example Code](../../frontend/src/components/ui/md-preview/md-preview.tsx)

For a full list of security risks, check [OWASP](https://owasp.org/www-project-top-10-client-side-security-risks/).

#### Handling user data

User info should be available through the auth port and app service provider.
React Query can cache the current-user request, but it should call
`AuthProvider.getCurrentUser()` through `useServices()` rather than importing a
concrete auth API module directly.

[Auth Configuration Example Code](../../frontend/src/lib/auth.tsx)

The application may render authenticated UI when a current user is present, but
the backend remains responsible for enforcing real authorization.

### Authorization

Authorization is the process of verifying whether a user has permission to access a specific resource within the application.

#### RBAC (Role based access control)

[Authorization Configuration Example Code](../../frontend/src/lib/authorization.tsx)

In a role-based authorization model, access to resources is determined by defining specific roles and associating them with permissions. For example, roles such as USER and ADMIN can be assigned different levels of access rights within the application. Users are then granted access based on their roles; for instance, restricting certain functionalities to regular users while permitting administrators to access all features and functionalities.

Client-side RBAC is a user-experience concern: it controls visible affordances
and local scenarios. It must not be treated as the real permission check for
API-backed behavior.

[RBAC Example Code](../../frontend/src/features/discussions/components/delete-discussion.tsx)

#### PBAC (Permission based access control)

While Role-Based Access Control (RBAC) provides a structured methodology for authorization, there are instances where a more granular approach is necessary. Permission-Based Access Control (PBAC) offers a more flexible solution, particularly in scenarios where access permissions need to be finely tuned based on specific criteria, such as allowing only the owner of a resource to perform certain operations. For example, in the case of a user's comment, PBAC ensures that only the author of the comment has the privilege to delete it, adding a layer of precision and customization to access control mechanisms.

For RBAC protection, you can use the RBAC component by passing allowed roles to it. On the other hand, if you need more strict protection, you can pass policies check to it.

For API-backed behavior, PBAC/RBAC decisions must be enforced by foundation
code. Frontend local adapters should mirror important authorization behavior so
experience scenarios remain realistic, but they are still mocks.

[PBAC Example Code](../../frontend/src/features/comments/components/comments-list.tsx)
