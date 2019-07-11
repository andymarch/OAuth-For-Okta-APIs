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
            let sub = req.headers.host.substr(0,req.headers.host.indexOf("."+process.env.BASE_HOST))
            
            var tenant = this.tenants.get(sub)

            if(tenant == null || tenant.isExpired()){
                try{
                    console.log("Consulting UDP for tenant info of "+sub)
                    var response = await axios.get(process.env.UDP_URI+"/api/configs/"+sub+"/"+process.env.UDP_APP_NAME,{
                        headers:{
                            Authorization: 'Bearer '+ process.env.UDP_ACCESS_TOKEN
                        }
                    })
                    response.data.redirect_uri = response.data.redirect_uri.replace('/authorization-code/callback', '')
                    this.tenants.set(sub,new Tenant(response.data));
                    console.log("tenant stored")
                    tenant = this.tenants.get(sub)
                }
                catch(error){
                    console.log(error)
                    return res.status(500).json({
                        Error: "Failed to retrieve tenant configuration from UDP for "+sub
                      });
                }
            }

            if(tenant == null){
                return res.status(500).json({
                    Error: "Unable to determine tenant configuration for "+sub
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
        let sub = req.headers.host.substr(0,req.headers.host.indexOf("."+process.env.BASE_HOST))
        return this.tenants.get(sub)
    }
}

module.exports = TenantResolver
