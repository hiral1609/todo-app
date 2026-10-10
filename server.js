
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3010;

app.use(express.json());
app.use(express.static(__dirname));

// Database file
const DB_FILE = path.join(__dirname, "db.json");

// Read tasks from file
function readTasks() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, "[]", "utf8");
        }

        return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (error) {
        console.error("Database read error:", error.message);
        throw error;
    }
}

// Save tasks to file
function saveTasks(tasks) {
    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(tasks, null, 2),
        "utf8"
    );
}

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Backend check
app.get("/api/check", (req, res) => {
    res.send("TaskFlow backend is running!");
});

// Get all tasks
app.get("/api/tasks", (req, res) => {
    res.json(readTasks());
});

// Add task
app.post("/api/tasks", (req, res) => {
    const { title, date = "", priority = "medium" } = req.body;

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    if (!["high", "medium", "low"].includes(priority)) {
        return res.status(400).json({
            message: "Invalid priority"
        });
    }

    const tasks = readTasks();

    const task = {
        id: Date.now(),
        title: title.trim(),
        date,
        priority,
        completed: false,
        createdAt: Date.now()
    };

    tasks.push(task);
    saveTasks(tasks);

    res.status(201).json({
        message: "Task added successfully!",
        task
    });
});

// Update task
app.put("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();

    const task = tasks.find(
        item => item.id === Number(req.params.id)
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const { title, date, priority, completed } = req.body;

    if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Invalid task title"
            });
        }

        task.title = title.trim();
    }

    if (date !== undefined) {
        if (typeof date !== "string") {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        task.date = date;
    }

    if (priority !== undefined) {
        if (!["high", "medium", "low"].includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        task.priority = priority;
    }

    if (completed !== undefined) {
        if (typeof completed !== "boolean") {
            return res.status(400).json({
                message: "Invalid completed status"
            });
        }

        task.completed = completed;
    }

    saveTasks(tasks);

    res.json({
        message: "Task updated successfully!",
        task
    });
});

// Delete one task
app.delete("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();

    const index = tasks.findIndex(
        item => item.id === Number(req.params.id)
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const deletedTask = tasks.splice(index, 1)[0];

    saveTasks(tasks);

    res.json({
        message: "Task deleted successfully!",
        task: deletedTask
    });
});

// Start server
app.listen(PORT, "127.0.0.1", () => {
    console.log(
        `TaskFlow is running at http://127.0.0.1:${PORT}`
    );
});

