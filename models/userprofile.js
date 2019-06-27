class UserProfile {
    constructor(profileJson) {
        if(profileJson){
            try {
                this.name = profileJson.profile.firstName + " " + profileJson.profile.lastName
                this.phoneNumber = profileJson.profile.mobilePhone
                this.email = profileJson.profile.email

                this.lastLogin = profileJson.lastLogin
                this.lastUpdate = profileJson.lastUpdated
            }
            catch(error) {
                console.log(error);
            }
        }
    }
}

module.exports = UserProfile