// router/auth_users.js
const express = require('express');
const regd_users = express.Router();
let books = require('./booksdb.js');

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  if (books[isbn]) {
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = review;
    return res.status(200).send(`Review for book with ISBN ${isbn} added/updated.`);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn] && books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).send(`Review for book with ISBN ${isbn} by user ${username} deleted.`);
  } else {
    return res.status(404).json({ message: "Review not found or book not found" });
  }
});

module.exports.authenticated = regd_users;