const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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
  })
})