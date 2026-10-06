const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const clearBtn = document.getElementById("clearBtn");
const emptyMessage = document.getElementById("emptyMessage");

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    const li = document.createElement("li");

    li.innerHTML = `
        <span class="task-text">${taskText}</span>
        <button class="complete-btn">Complete</button>
        <button class="delete-btn">Delete</button>
    `;

    taskList.appendChild(li);

    updateCounters();

    taskInput.value = "";
}

addBtn.addEventListener("click", addTask);

taskList.addEventListener("click", function (event) {

    if (event.target.classList.contains("complete-btn")) {
        const task = event.target.parentElement;
        const taskText = task.querySelector(".task-text");

        taskText.classList.toggle("completed");

        updateCounters();
    }

    if (event.target.classList.contains("delete-btn")) {
        const task = event.target.parentElement;

        task.remove();

        updateCounters();
    }
});

function updateCounters() {
    const tasks = taskList.querySelectorAll("li");

    let completed = 0;

    tasks.forEach(function (task) {
        const taskText = task.querySelector(".task-text");

        if (taskText.classList.contains("completed")) {
            completed++;
        }
    });

    const total = tasks.length;
    const pending = total - completed;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;

    if (total === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }
}

clearBtn.addEventListener("click", function () {
    taskList.innerHTML = "";
    updateCounters();
});