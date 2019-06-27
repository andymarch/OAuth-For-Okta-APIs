require('dotenv').config()
const express = require('express')
const hbs  = require('express-handlebars')
const session = require("express-session")
const axios = require("axios")
const ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const UserProfile = require('./models/userprofile')
const GroupProfile = require('./models/groupprofile')
const AppProfile = require('./models/appprofile')

const PORT = process.env.PORT || "3000";

app = express();

app.engine('hbs',  hbs( { 
    extname: 'hbs', 
    defaultLayout: 'main', 
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/'
  } ) );
app.set('view engine', 'hbs');

app.use("/static", express.static("static"));

app.use(session({
  cookie: { httpOnly: true },
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: true
}));

let oidc = new ExpressOIDC({
    issuer: process.env.TENANT,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    appBaseUrl: process.env.BASE_URI,
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.SCOPES
});
  
app.use(oidc.router);

function parseJWT (token){
    var atob = require('atob');
    if (token != null) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(atob(base64))
    } else {
        return "Invalid or empty token was parsed"
    }
}

function wasDownscoped(scopes){
    var result = false;
    process.env.SCOPES.split(" ").forEach(element => {
        if(!scopes.includes(element)){
            result = true
        }
    });
    return result;
}

const router = express.Router();
router.get("/",oidc.ensureAuthenticated(), async (req, res, next) => {

    var userProfile;
    const tokenSet = req.userContext.tokens;
    const scopes = parseJWT(tokenSet.access_token).scp
    var userDownscoped = wasDownscoped(scopes)
    var downscopeNotices = []
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token
    try {
        userres = await axios.get(process.env.TENANT+'/api/v1/users/'+req.userContext.userinfo.sub)
        userProfile = new UserProfile(userres.data)

        var userManagedGroups = []
        groupres = await axios.get(process.env.TENANT+'/api/v1/users/'+req.userContext.userinfo.sub+'/groups')
        groupres.data.forEach(function(element) {
            userManagedGroups.push(new GroupProfile(element))
        });

        var userManagedApplications = []
        if(scopes.includes("okta.clients.read")){
            appres = await axios.get(process.env.TENANT+'/oauth2/v1/clients')
            appres.data.forEach(function(element) {
                userManagedApplications.push(new AppProfile(element))
            });
        } else {
            downscopeNotices.push("okta.clients.read was not granted")
        }
    }
    catch(error) {
        console.log(error);
    }
    res.render("index",{
        user: userProfile,
        groups:userManagedGroups,
        applications: userManagedApplications,
        requestedScopes: process.env.SCOPES.split(" "),
        grantedScopes: scopes,
        wasDownscoped: userDownscoped,
        downscopeNotices: downscopeNotices
       });
});

router.get("/editprofile",oidc.ensureAuthenticated(), async (req, res, next) => {
    const tokenSet = req.userContext.tokens;
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token
    try {
        const response = await axios.get(process.env.TENANT+'/api/v1/users/'+req.userContext.userinfo.sub)
        userProfile = new UserProfile(response.data)
    }
    catch(error) {
        console.log(error);
    }
    res.render("editprofile",{
        user: userProfile
       });
});

router.post("/editprofile",oidc.ensureAuthenticated(), urlencodedParser, async (req, res, next) => {
    const tokenSet = req.userContext.tokens;
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token
    try {
        await axios.post(process.env.TENANT+'/api/v1/users/'+req.userContext.userinfo.sub,
        {
            profile: {mobilePhone: req.body.number}
        })
        res.redirect("/")
    }
    catch(error) {
        console.log(error);
    }
});

router.get("/addTeamMember/:groupId",oidc.ensureAuthenticated(), async (req, res, next) => {
    res.render("addTeamMember",{
        user: new UserProfile(),
        groupId: req.params.groupId
       });
});

router.post("/addTeamMember/:groupId",oidc.ensureAuthenticated(), urlencodedParser, async (req, res, next) => {
    const tokenSet = req.userContext.tokens;
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token
    try {
        await axios.post(process.env.TENANT+'/api/v1/users?activate=true',
        {
            profile: { 
                firstName: req.body.name.split(" ")[0],
                lastName: req.body.name.split(" ")[1],
                email: req.body.email,
                login: req.body.email
            },
            groupIds: [
                req.params.groupId
            ]
        })
        res.redirect("/")
    }
    catch(error) {
        res.render("addTeamMember",{
            user: new UserProfile(),
            groupId: req.params.groupId,
            error: error.response.data.error_description
           });
    }
});

router.get("/addApplication",oidc.ensureAuthenticated(), async (req, res, next) => {
    res.render("addApplication",{
       });
});

router.post("/addApplication",oidc.ensureAuthenticated(), urlencodedParser, async (req, res, next) => {
    const tokenSet = req.userContext.tokens;
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token
    try {
        await axios.post(process.env.TENANT+'/oauth2/v1/clients',
        {
            client_name: req.body.clientName,
            client_uri: req.body.uri,
            logo_uri: req.body.uri+"/logo.png",
            application_type: "web",
            redirect_uris: [
                req.body.uri+"/oauth2/redirectUri"
            ],
            post_logout_redirect_uris: [
                req.body.uri+"/oauth2/postLogoutRedirectUri"
            ],
            response_types: [
                "code"
            ],
            grant_types: [
                "authorization_code",
                "refresh_token"
            ],
            token_endpoint_auth_method: "client_secret_post",
            initiate_login_uri: req.body.uri + "/oauth2/login"
        })
        res.redirect("/")
    }
    catch(error) {
        res.render("addApplication",{
            clientName: req.body.clientName,
            uri: req.body.uri,
            error: error.response.data.error_description
        });
    }
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.use(router)

oidc.on('ready', () => {
  app.listen(PORT, () => console.log('app started'));
});

oidc.on("error", err => {
  console.error(err);
});