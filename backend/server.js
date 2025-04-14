const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(
    
));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/todoDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error: ", err));

// Schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now }
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes

// Create new TODO
app.post('/api/todos', async (req, res) => {
  try {
    const { title, description } = req.body;
    const todo = new Todo({ title, description });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get TODOs with pagination
app.get('/api/todos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const todos = await Todo.find().skip(skip).limit(limit).sort({ date: -1 });
    const total = await Todo.countDocuments();
    res.json({ todos, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single TODO
app.get('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a TODO
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a TODO
app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get TODOs with optional search and pagination
app.get('/api/todoes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };

    const todos = await Todo.find(searchQuery).skip(skip).limit(limit).sort({ date: -1 });
    const total = await Todo.countDocuments(searchQuery);

    res.json({ todos, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

