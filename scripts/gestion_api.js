let products = [];
let productSet = new Set();
let productMap = new Map();
let pendingProduct = null; // 🔸 Producto pendiente de ser agregado visualmente

// Load products on start
fetch("http://localhost:3000/products")
  .then(res => res.json())
  .then(data => {
    products = data;
    updateSetAndMap();
    displayAllProducts();
  })
  .catch(err => showMessage("❌ Error loading products.", "error"));

// Update Set and Map
function updateSetAndMap() {
  productSet = new Set(products.map(p => p.name.toLowerCase()));
  productMap = new Map(products.map(p => [p.category.toLowerCase(), p.name]));
}

// Display all products
function displayAllProducts() {
  const allDiv = document.getElementById("allProducts");
  allDiv.innerHTML = "";
  if (products.length === 0) {
    allDiv.innerHTML = "<i>No products available.</i>";
    return;
  }

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "result";
    div.innerHTML = `
      Name: ${p.name}<br>
      Price: $<span id="price-${p.name}">${p.price}</span><br>
      Category: <span id="category-${p.name}">${p.category}</span><br><br>
      <button onclick="deleteProductByName('${p.name}')">Delete</button>
      <button onclick="editPriceByName('${p.name}')">Edit price</button>
      <button onclick="editCategoryByName('${p.name}')">Edit category</button>
    `;
    allDiv.appendChild(div);
  });
}

// Handle form submission
document.getElementById("productForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim().toLowerCase();
  const price = parseFloat(document.getElementById("price").value);
  const category = document.getElementById("category").value.trim().toLowerCase();

  if (!name || isNaN(price) || !category) {
    return showMessage("❌ Please fill in all fields correctly.", "error");
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
      pendingProduct = product; // 🔹 Guardamos producto para aplicar después
      showMessage(`✅ Product "${product.name}" added successfully.`, "success");
    })
    .catch(err => showMessage("❌ Error adding product.", "error"));
});

// Show message
function showMessage(text, type) {
  const msgDiv = document.getElementById("msg");
  const msgText = document.getElementById("msgText");

  msgText.textContent = text;
  msgDiv.className = type;
  msgDiv.style.display = "flex";
}

// Close message manually and apply pending changes if any
document.getElementById("closeMsg").addEventListener("click", () => {
  const msgDiv = document.getElementById("msg");
  msgDiv.style.display = "none";
  msgDiv.className = "";
  document.getElementById("msgText").textContent = "";

  // 🔹 Si hay producto pendiente, ahora sí lo añadimos y actualizamos
  if (pendingProduct) {
    products.push(pendingProduct);
    updateSetAndMap();
    displayAllProducts();
    document.getElementById("productForm").reset();
    document.getElementById("name").focus();
    pendingProduct = null;
  }
});

// Search product
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
            Name: ${p.name}<br>
            Price: $<span id="price-${p.name}">${p.price}</span><br>
            Category: <span id="category-${p.name}">${p.category}</span><br><br>
            <button onclick="deleteProductByName('${p.name}')">Delete</button>
            <button onclick="editPriceByName('${p.name}')">Edit price</button>
            <button onclick="editCategoryByName('${p.name}')">Edit category</button>
          </div>`;
      } else {
        resultDiv.innerHTML = `Product "${searchTerm}" not found.`;
      }
    })
    .catch(err => showMessage("❌ Search error.", "error"));
});

// Delete product by name
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
        showMessage("✅ Product deleted successfully.", "success");
      });
    })
    .catch(err => showMessage("❌ Delete error.", "error"));
}

// Edit price
function editPriceByName(name) {
  const newPrice = prompt("Enter the new price:");
  if (!newPrice || isNaN(newPrice)) return showMessage("❌ Invalid price.", "error");

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
        showMessage("✅ Price updated.", "success");
      });
    })
    .catch(err => showMessage("❌ Error updating price.", "error"));
}

// Edit category
function editCategoryByName(name) {
  const newCategory = prompt("Enter the new category:");
  if (!newCategory) return showMessage("❌ Invalid category.", "error");

  fetch(`http://localhost:3000/products?name=${name}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return showMessage("❌ Product not found.", "error");
      const id = data[0].id;

      return fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory.toLowerCase() })
      }).then(() => {
        document.getElementById(`category-${name}`).textContent = newCategory.toLowerCase();
        products = products.map(p => p.name === name ? { ...p, category: newCategory.toLowerCase() } : p);
        updateSetAndMap();
        showMessage("✅ Category updated.", "success");
      });
    })
    .catch(err => showMessage("❌ Error updating category.", "error"));
}

// Make functions globally accessible
window.deleteProductByName = deleteProductByName;
window.editPriceByName = editPriceByName;
window.editCategoryByName = editCategoryByName;
