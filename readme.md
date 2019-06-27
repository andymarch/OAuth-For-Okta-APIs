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


### 101.0 
Ensure your tenant is configured with the flag ```OAUTH2_FOR_OKTA_API``` and you
have Node and NPM installed before proceeding.

<!-- UDP magic goes here --->

1. Clone this repository.

1. Create a .env file at the root level of this project with the following
   content

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

3. Note that here your token issuer is the tenant authz server itself . The okta.*
scopes are only exposed on this auth server and are not available from custom
authz servers.

1. To start the application enter ```npm run start```.

1. Open a browser in private or incognito mode and navigate to http://localhost:3000.

1. You will be prompted to login to your tenant if you are not already. You should
do this as a user with super user permission.

### 101.1

This exercise demonstrates user profile self management. This feature will allow
developers to enable user's to manage their profile directly in an application
with the goal of making this available to SPA (single page applications) where
API tokens cannot be safely used.

1. Under your profile select 'Edit' update your phone number and press submit.

1. Verify that the number shown under your profile changes.

1. Open the system log in the admin console and verify you see an event of type  ```user.account.update_profile```.

### 101.2

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