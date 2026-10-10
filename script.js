
const API_URL = "/api/tasks";

// HTML elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");

const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");
const filterTasks = document.getElementById("filterTasks");
const sortTasks = document.getElementById("sortTasks");
const clearAllBtn = document.getElementById("clearAllBtn");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const overdueTasks = document.getElementById("overdueTasks");
const taskCountLabel = document.getElementById("taskCountLabel");

const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressTrack = document.getElementById("progressTrack");
const todayDate = document.getElementById("todayDate");

const themeToggle = document.getElementById("themeToggle");

// Tasks will now come from the backend
let tasks = [];

// API helper
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

// Load tasks from backend
async function loadTasks() {
    try {
        const data = await apiRequest(API_URL);

        tasks = data.map(function (task) {
            return {
                id: task.id,
                text: task.title,
                date: task.date || "",
                priority: task.priority || "medium",
                completed: Boolean(task.completed),
                createdAt: task.createdAt || task.id
            };
        });

        displayTasks();
    } catch (error) {
        console.error("Loading tasks failed:", error);
        alert("Tasks load nahi hue. Check karo ki backend server chal raha hai.");
    }
}

// Today's date as YYYY-MM-DD
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Display today's date
todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
});

// Format due date
function formatDate(dateString) {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Add task using POST API
async function addTask(event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        taskInput.focus();
        return;
    }

    try {
        await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify({
                title: text,
                date: taskDate.value,
                priority: taskPriority.value
            })
        });

        taskForm.reset();
        taskPriority.value = "medium";

        await loadTasks();
        taskInput.focus();
    } catch (error) {
        console.error("Adding task failed:", error);
        alert("Task add nahi hua: " + error.message);
    }
}

// Complete or undo using PUT API
async function toggleTask(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                completed: !task.completed
            })
        });

        await loadTasks();
    } catch (error) {
        console.error("Updating task failed:", error);
        alert("Task update nahi hua: " + error.message);
    }
}

// Edit task using PUT API
async function editTask(id) {
    const task = tasks.find(item => item.id === id);
    if (!task) return;

    const newText = prompt("Edit task name:", task.text);

    if (newText === null) return;

    if (!newText.trim()) {
        alert("Task name cannot be empty.");
        return;
    }

    const newDate = prompt(
        "Enter due date as YYYY-MM-DD, or leave blank for no due date:",
        task.date || ""
    );

    if (newDate === null) return;

    const cleanDate = newDate.trim();

    if (cleanDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
            alert("Please enter the date in YYYY-MM-DD format.");
            return;
        }

        const [year, month, day] = cleanDate.split("-").map(Number);
        const checkDate = new Date(year, month - 1, day);

        const validDate =
            checkDate.getFullYear() === year &&
            checkDate.getMonth() === month - 1 &&
            checkDate.getDate() === day;

        if (!validDate) {
            alert("Please enter a valid date.");
            return;
        }
    }

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                title: newText.trim(),
                date: cleanDate,
                priority: task.priority
            })
        });

        await loadTasks();
    } catch (error) {
        console.error("Editing task failed:", error);
        alert("Task edit nahi hua: " + error.message);
    }
}

// Delete one task using DELETE API
async function deleteTask(id) {
    if (!confirm("Do you want to delete this task?")) return;

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        await loadTasks();
    } catch (error) {
        console.error("Deleting task failed:", error);
        alert("Task delete nahi hua: " + error.message);
    }
}

// Delete all tasks using DELETE API
async function clearAllTasks() {
    if (tasks.length === 0) {
        alert("There are no tasks to clear.");
        return;
    }

    if (!confirm("Are you sure you want to delete all tasks?")) return;

    try {
        for (const task of [...tasks]) {
            await apiRequest(`${API_URL}/${task.id}`, {
                method: "DELETE"
            });
        }

        await loadTasks();
    } catch (error) {
        console.error("Clearing tasks failed:", error);
        alert("Kuch tasks delete nahi hue: " + error.message);
        await loadTasks();
    }
}

// Create task card
function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item";

    if (task.completed) {
        li.classList.add("completed");
    }

    const taskMain = document.createElement("div");
    taskMain.className = "task-main";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");

    checkbox.addEventListener("change", function () {
        toggleTask(task.id);
    });

    const taskDetails = document.createElement("div");
    taskDetails.className = "task-details";

    const taskTitle = document.createElement("span");
    taskTitle.className = "task-title";
    taskTitle.textContent = task.text;

    taskDetails.appendChild(taskTitle);

    // Due date
    if (task.date) {
        const dateLabel = document.createElement("small");
        dateLabel.className = "task-date";
        dateLabel.textContent = "Due: " + formatDate(task.date);

        if (!task.completed && task.date < getTodayString()) {
            dateLabel.classList.add("overdue-text");
        }

        taskDetails.appendChild(dateLabel);
    }

    // Priority badge
    const priority = task.priority || "medium";
    const priorityBadge = document.createElement("small");

    priorityBadge.className = "priority-badge " + priority;
    priorityBadge.textContent =
        priority.charAt(0).toUpperCase() +
        priority.slice(1) +
        " Priority";

    taskDetails.appendChild(priorityBadge);

    // Due today / overdue badge
    if (task.date && !task.completed) {
        const statusBadge = document.createElement("small");

        if (task.date < getTodayString()) {
            statusBadge.className = "due-badge overdue";
            statusBadge.textContent = "Overdue";
            taskDetails.appendChild(statusBadge);
        } else if (task.date === getTodayString()) {
            statusBadge.className = "due-badge due-today";
            statusBadge.textContent = "Due Today";
            taskDetails.appendChild(statusBadge);
        }
    }

    taskMain.appendChild(checkbox);
    taskMain.appendChild(taskDetails);

    // Action buttons
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.textContent = task.completed ? "Undo" : "Complete";

    completeBtn.addEventListener("click", function () {
        toggleTask(task.id);
    });

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";

    editBtn.addEventListener("click", function () {
        editTask(task.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    deleteBtn.addEventListener("click", function () {
        deleteTask(task.id);
    });

    actions.appendChild(completeBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(taskMain);
    li.appendChild(actions);

    return li;
}

// Display tasks with search, filter and sort
function displayTasks() {
    taskList.replaceChildren();

    const searchTerm = searchInput.value.trim().toLowerCase();
    const filterValue = filterTasks.value;
    const sortValue = sortTasks.value;

    let filteredTasks = tasks.filter(function (task) {
        const matchesSearch = task.text.toLowerCase().includes(searchTerm);

        const matchesFilter =
            filterValue === "all" ||
            (filterValue === "completed" && task.completed) ||
            (filterValue === "pending" && !task.completed);

        return matchesSearch && matchesFilter;
    });

    if (sortValue === "priority") {
        const priorityOrder = {
            high: 1,
            medium: 2,
            low: 3
        };

        filteredTasks.sort(function (a, b) {
            return (priorityOrder[a.priority] || 2) -
                   (priorityOrder[b.priority] || 2);
        });
    } else if (sortValue === "date") {
        filteredTasks.sort(function (a, b) {
            if (!a.date && !b.date) {
                return a.createdAt - b.createdAt;
            }

            if (!a.date) return 1;
            if (!b.date) return -1;

            return a.date.localeCompare(b.date);
        });
    } else {
        filteredTasks.sort(function (a, b) {
            return a.createdAt - b.createdAt;
        });
    }

    filteredTasks.forEach(function (task) {
        taskList.appendChild(createTaskElement(task));
    });

    // Empty state
    if (filteredTasks.length === 0) {
        emptyMessage.hidden = false;

        const emptyHeading = emptyMessage.querySelector("h3");
        const emptyText = emptyMessage.querySelector("p");

        if (tasks.length === 0) {
            emptyHeading.textContent = "No tasks yet";
            emptyText.textContent =
                "Add your first task and make today productive!";
        } else {
            emptyHeading.textContent = "No matching tasks";
            emptyText.textContent =
                "Try changing your search or filter.";
        }
    } else {
        emptyMessage.hidden = true;
    }

    taskCountLabel.textContent =
        filteredTasks.length +
        (filteredTasks.length === 1 ? " task" : " tasks");

    updateCounters();
}

// Update statistics and progress
function updateCounters() {
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    const pending = total - completed;

    const overdue = tasks.filter(function (task) {
        return !task.completed &&
               task.date &&
               task.date < getTodayString();
    }).length;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    overdueTasks.textContent = overdue;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progressPercent.textContent = percentage + "%";
    progressFill.style.width = percentage + "%";

    progressText.textContent =
        completed + " out of " + total + " tasks completed";

    progressTrack.setAttribute("aria-valuenow", percentage);
}

// Dark mode
function updateThemeButton() {
    const isDark = document.body.classList.contains("dark-mode");

    themeToggle.textContent = isDark
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
}

try {
    if (localStorage.getItem("taskflowTheme") === "dark") {
        document.body.classList.add("dark-mode");
    }
} catch (error) {
    // Theme still works if storage is unavailable.
}

updateThemeButton();

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    try {
        localStorage.setItem("taskflowTheme", isDark ? "dark" : "light");
    } catch (error) {
        // Theme remains active until the page is closed.
    }

    updateThemeButton();
});

// Event listeners
taskForm.addEventListener("submit", addTask);
searchInput.addEventListener("input", displayTasks);
filterTasks.addEventListener("change", displayTasks);
sortTasks.addEventListener("change", displayTasks);
clearAllBtn.addEventListener("click", clearAllTasks);

// Load backend tasks when the page opens
loadTasks();
