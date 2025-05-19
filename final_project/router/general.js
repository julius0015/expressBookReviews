// router/general.js
const express = require('express');
const public_users = express.Router();
let books = require('./booksdb.js');
let users = {};
const jwt = require('jsonwebtoken'); // Import jwt here

public_users.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users[username]) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users[username] = password; // In a real app, hash the password!
  return res.status(201).json({ message: "User registered successfully" });
});

public_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in: Username and password required" });
  }
  if (users[username] && users[username] === password) {
    const accessToken = jwt.sign({ data: username }, 'secretkey'); // Replace 'secretkey' with your actual secret
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

public_users.get('/', async (req, res) => {
  try {
    const allBooks = await new Promise((resolve) => {
      resolve({ books: books });
    });
    res.status(200).json(JSON.stringify(allBooks, null, 2));
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ message: "Book not found" });
    }
  })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json(err));
});

public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const booksByAuthor = await new Promise((resolve) => {
      resolve(Object.values(books).filter(book => book.author === author));
    });
    if (booksByAuthor.length > 0) {
      res.status(200).json(booksByAuthor);
    } else {
      res.status(404).json({ message: "No books found by that author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author" });
  }
});

public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const booksByTitle = await new Promise((resolve) => {
      resolve(Object.values(books).filter(book => book.title === title));
    });
    if (booksByTitle.length > 0) {
      res.status(200).json(booksByTitle);
    } else {
      res.status(404).json({ message: "No books found with that title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by title" });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn] && books[isbn].reviews) {
    res.status(200).json(books[isbn].reviews);
  } else if (!books[isbn]) {
    res.status(404).json({ message: "Book not found" });
  } else {
    res.status(200).json({}); // No reviews found
  }
});

module.exports.general = public_users;
module.exports.users = users;