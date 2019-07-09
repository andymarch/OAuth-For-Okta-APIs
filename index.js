require('dotenv').config()
const express = require('express')
const hbs  = require('express-handlebars')
const session = require('express-session')
const axios = require('axios')
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const tenantResolver = require('./tenantResolver')

const UserProfile = require('./models/userprofile')
const GroupProfile = require('./models/groupprofile')
const AppProfile = require('./models/appprofile')

const PORT = process.env.PORT || 3000;

app = express();

app.engine('hbs',  hbs( { 
    extname: 'hbs', 
    defaultLayout: 'main', 
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: {
        betaTagged: () => {
            return !process.env.SUPPRESSBETA;
        }
    }
  } ) );

app.set('view engine', 'hbs');

app.use('/static', express.static('static'));

app.use(session({
  cookie: { httpOnly: true },
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: true
}));

const tr = new tenantResolver();

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

function wasDownscoped(scopes, requestedScopes){
    var result = false;
    requestedScopes.split(" ").forEach(element => {
        if(!scopes.includes(element)){
            result = true
        }
    });
    return result;
}

function parse403(error){
    if(error.response.headers['www-authenticate']){
        var error_description_pattern = /.*error_description=\"([^\"]+)\",.*/
        var scope_pattern = /.*scope=\"([^\"]+)\".+/
        var des = error.response.headers['www-authenticate'].match(error_description_pattern)[1]
        var scopeRequired = error.response.headers['www-authenticate'].match(scope_pattern)[1]
        return des+ " Required Scope: "+scopeRequired
    } else{
        return error.response.data.error_description
    }
}

const router = express.Router();

router.get("/",tr.ensureAuthenticated(), async (req, res, next) => {
    const requestingTenant = tr.getRequestingTenant(req);
    var userProfile;
    const tokenSet = req.userContext.tokens;
    const scopes = parseJWT(tokenSet.access_token).scp
    var userDownscoped = wasDownscoped(scopes,requestingTenant.scopes)
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token

    try {
        userres = await axios.get(requestingTenant.tenant+'/api/v1/users/'+req.userContext.userinfo.sub)
        userProfile = new UserProfile(userres.data)

        var userManagedGroups = []
        groupres = await axios.get(requestingTenant.tenant+'/api/v1/users/'+req.userContext.userinfo.sub+'/groups')
        groupres.data.forEach(function(element) {
            userManagedGroups.push(new GroupProfile(element))
        });

        var userManagedApplications = []
        if(scopes.includes("okta.clients.read")){
            appres = await axios.get(requestingTenant.tenant+'/oauth2/v1/clients')
            appres.data.forEach(function(element) {
                userManagedApplications.push(new AppProfile(element))
            });
        } 

    }
    catch(error) {
        //console.log(error);
    }

    var authorizations = {}
    var requestedScopes = requestingTenant.scopes.split(" ")

    requestedScopes.forEach(function (req_scope, index) {
        if (scopes.includes(req_scope)) {
            authorizations[req_scope] = true
        }
        else {
            authorizations[req_scope] = false
        }
    });

    res.render("index",{
        authorizations: authorizations,
        user: userProfile,
        groups:userManagedGroups,
        applications: userManagedApplications,
        requestedScopes: requestedScopes,
        grantedScopes: scopes,
        wasDownscoped: userDownscoped
    });

});

router.get("/editprofile",tr.ensureAuthenticated(), async (req, res, next) => {
    const tokenSet = req.userContext.tokens;
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token
    try {
        const response = await axios.get(tr.getRequestingTenant(req).tenant+'/api/v1/users/'+req.userContext.userinfo.sub)
        userProfile = new UserProfile(response.data)

        res.render("editprofile",{
            user: userProfile,
            error: req.query.error
        });
    }
    catch(error) {
        if(error.response.status === 403){
            res.render("editprofile",{
                user: new UserProfile(),
                error: parse403(error)
            });
        }
        else {
            console.log(error)
            res.render("editprofile",{
                user: new UserProfile(),
                error: "Unknown error, check console."
            });
        }
    }
});

router.post("/editprofile",tr.ensureAuthenticated(), urlencodedParser, async (req, res, next) => {
    const tokenSet = req.userContext.tokens;
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token
    try {
        await axios.post(tr.getRequestingTenant(req).tenant+'/api/v1/users/'+req.userContext.userinfo.sub,
        {
            profile: {mobilePhone: req.body.number}
        })
        res.redirect("/")
    }
    catch(error) {
        if(error.response.status === 403){
            res.redirect("/editprofile/?error="+encodeURIComponent(parse403(error))) 
        }
        else {
            console.log(error)
            res.redirect("/editprofile/?error="+encodeURIComponent("Unknown error, check console"))
        }
    }
});

router.get("/addTeamMember/:groupId",tr.ensureAuthenticated(), async (req, res, next) => {
    res.render("addTeamMember",{
        user: new UserProfile(),
        groupId: req.params.groupId
       });
});

router.post("/addTeamMember/:groupId",tr.ensureAuthenticated(), urlencodedParser, async (req, res, next) => {
    const tokenSet = req.userContext.tokens;
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token
    try {
        await axios.post(tr.getRequestingTenant(req).tenant+'/api/v1/users?activate=true',
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
        var errorMsg;
        if(error.response.status === 403){
            errorMsg = parse403(error)
        }
        else {
            console.error(error)
            errorMsg = "Unknown error, check console";
        }
        res.render("addTeamMember",{
            user: new UserProfile(),
            groupId: req.params.groupId,
            error: errorMsg
           });
    }
});

router.get("/addApplication",tr.ensureAuthenticated(), async (req, res, next) => {
    res.render("addApplication",{
       });
});

router.post("/addApplication",tr.ensureAuthenticated(), urlencodedParser, async (req, res, next) => {
    const tokenSet = req.userContext.tokens;
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token
    try {
        await axios.post(tr.getRequestingTenant(req).tenant+'/oauth2/v1/clients',
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
        var errorMsg;
        if(error.response.status === 403){
            errorMsg = parse403(error)
        }
        else {
            console.error(error)
            errorMsg = "Unknown error, check console";
        }

        res.render("addApplication",{
            clientName: req.body.clientName,
            uri: req.body.uri,
            error: errorMsg
        });
    }
});

app.get("/logout", (req, res) => {
    const tokenSet = req.userContext.tokens;
    console.log(req)
    req.logout();
    res.redirect(tr.getRequestingTenant(req).tenant+'/oauth2/v1/logout?id_token_hint='
        + tokenSet.id_token
        + '&post_logout_redirect_uri='
        + encodeURI(req.protocol+"://"+req.headers.host)
        );
});

app.use(router)

app.listen(PORT, () => console.log('app started'));