const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
const chuckNorrisApiUrl = 'https://api.chucknorris.io/jokes/random';

const dbConfig = {
  user: 'admin',
  host: 'chucknorris-db-1.cklma3bils2o.eu-central-1.rds.amazonaws.com',
  database: 'chucknorris_db',
  password: 'admin123'
};

let connection;
mysql.createConnection(dbConfig).then((con) => connection = con);

async function saveJokeToDB(joke) {
  try {
    const [rows] = await connection.execute('INSERT INTO jokes (joke) VALUES (?)', [joke]);
    
    return rows;
  } catch (err) {
    console.error('Error saving joke to database:', err);
  } 
}

app.get('/joke', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT joke FROM jokes ORDER BY RAND() LIMIT 1');
    const joke = rows[0].joke;

    res.json({ joke });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch joke from database' });
  }
});

app.post('/joke', async (req, res) => {
  try {
    const response = await axios.get(chuckNorrisApiUrl);
    const joke = response.data.value;

    await saveJokeToDB(joke);

    res.json({ joke });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch joke' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});