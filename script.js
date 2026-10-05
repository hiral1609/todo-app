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

        <button class="complete-btn">
            Complete
        </button>

        <button class="delete-btn">
            Delete
        </button>
    `;

    taskList.appendChild(li);

    taskInput.value = "";
}

addBtn.addEventListener("click", addTask);

taskList.addEventListener("click", function (event) {

    if (event.target.classList.contains("complete-btn")) {

        const task = event.target.parentElement;

        task.querySelector(".task-text").classList.toggle("completed");
    }


    if (event.target.classList.contains("delete-btn")) {

        const task = event.target.parentElement;

        task.remove();
    }

});