# OAuth for Okta API Demonstrator

This demonstrator allows you to explore the new OAuth for Okta APIs feature.

---
**NOTE**

We are overscoping for profile update here. We are granting users of this server
 user.read and user.manage when we want to be appending this with .self. 
 However this is not currently available in beta.

---

# Lab Guide

## 101

> You should have Node and NPM installed before proceeding.


### 101.0

1. Get an oktapreview tenant. Ensure your tenant is configured with the flag 
```OAUTH2_FOR_OKTA_API```

<!-- UDP magic goes here --->

1. Create an OIDC client. A web app client with authorization code grant type
   will work. The redirect uri should be:
   `http://localhost:3000/authorization-code/callback`

1. In the application page you will see a new tab "Okta API Scopes", click this
   and enable the following scopes: okta.users.read
   okta.users.manage okta.clients.read okta.clients.register 

1. Clone this repository.

1. Create a .env file at the root level of this project with the following 
content:

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

> Note that in this lab, the token issuer is the root tenant authz server. The 
okta.* scopes are only exposed on this authz server, and are not available from 
custom authz servers.
   
1. To install the npm package dependencies enter ```npm install```.

1. To start the application enter ```npm run start```.

1. Open a browser in private or incognito mode and navigate to 
http://localhost:3000.

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

1. Login to your tenant as a super user and create a new group called 
"Development".

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

   This excerise demonstrates application management and the control of user
   permissions driven by Okta's permission model.

1. Open the demonstrator as your test account.

1. Under applications press "New Application"

1. Complete the form and press submit.

1. You will be shown an error. While your token has the scope to register new 
clients your user does not.

1. Login to the tenant as a super user and grant the test account application 
administrator.

1. Repeat the form submission for creating a new application.

1. You should see the newly created application listed under your applications.

## 201

- Complete 101 first.

### 201.1

   This exercise should allow you to quickly update the branding to provide
   customized demonstrations to customer.

1. Using the css file in ```/static/css/style.css``` update the brandlogo shown.

2. Change the background colour.

### 202.2

   This exercise will help you to add custom logic to your delegated
   administration sample.

   1. Add an additional field to the user profile page which updates a custom
      attribute on the user profile.

    2. Add custom validation logic on your field in the application and prevent
       submission to Okta if validation is not met.

### 202.3

   THis exercise should familize you with the progress being made, where to find
   updates as to which endpoints are covered and how to extend the demo to use
   them.
   
   1. Visit the wiki page for OAuth for Okta APIs and review the endpoint status
      [here](https://oktawiki.atlassian.net/wiki/spaces/eng/pages/571380965/OAuth+2.0+for+Okta+APIs#OAuth2.0forOktaAPIs-EndpointStatus(Tobeupdatedbyproductteams)).
      
   1. Pick an endpoint besides user or client. (Currently live are
      apps/authorizationServerss/eventHooks/groups/schemas)
   
   1. Add the required scopes to your application grants.

   1. Add the required scopes to your .env file.

   1. Add an additional screen to interact with that endpoint.