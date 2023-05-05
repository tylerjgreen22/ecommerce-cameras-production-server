require('dotenv').config()

const pool = require('../db/index');
const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    let { firstname, lastname, email, password, street, zip, state, city } = req.body;
    const moderator = false;
    const search = `SELECT * FROM users WHERE email = $1`
    const insert = "INSERT INTO users (firstname, lastname, email, password, street, zip, state, city, moderator) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        password = hashedPassword;
    } catch (error) {
        res.sendStatus(500);
    }

    try {
        pool.query(search, [email], (err, results) => {
            if (err) throw err;
            if (results.rows.length) {
                res.status(200).json({ msg: "Email already registered" })
            } else {
                try {
                    pool.query(insert, [firstname, lastname, email, password, street, zip, state, city, moderator], (err, result) => {
                        if (err) throw err;
                        res.status(201).json({ msg: "User Created" })
                    })
                } catch (error) {
                    res.sendStatus(500);
                }
            }
        })
    } catch (error) {
        res.sendStatus(500);
    }


};

const loginUser = (req, res) => {
    const sql = "SELECT * FROM Users WHERE email = $1";
    const email = req.body.email;

    try {
        pool.query(sql, [email], async (err, results) => {
            if (err) throw err;
            const user = results.rows[0];
            if (user) {
                try {
                    if (await bcrypt.compare(req.body.password, user.password)) {
                        const accessToken = jwt.sign(JSON.parse(JSON.stringify(user)), process.env.ACCESS_TOKEN_SECRET)
                        res.status(201).json({ accessToken: accessToken })
                    } else {
                        res.status(200).json({ msg: "Username or Password Incorrect" })
                    }
                } catch (err) {
                    res.sendStatus(500);
                }
            } else {
                res.status(200).json({ msg: "Username or Password Incorrect" })
            }
        })
    } catch (error) {
        res.sendStatus(500);
    }
}

const getUser = (req, res) => {
    try {
        const user = req.user
        res.status(200).json({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            street: user.street,
            city: user.city,
            state: user.state,
            zip: user.zip,
            isModerator: user.moderator
        });
    } catch (error) {
        res.sendStatus(500);
    }
}

const isModerator = (req, res) => {
    try {
        if (req.user.moderator) {
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        res.sendStatus(500);
    }
}

const editUser = async (req, res) => {
    let { firstname, lastname, email, password, street, zip, state, city } = req.body;
    const id = req.params.id;
    const search = `SELECT * FROM users WHERE email = $1`
    const update = "UPDATE users SET firstname = $1, lastname = $2, email = $3, password= $4, street = $5, zip = $6, state = $7, city = $8 WHERE id = $9";

    if (req.body.password) {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            password = hashedPassword;
        } catch (error) {
            res.sendStatus(500);
        }
    }

    try {
        pool.query(search, [email], (err, results) => {
            if (err) throw err;
            if (results.rows.length && results.rows[0].id != id) {
                res.status(200).json({ msg: "Email already registered" })
            } else {
                try {
                    pool.query(update, [firstname, lastname, email, password, street, zip, state, city, id], (err, result) => {
                        if (err) throw err;
                        res.status(200).json({ msg: "User Updated" })
                    });
                }
                catch (error) {
                    res.sendStatus(500);
                }
            }
        }
        );
    } catch (error) {
        res.sendStatus(500);
    }
}

function authToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ msg: "No Token" })

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ msg: "Bad Token" })
        req.user = user
        next()
    })
}

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user", authToken, getUser);
router.get("/mod", authToken, isModerator);
router.put("/user/:id", editUser);

module.exports = router;