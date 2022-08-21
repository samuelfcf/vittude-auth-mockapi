import express from "express";
import cors from "cors";
import { v4 as uuid } from 'uuid';
import connection from './database.js';
import setup from './setup.js';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (_, res) => {
  res.status(200).send({
    messasge: 'OK!!!'
  })
});

app.get('/test-database', async (_, res) => {
  const result = await connection.query('SELECT * FROM users;')
  res.status(200).send(result.rows);
})

app.post('/auth/patient', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email.length === 0 || password.length === 0) {
      return res.sendStatus(400);
    }

    const identifier = email;
    const patientExists = await connection.query(`
      SELECT * FROM patients WHERE email = $1;`, [identifier]
    );
    
    if (patientExists.rowCount === 0) return res.sendStatus(404);

    const patient = patientExists.rows[0];
    const result = await connection.query(
      `SELECT * FROM users WHERE identifier = $1`, [patient.email]
    );
    
    if (result.rowCount === 0) res.sendStatus(404);
    
    const user = result.rows[0];


    if (user.password !== password) {
      return res.status(400).send({
        message: 'Invalid credentials'
      });
    }

    const token = uuid();
    const insertResult = await connection.query(`
      INSERT INTO sessions (user_id, token) VALUES ($1, $2);
    `, [user.id, token])
 
    return res.status(200).send({
      token: insertResult.rowCount > 0 && token
    });

  } catch (err) { 
    console.log(err)
    res.sendStatus(500);
  }
});

app.post('/auth/psico', async (req, res) => {
  try {
    const { document, password } = req.body;

    if (document.length === 0 || password.length === 0) {
      return res.sendStatus(400);
    }

    const identifier = document;
    const psicoExists = await connection.query(`
      SELECT * FROM psychologists WHERE document = $1;`, [identifier]
    );
    
    if (psicoExists.rowCount === 0) return res.sendStatus(404);

    const psico = psicoExists.rows[0];
    const result = await connection.query(
      `SELECT * FROM users WHERE identifier = $1`, [psico.document]
    );
    
    if (psico.rowCount === 0) res.sendStatus(404);
    
    const patient = result.rows[0];

    if (patient.password !== password) {
      return res.status(400).send({
        message: 'Invalid credentials'
      });
    }

    const token = uuid();
    const insertResult = await connection.query(`
      INSERT INTO sessions (user_id, token) VALUES ($1, $2);
    `, [patient.id, token])
 
    return res.status(200).send({
      token: insertResult.rowCount > 0 && token
    });
    
  } catch (err) { 
    console.log(err)
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.clear();
  console.log("Server is running on port 5000!");
});