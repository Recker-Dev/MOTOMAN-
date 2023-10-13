const express = require("express");
const app = express();
const session = require('express-session');
const https = require("https");
const pg = require("pg-promise")();
require('dotenv').config();
const passport=require("passport");


const dbURL = "postgresql://retool:AbNWheZC9v6z@ep-super-mode-75219061.us-west-2.retooldb.com/retool?sslmode=require"

const db = pg(dbURL)

// Serve static files from the "public" directory
app.use(express.static("public"));

app.set("view engine", "ejs");
// Middleware setup
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data in the request body



const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
 
// database.query("SELECT * FROM moto;").then((result) => {
//   console.log(result)
// })

app.post("/login", function(req,res){
  res.redirect("/select-building")
})

app.get("/select-building", (req,res) =>
{
  res.render(__dirname + "/public/cleanchan.ejs");
})


app.get("/", function (req, res) {
  
  res.render(__dirname + "/public/login.ejs");
});

app.get("/boyshostel", function (req, res) {
  
  res.render(__dirname + "/public/boyshostel.ejs");
});

app.get('/complaint-:block', (req, res) =>{
  res.render(__dirname + "/public/complaintbox.ejs", {block : req.params.block})
})

app.post("/submit-complaint", (res,req) => {
  req.send("YOUR COMPLAINT HAS BEEN RECIEVED");
})




// Start the server and listen on port 3000
app.listen(3000, function () {
  console.log("Server listening on port 3000");
});

app.use(session({
  secret: 'your-secret-key', // Use your session secret key from .env
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.session());

const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
    clientID:     clientID,
    clientSecret: clientSecret,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    const googleId = profile.id;
  
    // Check if the user already exists in your database
    db.oneOrNone('SELECT * FROM moto WHERE google_id = $1', [googleId])
      .then(user => {
        if (user) {
          // User already exists, return the user
          return done(null, user);
        } else {
          // User does not exist, create a new user
          const email = profile.email;
          // const name = profile.displayName;
          db.one('INSERT INTO moto (google_id, email) VALUES ($1, $2) RETURNING *', [googleId, email])
            .then(newUser => {
              return done(null, newUser);
            })
            .catch(err => {
              return done(err);
            });
        }
      })
      .catch(err => {
        return done(err);
      });
  }));

  passport.serializeUser((user,done)=>
  {
    done(null,user)
  });

  passport.deserializeUser((user,done)=>
  {
    done(null,user)
  });



 app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);



app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/select-building',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/register', (req, res) => {
  // Redirect to the Google OAuth registration page
  res.redirect('/auth/google');
});


app.get("/auth/select-building", (req,res) =>
{
  res.render(__dirname + "/public/cleanchan.ejs");
})
