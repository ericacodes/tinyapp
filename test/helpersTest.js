const { assert } = require('chai');
const bcrypt = require('bcrypt');

const { lookupEmail, authenticateUser } = require('../helpers.js');

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

describe('lookupEmail', function() {
  it('should return a user with valid email', function() {
    const user = lookupEmail("user@example.com", testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined for invalid email', function() {
    const user = lookupEmail("ericasun123@yahoo.ca", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe('authenticateUser', function() {
  it("should return user for valid email and password", function() {
    const user = authenticateUser("user@example.com", "purple-monkey-dinosaur", testUsers);
    const expectedOutput = testUsers.userRandomID;
    console.log(user);
    console.log(expectedOutput);
    assert.deepEqual(user, expectedOutput);
  });
});
