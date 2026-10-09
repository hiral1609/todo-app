
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const clearBtn = document.getElementById("clearBtn");
const emptyMessage = document.getElementById("emptyMessage");
const taskCountLabel = document.getElementById("taskCountLabel");
const todayDate = document.getElementById("todayDate");

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    tasks = Array.isArray(savedTasks)
        ? savedTasks.filter(task => task && typeof task.text === "string")
        : [];
} catch (error) {
    tasks = [];
}

todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
});

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function displayTasks() {
    taskList.innerHTML = "";

    tasks.forEach(function (task, index) {
        const li = document.createElement("li");

        const taskDetails = document.createElement("div");
        taskDetails.className = "task-details";

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        if (task.completed) {
            taskText.classList.add("completed");
        }

        taskDetails.appendChild(taskText);

        if (task.date) {
            const dateText = document.createElement("small");
            dateText.className = "task-date";
            dateText.textContent = "Due: " + task.date;
            taskDetails.appendChild(dateText);
        }

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";

        editBtn.addEventListener("click", function () {
            const updatedText = prompt("Edit your task:", task.text);

            if (updatedText === null) {
                return;
            }

            if (updatedText.trim() === "") {
                alert("Task cannot be empty!");
                return;
            }

            const updatedDate = prompt(
                "Enter due date (YYYY-MM-DD), or leave blank:",
                task.date || ""
            );

            if (updatedDate === null) {
                return;
            }

            const cleanDate = updatedDate.trim();

            if (
                cleanDate !== "" &&
                !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)
            ) {
                alert("Please use the date format YYYY-MM-DD.");
                return;
            }

            tasks[index].text = updatedText.trim();
            tasks[index].date = cleanDate;

            saveTasks();
            displayTasks();
        });

        const completeBtn = document.createElement("button");
        completeBtn.className = "complete-btn";
        completeBtn.textContent = task.completed ? "Undo" : "Complete";

        completeBtn.addEventListener("click", function () {
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            displayTasks();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", function () {
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        });

        li.appendChild(taskDetails);
        li.appendChild(editBtn);
        li.appendChild(completeBtn);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });

    updateCounters();
}

function addTask() {
    const text = taskInput.value.trim();
    const date = taskDate.value;

    if (text === "") {
        alert("Please enter a task!");
        taskInput.focus();
        return;
    }

    tasks.push({
        text: text,
        date: date,
        completed: false
    });

    saveTasks();
    displayTasks();

    taskInput.value = "";
    taskDate.value = "";
    taskInput.focus();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

taskDate.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

clearBtn.addEventListener("click", function () {
    if (tasks.length === 0) {
        return;
    }

    if (confirm("Are you sure you want to clear all tasks?")) {
        tasks = [];
        saveTasks();
        displayTasks();
    }
});

function updateCounters() {
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    const pending = total - completed;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;

    taskCountLabel.textContent =
        total + (total === 1 ? " task" : " tasks");

    emptyMessage.style.display = total === 0 ? "block" : "none";
}

displayTasks();
