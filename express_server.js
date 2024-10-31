const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const morgan = require('morgan');
const app = express();
const PORT = 8080; //default 8080


const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


const users = {
  aJ48lW: {
    id: "aJ48lW",
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

function urlsForUser(id) {
  const urlObj = {};
  for (let dataId in urlDatabase) {
    if (urlDatabase[dataId].userID === id) {
      urlObj[dataId] = {longURL: urlDatabase[dataId].longURL};
    }
  }
  return urlObj;
}


app.get('/', (req, res) => {
  res.end('Hello!');
});

app.get('/urls', (req, res) => {
  const cookieId = req.cookies['user_id']
  const user = users[cookieId]

  if (!req.cookies['user_id']) {
    return res.send('Login to view your URLs. If you do not have an account, create one.')
  }

  const userURLs = urlsForUser(cookieId);
  console.log('result of cookieId: ', req.cookies)

  const templateVars = {
    urls: userURLs,
    user: user
  };
  console.log('result of templateVars:', templateVars);
  res.render('urls_index', templateVars);
})

// Go to create new URL page 
app.get('/urls/new', (req, res) => {
  const cookieId = req.cookies['user_id'];
  const user = users[cookieId];
  const templateVars = {user: user }
  
  if (!cookieId) {
    return res.redirect('/login')
  }
  
  res.render('urls_new', templateVars);
})

// Go to specific URL in database
app.get('/urls/:id', (req, res) => {
  const cookieId = req.cookies['user_id']
  const user = users[cookieId];
  const paramURL = req.params.id;

  if (!cookieId) {
    return res.send('You do not have access to URL. Please Log in.')
  }
  
  if (cookieId !== urlDatabase[paramURL].userID) {
    return res.send('This URL does not belong to you. You do not have access.')
  }
  
  const templateVars = {
    id: paramURL,
    longURL: urlDatabase[req.params.id].longURL,
    user: user
  }
  res.render('urls_show', templateVars);
})

app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id].longURL) {
    return res.send('Error! This shorthand URL does not exist!')
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
})

// create new url
app.post('/urls', (req, res) => {
  const cookieId = req.cookies['user_id']
  if (!cookieId) {
    return res.send('Cannot shorten URL because you are not logged in. If you don"t have an account, please create one.')
  }
  const newId = generateRandomString();
  urlDatabase[newId] = {longURL: req.body.longURL, userID: cookieId};
  res.redirect(`/urls/${newId}`);
})

// edit the url
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const cookieId = req.cookies['user_id'];

  if (!urlDatabase[id].longURL) {
    return res.send('Error! Cannot edit a url if it does not exist!')
  }
  if (!cookieId) {
    return res.send('You do not have permission to edit. Please Log in.')
  }
  if (urlDatabase[id].userID !== cookieId) {
    return res.send('You do not own this URL. Cannot edit something that you do not own.')
  }

  urlDatabase[id].longURL = req.body.longURL;
  res.redirect('/urls');
})

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const cookieId = req.cookies['user_id']

  if (!urlDatabase[id]) {
    return res.send('The url you are trying to delete does not exist')
  }
  if (!cookieId) {
    return res.send('You do not have permission to delete. Please Log in.')
  }
  if (urlDatabase[id].userID !== cookieId) {
    return res.send('You do not own this URL. Cannot delete something that you do not own.')
  }

  delete urlDatabase[id];
  res.redirect('/urls');
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = getUserByEmail(users, email);
  // if email or password not sent
  if (!email || !password) {
    return res.status(400).send('Please enter an email and password')
  }

  const isPassword = bcrypt.compareSync(password, foundUser.password);
 
  if (!foundUser) {
    return res.status(403).send('An account with that email does not exist')
  }
  if (!isPassword) {
    return res.status(403).send('The password you entered did not match')
  }

  res.cookie('user_id', foundUser.id)
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
})

// register user
app.get('/register', (req, res) => {
  if (req.cookies['user_id']) {
    return res.redirect('/urls')
  }
  const cookieId = req.cookies['user_id'];
  const user = users[cookieId];
  const templateVars = {user: user }
  res.render('register', templateVars);
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

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  const newUser = {
    id: id,
    email: email,
    password: hashedPassword
  }
  users[id] = newUser;

  res.cookie('user_id', id);
  res.redirect('/urls');
})

app.get('/login', (req, res) => {
  const cookieId = req.cookies['user_id'];
  const user = users[cookieId];
  
  if (req.cookies['user_id']) {
    return res.redirect('/urls')
  }
  
  const templateVars = {user: user }
  res.render('login', templateVars);
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