const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();
const PORT = 8080; //default 8080

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  "9sm5xK": "http://www.google.com",
}

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "5678",
  },
}

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

function generateRandomString() {
  const randomNum = Math.random().toString(36).substring(2, 8);
  return randomNum;
}


app.get('/', (req, res) => {
  res.end('Hello!');
});

app.get('/urls', (req, res) => {
  const cookieId = req.cookies['user_id']
  const user = users[cookieId]
  console.log('result of cookieId: ', cookieId)

  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  console.log('result of templateVars:', templateVars);
  res.render('urls_index', templateVars);
})

// Go to create new URL page   USERNAME
app.get('/urls/new', (req, res) => {
  const cookieId = req.cookies['user_id'];
  const user = users[cookieId];
  const templateVars = {user: user }
  res.render('urls_new', templateVars);
})

// Go to specific URL in database
app.get('/urls/:id', (req, res) => {
  const cookieId = req.cookies['user_id']
  const user = users[cookieId];
  
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user
  }
  res.render('urls_show', templateVars);
})

app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
})

// create new url
app.post('/urls', (req, res) => {
  const newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
})

// edit the url
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
})

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if email or password not sent
  if (!email || !password) {
    return res.status(400).send('Please enter an email and password')
  }

  const foundUser = getUserByEmail(users, email);
  if (!foundUser) {
    return res.status(403).send('An account with that email does not exist')
  }
  if (foundUser.password !== password) {
    return res.status(403).send('The password you entered did not match')
  }
  console.log('foundUser.id is ', foundUser.id)
  res.cookie('user_id', foundUser.id)
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

// register user
app.get('/register', (req, res) => {
  res.render('register');
})

app.post('/register', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  // if email or password not sent
  if (!email || !password) {
    return res.status(400).send('Please enter an email and password')
  }

  // if email already exist
  const foundUser = getUserByEmail(users, email);
  if (foundUser) return res.status(400).send('Email already in use. Please use another.')

  const id = generateRandomString();
  const newUser = {
    id: id,
    email: email,
    password: password
  }

  users[id] = newUser;
  console.log(users)
  res.cookie('user_id', id);
  res.redirect('/urls');
})

app.get('/login', (req, res) => {

  res.render('login');
})

const getUserByEmail = function(users, email) {
  for (userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user
    }
  }
  return null
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});