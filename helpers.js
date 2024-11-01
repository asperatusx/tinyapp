const getUserByEmail = function(users, email) {
  for (userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user
    }
  }
  return undefined
}

function urlsForUser(userId, urlDatabase) {
  const urlObj = {};
  for (let dataId in urlDatabase) {
    if (urlDatabase[dataId].userID === userId) {
      urlObj[dataId] = {longURL: urlDatabase[dataId].longURL};
    }
  }
  return urlObj;
}

module.exports = { getUserByEmail, urlsForUser };

