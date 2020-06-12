const { assert } = require('chai');
const bcrypt = require('bcrypt');

const { lookupEmail, authenticateUser, addUser, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    userID: "userRandomID",
    email: "user@example.com",
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    userID: "user2RandomID",
    email: "user2@example.com",
    hasehdPassword: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const testURLs = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW"},
  "sdghkj": { longURL: "http://www.instagram.com", userID: "qwerty"}
};

describe('lookupEmail', function() {
  it('should return a user for a valid email', function() {
    const user = lookupEmail("user@example.com", testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined for an invalid email', function() {
    const user = lookupEmail("ericasun123@yahoo.ca", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe('authenticateUser', function() {
  it("should return a user for a valid email and correct password", function() {
    const user = authenticateUser("user@example.com", "purple-monkey-dinosaur", testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.deepEqual(user, expectedOutput);
  });
  it("should return undefined for a valid email and incorrect password", function() {
    const actual = authenticateUser("user@example.com", "hellooooo", testUsers);
    const expected = undefined; 
    assert.equal(actual, expected);
  })
  it("should return undefined for an invalid email", function() {
    const actual = authenticateUser("user@example.commmmm", "hellooooo", testUsers);
    const expected = undefined; 
    assert.equal(actual, expected);
  });
});

describe('addUser', function() {
  it("should add user to database", function() {
    const hashedPassword = bcrypt.hashSync("myPassword", 10)
    const addedUser = addUser("myUserID", "ericasun@example.com", hashedPassword, testUsers);
    const actual = testUsers["myUserID"]; 
    const expected = {
      userID: "myUserID",
      email: "ericasun@example.com",
      hashedPassword
    };
    console.log(actual);
    console.log(expected);
    assert.deepEqual(actual, expected);
  });
});

describe('generateRandomString', function() {
  it("should return a random string", function() {
    const id = generateRandomString();
    const idType = typeof id; 
    const idLength = id.length; 
    assert.equal(idType, "string");
    assert.equal(idLength, 6);
  });
});
  
describe('urlsForUser', function() {
  it("should return object containing urls made by user for valid id", function() {
    const actual = urlsForUser("aJ48lW", testURLs);
    const expected = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
      "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW"}
    };
    assert.deepEqual(actual, expected);
  });
  it("should return an empty object for invalid id", function() {
    const actual = urlsForUser("aJ48sfgkdhjslW", testURLs);
    const expected = {};
    assert.deepEqual(actual, expected);
  });
});
