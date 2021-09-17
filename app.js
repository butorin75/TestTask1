console.log("TestTask 1.0.0");

const config = require('./dbcfg.json');
const mysql  = require('mysql');
const axios = require('axios');

// Initialize mysql with host/user/password from config and create the table 
let connection = mysql.createConnection(config);
connection.connect();
connection.query('CREATE TABLE IF NOT EXISTS users(' +
    'id int NOT NULL PRIMARY KEY,' +
    'first_name varchar(255) NOT NULL,' +
    'last_name varchar(255) NOT NULL,' +
    'email varchar(255) NOT NULL,' +
    'avatar varchar(4096) NOT NULL)');

// Total number of pages to parse
let pages_total = Number.MAX_SAFE_INTEGER;

// Loads a page and finds all users on it
function loadPage(page){
    let url = 'https://reqres.in/api/users?page=' + page.toString();
    console.log('RQ: ' + url)
    axios.get(url)
    .then((response) => {
        for(const user of response.data.data)
            connection.query('INSERT IGNORE INTO users SET ?', user)
        --pages_total;
        if (!pages_total)
            connection.end(); // After all pages being parsed -> close the connection
    })
    .catch(error => {
        console.log(error)
    });
}

// Get the main page and run the loop for each page
axios.get('https://reqres.in/api/users')
  .then(response => {
    pages_total = response.data.total_pages;
    console.log('Pages: ' + pages_total);
    for(let page = 1; page <= pages_total; ++page)
        loadPage(page)
  })
  .catch(error => {
    console.log(error)
  });


