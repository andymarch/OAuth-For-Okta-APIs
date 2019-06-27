class GroupProfile {
    constructor(profileJson) {
        if(profileJson){
            try {
                this.id = profileJson.id
                this.name = profileJson.profile.name
                this.desc = profileJson.profile.description
            }
            catch(error) {
                console.log(error);
            }
        }
    }
}

module.exports = GroupProfile