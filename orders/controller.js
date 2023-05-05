const pool = require('../db/index');
const { Router } = require('express');

const addOrder = (req, res) => {
    const { orderid, userid, productid, orderdate, address } = req.body;
    const sql = "INSERT INTO orders (orderid, userid, productid, orderdate, address) VALUES ($1, $2, $3, $4, $5)";

    try {
        pool.query(sql, [orderid, userid, productid, orderdate, address], (err, results) => {
            if (err) throw err;
            res.status(201).json({ msg: "Order received" })
        })
    } catch (error) {
        res.sendStatus(500);
    }
}

const getOrder = (req, res) => {
    const userId = req.params.id;
    const sql = "SELECT * FROM orders WHERE userid = $1";

    try {
        pool.query(sql, [userId], (err, results) => {
            if (err) throw err;
            res.status(201).json(results.rows);
        })
    } catch (error) {
        res.sendStatus(500);
    }
}

const router = Router();

router.post("/", addOrder);
router.get("/:id", getOrder);

module.exports = router;