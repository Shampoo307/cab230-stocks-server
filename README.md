# cab230-stocks-server

This server-side university project is an Express based API app made to serve up JSON data upon request from an outside source.
It works with a MySQL database dump populated with stock information from the American stock exchange, and based on
the GET or POST requests serves up general data, or data from within a specified time frame, or returns an error and its respective
status code. It also has authentication through use of JWT, and stores user information in the database with the passwords stored
as a hash, done through hashing and salting with bcrpyt.
