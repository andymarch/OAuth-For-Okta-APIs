const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC

class Tenant {
    constructor(tenantProfileJson) {
        if(tenantProfileJson){
            try {
                this.sub = "test"
                this.tenant = "https://examplydev.oktapreview.com"
                this.scopes = "openid profile okta.users.read okta.users.manage okta.clients.read"
                this.oidc = new ExpressOIDC({
                    issuer: process.env.TENANT,
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    appBaseUrl: process.env.BASE_URI,
                    redirect_uri: process.env.REDIRECT_URI,
                    scope: process.env.SCOPES,
                    logoutRedirectUri: process.env.BASE_URI
                });
                app.use(this.oidc.router)
            }
            catch(error) {
                console.log(error);
            }
        }
    }
}

module.exports = Tenant