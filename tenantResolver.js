const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC
const axios = require('axios')
const Tenant = require('./models/tenant')

class TenantResolver {
    constructor() {
        this.tenants = new Map([]);
        this.tenants.set("",new Tenant())
    }

    ensureAuthenticated(){
        return async (req, res, next) => {
            const subdomainPattern = /(.*)\..*(:[0-9]*)?/
            const matches = req.headers.host.match(subdomainPattern)

            var tenant;
            let sub = ""
            if(matches != null){
                sub = matches[1]
                if(this.tenants.has(sub)){
                    console.log("Found known tenant")
                    tenant = this.tenants.get(sub)
                } else {
                    try{
                        console.log("Consulting UDP for tenant info")
                        var response = await axios.get(process.env.UDP_URI+"/api/configs/"+sub+"/"+process.env.UDP_APP_NAME)
                        this.tenants.set(sub,new Tenant(response.data));
                        tenant = this.tenants.get(sub)
                        console.log("tenant stored")
                    }
                    catch(error){
                        console.log(error)
                    }
                }
            }
            else {
                tenant = this.tenants.get(sub)
            }
            if(tenant == null){
                return res.status(500).json({
                    Error: "Unable to determine tenant configuration."
                  });
            }
            var oldNext = next;
            if(tenant.oidc == null){
                this.tenants.delete(sub)
                return res.status(500).json({
                    Error: "Tenant configuration was malformed unable to configure middleware. Tenant will be removed, update configuration and retry."
                  });
            }
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