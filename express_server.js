const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;
const cookieParser = require('cookie-parser')

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW"}
};

const users = {};

 app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// more specific 
app.get("/urls/new", (req, res) => { 
  let templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// less specific 
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  if (!urlDatabase[req.params.shortURL].longURL.startsWith('http')) {
    longURL = `http://${urlDatabase[req.params.shortURL]}`;
  };
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] }
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: null }
  res.render("urls_login", templateVars);
})

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL
  const userID = req.cookies["user_id"]
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
  // let templateVars = { 
  //   shortURL : req.params.shortURL,
  //   longURL: urlDatabase[req.params.shortURL],
  //   user: users[req.cookies["user_id"]]
  // };
  // res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  console.log(req.params.longURL);
  console.log(typeof req.params.longURL);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email; 
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Email or password is empty.");
  } else if (lookupEmail(email)) {
    res.status(400).send("Email is already registered.");
  } else {
    addUser(userID, email, password);
    res.cookie("user_id", userID); // registers then logged in 
    res.redirect("urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!lookupEmail(email)) {
    res.status(403).send("Email has not been registered.");
  } else if (!authenticateUser(email, password)) {
    res.status(403).send("Incorrect password");
  } else {
    res.cookie("user_id", user.userID); // logged in 
    res.redirect("/urls");
  }
});

// returns user or undefined 
const authenticateUser = (email, password) => {
  const user = lookupEmail(email);
  if (user.password === password) {
    return user; 
  }
};

// returns user or undefined
const lookupEmail = (email) => {
  return Object.values(users).find(user => user.email === email);
};

const addUser = (userID, email, password) => {
  user = {
    userID, 
    email, 
    password
  }
  users[userID] = user; 
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const alphanumericCharacters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i <= 6; i++) {
    result += alphanumericCharacters.charAt(Math.floor(Math.random() * alphanumericCharacters.length));
  }
  return result;
}





