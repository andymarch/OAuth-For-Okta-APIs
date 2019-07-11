const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC

class Tenant {
    constructor(tenantProfileJson) {
        if(tenantProfileJson){
            try {
                this.tenant = tenantProfileJson.okta_org_name
                this.oidc = new ExpressOIDC({
                    issuer: tenantProfileJson.okta_org_name,
                    client_id: tenantProfileJson.client_id,
                    client_secret: tenantProfileJson.client_secret,
                    appBaseUrl: tenantProfileJson.redirect_uri,
                    redirect_uri: tenantProfileJson.redirect_uri,
                    scope: process.env.SCOPES,
                    logoutRedirectUri: tenantProfileJson.redirect_uri
                });
                var expire = new Date()
                expire.setMinutes(expire.getMinutes + 5)
                this.expires = expire
                app.use(this.oidc.router)
            }
            catch(error) {
                console.log(error);
            }
        }
        else {
            try {
                this.tenant = process.env.TENANT
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
                this.expires = null
            }
            catch(error) {
                console.log(error);
            }
        }
    }

    isExpired(){
        console.log("Checking expiry on stored tenant")
        if(this.expires === null){
            return false
        }
        console.log("isExpired: "+new Date() > this.expires)
        return new Date() > this.expires
    }
}

module.exports = Tenant