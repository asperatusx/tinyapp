// Return the user object that matches the email
const getUserByEmail = function(users, email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

// Returns all the urls from the database that belongs to the specific user.
const urlsForUser = function(userId, urlDatabase) {
  const urlObj = {};
  for (let dataId in urlDatabase) {
    if (urlDatabase[dataId].userID === userId) {
      urlObj[dataId] = {longURL: urlDatabase[dataId].longURL};
    }
  }
  return urlObj;
};

module.exports = { getUserByEmail, urlsForUser };

