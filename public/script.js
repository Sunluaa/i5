const API = '/api/contacts';

// загрузка списка
async function loadContacts() {
  const res = await fetch(API);
  const data = await res.json();

  const list = document.getElementById('list');
  list.innerHTML = '';

  data.forEach(c => {
    const li = document.createElement('li');
    li.className = 'contact';

    li.innerHTML = `
      <span>
        <b>${c.name}</b><br>
        ${c.email}<br>
        ${c.phone}
      </span>
      <button onclick="removeContact('${c._id}')">X</button>
    `;

    list.appendChild(li);
  });
}

// добавление
async function addContact() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  if (!name) return alert("Введите имя");

  await fetch(API, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name, email, phone})
  });

  loadContacts();
}

// удаление
async function removeContact(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  loadContacts();
}

// первая загрузка
loadContacts();
