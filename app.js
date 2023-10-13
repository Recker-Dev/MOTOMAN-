const express = require("express");
const app = express();
const https = require("https");
require('dotenv').config();

// Serve static files from the "public" directory
app.use(express.static("public"));

app.set("view engine", "ejs");
// Middleware setup
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data in the request body



const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;








app.get("/", function (req, res) {
  
  res.sendFile(__dirname + "/cleanchan.html");
});

app.get("/", function (req, res) {
  
  res.sendFile(__dirname + "/cleanchan.html");
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
