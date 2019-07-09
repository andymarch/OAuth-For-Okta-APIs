const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC

class TenantResolver {
    constructor() {
        //using this default tenant until able to retrieve from UDP
        let oidc = new ExpressOIDC({
            issuer: process.env.TENANT,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            appBaseUrl: process.env.BASE_URI,
            redirect_uri: process.env.REDIRECT_URI,
            scope: process.env.SCOPES,
            logoutRedirectUri: process.env.BASE_URI
        });
        app.use(oidc.router);

        this.tenants = new Map([]);
        this.tenants.set("",oidc)
    }

    ensureAuthenticated(){
        return (req, res, next) => {
            const subdomainPattern = /(.*)\..*(:[0-9]*)?/
            const matches = req.headers.host.match(subdomainPattern)

            var oidc;
            if(matches != null){
                const sub = [1]
                if(this.tenants.has(sub)){
                    oidc = this.tenants.get(sub)
                } else {
                    //TODO call UDP to get the tenant config
                }
            }
            else {
                oidc = this.tenants.get("")
            }
            if(oidc == null){
                return res.status(500).json({
                    Error: "Unable to determine tenant configuration."
                  });
            }
            var oldNext = next;
            next = oidc.ensureAuthenticated()
            next(req,res,oldNext)
        }
    }
}

module.exports = TenantResolver