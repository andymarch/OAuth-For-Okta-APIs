# OAuth for Okta API Demonstrator

This demonstrator allows you to explore the new OAuth for Okta APIs feature.

## Environment

---
**NOTE**

We are overscoping for profile update here. We are granting users of this server user.read and
user.manage when we want to be appending this with .self. However this is not
currently available in beta.

---

# Lab Guide

## 101

> You should have Node and NPM installed before proceeding.


### 101.0

1. Get an oktapreview tenant. Ensure your tenant is configured with the flag ```OAUTH2_FOR_OKTA_API```

<!-- UDP magic goes here --->

1. Create an OIDC client. A web app client with authorization code grant type
   will work. The redirect uri should be:
   `http://localhost:3000/authorization-code/callback`

1. In the application page you will see a new tab "Okta API Scopes", click this
   and enable the following scopes: okta.users.read
   okta.users.manage okta.clients.read okta.clients.register 

1. Clone this repository.

1. Create a .env file at the root level of this project with the following content:

```
TENANT=https://<yourtentant>.oktapreview.com
BASE_URI=http://localhost:3000
REDIRECT_URI=http://localhost:3000/authorization-code/callback
CLIENT_ID=<your client id>
CLIENT_SECRET=<your client secret>
SESSION_SECRET=<a random session string>
PORT=3000
SCOPES=openid profile okta.users.read okta.users.manage
```

> Note that in this lab, the token issuer is the root tenant authz server. The okta.*
scopes are only exposed on this authz server, and are not available from custom
authz servers.
   
1. To install the npm package dependencies enter ```npm install```.

1. To start the application enter ```npm run start```.

1. Open a browser in private or incognito mode and navigate to http://localhost:3000.

1. You will be prompted to login to your tenant if you are not already. You should
do this as a user with super admin permission.

### 101.1

This exercise demonstrates user profile self management. This feature will allow
developers to enable users to manage their profile directly in an application
with the goal of making this available to SPAs (single page applications) where
API tokens cannot be safely used.

1. Whilst logged to the demo application as super admin. Select 'Edit' under
   your profile an update your phone number and press submit.

1. Verify that the number shown under your profile changes.

1. Open the system log in the admin console and verify you see an event of type
   ```user.account.update_profile```.

### 101.2

   This excercise demonstrates silent downscoping. The actions available to a
   user with their bearer token depend on the scopes granted to that
   application.
   
1. Open the tenant administration console and switch to the application you
      created in 101.1.

1. From the "Okta API Scopes" tab revoke the ```okta.users.manage``` scope.

1. Launch the demonstrator again as the same user as before. You should now
      see a downscope warning listing the requested scopes and the granted
      scopes.

   1. Try to update the user's phone number as done in 101.1 you will now see
      and error that insufficient scopes are granted.

### 101.3

This exercise demonstrates delegated administration. This will allow for the
development of custom management dashboard still bound by the rights granted to
the user within Okta.

1. Login to your tenant as a super user and create a new group called "Development".

1. Create a new user with naming of your choice and assign them to this group.

1. Make your new user a group administrator.

1. Open a browser in a new private or incognito mode and navigate to
   http://localhost:3000.

1. Login as your new administrator.

1. Under "Your Teams" press "New Team Member" under the group you just created.

1. Complete the registration form with an email address you can access.

1. Complete the activation of the your newly created user from the email.

1. Login to http://localhost:3000 with this new user.

1. You will notice that the phone number is not shown on your profile. This is
   due to a current limitation on the /self scope.

1. You will notice that no groups are shown, this user does not have permission
   to retrieve their own group membership.

### 101.3

Application administrator

## 201

- Complete 101 first.

Do a branding swap

extend the "your profile" call to update a custom profile attribute.

add lifecycle events to the the "your teams" view.