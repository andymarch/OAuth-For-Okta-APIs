# OAuth for Okta API Demonstrator

This demonstrator allows you to explore the new OAuth for Okta APIs feature.

## Environment

Create a .env file at the root level of this project with the following content
```
TENANT=https://<yourtentant>.oktapreview.com
BASE_URI=http://localhost:3000
REDIRECT_URI=http://localhost:3000/callback
CLIENT_ID=<your client id>
CLIENT_SECRET=<your client secret>
SESSION_SECRET=<a random session string>
PORT=3000
SCOPES=openid profile okta.users.read okta.users.manage
```

Note that here your token issuer is the tenant authz server itself. The okta.*
scopes are only exposed on this auth server and are not available from custom
authz servers.

---
**NOTE**

We are overscoping here. We are granting users of this server user.read and
user.manage when we want to be appending this with .self. However this is not
currently available in beta.
Working around this on the application side by scoping the change to always
using the sub of the token in the API request URI.

---