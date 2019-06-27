class AppProfile {
    constructor(profileJson) {
        console.log(profileJson)
        if(profileJson){
            try {
                this.id = profileJson.client_id
                this.name = profileJson.client_name
            }
            catch(error) {
                console.log(error);
            }
        }
    }
}

module.exports = AppProfile