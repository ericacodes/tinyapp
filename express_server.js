// -------------------------------------------- SETUP --------------------------------------------------

// Require necessary modules and initialize other constants
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const { lookupEmail, authenticateUser, addUser, generateRandomString, urlsForUser } = require('./helpers');

// Specify other setup configurations
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["awepgkns", "walsdgjwnsf"]
}));

// Initialize url and user databases
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW"}
};
const usersDatabase = {};

// ---------------------------------------------- ROUTERS ----------------------------------------------

// GET REQUESTS
// Read urls_index page
app.get("/", (req,res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    const templateVars = {
      urls: urlsForUser(userID, urlDatabase),
      user: usersDatabase[userID]
    };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = { user: null };
    res.render("urls_errorNotLoggedIn", templateVars);
  }
});

// Read urls_new page
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    const templateVars = {
      urls: urlDatabase,
      user: usersDatabase[userID]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Read urls_show page associated to shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  
  // Is the user logged in?
  if (!userID) {
    const templateVars = { user: null };
    res.render("urls_errorNotLoggedIn", templateVars);
  // Is the requested shortURL valid?
  } else if (!urlDatabase[shortURL]) {
    const templateVars = { user: usersDatabase[userID] };
    res.render("urls_errorInvalidShortURL", templateVars);
  // Is the user the owner of the short URL?
  } else if (userID !== urlDatabase[shortURL].userID) {
    const templateVars = { user: usersDatabase[userID] };
    res.render("urls_errorNotOwner", templateVars);
  } else {
    const templateVars = {
      shortURL,
      longURL : urlDatabase[shortURL].longURL,
      user: usersDatabase[userID]
    };
    res.render("urls_show", templateVars);
  }
});

// Read longURL page associated to shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    const templateVars = { user: usersDatabase[req.session.user_id] };
    res.render("urls_errorInvalidShortURL", templateVars);
  } else {
    let longURL = urlDatabase[shortURL].longURL;
    if (!longURL.startsWith('http')) {
      longURL = `http://${longURL}`;
    }
    res.redirect(longURL);
  }
});

// Read register page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: usersDatabase[userID] };
    res.render("urls_register", templateVars);
  }
});

// Read login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: null };
    res.render("urls_login", templateVars);
  }
});

// POST REQUESTS
// Create new shortURL
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL, userID };
    res.redirect(`/urls/${shortURL}`);
  } else {
    const templateVars = { user: null };
    res.render("urls_errorNotLoggedIn", templateVars);
  }
});

// Delete shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;

  // Is the user logged in?
  if (!userID) {
    const templateVars = { user: null };
    res.render("urls_errorNotLoggedIn", templateVars);
  // Is the requested shortURL valid?
  } else if (!urlDatabase[shortURL]) {
    const templateVars = { user: usersDatabase[userID] };
    res.render("urls_errorInvalidShortURL", templateVars);
  // Is the user the owner of the short URL?
  } else if (userID !== urlDatabase[shortURL].userID) {
    const templateVars = { user: usersDatabase[userID] };
    res.render("urls_errorNotOwner", templateVars);
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

// Edit shortURL
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;

  // Is the user logged in?
  if (!userID) {
    const templateVars = { user: null };
    res.render("urls_errorNotLoggedIn", templateVars);
  // Is the requested shortURL valid?
  } else if (!urlDatabase[shortURL]) {
    const templateVars = { user: usersDatabase[userID] };
    res.render("urls_errorInvalidShortURL", templateVars);
  // Is the user the owner of the short URL?
  } else if (userID !== urlDatabase[shortURL].userID) {
    const templateVars = { user: usersDatabase[userID] };
    res.render("urls_errorNotOwner", templateVars);
  } else {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

// Logout current user
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

// Register user
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const templateVars = { user: null };

  if (lookupEmail(email, usersDatabase)) {
    res.status(400).render("urls_errorAlreadyRegistered", templateVars);
  } else {
    addUser(userID, email, hashedPassword, usersDatabase);
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// Login user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, usersDatabase);
  const templateVars = { user: null };

  if (!lookupEmail(email, usersDatabase)) {
    res.status(403).render("urls_errorUnregistered", templateVars);
  } else if (!user) {
    res.status(403).render("urls_errorIncorrectPassword", templateVars);
  } else {
    req.session.user_id = user.userID;
    res.redirect("/urls");
  }
});

// ---------------------------------------- CREATE SERVER ------------------------------------------------

// Create server on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
