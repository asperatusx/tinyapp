const getUserByEmail = function(users, email) {
  for (userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user
    }
  }
  return null
}

module.exports = { getUserByEmail };