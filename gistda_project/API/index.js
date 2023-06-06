const { Client } = require("pg");
const dotenv = require("dotenv");
const express = require("express");

dotenv.config();

const app = express();
const port = 3000;

// Database connection configuration
const dbConfig = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
};

app.get("/", async (req, res) => {
    try {
        const { query } = req.query;

        // Connect to the database
        const client = new Client(dbConfig);
        await client.connect();

        // Execute the SQL query
        const queryResult = await client.query(query);
        const result = queryResult.rows;

        // Send the result as JSON response
        res.json(result);

        // Close the database connection
        await client.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
