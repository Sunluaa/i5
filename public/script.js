const API = "/api/contacts";

/* ---------------- загрузка ---------------- */

async function loadContacts() {
  const res = await fetch(API);
  const data = await res.json();
  renderList(data);
}

/* ---------------- вывод списка ---------------- */

function renderList(list) {
  const ul = document.getElementById("list");
  ul.innerHTML = "";

  list.forEach(c => {
    const li = document.createElement("li");
    li.className = "contact";

    li.innerHTML = `
      <div class="contact-info">
        <div><b>${c.name}</b></div>
        <div>📧 ${c.email}</div>
        <div>📞 ${c.phone}</div>
        <div>📍 ${c.address || "—"}</div>
      </div>

      <div class="actions">
        <button class="delete-btn" onclick="deleteContact('${c._id}')">Удалить</button>
      </div>
    `;

    ul.appendChild(li);
  });
}

/* ---------------- добавление ---------------- */

async function addContact() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, address })
  });

  loadContacts();
}

/* ---------------- удаление ---------------- */

async function deleteContact(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadContacts();
}

/* ---------------- редактирование ---------------- */

function editContact(id) {
  const card = event.target.closest(".contact");

  const name = card.querySelector(".contact-info > div:nth-child(1)").innerText;
  const email = card.querySelector(".contact-info > div:nth-child(2)").innerText.replace("📧 ", "");
  const phone = card.querySelector(".contact-info > div:nth-child(3)").innerText.replace("📞 ", "");
  const address = card.querySelector(".contact-info > div:nth-child(4)").innerText.replace("📍 ", "");

  card.innerHTML = `
    <div class="contact-info">
      <input id="edit-name" value="${name}">
      <input id="edit-email" value="${email}">
      <input id="edit-phone" value="${phone}">
      <input id="edit-address" value="${address}">
    </div>

    <div class="actions">
      <button class="save-btn" onclick="saveEdit('${id}')">Сохранить</button>
      <button class="cancel-btn" onclick="loadContacts()">Отмена</button>
    </div>
  `;
}

/* ---------------- сохранение после редактирования ---------------- */

async function saveEdit(id) {
  const card = document.querySelector(".save-btn").closest(".contact");

  const body = {
    name: card.querySelector("#edit-name").value || null,
    email: card.querySelector("#edit-email").value || null,
    phone: card.querySelector("#edit-phone").value || null,
    address: card.querySelector("#edit-address").value || null
  };

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  loadContacts();
}

loadContacts();
