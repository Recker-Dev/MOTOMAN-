// Import the Express framework
const express = require("express");

// Create an instance of the Express application
const app = express();

// Import the HTTPS module
const https = require("https");

// Serve static files from the "public" directory
app.use(express.static("public"));

app.set("view engine", "ejs");

// Middleware setup
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data in the request body

// Define a route to serve the signup.html file
app.get("/", function (req, res) {
  // Use __dirname to get the current directory and directly specify the file path
  res.sendFile(__dirname + "/cleanchan.html");
});

app.get("/", function (req, res) {
  // Use __dirname to get the current directory and directly specify the file path
  res.sendFile(__dirname + "/cleanchan.html");
});

app.get("/boyshostel", function (req, res) {
  // Use __dirname to get the current directory and directly specify the file path
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
