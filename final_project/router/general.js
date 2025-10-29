const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Unable to register user." });
});

async function fetchBooks() {
    return books;
}
// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const data = await fetchBooks();
        res.send(JSON.stringify(data, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Oops!" });
    }
});

async function getBook(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books[isbn]);
        }, 1000);
    });
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const data = await getBook(isbn);
        res.send(JSON.stringify(data, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Oops!" });
    }
});
async function searchBooks(text, attribute) {
    let results = {};
    const needle = text.toUpperCase();
    for (const [key, value] of Object.entries(books)) {
        if (value[attribute].toUpperCase().includes(needle)) {
            results[key] = value;
        }
    }
    return results;
}
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const data = await searchBooks(author, "author");
        if (Object.keys(data).length > 0) {
            res.send(JSON.stringify(data, null, 4));
        }
        else {
            return res.status(404).json({ message: "No books for this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Oops!" });
    }

});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const data = await searchBooks(title, "title");
        if (Object.keys(data).length > 0) {
            res.send(JSON.stringify(data, null, 4));
        }
        else {
            return res.status(404).json({ message: "No matching titles found." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Oops!" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    res.send(JSON.stringify(books[isbn]["reviews"]));
});


module.exports.general = public_users;
