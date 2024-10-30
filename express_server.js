const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default 8080

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  "9sm5xK": "http://www.google.com",
}

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  const randomNum = Math.random().toString(36).substring(2, 8);
  return randomNum;
}


app.get('/', (req, res) => {
  res.end('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
})

// Go to create new URL page
app.get('/urls/new', (req, res) => {
  const templateVars = {username: req.cookies['username']}
  res.render('urls_new', templateVars);
})

// Go to specific URL in database
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username']
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
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  console.log('hello')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});