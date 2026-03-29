const express = require("express")
const mysql = require("mysql2")
const cors = require("cors")
const bcrypt = require("bcrypt")

const app = express()

app.use(cors())
app.use(express.json())

// ✅ MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Kanishka@11",   // put your mysql password here
    database: "placementprep"
})

db.connect(err => {
    if (err) {
        console.log("DB Error:", err)
    } else {
        console.log("MySQL Connected ✅")
    }
})
// app.get("/", (req, res) => {
//     res.send("Backend is running 🚀")
// })

// ✅ REGISTER API

app.post("/register", async (req, res) => {

    const { name, email, password, branch, graduation_year } = req.body

    try {

        const hashedPassword = await bcrypt.hash(password, 10)

        const sql = `
        INSERT INTO users (name, email, password, branch, graduation_year)
        VALUES (?, ?, ?, ?, ?)
        `

        db.query(sql, [name, email, hashedPassword, branch, graduation_year], (err, result) => {

            if (err) {
                console.log(err)
                return res.status(500).json({ message: "User already exists or DB error" })
            }

            res.json({ message: "User Registered Successfully ✅" })

        })

    } catch (err) {
        res.status(500).json({ message: "Server Error" })
    }

})


// ✅ LOGIN API

app.post("/login", (req, res) => {

    const { email, password } = req.body

    const sql = "SELECT * FROM users WHERE email = ?"

    db.query(sql, [email], async (err, result) => {

        if (err) return res.status(500).json({ message: "DB Error" })

        if (result.length === 0) {
            return res.status(400).json({ message: "User not found" })
        }

        const user = result[0]

        const match = await bcrypt.compare(password, user.password)

        if (!match) {
            return res.status(400).json({ message: "Wrong password" })
        }

        res.json({ message: "Login successful ✅", user })

    })

})

// Forgot password

app.post("/reset-password", async (req, res) => {

    const { email, newPassword } = req.body

    try {

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        const sql = "UPDATE users SET password = ? WHERE email = ?"

        db.query(sql, [hashedPassword, email], (err, result) => {

            if (err) {
                return res.status(500).json({ message: "DB Error" })
            }

            if (result.affectedRows === 0) {
                return res.status(400).json({ message: "User not found" })
            }

            res.json({ message: "Password updated successfully ✅" })

        })

    } catch (err) {
        res.status(500).json({ message: "Server Error" })
    }

})

//register Validation
app.post("/register", async (req, res) => {

    const { name, email, password, branch, graduation_year } = req.body

    // ✅ BACKEND VALIDATION
    if (!name || !email || !password || !branch || !graduation_year) {
        return res.status(400).json({ message: "All fields are required" })
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password too short" })
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10)

        const sql = `
        INSERT INTO users (name, email, password, branch, graduation_year)
        VALUES (?, ?, ?, ?, ?)
        `

        db.query(sql, [name, email, hashedPassword, branch, graduation_year], (err, result) => {

            if (err) {
                return res.status(500).json({ message: "User already exists" })
            }

            res.json({ message: "User Registered Successfully ✅" })

        })

    } catch (err) {
        res.status(500).json({ message: "Server Error" })
    }

})

// ✅ START SERVER

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000 🚀")
})
