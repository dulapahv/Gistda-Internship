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

        // Connect to the database
        const client = new Client(dbConfig);
        await client.connect();

        let dynamicQuery = `SELECT `;

        // 1. Parse `select` query parameter
        if (queryParams.select) {
            // Check if `select` is a valid column name
            const columns = await client.query(
                `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
                [queryParams.table]
            );
            const columnNames = columns.rows.map(
                (column) => column.column_name
            );
            const queryColumnNames = queryParams.select.split(",");
            for (const queryColumnName of queryColumnNames) {
                if (!columnNames.includes(queryColumnName)) {
                    throw new Error(
                        "Invalid `select` query parameter: " + queryColumnName
                    );
                }
            }
            dynamicQuery += `${queryParams.select} `;
        } else {
            dynamicQuery += `* `;
        }

        // 2. Parse `table` query parameter
        if (queryParams.table) {
            // Check if `table` is a valid table name
            const tables = await client.query(
                `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
                [queryParams.table]
            );
            const tableNames = tables.rows.map((table) => table.table_name);
            if (!tableNames.includes(queryParams.table)) {
                throw new Error(
                    "Invalid `table` query parameter: " + queryParams.table
                );
            }
            dynamicQuery += `FROM ${queryParams.table} `;
        } else {
            throw new Error("Missing `table` query parameter");
        }

        // 3. Parse `where` query parameter
        if (queryParams.where) {
            // Check if `where` is a valid column name
            const columns = await client.query(
                `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
                [queryParams.table]
            );
            const columnNames = columns.rows.map(
                (column) => column.column_name
            );
            // Split comma separated where
            const queryWhere = queryParams.where.split(",");
            for (const queryWhereItem of queryWhere) {
                if (
                    !columnNames.includes(
                        queryWhereItem.split(/(\w+)([=!<>]{1,2})(\d+)/)[1]
                    )
                ) {
                    throw new Error(
                        "Invalid `where` query parameter: " + queryWhereItem
                    );
                }
                if (
                    queryWhereItem.split(/(\w+)([=!<>]{1,2})(\d+)/)[3].length ==
                    0
                ) {
                    throw new Error(
                        "Invalid `where` query parameter: " + queryWhereItem
                    );
                }
            }
            dynamicQuery += `WHERE ${queryParams.where.replace(",", " AND ")} `;
        }

        // 4. Parse `order_by` query parameter
        if (queryParams.order_by) {
            // Check if `order_by` is a valid column name
            const columns = await client.query(
                `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
                [queryParams.table]
            );
            const columnNames = columns.rows.map(
                (column) => column.column_name
            );
            if (!columnNames.includes(queryParams.order_by)) {
                throw new Error(
                    "Invalid `order_by` query parameter: " +
                        queryParams.order_by
                );
            }
            if (queryParams.order === "acq_date") {
                dynamicQuery += `ORDER BY to_date(acq_date, 'DD-MM-YY') `;
            } else {
                dynamicQuery += `ORDER BY ${queryParams.order_by} `;
            }
        }

        // 5. Parse `order` query parameter
        if (queryParams.order === "desc") {
            dynamicQuery += `DESC `;
        }

        // 6. Parse `limit` query parameter
        if (queryParams.limit) {
            // Check if `limit` is a number
            if (isNaN(queryParams.limit)) {
                throw new Error("`limit` query parameter must be a number");
            }
            dynamicQuery += `LIMIT ${queryParams.limit}`;
        }

        console.log(dynamicQuery);

        // Execute the dynamic query
        const queryResult = await client.query(dynamicQuery);
        const result = queryResult.rows;

        // Send the result as JSON response
        res.json({ result });

        // Close the database connection
        await client.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
