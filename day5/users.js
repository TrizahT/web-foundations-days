const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const status = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let users = [];
function renderUsers(list) {
    usersList.innerHTML = "";
  
    if (list.length === 0 && filterInput.value.trim() !== "") {
      const message = document.createElement("li");
      message.textContent = "No users match your filter.";
      usersList.appendChild(message);
      return;
    }
  
    list.forEach((user) => {
      const li = document.createElement("li");
  
      const name = document.createElement("h2");
      name.textContent = user.name;
  
      const email = document.createElement("p");
      email.textContent = `Email: ${user.email}`;
  
      const city = document.createElement("p");
      city.textContent = `City: ${user.address.city}`;
  
      const company = document.createElement("p");
      company.textContent = `Company: ${user.company.name}`;
  
      li.appendChild(name);
      li.appendChild(email);
      li.appendChild(city);
      li.appendChild(company);
  
      usersList.appendChild(li);
    });
  }
  async function loadUsers() {
    loadButton.disabled = true;
    status.textContent = "Loading users...";
  
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
  
      if (!response.ok) {
        throw new Error("Failed to load users.");
      }
  
      users = await response.json();
  
      renderUsers(users);
  
      status.textContent = `Loaded ${users.length} users successfully.`;
    } catch (error) {
      status.textContent = "Unable to load users. Please try again.";
      users = [];
      renderUsers(users);
    } finally {
      loadButton.disabled = false;
    }
  }
  loadButton.addEventListener("click", loadUsers);
  filterInput.addEventListener("input", () => {
    const searchTerm = filterInput.value.toLowerCase().trim();
  
    const filteredUsers = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm)
    );
  
    renderUsers(filteredUsers);
  });