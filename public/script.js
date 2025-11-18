const API = "/api/contacts";

async function loadContacts() {
  const res = await fetch(API);
  const data = await res.json();
  renderList(data);
}

async function addContact() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone }),
  });

  loadContacts();
}

async function deleteContact(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadContacts();
}

/* ------------------ NEW: edit mode ------------------ */

let editingId = null;

function startEdit(contact) {
  editingId = contact._id;

  document.getElementById("name").value = contact.name;
  document.getElementById("email").value = contact.email || "";
  document.getElementById("phone").value = contact.phone;

  document.getElementById("add-btn").style.display = "none";
  document.getElementById("save-btn").style.display = "inline-block";
}

async function saveEdit() {
  if (!editingId) return;

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  await fetch(`${API}/${editingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone }),
  });

  editingId = null;

  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";

  document.getElementById("add-btn").style.display = "inline-block";
  document.getElementById("save-btn").style.display = "none";

  loadContacts();
}

/* ------------------ render ------------------ */

function renderList(arr) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  arr.forEach(c => {
    const li = document.createElement("li");
    li.className = "contact";

    li.innerHTML = `
      <div class="contact-info">
        <b>${c.name}</b><br>
        ${c.email || "—"} <br>
        ${c.phone}
      </div>

      <div class="actions">
        <button class="edit-btn" onclick='startEdit(${JSON.stringify(c)})'>✏ Редактировать</button>
        <button class="delete-btn" onclick="deleteContact('${c._id}')">🗑 Удалить</button>
      </div>
    `;
    list.appendChild(li);
  });
}

loadContacts();
