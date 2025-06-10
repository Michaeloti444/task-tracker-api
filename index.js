// 📁 index.js (with file saving)
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(express.json());

// Load tasks from file on startup
let tasks = [];
if (fs.existsSync(DATA_FILE)) {
  const raw = fs.readFileSync(DATA_FILE);
  tasks = JSON.parse(raw);
}

// Helper: Save tasks to file
const saveTasks = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};

app.post('/tasks', (req, res) => {
  const task = { id: Date.now(), ...req.body };
  tasks.push(task);
  saveTasks();
  res.status(201).json(task);
});

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(task => task.id == id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...req.body };
    saveTasks();
    res.json(tasks[index]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(task => task.id != id);
  saveTasks();
  res.status(204).send();
});
app.get('/', (req, res) => {
  res.send('Task Tracker API is running. Use /tasks to interact with tasks.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
