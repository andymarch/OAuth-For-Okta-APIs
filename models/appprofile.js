var logger = require('../logger.js')

class AppProfile {
    constructor(profileJson) {
        if(profileJson){
            try {
                this.id = profileJson.client_id
                this.name = profileJson.client_name
            }
            catch(error) {
                logger.error(error);
            }
        }
    }
}

module.exports = AppProfile