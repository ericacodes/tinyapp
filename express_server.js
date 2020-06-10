const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;
const cookieParser = require('cookie-parser')

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

 app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// more specific 
app.get("/urls/new", (req, res) => { 
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// less specific 
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (!urlDatabase[req.params.shortURL].startsWith('http')) {
    longURL = `http://${urlDatabase[req.params.shortURL]}`;
  };
  let templateVars = { urls: urlDatabase };// username not needed since redirected?
  res.redirect(longURL, templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${short}`);
  let templateVars = { 
    shortURL : req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
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

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

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





