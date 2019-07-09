const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC
const axios = require('axios')
const Tenant = require('./models/tenant')

class TenantResolver {
    constructor() {
        this.tenants = new Map([]);
        this.tenants.set("",new Tenant("sdfdsfsdf"))
    }

    ensureAuthenticated(){
        return async (req, res, next) => {
            const subdomainPattern = /(.*)\..*(:[0-9]*)?/
            const matches = req.headers.host.match(subdomainPattern)

            var tenant;
            if(matches != null){
                const sub = matches[1]
                if(this.tenants.has(sub)){
                    tenant = this.tenants.get(sub)
                } else {
                    try{
                    var response = await axios.get(process.env.UDP_URI+"/api/config/"+sub+"/"+process.env.UDP_APP_NAME+"/.well-known/default-settings")
                    console.log(response)
                    //TODO call UDP to get the tenant config
                    }
                    catch(error){
                        console.log(error)
                    }
                }
            }
            else {
                tenant = this.tenants.get("")
            }
            if(tenant == null){
                return res.status(500).json({
                    Error: "Unable to determine tenant configuration."
                  });
            }
            var oldNext = next;
            next = tenant.oidc.ensureAuthenticated()
            next(req,res,oldNext)
        }
    }

    getRequestingTenant(req){
        const subdomainPattern = /(.*)\..*(:[0-9]*)?/
        const matches = req.headers.host.match(subdomainPattern)

        var tenant;
        if(matches != null){
            const sub = matches[1]
            if(this.tenants.has(sub)){
                tenant = this.tenants.get(sub)
            } 
        }
        else {
            tenant = this.tenants.get("")
        }
        return tenant;
    }
}

module.exports = TenantResolver