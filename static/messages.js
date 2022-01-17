const express = require('express');
const { sequelize, Users, Messages } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const { QueryTypes } = require('sequelize');

const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({ extended: true }));
route.use(cors());

function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    // if (token == null) return res.status(401).json({ msg: "greska" });
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    
        //if (err) return res.status(403).json({ msg: err });
    
        req.user = user;
    
        next();
    });
}

//route.use(authToken);

route.get('/users', (req, res) => {
    sequelize.query("SELECT * FROM `users`")
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

route.get('/messages', (req, res) => {
    sequelize.query("SELECT * FROM `messages`", { type: QueryTypes.SELECT })
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});
route.get('/products', (req, res) => {
    sequelize.query("SELECT * FROM `product`")
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});
route.post('/add_comment', (req, res) => {
    sequelize.query("INSERT INTO messages (id, user_id, product_id, body, posted_date, last_updated) VALUES (NULL, '"+req.body.user_id+"', '"+req.body.product_id+"', '"+req.body.body+"', '"+req.body.posted_date+"', '"+req.body.last_update+"')")
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});
route.post('/getusername', (req, res) => {
    sequelize.query("SELECT username FROM users WHERE id="+req.body.user_id+"", { type: QueryTypes.SELECT })
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});
route.post('/messages', (req, res) => {
    
    Users.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.admin) {
                Messages.create({ body: req.body.body, userId: req.user.userId })
                    .then( rows => res.json(rows) )
                    .catch( err => res.status(500).json(err) );
            } else {
                res.status(403).json({ msg: "Invalid credentials"});
            }
        })
        .catch( err => res.status(500).json(err) );
        
});

module.exports = route;