let products = [];
let productSet = new Set();
let productMap = new Map();

// Load products on start
fetch("http://localhost:3000/products")
  .then(res => res.json())
  .then(data => {
    products = data;
    productSet = new Set(products.map(p => p.name.toLowerCase()));
    productMap = new Map(products.map(p => [p.category.toLowerCase(), p.name]));
  });

// Add product
document.getElementById("productForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim().toLowerCase();
  const price = parseFloat(document.getElementById("price").value);
  const category = document.getElementById("category").value.trim().toLowerCase();

  if (productSet.has(name)) {
    alert(`The product "${name}" already exists.`);
    return;
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
      productSet.add(name);
      productMap.set(category, name);
      console.log("Product added:", product);
      e.target.reset();
    });
});

// Search product
document.getElementById("searchBtn").addEventListener("click", () => {
  const searchTerm = document.getElementById("search").value.trim().toLowerCase();
  const resultDiv = document.getElementById("searchResult");
  resultDiv.innerHTML = "";

  fetch("http://localhost:3000/products?name=" + searchTerm)
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
    });
});

// Delete by name
function deleteProductByName(name) {
  if (!confirm(`Delete the product "${name}"?`)) return;

  fetch(`http://localhost:3000/products?name=${name}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return alert("Product not found.");
      const id = data[0].id;

      return fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE"
      });
    })
    .then(() => {
      document.getElementById("searchResult").innerHTML =
        `Product deleted successfully.`;
      products = products.filter(p => p.name !== name);
    })
    .catch(err => console.error("Delete error:", err));
}

// Edit price by name
function editPriceByName(name) {
  const newPrice = prompt("Enter the new price:");
  if (!newPrice || isNaN(newPrice)) return alert("Invalid price.");

  fetch(`http://localhost:3000/products?name=${name}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return alert("Product not found.");
      const id = data[0].id;

      return fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: parseFloat(newPrice) })
      });
    })
    .then(() => {
      document.getElementById(`price-${name}`).textContent = parseFloat(newPrice);
    });
}

// Edit category by name
function editCategoryByName(name) {
  const newCategory = prompt("Enter the new category:");
  if (!newCategory) return alert("Invalid category.");

  fetch(`http://localhost:3000/products?name=${name}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) return alert("Product not found.");
      const id = data[0].id;

      return fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory.toLowerCase() })
      });
    })
    .then(() => {
      document.getElementById(`category-${name}`).textContent = newCategory.toLowerCase();
    });
}

// Make functions globally accessible
window.deleteProductByName = deleteProductByName;
window.editPriceByName = editPriceByName;
window.editCategoryByName = editCategoryByName;
