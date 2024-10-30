const express = require('express');
const app = express();
const PORT = 8080; //default 8080

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  "9sm5xK": "http://www.google.com",
}

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  const randomNum = Math.random().toString(36).substring(2,8);
  return randomNum;
}


app.get('/', (req, res) => {
  res.end('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]}
  res.render('urls_show', templateVars);
})

app.post('/urls', (req, res) => {
  const newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`urls/${newId}`);
})


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});