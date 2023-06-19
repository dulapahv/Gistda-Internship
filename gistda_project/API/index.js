const { Client } = require('pg');
const dotenv = require('dotenv');
const express = require('express');
const querystring = require('querystring');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 3001;

// Database connection configuration
const dbConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
};

// Function to validate query parameters
const validateQueryParams = async (queryParams, client) => {
  const { data, select, where, order_by, order, limit } = queryParams;

  // Check if `data` is a valid table name
  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [data]
  );
  const tableNames = tables.rows.map((data) => data.table_name);
  if (!tableNames.includes(data)) {
    throw new Error('Invalid `data` query parameter: ' + data);
  }

  // Check if `select` is a valid column name
  const columns = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
    [data]
  );
  const columnNames = columns.rows.map((column) => column.column_name);
  if (select) {
    const queryColumnNames = select.split(',');
    for (const queryColumnName of queryColumnNames) {
      if (!columnNames.includes(queryColumnName)) {
        throw new Error('Invalid `select` query parameter: ' + queryColumnName);
      }
    }
  }

  // Check if `where` is a valid column name
  if (where) {
    // Split comma separated where
    const queryWhere = where.split(',');
    for (const queryWhereItem of queryWhere) {
      console.log(queryWhereItem.split(/(\w+)([=!<>]{1,2})(\d+)/))[1];
      if (
        !columnNames.includes(
          queryWhereItem.split(/(\w+)([=!<>]{1,2})(\d+)/)[1]
        )
      ) {
        throw new Error('Invalid `where` query parameter: ' + queryWhereItem);
      }
      if (queryWhereItem.split(/(\w+)([=!<>]{1,2})(\d+)/)[3].length == 0) {
        throw new Error('Invalid `where` query parameter: ' + queryWhereItem);
      }
    }
  }

  // Check if `order_by` is a valid column name
  if (order_by && !columnNames.includes(order_by)) {
    throw new Error('Invalid `order_by` query parameter: ' + order_by);
  }

  // Check if `order` is a valid value
  if (order && !['asc', 'desc'].includes(order)) {
    throw new Error('Invalid `order` query parameter: ' + order);
  }

  // Check if `limit` is a number
  if (limit && isNaN(limit)) {
    throw new Error('`limit` query parameter must be a number');
  }
};

app.use(cors());

app.get('/', async (req, res) => {
  try {
    const query = req.url.split('?')[1];
    const queryParams = querystring.parse(query, '&', '=');

    // Connect to the database
    const client = new Client(dbConfig);
    await client.connect();

    // await validateQueryParams(queryParams, client);

    let dynamicQuery = `SELECT ${queryParams.select || '*'} FROM ${
      queryParams.data
    }`;

    if (queryParams.where) {
      dynamicQuery += ` WHERE ${queryParams.where}`;
    }

    if (queryParams.order_by) {
      if (queryParams.order === 'acq_date') {
        dynamicQuery += ` ORDER BY to_date(acq_date, 'DD-MM-YY')`;
      } else {
        dynamicQuery += ` ORDER BY ${queryParams.order_by}`;
      }
    }

    if (queryParams.order === 'desc') {
      dynamicQuery += ` DESC`;
    }

    if (queryParams.limit) {
      dynamicQuery += ` LIMIT ${queryParams.limit}`;
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
