const express = require("express");
const app = express();
const session = require('express-session');
const https = require("https");
const pg = require("pg-promise")();
require('dotenv').config();
const passport=require("passport");

let userID;

const dbURL = "postgresql://retool:AbNWheZC9v6z@ep-super-mode-75219061.us-west-2.retooldb.com/retool?sslmode=require"

const db = pg(dbURL)

// Serve static files from the "public" directory
app.use(express.static("public"));

app.set("view engine", "ejs");
// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data in the request body



const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
 
// database.query("SELECT * FROM moto;").then((result) => {
//   console.log(result)
// })

app.post("/login", function(req,res){
  res.redirect("/register")
})




app.get("/", function (req, res) {
 
  
  res.render(__dirname + "/public/login.ejs");
});

app.get("/login", (req,res)=>{
  res.redirect("/")
})






// Start the server and listen on port 3000
app.listen(3000, function () {
  console.log("Server listening on port 3000");
});

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true, // Set to true for HTTPS
    maxAge: 60000, // Session expires after 60 seconds
    httpOnly: true,
  }
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
    failureRedirect: '/login',
   
  }),function(req, res) {
    // Successful authentication, redirect home.
    console.log(req.user)
     userID = req.user.google_id;
    res.redirect(`/select-building&id=${userID}`);
  });


app.get('/register', (req, res) => {
  // Redirect to the Google OAuth registration page
  res.redirect('/auth/google');
});


app.get("/select-building&id=:id", (req,res) =>
{
  res.render(__dirname + "/public/cleanchan.ejs", {id:req.params.id});
})


app.get("/boyshostel&id=:id&buildingtype=:type", function (req, res) {
  // console.log(req.params.id)
  // console.log(req.params.type)
  if (req.params.id == userID){
  res.render(__dirname + "/public/boyshostel.ejs",{id:req.params.id,type:req.params.type});}
  else{
    res.redirect('/login')
  }
});



app.get('/complaint&id=:id&buildingtype=:type&blockno=:block', (req, res) =>{
  res.render(__dirname + "/public/complaintbox.ejs", {id:req.params.id,type:req.params.type,block : req.params.block})
})


app.post("/submit-complaint&id=:id&buildingtype=:type&blockno=:block", (req,res) => {
  console.log(req.params.id)
  const id = req.params.id;
  console.log(req.params.type)
  console.log(req.params.block)
  console.log(req.body.complaintText)
  complaintText=req.body.complaintText;
  res.send("YOUR COMPLAINT HAS BEEN RECIEVED");

  db.none(
    'UPDATE moto SET complainboxdescription = $1 WHERE google_id = $2',
    [complaintText, id]
  )
  .then(() => {
    // Successful update, send a response or redirect
    res.send("Your complaint has been received and updated.");
  })
  .catch((error) => {
    // Handle any errors that occur during the database update
    console.error("Error updating the database:", error);
    res.status(500).send("Error updating the database");
  });

});