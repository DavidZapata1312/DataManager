let products = [];
let productSet = new Set();
let productMap = new Map();

// Load products on start
fetch("http://localhost:3000/products")
  .then(res => res.json())
  .then(data => {
    products = data;
    updateSetAndMap();
    displayAllProducts();
  })
  .catch(err => showMessage("❌ Error loading products", "error"));

// Update helpers
function updateSetAndMap() {
  productSet = new Set(products.map(p => p.name.toLowerCase()));
  productMap = new Map(products.map(p => [p.category.toLowerCase(), p.name]));
}

// Display all products
function displayAllProducts() {
  const listDiv = document.getElementById("allProducts");
  listDiv.innerHTML = products.map(p => `
    <div>
      Name: ${p.name} | Price: $${p.price} | Category: ${p.category}
    </div>
  `).join("");
}

// Add product
document.getElementById("productForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim().toLowerCase();
  const price = parseFloat(document.getElementById("price").value);
  const category = document.getElementById("category").value.trim().toLowerCase();

  if (!name || isNaN(price) || price < 0 || !category) {
    return showMessage("❌ Please fill in all fields with valid data.", "error");
  }

  if (productSet.has(name)) {
    return showMessage(`❌ The product "${name}" already exists.`, "error");
  }

  const newProduct = { name, price, category };

  fetch("http://localhost:3000/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct)
  })
    .then(res => res.json())
    .then(product => {
      products.push(product);
      updateSetAndMap();
      displayAllProducts();
      showMessage(`✅ Product "${product.name}" added successfully.`, "success");
      e.target.reset();
    })
    .catch(err => showMessage("❌ Error adding product.", "error"));
});

// Search
document.getElementById("searchBtn").addEventListener("click", () => {
  const searchTerm = document.getElementById("search").value.trim().toLowerCase();
  const resultDiv = document.getElementById("searchResult");
  resultDiv.innerHTML = "";

  if (!searchTerm) {
    return showMessage("❌ Please enter a product name to search.", "error");
  }

  fetch(`http://localhost:3000/products?name=${searchTerm}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const p = data[0];
        resultDiv.innerHTML = `
          <div class="result" data-name="${p.name}">
            Name: <span id="name-${p.name}">${p.name}</span><br>
            Price: $<span id="price-${p.name}">${p.price}</span><br>
            Category: <span id="category-${p.name}">${p.category}</span><br><br>

            <button onclick="deleteProductByName('${p.name}')">Delete</button>
            <button onclick="editPriceByName('${p.name}')">Edit price</button>
            <button onclick="editCategoryByName('${p.name}')">Edit category</button>
            <button onclick="editNameByName('${p.name}')">Edit name</button>
          </div>`;
      } else {
        resultDiv.innerHTML = `Product "${searchTerm}" not found.`;
      }
    })
    .catch(err => showMessage("❌ Error during search.", "error"));
});

// Delete
function deleteProductByName(name) {
  if (!confirm(`Delete the product "${name}"?`)) return;

  fetch(`http://localhost:3000/products?name=${name}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return showMessage("❌ Product not found.", "error");
      const id = data[0].id;

      return fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE"
      }).then(() => {
        products = products.filter(p => p.name !== name);
        updateSetAndMap();
        displayAllProducts();
        document.getElementById("searchResult").innerHTML = `✅ Product deleted successfully.`;
      });
    })
    .catch(err => showMessage("❌ Delete error.", "error"));
}

// Edit price
function editPriceByName(name) {
  const newPrice = prompt("Enter the new price:");
  if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) < 0) {
    return showMessage("❌ Invalid price.", "error");
  }

  fetch(`http://localhost:3000/products?name=${name}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return showMessage("❌ Product not found.", "error");
      const id = data[0].id;

      return fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: parseFloat(newPrice) })
      }).then(() => {
        document.getElementById(`price-${name}`).textContent = parseFloat(newPrice);
        products = products.map(p => p.name === name ? { ...p, price: parseFloat(newPrice) } : p);
        displayAllProducts();
        showMessage(`✅ Price updated for "${name}".`, "success");
      });
    })
    .catch(err => showMessage("❌ Error updating price.", "error"));
}

// Edit category
function editCategoryByName(name) {
  const newCategory = prompt("Enter the new category:").trim().toLowerCase();
  if (!newCategory) return showMessage("❌ Invalid category.", "error");

  fetch(`http://localhost:3000/products?name=${name}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return showMessage("❌ Product not found.", "error");
      const id = data[0].id;

      return fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory })
      }).then(() => {
        document.getElementById(`category-${name}`).textContent = newCategory;
        products = products.map(p => p.name === name ? { ...p, category: newCategory } : p);
        updateSetAndMap();
        displayAllProducts();
        showMessage(`✅ Category updated for "${name}".`, "success");
      });
    })
    .catch(err => showMessage("❌ Error updating category.", "error"));
}

// Edit name
function editNameByName(name) {
  const newName = prompt("Enter the new name:").trim().toLowerCase();
  if (!newName) return showMessage("❌ Invalid name.", "error");
  if (productSet.has(newName)) return showMessage("❌ Name already exists.", "error");

  fetch(`http://localhost:3000/products?name=${name}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return showMessage("❌ Product not found.", "error");
      const id = data[0].id;

      return fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      }).then(() => {
        products = products.map(p => p.name === name ? { ...p, name: newName } : p);
        updateSetAndMap();
        displayAllProducts();
        showMessage(`✅ Name updated to "${newName}".`, "success");
      });
    })
    .catch(err => showMessage("❌ Error updating name.", "error"));
}

//  Persistent message function with styling
function showMessage(message, type = "success") {
  const msgDiv = document.getElementById("msg");
  const msgText = document.getElementById("msgText");
  msgDiv.className = type;
  msgText.textContent = message;
  msgDiv.style.display = "block";
}

//  Close message manually
document.getElementById("closeMsg").addEventListener("click", () => {
  const msgDiv = document.getElementById("msg");
  msgDiv.style.display = "none";
  msgDiv.className = "";
  msgDiv.querySelector("#msgText").textContent = "";
});

// Expose globally
window.deleteProductByName = deleteProductByName;
window.editPriceByName = editPriceByName;
window.editCategoryByName = editCategoryByName;
window.editNameByName = editNameByName;
