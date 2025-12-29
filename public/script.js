async function loadTodos() {
  const res = await fetch("/todos");
  const todos = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  todos.forEach(todo => {
    list.innerHTML += `
      <li>
        <span>${todo.text}</span>
        <span class="actions">
          <button onclick="editTodo('${todo._id}', '${todo.text}')">Edit</button>
          <button onclick="deleteTodo('${todo._id}')">Delete</button>
        </span>
      </li>
    `;
  });
}

async function saveTodo() {
  const text = document.getElementById("todo").value;
  const id = document.getElementById("todoId").value;

  if (!text) return;

  if (id) {
    // UPDATE
    await fetch(`/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
  } else {
    // CREATE
    await fetch("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
  }

  document.getElementById("todo").value = "";
  document.getElementById("todoId").value = "";
  loadTodos();
}

function editTodo(id, text) {
  document.getElementById("todo").value = text;
  document.getElementById("todoId").value = id;
}

async function deleteTodo(id) {
  await fetch(`/todos/${id}`, { method: "DELETE" });
  loadTodos();
}

loadTodos();
