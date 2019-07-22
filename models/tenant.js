var logger = require('../logger.js')

class Tenant {
    constructor(tenantProfileJson,sub) {
        if(tenantProfileJson){
            try {
                this.tenant = tenantProfileJson.okta_org_name
                this.expires = new Date(new Date().getTime() + process.env.UDP_CACHE_DURATION*60000);
                this.authorizationURL = tenantProfileJson.okta_org_name+ '/oauth2/v1/authorize',
                this.tokenURL= tenantProfileJson.okta_org_name+'/oauth2/v1/token',
                this.userInfoURL= tenantProfileJson.okta_org_name+'/oauth2/v1/userinfo',
                this.clientID= tenantProfileJson.client_id,
                this.clientSecret =  tenantProfileJson.client_secret,
                this.callbackURL = tenantProfileJson.redirect_uri+'/authorization-code/'+sub
            }
            catch(error) {
                logger.error(error);
            }
        }
        else {
            try {
                this.tenant = process.env.TENANT
                this.expires = null
                this.issuer = process.env.TENANT
                this.authorizationURL = process.env.TENANT+ '/oauth2/v1/authorize'
                this.tokenURL = process.env.TENANT+'/oauth2/v1/token',
                this.userInfoURL = process.env.TENANT+'/oauth2/v1/userinfo',
                this.clientID = process.env.CLIENT_ID,
                this.clientSecret = process.env.CLIENT_SECRET,
                this.callbackURL = process.env.REDIRECT_URI+'/authorization-code/'+sub
            }
            catch(error) {
                logger.error(error);
            }
        }
    }

    isExpired(){
        if(this.expires === null){
            return false
        }
        return new Date() > this.expires
    }
}

module.exports = Tenant