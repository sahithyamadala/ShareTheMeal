const fs = require('fs');
const path = require('path');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');
const app = express();
const port = process.env.PORT || 5000;
// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/form.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

app.post('/submit', (req, res) => {
  const { name, contact, quantity, maxPersons, location } = req.body;
  const log = `Form submitted at ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`;

  writeLogToFile(log, name, contact, quantity, maxPersons, location);
  res.sendFile(path.join(__dirname, 'submit.html'));
});
// Show available meals (public listing)
app.get('/meals', (req, res) => {
  const logFilePath = path.join(__dirname, 'logs', 'logs.txt');
  if (!fs.existsSync(logFilePath)) {
    return res.send('<h2>No meals available at the moment.</h2><a href="/">Back to Home</a>');
  }
  const logs = fs.readFileSync(logFilePath, 'utf8');
  // Extract meal entries (simple parsing)
  const meals = logs.split('-------------------------').filter(Boolean).map(entry => {
    const quantityMatch = entry.match(/Quantity: (.*)/);
    const maxPersonsMatch = entry.match(/Max Persons: (.*)/);
    const locationMatch = entry.match(/Location: (.*)/);
    return {
      quantity: quantityMatch ? quantityMatch[1] : '',
      maxPersons: maxPersonsMatch ? maxPersonsMatch[1] : '',
      location: locationMatch ? locationMatch[1] : ''
    };
  });
  let html = `<h2>Available Meals</h2><ul>`;
  meals.forEach(meal => {
    if (meal.location) {
      html += `<li>
        <strong>Location:</strong> ${meal.location} <br>
        <strong>Quantity:</strong> ${meal.quantity} <br>
        <strong>Max Persons:</strong> ${meal.maxPersons}
      </li><hr>`;
    }
  });
  html += `</ul><a href="/">Back to Home</a>`;
  res.send(html);
});
// Helper function
function writeLogToFile(log, name, contact, quantity, maxPersons, location) {
  const logsDir = path.join(__dirname, 'logs');
  const logFilePath = path.join(logsDir, 'logs.txt');

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir); // create logs directory if not present
  }
  const logEntry = `${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} - ${uuidv4()} - ${log}
Name: ${name}
Contact: ${contact}
Quantity: ${quantity}
Max Persons: ${maxPersons}
Location: ${location}

-------------------------
`;

  fs.appendFileSync(logFilePath, logEntry, 'utf8');
}


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});