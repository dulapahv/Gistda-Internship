const { Client } = require("pg");
const dotenv = require("dotenv");
const express = require("express");
const querystring = require("querystring");

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
        const query = req.url.split("?")[1];
        const queryParams = querystring.parse(query, "&", "=");

        // Extract table name and query conditions from queryParams
        const tableName = queryParams.table;

        // Remove reserved parameters from queryParams
        // delete queryParams.table;
        // delete queryParams.order;
        // delete queryParams.limit;

        const queryConditions = Object.entries(queryParams);

        // Connect to the database
        const client = new Client(dbConfig);
        await client.connect();

        let dynamicQuery = `SELECT * FROM ${tableName}`;
        const dynamicParams = [];

        // if (queryConditions.length > 0) {
        //     dynamicQuery += " WHERE ";

        //     // Construct the dynamic query with the query conditions
        //     queryConditions.forEach(([key, value], index) => {
        //         dynamicQuery += `${key} = $${index + 1}`;

        //         if (index < queryConditions.length - 1) {
        //             dynamicQuery += " AND ";
        //         }

        //         dynamicParams.push(value);
        //     });
        // }

        // Include order and limit if provided
        if (queryParams.order_by) {
            if (queryParams.order === "acq_date") {
                dynamicQuery += ` ORDER BY to_date(acq_date, 'DD-MM-YY')`;
            } else {
                dynamicQuery += ` ORDER BY ${queryParams.order_by}`;
            }
        }

        if (queryParams.order === "DESC") {
            dynamicQuery += " DESC";
        }

        if (queryParams.limit) {
            dynamicQuery += ` LIMIT ${queryParams.limit}`;
        }

        console.log(dynamicQuery);

        // Execute the dynamic query
        const queryResult = await client.query(dynamicQuery, dynamicParams);
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
