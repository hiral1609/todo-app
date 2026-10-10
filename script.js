// TaskFlow Todo Dashboard

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

// Load saved tasks from LocalStorage
let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("taskflowTasks"));
    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    tasks = [];
}

// Current date in local timezone
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Show today's date
todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
});

// Save tasks in browser
function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}

// Format date for display without timezone issues
function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Add a new task
function addTask(event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        taskInput.focus();
        return;
    }

    const task = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: text,
        date: taskDate.value,
        priority: taskPriority.value,
        completed: false,
        createdAt: Date.now()
    };

    tasks.push(task);

    saveTasks();

    taskForm.reset();
    taskPriority.value = "medium";

    displayTasks();
    taskInput.focus();
}

// Change completion status
function toggleTask(id) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    task.completed = !task.completed;

    saveTasks();
    displayTasks();
}

// Edit task name and due date
function editTask(id) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    const newText = prompt("Edit task name:", task.text);

    if (newText === null) {
        return;
    }

    if (!newText.trim()) {
        alert("Task name cannot be empty.");
        return;
    }

    const newDate = prompt(
        "Enter due date as YYYY-MM-DD, or leave blank for no due date:",
        task.date || ""
    );

    if (newDate === null) {
        return;
    }

    const cleanDate = newDate.trim();

    if (
        cleanDate &&
        !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)
    ) {
        alert("Please enter the date in YYYY-MM-DD format.");
        return;
    }

    if (cleanDate) {
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

    task.text = newText.trim();
    task.date = cleanDate;

    saveTasks();
    displayTasks();
}

// Delete one task
function deleteTask(id) {
    const confirmed = confirm("Do you want to delete this task?");

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(function (task) {
        return task.id !== id;
    });

    saveTasks();
    displayTasks();
}

// Clear all tasks
function clearAllTasks() {
    if (tasks.length === 0) {
        alert("There are no tasks to clear.");
        return;
    }

    const confirmed = confirm("Are you sure you want to delete all tasks?");

    if (!confirmed) {
        return;
    }

    tasks = [];

    saveTasks();
    displayTasks();
}

// Create a task element safely
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
    checkbox.checked = Boolean(task.completed);
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
    const priorityBadge = document.createElement("small");
    const priority = task.priority || "medium";

    priorityBadge.className = "priority-badge " + priority;
    priorityBadge.textContent =
        priority.charAt(0).toUpperCase() +
        priority.slice(1) +
        " Priority";

    taskDetails.appendChild(priorityBadge);

    // Due date status
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

// Display tasks with search, filter and sorting
function displayTasks() {
    taskList.replaceChildren();

    const searchTerm = searchInput.value.trim().toLowerCase();
    const filterValue = filterTasks.value;
    const sortValue = sortTasks.value;

    let filteredTasks = tasks.filter(function (task) {
        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchTerm);

        const matchesFilter =
            filterValue === "all" ||
            (filterValue === "completed" && task.completed) ||
            (filterValue === "pending" && !task.completed);

        return matchesSearch && matchesFilter;
    });

    // High, medium, low priority sorting
    if (sortValue === "priority") {
        const priorityOrder = {
            high: 1,
            medium: 2,
            low: 3
        };

        filteredTasks.sort(function (a, b) {
            const priorityA = priorityOrder[a.priority] || 2;
            const priorityB = priorityOrder[b.priority] || 2;

            return priorityA - priorityB;
        });
    }

    // Earliest due date first; tasks without dates appear last
    if (sortValue === "date") {
        filteredTasks.sort(function (a, b) {
            if (!a.date && !b.date) {
                return (a.createdAt || 0) - (b.createdAt || 0);
            }

            if (!a.date) {
                return 1;
            }

            if (!b.date) {
                return -1;
            }

            return a.date.localeCompare(b.date);
        });
    }

    // Default: oldest task first
    if (sortValue === "default") {
        filteredTasks.sort(function (a, b) {
            return (a.createdAt || 0) - (b.createdAt || 0);
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
        return (
            !task.completed &&
            task.date &&
            task.date < getTodayString()
        );
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

// Event listeners
taskForm.addEventListener("submit", addTask);

searchInput.addEventListener("input", displayTasks);
filterTasks.addEventListener("change", displayTasks);
sortTasks.addEventListener("change", displayTasks);

clearAllBtn.addEventListener("click", clearAllTasks);

// Initial render
displayTasks();