class UserProfile {
    constructor(profileJson) {
        this.name = profileJson.profile.firstName + " " + profileJson.profile.lastName
        this.phoneNumber = profileJson.profile.mobilePhone

        this.lastLogin = profileJson.lastLogin
        this.lastUpdate = profileJson.lastUpdated
    }
}

module.exports = UserProfile