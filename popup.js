const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const deadlineInput = document.getElementById("deadlineInput");
const themeToggle = document.getElementById("themeToggle");
const completeSound = document.getElementById("completeSound");
const dingSound = new Audio("complete.mp3");

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  loadTheme();
});

addBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  const deadline = deadlineInput.value;
  if (taskText) {
    addTask(taskText, deadline);
    saveTask(taskText, deadline);
    taskInput.value = "";
    deadlineInput.value = "";
  }
});

themeToggle.addEventListener("change", () => {
  const isDark = themeToggle.checked;
  document.body.classList.toggle("dark", isDark);
  chrome.storage.local.set({ theme: isDark ? "dark" : "light" });
});

function addTask(text, deadline = "", completed = false) {
  const li = document.createElement("li");
  li.className = completed ? "done animate" : "";

  const taskText = document.createElement("span");
  taskText.textContent = text;

  const deadlineText = document.createElement("small");
  deadlineText.textContent = deadline ? `⏰ ${new Date(deadline).toLocaleString()}` : "";
  deadlineText.className = "deadline";

  const delBtn = document.createElement("button");
  delBtn.innerHTML = "&times;";

  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    li.remove();
    deleteTask(text);
  });

  li.addEventListener("click", () => {
    li.classList.add("done", "animate");
    dingSound.play();
    
    setTimeout(() => {
      li.remove();
      deleteTask(text);
    }, 500);
  });

  li.appendChild(taskText);
  li.appendChild(deadlineText);
  li.appendChild(delBtn);
  taskList.appendChild(li);
}

function saveTask(taskText, deadline) {
  chrome.storage.local.get(["tasks"], (result) => {
    const tasks = result.tasks || [];
    tasks.push({ text: taskText, deadline, done: false });
    chrome.storage.local.set({ tasks });
  });
}

function loadTasks() {
  chrome.storage.local.get(["tasks"], (result) => {
    const tasks = result.tasks || [];
    tasks.forEach(task => addTask(task.text, task.deadline, task.done));
  });
}

function updateTaskStatus(taskText) {
  chrome.storage.local.get(["tasks"], (result) => {
    const tasks = result.tasks || [];
    const updated = tasks.map(task =>
      task.text === taskText ? { ...task, done: !task.done } : task
    );
    chrome.storage.local.set({ tasks: updated });
  });
}

function deleteTask(taskText) {
  chrome.storage.local.get(["tasks"], (result) => {
    const tasks = result.tasks || [];
    const filtered = tasks.filter(task => task.text !== taskText);
    chrome.storage.local.set({ tasks: filtered });
  });
}

function loadTheme() {
  chrome.storage.local.get(["theme"], (result) => {
    const theme = result.theme || "light";
    document.body.classList.toggle("dark", theme === "dark");
    themeToggle.checked = theme === "dark";
  });
}
