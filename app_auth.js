const express = require('express');
const { sequelize } = require('./models');
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt');                                   //npm install _______ express,bcryps,sequelize
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

app.post('/register', (req, res) => {

    const obj = {
        name: req.body.name,
        email: req.body.email,
        admin: req.body.admin,
        password: bcrypt.hashSync(req.body.password, 10)
    };
    var curTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    sequelize.query('INSERT INTO users (id, username, password, admin, registered, last_login) VALUES(null, "'+obj.name+'", "'+obj.password+'", "'+obj.admin+'", "'+curTime+'", "'+curTime+'")')
    .then( rows => {
        
        const usr = {
            userId: rows.id,
            user: rows.name
        };

        const token = jwt.sign(usr, process.env.ACCESS_TOKEN_SECRET);

        console.log(token);
        
        res.json({ token: token });

    }).catch( err => res.status(500).json(err) );
});

app.post('/login', (req, res) => {
    sequelize.query('SELECT * FROM users WHERE username="'+req.body.name+'" AND password="'+req.body.password+'" LIMIT 1', { type: QueryTypes.SELECT })
        .then( usr => {
            let selectedUser = {};
            if (usr[0]){
                selectedUser = usr[0];
            }
            if (selectedUser.id) {
                const obj = {
                    userId: selectedUser.id,
                    user: selectedUser.username,
                    admin: selectedUser.admin
                };
                return res.json({obj});
            } else {
                return res.status(400).json({ msg: "Invalid credentials"});
            }
        }).catch( err => res.status(500).json(err) );
});

app.listen({ port: 9000 }, async () => {
    await sequelize.authenticate();
});