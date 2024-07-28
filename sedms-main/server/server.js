const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const db = require('./dbConnect'); // Ensure this path is correct
const bodyParser = require('body-parser');
const app = express();

// For allowing the URLs to be accessed by the server
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['PUT', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(bodyParser.json());

// Insert data in table Active Users
app.post('/input_active_users', async (req, res) => {
  const { equipment, quantity, timereq, full_name, reg_no, contact_no, branch, division } = req.body;

  try {
    const qry = `INSERT INTO sems.active_users (equipment, quantity, timereq, full_name, reg_no, contact_no, branch, division) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.execute(qry, [equipment, quantity, timereq, full_name, reg_no, contact_no, branch, division]);
    console.log('Data inserted into MySQL table');
    res.status(200).send('Data received and inserted into MySQL successfully');
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).send('Error inserting data into MySQL');
  }
});

// Accessing the data from the table Active_Users
app.get('/data_of_active_users', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM active_users');
    res.json(result);
  } catch (error) {
    console.error('Error fetching data from MySQL:', error);
    res.status(500).json({ error: 'Error fetching data from MySQL' });
  }
});

app.get('/data_of_equip_avai', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM equipments_table');
    res.json(result);
  } catch (error) {
    console.error('Error fetching data from MySQL:', error);
    res.status(500).json({ error: 'Error fetching data from MySQL' });
  }
});

app.post('/update_table', async (req, res) => {
  const { equipment, quantity, timereq, full_name, reg_no, contact_no, branch, division } = req.body;
  let equip = equipment.toLowerCase(); // Convert equipment name to lowercase

  try {
    const [result] = await db.query('SELECT available FROM equipments_table WHERE equipment_name = ?', [equip]);
    if (result.length > 0) {
      const avail_quantity = result[0].available;
      const insert_val = avail_quantity - quantity;

      if (insert_val >= 0) {
        const qry = 'UPDATE equipments_table SET taken = ?, available = ?, remaining = ? WHERE equipment_name = ?';
        await db.query(qry, [quantity, insert_val, insert_val, equip]);
        res.status(200).json({ message: 'Table updated successfully' });
      } else {
        res.status(400).json({ error: 'Insufficient quantity available' });
      }
    } else {
      res.status(404).json({ error: 'Equipment not found' });
    }
  } catch (error) {
    console.error('Error fetching data from MySQL:', error);
    res.status(500).json({ error: 'Error fetching data from MySQL' });
  }
});

app.post('/api/delete', (req, res) => {
  const { registrationId } = req.body;
  const sql = 'DELETE from active_users WHERE reg_no = ?';

  db.query(sql, [registrationId], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'An error occurred while returning item.' });
      return;
    }
    res.json({ success: true });
  });
});

app.post('/api/return', (req, res) => {
  const { registrationId } = req.body;
  const sql2 = 'SELECT equipment FROM active_users WHERE reg_no = ?';
  const sql1 = 'UPDATE equipments_table SET taken = 0 WHERE equipment_name = ?';

  db.query(sql2, [registrationId], (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'An error occurred while returning item.' });
      return;
    }

    const equipmentName = result[0].equipment;
    db.query(sql1, [equipmentName], (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ error: 'An error occurred while returning item.' });
        return;
      }
    });
  });
});

// Run python file get the key, run query using key and send user details to the frontend
app.all('/rundemo', (req, res) => {
  const pythonProcess = exec('python script.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      return res.status(500).send(`Error executing Python script: ${error}`);
    }

    console.log(`Python script stdout: ${stdout}`);
    const key = stdout.trim();

    db.execute('SELECT * FROM USERS WHERE reg_no = ?', [key])
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        console.log(err);
      });

    console.error(`Python script stderr: ${stderr}`);
  });

  pythonProcess.on('exit', (code) => {
    console.log(`Python script process exited with code ${code}`);
  });
});

app.all('*', (req, res) => {
  res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
