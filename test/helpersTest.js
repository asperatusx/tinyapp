const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user object when provided with an email that exists in the database', () => {
    const user = getUserByEmail(testUsers, 'user@example.com');
    const expectedUserID = 'userRandomID';
    assert.deepEqual(user, testUsers[expectedUserID]);
  }),
  it('should return undefined if email is not in database', () => {
    const result = getUserByEmail(testUsers, 'unknown@email.com');
    assert.strictEqual(result, undefined);
  });
});

describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    const userID = 'user1';
    const urlDatabase = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2' },
      '6hj7F3': { longURL: 'http://www.example.com', userID: 'user1' }
    };

    const expectedOutput = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca' },
      '6hj7F3': { longURL: 'http://www.example.com' }
    };

    const result = urlsForUser(userID, urlDatabase);
    assert.deepEqual(result, expectedOutput, 'The function should return only the URLs that belong to the specified user, excluding userID');
  });

  it('should return an empty object if the user has no URLs', function() {
    const userID = 'user3';
    const urlDatabase = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2' },
      '6hj7F3': { longURL: 'http://www.example.com', userID: 'user1' }
    };

    const expectedOutput = {};

    const result = urlsForUser(userID, urlDatabase);
    assert.deepEqual(result, expectedOutput, 'The function should return an empty object if the user has no URLs');
  });

  it('should return an empty object if urlDatabase contains no URLs', function() {
    const userID = 'user1';
    const urlDatabase = {}; // Empty urlDatabase

    const expectedOutput = {};

    const result = urlsForUser(userID, urlDatabase);
    assert.deepEqual(result, expectedOutput, 'The function should return an empty object if urlDatabase contains no URLs');
  });

  it('should not return URLs that do not belong to the specified user', function() {
    const userID = 'user1';
    const urlDatabase = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user1' },
      '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2' },
      '6hj7F3': { longURL: 'http://www.example.com', userID: 'user1' },
      '4kL5mN': { longURL: 'http://www.yahoo.com', userID: 'user3' }
    };

    const expectedOutput = {
      'b2xVn2': { longURL: 'http://www.lighthouselabs.ca' },
      '6hj7F3': { longURL: 'http://www.example.com' }
    };

    const result = urlsForUser(userID, urlDatabase);
    assert.deepEqual(result, expectedOutput, 'The function should return only the URLs that belong to the specified user, excluding others');
  });
});