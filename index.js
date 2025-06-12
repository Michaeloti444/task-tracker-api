// 📁 index.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Load the PORT that Render provides (or fall back to 3000 locally)
const PORT = process.env.PORT || 3000;

// Where we’ll persist tasks
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(express.json());

// Load tasks from disk (or start empty)
let tasks = [];
if (fs.existsSync(DATA_FILE)) {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  tasks = JSON.parse(raw);
}

// Write tasks back to disk
function saveTasks() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// --- ROUTES ---

// Healthcheck / root
app.get('/', (req, res) => {
  res.send('✅ Task Tracker API is up. Use /tasks to manage your tasks.');
});

// Create
app.post('/tasks', (req, res) => {
  const task = { id: Date.now(), ...req.body };
  tasks.push(task);
  saveTasks();
  res.status(201).json(task);
});

// Read all
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Update
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const idx = tasks.findIndex(t => t.id == id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  tasks[idx] = { ...tasks[idx], ...req.body };
  saveTasks();
  res.json(tasks[idx]);
});

// Delete
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id != id);
  saveTasks();
  res.status(204).send();
});

// --- START SERVER ---
// Bind to 0.0.0.0 so Render can route traffic, and use the dynamic PORT
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
