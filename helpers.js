// ------------------------------------------ HELPER FUNCTIONS ------------------------------------------
const bcrypt = require('bcrypt');

// Return user if email is registered. Otherwise undefined.
const lookupEmail = (email, usersDatabase) => {
  return Object.values(usersDatabase).find(user => user.email === email);
};

// Return user if password matches email. Otherwise undefined.
const authenticateUser = (email, password, usersDatabase) => {
  const user = lookupEmail(email, usersDatabase);
  // console.log("this da user", user);
  if (bcrypt.compareSync(password, user.hashedPassword)) {
    return user;
  }
};

// Add user to users database.
const addUser = (userID, email, hashedPassword, usersDatabase) => {
  const user = {
    userID,
    email,
    hashedPassword
  };
  usersDatabase[userID] = user;
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

// Return message string if not logged in or not owner. Otherwise true. 
const checkOwner = (shortURL, userID, urlDatabase) => {
  // return userID === urlDatabase[shortURL].userID;
  if (!userID) {
    return "Please login first."
  } else if (userID !== urlDatabase[shortURL].userID) {
    return "You are not the owner of this short URL."
  } else {
    return true; 
  }
};

// Return object containing urls made by user (could be empty)
const urlsForUser = (id, urlDatabase) => {
  const result = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }
  return result;
};


module.exports = { lookupEmail, authenticateUser, addUser, generateRandomString, checkOwner, urlsForUser };