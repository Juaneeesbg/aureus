// Obtener todos los botones de tamaño
const sizeButtons = document.querySelectorAll('.size-button');

// Agregar un evento a cada botón
sizeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        // Remover la clase 'active' de todos los botones
        sizeButtons.forEach((btn) => btn.classList.remove('active'));
        
        // Agregar la clase 'active' al botón seleccionado
        button.classList.add('active');
    });
});

function changeImage(image) {
    document.getElementById('main-image').src = image;
}

// Datos de los productos
const products = [
    {
        //Camiseta 1
        title: "Black Oversized T-Shirt",
        subtitle: "RoadMap",
        quote: '"Vístete para inspirar, no para impresionar."',
        description: "Esta camiseta oversized negra de la marca Aureus es el equilibrio perfecto entre comodidad y estilo. Hecha de algodón premium de 220 gramos, es ideal para cualquier ocasión.",
        price: "$85,000",
        priceOld: "$120,000",
        model3d: "https://cdn.jsdelivr.net/gh/JBarrera2/model3d@main/BlackRoadmap.glb", // Imagen 3D
        mainImage: "../Coleccion/Galleria/BlaRoadmap1.png", // Imagen principal
        galleryImages: ["../Coleccion/Galleria/BlaRoadmap1.png", "../Coleccion/Galleria/BlaRoadmap2.png", "../Coleccion/Galleria/BlaRoadmap3.png", "Product1-Alt1.png", "Product2.png"]
    },
    {
        //Camiseta 2
        title: "Fall in Love - Oversized Blanca",
        subtitle: "Fall in Love",
        quote: '"Estilo es lo que eres, no lo que usas."',
        description: "Camiseta blanca oversized de Aureus con un diseño urbano, perfecta para un look relajado y moderno. Hecha de algodón premium de 220 gramos, es ideal para cualquier ocasión.",
        price: "$85,000",
        priceOld: "$120,000",
        model3d: "../3D/WhiteCupid.glb", // Imagen 3D
        mainImage: "../Coleccion/Galleria/WhiCupid.png", 
        galleryImages: ["../Coleccion/Galleria/WhiCupid.png", "../Coleccion/Galleria/WhiCupid2.png", "../Coleccion/Galleria/WhiCupid3.png", "Product1-Alt1.png", "Product2.png"]
    },
    {
        //Camiseta 3
        title: "Black Oversized T-Shirt",
        subtitle: "Legacy",
        quote: '"No sigas la moda, sé la moda."',
        description: "Camiseta gris oversized, combinando confort y estilo para el amante del streetwear. Hecha con el mejor algodón y con un corte boxy 220 gramos, es ideal para cualquier ocasión.",
        description1: "Tamaños disponibles: S, M, L, XL.",
        price: "$85,000",
        priceOld: "$120,000",
        model3d: "../3D/BlackDavid.glb", // Imagen 3D
        mainImage: "../Coleccion/Galleria/BlaDavid.png", 
        galleryImages: ["../Coleccion/Galleria/BlaDavid.png", "../Coleccion/Galleria/BlaDavid2.png", "../Coleccion/Galleria/BlaDavid3.png", "Product1-Alt1.png", "Product2.png"]
    },
    {
        //Camiseta 4
        title: "White Oversized T-Shirt",
        subtitle: "By Fire",
        quote: '"No sigas la moda, sé la moda."',
        description: "Camiseta gris oversized, combinando confort y estilo para el amante del streetwear. Hecha con el mejor algodón y con un corte boxy 220 gramos, es ideal para cualquier ocasión.",
        price: "$85,000",
        priceOld: "$120,000",
        model3d: "../3D/WhiteFire.glb", // Imagen 3D
        mainImage: "../Coleccion/Galleria/WhiFire.png", 
        galleryImages: ["../Coleccion/Galleria/WhiFire.png", "../Coleccion/Galleria/WhiFire2.png", "../Coleccion/Galleria/WhiFire3.png", "Product1-Alt1.png", "Product2.png"]
    },
    {
        //Camiseta 5
        title: "Black Oversized T-Shirt",
        subtitle: "No love",
        quote: '"Vístete para inspirar, no para impresionar."',
        description: "Esta camiseta oversized negra de la marca Aureus es el equilibrio perfecto entre comodidad y estilo. Hecha de algodón premium de 220 gramos, es ideal para cualquier ocasión.",
        price: "$85,000",
        priceOld: "$120,000",
        model3d: "../3D/BlackCupid.glb", // Imagen 3D
        mainImage: "../Coleccion/Galleria/BlaCupid.png", // Imagen principal
        galleryImages: ["../Coleccion/Galleria/BlaCupid.png", "../Coleccion/Galleria/BlaCupid2.png", "../Coleccion/Galleria/BlaCupid3.png", "Product1-Alt1.png", "Product2.png"]
    },
    {
        //Camiseta 6
        title: "White Oversized T-Shirt",
        subtitle: "RoadMap",
        quote: '"Estilo es lo que eres, no lo que usas."',
        description: "Camiseta blanca oversized de Aureus con un diseño urbano, perfecta para un look relajado y moderno. Hecha de algodón premium de 220 gramos, es ideal para cualquier ocasión.",
        price: "$85,000",
        priceOld: "$120,000",
        model3d: "../3D/WhiteRoadmap.glb", // Imagen 3D
        mainImage: "../Coleccion/Galleria/WhiRoadmap.png", 
        galleryImages: ["../Coleccion/Galleria/WhiRoadmap.png", "../Coleccion/Galleria/WhiRoadmap2.png", "../Coleccion/Galleria/WhiRoadmap3.png", "Product1-Alt1.png", "Product2.png"]
    },
    {
        //Camiseta 7
        title: "Black Oversized T-Shirt",
        subtitle: "By Fire",
        quote: '"No sigas la moda, sé la moda."',
        description: "Camiseta gris oversized, combinando confort y estilo para el amante del streetwear. Hecha con el mejor algodón y con un corte boxy 220 gramos, es ideal para cualquier ocasión.",
        description1: "Tamaños disponibles: S, M, L, XL.",
        price: "$85,000",
        priceOld: "$120,000",
        model3d: "../3D/BlackFire.glb", // Imagen 3D
        mainImage: "../Coleccion/Galleria/BlaFire.png", 
        galleryImages: ["../Coleccion/Galleria/BlaFire.png", "../Coleccion/Galleria/BlaFire2.png", "../Coleccion/Galleria/BlaFire3.png", "Product1-Alt1.png", "Product2.png"]
    },
];

// Función para cambiar los contenidos según el producto seleccionado
function updateProductContent(productIndex) {
    const product = products[productIndex];

    // Cambiar el título de la página (pestaña)
    document.title = product.title;

    // Cambiar el título y subtítulo principal
    document.getElementById("main-title").textContent = product.title;
    document.getElementById("main-subtitle").textContent = product.subtitle;

    // Cambiar el título del producto en la sección de detalles
    document.getElementById("product-name").innerHTML = `${product.title} <span id="product-subtitle">${product.subtitle}</span>`;

    // Cambiar la cita inspiradora
    document.getElementById("product-quote").textContent = product.quote;

    // Cambiar la descripción
    document.getElementById("product-description").textContent = product.description;

    // Cambiar el precio
    document.getElementById("price").textContent = product.price;
    document.getElementById("price-old").textContent = product.priceOld;

    // Cambiar el modelo 3D
    document.getElementById("model-3d").setAttribute('src', product.model3d);

    // Cambiar la imagen principal
    document.getElementById("main-image").src = product.mainImage;

    // Cambiar las miniaturas de la galería
    const thumbnails = document.querySelectorAll(".thumbnail");
    product.galleryImages.forEach((image, index) => {
        thumbnails[index].src = image;
        thumbnails[index].alt = `Camiseta Imagen ${index + 1}`;
    });
}


// Leer el parámetro productId de la URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('productId'));

// Si el productId es válido, actualizar el contenido del producto
if (!isNaN(productId) && productId >= 0 && productId < products.length) {
    updateProductContent(productId);
} else {
    // Si el parámetro no es válido, mostrar un mensaje de error o cargar el primer producto
    updateProductContent(0);
}






document.addEventListener('DOMContentLoaded', function() {
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const mobileMenu = document.querySelector('.mobile-menu');

    // Verificar si los elementos existen antes de agregar eventos
    if (hamburgerIcon && mobileMenu) {
        hamburgerIcon.addEventListener('click', function() {
            // Toggle hamburger icon animation
            this.classList.toggle('active');
            
            // Toggle mobile menu
            mobileMenu.classList.toggle('active');
            
            // Prevent scrolling when menu is open
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close menu when a menu item is clicked
        const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                hamburgerIcon.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }
});







// Script para gestionar el carrito
let cartCount = 0;  // Variable para almacenar la cantidad de productos en el carrito


// Función para obtener la talla seleccionada
function getSelectedSize() {
    const buttons = document.querySelectorAll('.size-button');
    let selectedSize = null;

    buttons.forEach(button => {
        if (button.classList.contains('selected')) {
            selectedSize = button.id;
        }
    });

    return selectedSize;
}

// Función para actualizar la cantidad en el carrito
function updateCartCount() {
    document.getElementById('cart-count').textContent = cartCount;
}

// Función para agregar el producto al carrito (simulada)
function addToCart(size) {
    // Aquí podrías implementar la lógica de agregar el producto al carrito real
    console.log(`Producto agregado al carrito. Talla: ${size}`);
}

// Agregar un evento de selección de talla
document.querySelectorAll('.size-button').forEach(button => {
    button.addEventListener('click', function() {
        // Limpiar la selección anterior
        document.querySelectorAll('.size-button').forEach(b => b.classList.remove('selected'));
        // Marcar el tamaño seleccionado
        button.classList.add('selected');
    });
});



// Variables globales
// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];  // Cargar carrito desde localStorage

// Función para mostrar el carrito
function showCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    cartItemsContainer.innerHTML = '';  // Limpiar los elementos previos

    let total = 0;
    cart.forEach((item, index) => {
        // Crear el HTML de cada producto en el carrito
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-info">
                <p>${item.title}</p>
                <p>Talla: ${item.size}</p>
                <p>Precio: $${parseFloat(item.price.replace('$', '').replace(',', '')).toLocaleString('es-CO')}</p>
            </div>
            <button class="remove-item" onclick="removeItem(${index})">Eliminar</button>
        `;
        cartItemsContainer.appendChild(itemElement);

        // Actualizar el total
        total += parseFloat(item.price.replace('$', '').replace(',', '')); 
    });

    // Mostrar el total en el carrito con formato colombiano
    cartTotal.textContent = `$${total.toLocaleString('es-CO')}`;

    // Guardar carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para eliminar un producto del carrito
function removeItem(index) {
    cart.splice(index, 1); // Eliminar el producto
    
    // Actualizar el contador global del carrito
    cartCount = cart.length;
    updateCartCount();

    // Volver a mostrar el carrito con los cambios
    showCart(); 
}

// Función para agregar al carrito
function addToCart() {
    const selectedSize = getSelectedSize();
    
    if (!selectedSize) {
        alert('Por favor, selecciona una talla antes de comprar.');
        return;
    }

    // Obtener el índice del producto actual de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('productId')) || 0;
    
    const product = products[productId];

    // Agregar al carrito
    cart.push({
        title: product.title,
        price: product.price,
        image: product.mainImage,
        size: selectedSize
    });

    // Actualizar contador y mostrar carrito
    cartCount = cart.length;
    updateCartCount();
    showCart();

    // Abrir panel lateral del carrito
    document.getElementById('side-panel').classList.add('open');
}
// Cerrar el panel lateral
document.getElementById('close-panel').addEventListener('click', function() {
    document.getElementById('side-panel').classList.remove('open');
});
// Evento para abrir el carrito
document.addEventListener('DOMContentLoaded', function() {
    const cartIcon = document.getElementById('cart-icon');
    const sidePanel = document.getElementById('side-panel');
    const closePanel = document.getElementById('close-panel');

    if (cartIcon) {
        cartIcon.addEventListener('click', function(event) {
            event.preventDefault(); // Prevenir comportamiento por defecto del enlace
            sidePanel.classList.add('open');
            showCart(); // Asegúrate de que esta función existe y actualiza el contenido del carrito
        });
    }

    if (closePanel) {
        closePanel.addEventListener('click', function() {
            sidePanel.classList.remove('open');
        });
    }
});

// Inicializar el contador del carrito al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cartCount = cart.length;
    updateCartCount();
});