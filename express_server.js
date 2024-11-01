const express = require('express');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const morgan = require('morgan');
const { getUserByEmail, urlsForUser } = require('./helpers');
const app = express();
const PORT = 8080;

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i2AoDz: {
    longURL: "https://www.youtube.com",
    userID: "user2RandomID",
  },
};

const tempPassword = bcrypt.hashSync('1234', 10);
const temp2Password = bcrypt.hashSync('5678', 10);

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "a@a.com",
    password: tempPassword,
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: temp2Password,
  },
};

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'whatever',
  keys: ['abc123'],
}));

// Generates a random alphanumeric string of 6 characters for the short URL.
const generateRandomString = function() {
  const randomNum = Math.random().toString(36).substring(2, 8);
  return randomNum;
};

// Redirect to appropriate page based on login status
app.get('/', (req, res) => {
  if (req.session.userID) {
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

// Display all the user's URLs
app.get('/urls', (req, res) => {
  const cookieId = req.session.userID;
  const user = users[cookieId];

  if (!req.session.userID) {
    return res.send('Login to view your URLs. If you do not have an account, create one.');
  }

  const userURLs = urlsForUser(cookieId, urlDatabase);
  const templateVars = {
    urls: userURLs,
    user: user
  };

  res.render('urls_index', templateVars);
});

// Display the page to create new URL
app.get('/urls/new', (req, res) => {
  const cookieId = req.session.userID;
  const user = users[cookieId];
  const templateVars = {user: user };
  
  if (!cookieId) {
    return res.redirect('/login');
  }
  
  res.render('urls_new', templateVars);
});

// Go to specific URL in database
app.get('/urls/:id', (req, res) => {
  const cookieId = req.session.userID;
  const user = users[cookieId];
  const paramURL = req.params.id;

  if (!cookieId) {
    return res.send('You do not have access to URL. Please Log in.');
  }
  if (cookieId !== urlDatabase[paramURL].userID) {
    return res.send('This URL does not belong to you. You do not have access.');
  }
  
  const templateVars = {
    id: paramURL,
    longURL: urlDatabase[req.params.id].longURL,
    user: user
  };
  res.render('urls_show', templateVars);
});

// When provided existing short URL it will redirect to long URL
app.get('/u/:id', (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id] || !urlDatabase[id].longURL) {
    return res.send('Error! This shorthand URL does not exist!');
  }

  let longURL = urlDatabase[id].longURL;
  const httpString = 'https://www.';
  if (!longURL.includes(httpString)) {
    longURL = httpString + longURL;
  }
  res.redirect(longURL);
});

// Create new url with unique Id
app.post('/urls', (req, res) => {
  const cookieId = req.session.userID;
  if (!cookieId) {
    return res.send('Cannot shorten URL because you are not logged in. If you don"t have an account, please create one.');
  }
  const newId = generateRandomString();
  urlDatabase[newId] = {longURL: req.body.longURL, userID: cookieId};
  res.redirect(`/urls/${newId}`);
});

// Edit the existing URL
app.put('/urls/:id', (req, res) => {
  const id = req.params.id;
  const cookieId = req.session.userID;

  if (!urlDatabase[id].longURL) {
    return res.send('Error! Cannot edit a url if it does not exist!');
  }
  if (!cookieId) {
    return res.send('You do not have permission to edit. Please Log in.');
  }
  if (urlDatabase[id].userID !== cookieId) {
    return res.send('You do not own this URL. Cannot edit something that you do not own.');
  }

  urlDatabase[id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// Delete a URL
app.delete('/urls/:id', (req, res) => {
  const id = req.params.id;
  const cookieId = req.session.userID;

  if (!urlDatabase[id]) {
    return res.send('The url you are trying to delete does not exist');
  }
  if (!cookieId) {
    return res.send('You do not have permission to delete. Please Log in.');
  }
  if (urlDatabase[id].userID !== cookieId) {
    return res.send('You do not own this URL. Cannot delete something that you do not own.');
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const cookieId = req.session.userID;
  const user = users[cookieId];
  
  if (req.session.userID) {
    return res.redirect('/urls');
  }
  
  const templateVars = {user: user };
  res.render('login', templateVars);
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = getUserByEmail(users, email);

  // if email or password not sent
  if (!email || !password) {
    return res.status(400).send('Please enter an email and password');
  }
  if (!foundUser) {
    return res.status(403).send('An account with that email does not exist');
  }

  const isPassword = bcrypt.compareSync(password, foundUser.password);
  if (!isPassword) {
    return res.status(403).send('The password you entered did not match');
  }

  req.session.userID = foundUser.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  if (req.session.userID) {
    return res.redirect('/urls');
  }
  const cookieId = req.session.userID;
  const user = users[cookieId];
  const templateVars = {user: user };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if email or password not sent
  if (!email || !password) {
    return res.status(400).send('Please enter an email and password');
  }

  // if email already exist
  const foundUser = getUserByEmail(users, email);
  if (foundUser) return res.status(400).send('Email already in use. Please use another.');

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  const newUser = {
    id: id,
    email: email,
    password: hashedPassword
  };
  users[id] = newUser;

  req.session.userID = id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});