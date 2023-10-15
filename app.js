const express = require("express");
const app = express();
const session = require('express-session');
const https = require("https");
const pg = require("pg-promise")();
require('dotenv').config();
const passport = require("passport");

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

app.post("/login", function (req, res) {
  res.redirect("/register")
})




app.get("/", function (req, res) {


  res.render(__dirname + "/public/login.ejs");
});

app.get("/login", (req, res) => {
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

const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
  clientID: clientID,
  clientSecret: clientSecret,
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback: true
},
  function (request, accessToken, refreshToken, profile, done) {
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

passport.serializeUser((user, done) => {
  done(null, user)
});

passport.deserializeUser((user, done) => {
  done(null, user)
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);



app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',

  }), function (req, res) {
    // Successful authentication, redirect home.
    console.log(req.user)
    userID = req.user.google_id;
    res.redirect(`/select-building&id=${userID}`);
  });


app.get('/register', (req, res) => {
  // Redirect to the Google OAuth registration page
  res.redirect('/auth/google');
});


app.get("/select-building&id=:id", (req, res) => {
  res.render(__dirname + "/public/cleanchan.ejs", { id: req.params.id });
})


app.get("/boyshostel&id=:id&buildingtype=:type", function (req, res) {
  // console.log(req.params.id)
  // console.log(req.params.type)
  if (req.params.id == userID) {
    res.render(__dirname + "/public/boyshostel.ejs", { id: req.params.id, type: req.params.type });
  }
  else {
    res.redirect('/login')
  }
});



app.get('/complaint&id=:id&buildingtype=:type&blockno=:block', (req, res) => {
  res.render(__dirname + "/public/complaintbox.ejs", { id: req.params.id, type: req.params.type, block: req.params.block })
})


app.post("/submit-complaint&id=:id&buildingtype=:type&blockno=:block", (req, res) => {
  console.log(req.params.id)
  const id = req.params.id;
  console.log(req.params.type)
  console.log(req.params.block)
  console.log(req.body.complaintText)
  complaintText = req.body.complaintText;
  // res.send("Complaint updated");

  // db.none(
  //   'UPDATE complaintbox SET complainboxdescription = $1 WHERE google_id = $2',
  //   [complaintText, id]
  // )
  //   .then(() => {
  //     // Successful update, send a response or redirect
  //     res.send("YOUR COMPLAINT HAS BEEN RECIEVED");
  //   })
  //   .catch((error) => {
  //     // Handle any errors that occur during the database update
  //     console.error("Error updating the database:", error);
  //     res.status(500).send("Error updating the database");
  //   });

  db.one('SELECT complains FROM complaintbox WHERE id = $1', [id])
    .then((result) => {
      const existingComplains = result.complains || {}; // Parse the JSON data


      // Determine how many complaints exist
      const complaintCount = Object.keys(existingComplains).length;

      if (complaintCount < 3) {
        // There is space for a new complaint
        // Add the new complaint to the JSON data with a status of "open"
        const newComplaintIndex = complaintCount + 1;
        existingComplains[`complaint${newComplaintIndex}`] = {
          text: complaintText,
          status: "open",
        };

        // Update the "complains" JSON column with the new JSON data
        db.none(
          'UPDATE complaintbox SET complains = $1 WHERE id = $2',
          [existingComplains, id]
        )
          .then(() => {
            res.send("Your complaint has been received and updated.");
          })
          .catch((error) => {
            console.error("Error updating the database:", error);
            res.status(500).send("Error updating the database");
          });
      } else {
        // Limit of 3 complaints reached
        res.send("Only 3 complaints are allowed to be open at a time");
      }
    })
    .catch((error) => {
      console.error("Error fetching existing data from the database:", error);
      res.status(500).send("Error fetching existing data from the database");
    });






  // Fetch the existing complaints associated with this ID
  // db.one(
  //   'SELECT complain_1, complain_2, complain_3 FROM complaintbox WHERE id = $1',
  //   [id]
  // )
  //   .then((result) => {
  //     // Determine how many complaints exist (how many columns are used)
  //     const existingComplaints = [result.complain_1, result.complain_2, result.complain_3];
  //     const complaintCount = existingComplaints.filter(Boolean).length;

  //     if (complaintCount < 3) {
  //       // There is space for a new complaint, find the next available column
  //       const nextColumnIndex = existingComplaints.findIndex(complaint => !complaint);
  //       const columnName = `complain_${nextColumnIndex + 1}`;

  //       // Update the corresponding column with the new complaint
  //       db.none(
  //         `UPDATE complaintbox SET ${columnName} = $1 WHERE id = $2`,
  //         [complaintText, id]
  //       )
  //         .then(() => {
  //           res.send("Your complaint has been received and updated.");
  //         })
  //         .catch((error) => {
  //           console.error("Error updating the database:", error);
  //           res.status(500).send("Error updating the database");
  //         });
  //     } else {
  //       // Limit of 3 complaints reached
  //       res.send("Only 3 complaints are allowed to be open at a time");
  //     }
  //   })
  //   .catch((error) => {
  //     console.error("Error fetching existing data from the database:", error);
  //     res.status(500).send("Error fetching existing data from the database");
  //   });



  // db.any('SELECT * FROM complaintbox WHERE id = $1', [id])
  //   .then((results) => {
  //     // Log the results to the console
  //     console.log('Data retrieved from complaintbox table:', results);
  //   })
  //   .catch((error) => {
  //     console.error('Error fetching data from the complaintbox table:', error);
  //     res.status(500).send('Error fetching data from the complaintbox table');
  //   });
});
