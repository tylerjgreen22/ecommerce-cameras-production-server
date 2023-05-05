const pool = require('../db/index');
const { Router } = require('express');
const path = require('node:path');

const getProducts = (req, res) => {
    const sql = "SELECT * FROM products";
    try {
        pool.query(sql, (error, results) => {
            if (error) throw error;
            res.status(200).json(results.rows);
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}


const getOneProduct = (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM products WHERE id = $1";

    try {
        pool.query(sql, [id], (error, results) => {
            if (error) throw error;
            res.status(200).json(results.rows);
        })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}

const addProduct = (req, res) => {
    const { productname, price, productdesc, category, img, sale, bestseller } = req.body;
    const file = req.files.file;
    const sql = "INSERT INTO products (productname, price, productdesc, category, img, sale, bestseller) VALUES ($1, $2, $3, $4, $5, $6, $7)";

    try {
        file.mv(path.join(__dirname, '..', "public", "assets", file.name), err => {
            if (err) {
                res.sendStatus(500);
            }
        })

        pool.query(sql, [productname, price, productdesc, category, img, sale, bestseller], (error, results) => {
            if (error) throw error;
            res.status(201).json({ msg: "Product added" });
        });
    } catch (error) {
        res.sendStatus(500);
    }
}

const updateProduct = (req, res) => {
    const id = req.params.id;
    const { productname, price, productdesc, category, img, sale, bestseller } = req.body;
    console.log(bestseller);
    const sql = "UPDATE products SET productname = $1, price = $2, productdesc = $3, category = $4, img = $5, sale = $6, bestseller = $7 WHERE id = $8";

    try {
        if (req.files) {
            const file = req.files.file
            file.mv(path.join(__dirname, '..', "public", "assets", file.name), err => {
                if (err) {
                    res.sendStatus(500);
                }
            })
        }

        pool.query(sql, [productname, price, productdesc, category, img, sale, bestseller, id], (error, results) => {
            if (error) throw error;
            res.status(200).json({ msg: "Product updated" });
        });
    } catch (error) {
        res.sendStatus(500);
    }

}

const deleteProduct = (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM products WHERE id = $1";

    try {
        pool.query(sql, [id], (error, results) => {
            if (error) throw error;
            res.sendStatus(204);
        })
    } catch (error) {
        res.sendStatus(500);
    }

}

const router = Router();

router.get("/", getProducts);
router.get("/:id", getOneProduct);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;