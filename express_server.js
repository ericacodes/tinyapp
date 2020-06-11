// ------------------------------------------ HELPER FUNCTIONS ------------------------------------------

// Require necessary modules and initialize other constants
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

// Specify other setup configurations
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

// Initialize url and user databases
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW"}
};
const users = {};

// Create server on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// ---------------------------------------------- ROUTERS ----------------------------------------------

// GET REQUESTS
// Read urls_index page
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  let templateVars = {
    urls: urlsForUser(userID),
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// Read urls_new page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// Read urls_show page associated to shortURL
app.get("/urls/:shortURL", (req, res) => { // helper function
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.send("Please login first");
  } else if (userID !== urlDatabase[shortURL].userID) {
    res.send("Not your URL");
  } else {
    let templateVars = {
      shortURL,
      longURL,
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_show", templateVars);
  }
});

// Read longURL page associated to shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  if (!urlDatabase[req.params.shortURL].longURL.startsWith('http')) {
    longURL = `http://${urlDatabase[req.params.shortURL]}`;
  }
  res.redirect(longURL);
});

// Read register page
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

// Read login page
app.get("/login", (req, res) => {
  let templateVars = { user: null };
  res.render("urls_login", templateVars);
});

// POST REQUESTS
// Create new shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

// Delete shortURL
app.post("/urls/:shortURL/delete", (req, res) => { // helper function
  const shortURL = req.params.shortURL;
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.send("Please login first");
  } else if (!checkOwner(shortURL, userID)) {
    res.send("Cannot delete. You are not the owner");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

// Edit shortURL
app.post("/urls/:shortURL", (req, res) => { // helper function
  const shortURL = req.params.shortURL;
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.send("Please login first");
  } else if (!checkOwner(shortURL, userID)) {
    res.send("Cannot edit. You are not the owner");
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

//
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send("Email or password is empty.");
  } else if (lookupEmail(email)) {
    res.status(400).send("Email is already registered.");
  } else {
    addUser(userID, email, hashedPassword);
    console.log(users);
    res.cookie("user_id", userID); // registers then logged in
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password);

  if (!lookupEmail(email)) {
    res.status(403).send("Email has not been registered.");
  } else if (!user) {
    res.status(403).send("Incorrect password");
  } else {
    res.cookie("user_id", user.userID); // logged in
    res.redirect("/urls");
  }
});

// ------------------------------------------ HELPER FUNCTIONS ------------------------------------------


// Return user if email is registered. Otherwise undefined.
const lookupEmail = (email) => {
  return Object.values(users).find(user => user.email === email);
};


// Return user if password matches email. Otherwise undefined.
const authenticateUser = (email, password) => {
  const user = lookupEmail(email);
  if (bcrypt.compareSync(password, user.hashedPassword)) {
    return user;
  }
};

// Add user to users database.
const addUser = (userID, email, hashedPassword) => {
  const user = {
    userID,
    email,
    hashedPassword
  };
  users[userID] = user;
};

// Return random alphanumeric string
const generateRandomString = () => {
  const alphanumericCharacters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i <= 5; i++) {
    result += alphanumericCharacters.charAt(Math.floor(Math.random() * alphanumericCharacters.length));
  }
  return result;
};

//
const checkOwner = (shortURL, userID) => {
  return userID === urlDatabase[shortURL].userID;
  // if (!userID) {
  //   return "Please login first."
  // } else if (userID !== urlDatabase[shortURL].userID) {
  //   return "You are not the owner of this short URL."
  // }
};

// Return object containing urls made by user (could be empty)
const urlsForUser = (id) => {
  const result = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }
  return result;
};





