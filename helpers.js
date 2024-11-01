const getUserByEmail = function(users, email) {
  for (userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user
    }
  }
  return undefined
}

module.exports = { getUserByEmail };