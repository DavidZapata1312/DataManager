const productos = {
    1: { id: 101, nombre: "laptop", precio: 3000 },
    2: { id: 102, nombre: "teclado", precio: 1500 },
    3: { id: 103, nombre: "mouse", precio: 500 }
};

console.log("Productos iniciales", productos);

// Set para evitar duplicados
const setProductos = new Set(Object.values(productos).map(p => p.nombre.toLowerCase()));

// Map de categorías
const mapProductos = new Map([
    ["electronica", "laptop"],
    ["accesorios", "mouse"],
    ["accesorios", "teclado"]
]);

// Mostrar contenido inicial
for (const id in productos) {
    console.log(`Producto ID: ${id}, Detalles`, productos[id]);
}
for (const producto of setProductos) {
    console.log("Producto único", producto);
}
mapProductos.forEach((producto, categoria) => {
    console.log(`Categoría: ${categoria}, Producto: ${producto}`);
});

// IDs automáticos
let nextId = Object.keys(productos).length + 1;
let nextInternalId = 104;

// Agregar producto
document.getElementById("formProducto").addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim().toLowerCase();
    const precio = parseFloat(document.getElementById("precio").value);
    const categoria = document.getElementById("categoria").value.trim().toLowerCase();

    if (setProductos.has(nombre)) {
        console.warn(`El producto "${nombre}" ya existe y no se puede agregar duplicado.`);
        return;
    }

    productos[nextId] = {
        id: nextInternalId,
        nombre: nombre,
        precio: precio
    };

    setProductos.add(nombre);
    mapProductos.set(categoria, nombre); // Asociar categoría con producto

    console.log(`✅ Producto agregado:`, productos[nextId]);
    console.log(`🗂️ Categoría actualizada: ${categoria} → ${nombre}`);

    nextId++;
    nextInternalId++;

    e.target.reset();
});

// Buscar producto
document.getElementById("buscarBtn").addEventListener("click", () => {
    const termino = document.getElementById("busqueda").value.trim().toLowerCase();
    const resultadoDiv = document.getElementById("resultadoBusqueda");
    resultadoDiv.innerHTML = ""; // limpiar

    const encontrado = Object.values(productos).find(p => p.nombre.toLowerCase() === termino);

    if (encontrado) {
        // Buscar categoría asociada
        let categoriaEncontrada = null;
        for (const [categoria, producto] of mapProductos.entries()) {
            if (producto.toLowerCase() === termino) {
                categoriaEncontrada = categoria;
                break;
            }
        }

        resultadoDiv.innerHTML = `
            <div class="resultado">
                <strong>Nombre:</strong> ${encontrado.nombre}<br>
                <strong>Precio:</strong> $${encontrado.precio}<br>
                <strong>ID interno:</strong> ${encontrado.id}<br>
                <strong>Categoría:</strong> ${categoriaEncontrada ?? "Sin categoría"}
            </div>
        `;
    } else {
        resultadoDiv.innerHTML = `
            <div class="resultado">
                Producto "<em>${termino}</em>" no encontrado.
            </div>
        `;
    }
});
