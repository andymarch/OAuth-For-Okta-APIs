require('dotenv').config()
const express = require('express')
const hbs  = require('express-handlebars')
const session = require("express-session")
const axios = require("axios")
const ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const UserProfile = require('./models/userprofile')

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

const router = express.Router();
router.get("/",oidc.ensureAuthenticated(), async (req, res, next) => {
    var userProfile;
    const tokenSet = req.userContext.tokens;
    axios.defaults.headers.common['Authorization'] = `Bearer `+tokenSet.access_token
    try {
        response = await axios.get(process.env.TENANT+'/api/v1/users/'+req.userContext.userinfo.sub)
        userProfile = new UserProfile(response.data)
    }
    catch(error) {
        console.log(error);
    }
    res.render("index",{
        user: userProfile
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
        const response = await axios.post(process.env.TENANT+'/api/v1/users/'+req.userContext.userinfo.sub,
        {
            profile: {mobilePhone: req.body.number}
        })
        res.redirect("/")
    }
    catch(error) {
        console.log(error);
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