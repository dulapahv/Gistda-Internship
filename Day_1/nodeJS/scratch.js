// demonstrate nodeJS program to connect to PostgreSQL database

// load the pg module
const { Client } = require("pg");

// define the connection string to the database
const connectionString =
    "postgres://postgres:postgres@localhost:5432/mypostgis";

// create a new client
const client = new Client({
    connectionString: connectionString,
});

// connect to the database
client.connect();

// get data from public.rice_20230515
client.query("SELECT geom, ST_AsText(geom) FROM rice_20230515 ORDER BY geom", (err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log(res.rows);
    }
});
