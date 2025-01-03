

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
            <button class="remove-item" onclick="removeItem(${index})">🗑️ Eliminar</button>
        `;
        cartItemsContainer.appendChild(itemElement);

        // Actualizar el total
        total += parseFloat(item.price.replace('$', '').replace(',', '')); 
    });

    // Mostrar el total en el carrito con formato colombiano
    cartTotal.textContent = `$${total.toLocaleString('es-CO')}`;

    // Guardar carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Actualizar contador del carrito
    updateCartCount();
}

// Función para eliminar un producto del carrito
function removeItem(index) {
    cart.splice(index, 1); // Eliminar el producto
    
    // Volver a mostrar el carrito con los cambios
    showCart();
    showCheckoutItems(); // Actualizar el checkout
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const paypalAdditionalInfo = document.getElementById('paypal-additional-info');
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    const confirmOrderButton = document.getElementById('confirm-order-button'); // Botón de Confirmar Pedido
    let paypalButtonInstance = null;

    // Función para convertir COP a USD (usando tasa de cambio aproximada)
    function convertCOPtoUSD(copAmount) {
        const exchangeRate = 0.00025; // Ejemplo: 1 COP = 0.00025 USD
        return (copAmount * exchangeRate).toFixed(2);
    }

    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Limpiar cualquier botón de PayPal existente
            if (paypalButtonInstance) {
                paypalButtonContainer.innerHTML = '';
                paypalButtonInstance = null;
            }

            if (this.value === 'paypal') {
                // Mostrar elementos específicos de PayPal
                if (paypalAdditionalInfo) {
                    paypalAdditionalInfo.style.display = 'block';
                }

                if (confirmOrderButton) {
                    confirmOrderButton.style.display = 'none'; // Ocultar el botón de Confirmar Pedido
                }

                if (paypalButtonContainer) {
                    paypalButtonInstance = paypal.Buttons({
                        createOrder: function(data, actions) {
                            const totalCOP = localStorage.getItem('orderTotal') || 
                                             document.getElementById('checkout-total').textContent.replace('$', '').replace(',', '');
                            const totalUSD = convertCOPtoUSD(parseFloat(totalCOP));

                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        value: totalUSD,
                                        currency_code: 'USD'
                                    }
                                }]
                            });
                        },
                        onApprove: function(data, actions) {
                            return actions.order.capture().then(function(details) {
                                localStorage.setItem('paymentMethod', 'paypal');
                                localStorage.setItem('paymentDetails', JSON.stringify(details));
                                window.location.href = '../backend/order-confirmation.html';
                            });
                        },
                        onError: function(err) {
                            console.error('PayPal Error:', err);
                            alert('Hubo un problema con el pago de PayPal. Intenta nuevamente.');
                        }
                    });

                    paypalButtonInstance.render('#paypal-button-container');
                    paypalButtonContainer.style.display = 'block';
                }
            } else {
                // Ocultar elementos específicos de PayPal y mostrar el botón de Confirmar Pedido
                if (paypalAdditionalInfo) {
                    paypalAdditionalInfo.style.display = 'none';
                }

                if (paypalButtonContainer) {
                    paypalButtonContainer.style.display = 'none';
                }

                if (confirmOrderButton) {
                    confirmOrderButton.style.display = 'block'; // Mostrar el botón de Confirmar Pedido
                }
            }
        });
    });
});




// Modificar la función de mostrar items para calcular el total global
function showCheckoutItems() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutTotalElement = document.getElementById('checkout-total');

    checkoutItemsContainer.innerHTML = ''; // Limpiar contenido previo

    let total = 0;
    cart.forEach((item, index) => {
        // Crear el HTML de cada producto en el resumen del checkout
        const itemElement = document.createElement('div');
        itemElement.classList.add('checkout-item');
        
        // Convertir precio a número
        const itemPrice = parseFloat(item.price.replace('$', '').replace(',', ''));
        
        itemElement.innerHTML = `
            <div class="item-details">
                <img src="${item.image}" alt="${item.title}" class="item-image">
                <div class="item-info">
                    <p>${item.title}</p>
                    <p>Talla: ${item.size}</p>
                    <p>Precio: $${itemPrice.toLocaleString('es-CO')}</p>
                </div>
            </div>
            <button class="remove-item" onclick="removeItem(${index})">🗑️ Eliminar</button>
        `;
        checkoutItemsContainer.appendChild(itemElement);

        // Sumar al total
        total += itemPrice;
    });

    // Mostrar el total con formato colombiano
    checkoutTotalElement.textContent = `$${total.toLocaleString('es-CO')}`;
    
    // Almacenar el total en localStorage para uso posterior
    localStorage.setItem('orderTotal', total.toString());
}

// Mostrar productos al cargar la página
document.addEventListener('DOMContentLoaded', showCheckoutItems);

// Al hacer submit del formulario de cliente
// Modificar el evento de submit existente para manejar PayPal
document.getElementById('customer-info').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const city = document.getElementById('city').value;
    const email = document.getElementById('email').value;
    const notes = document.getElementById('notes').value;
    const paymentMethodElement = document.querySelector('input[name="payment-method"]:checked');
    
    if (!paymentMethodElement) {
        alert('Por favor, selecciona un método de pago.');
        return;
    }
    
    const paymentMethod = paymentMethodElement.value;
    if (paymentMethod === 'pse') {
        handleMercadoPagoPayment();
        return;
    }
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Obtener el total almacenado
    const total = localStorage.getItem('orderTotal') || '0';

    const orderData = {
        name,
        address,
        phone,
        city,
        email,
        notes,
        paymentMethod,
        cart,
        total: parseFloat(total),
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch('http://localhost:3000/save-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
    
        const result = await response.json();
    
        if (response.ok) {
            // Guardar información adicional en localStorage
            localStorage.setItem('lastOrder', JSON.stringify(orderData));
            localStorage.setItem('orderId', result.orderId);
            localStorage.setItem('paymentMethod', paymentMethod);
            
            // Limpiar carrito
            localStorage.removeItem('cart');
            
            // Redirigir a confirmación de orden
            window.location.href = '../backend/order-confirmation.html';
        } else {
            console.error('Error al procesar el pedido:', result.message);
            alert('Error al procesar tu pedido. Por favor, intenta de nuevo.');
        }
    } catch (error) {
        console.error('Error de conexión con el servidor:', error);
        alert('Error de conexión. Intenta más tarde.');
    }
});


const elemento = document.getElementById('id-del-elemento');
if (elemento) {
    elemento.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    const payButton = document.getElementById('pay-button');
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const nameField = document.getElementById('name');
    const addressField = document.getElementById('address');
    const phoneField = document.getElementById('phone');
    
    // Validación del formulario
    function isFormComplete() {
        return nameField.value.trim() !== '' &&
               addressField.value.trim() !== '' &&
               phoneField.value.trim() !== '';
    }
    
    // Función para redirigir a PSE
    function redirectToPSE() {
        // Aquí deberías redirigir al usuario a una página de pago proporcionada por la pasarela de PSE
        // Esto es solo un ejemplo, debes usar la URL de la pasarela de pago de PSE que tengas configurada
        window.location.href = "https://pse.pagoseguro.com.co"; // Reemplaza con la URL real de PSE
    }
    
    // Evento al hacer clic en el botón de pago
    payButton.addEventListener('click', function() {
        if (!isFormComplete()) {
            alert('Por favor, complete todos los campos del formulario antes de proceder.');
        } else {
            // Validamos qué método de pago está seleccionado
            const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
            if (selectedPaymentMethod) {
                if (selectedPaymentMethod.value === 'pse') {
                    // Redirigimos a PSE
                    redirectToPSE();
                } else if (selectedPaymentMethod.value === 'nequi') {
                    // Redirigimos a Nequi
                    redirectToPayment('nequi');
                } else if (selectedPaymentMethod.value === 'daviplata') {
                    // Redirigimos a Daviplata
                    redirectToPayment('daviplata');
                }
            } else {
                alert('Por favor, seleccione un método de pago.');
            }
        }
    });
});



// Inicializar MercadoPago
const mp = new MercadoPago('TEST-ae78a8d4-5f93-4696-8b9e-861462ba5de7');

// Agregar listener solo para PSE
document.addEventListener('DOMContentLoaded', function() {
    const pseRadio = document.getElementById('pse-payment');
    const walletContainer = document.getElementById('wallet_container');
    
    if (pseRadio) {
        pseRadio.addEventListener('change', function() {
            if (this.checked) {
                // Mostrar contenedor de MercadoPago
                walletContainer.style.display = 'block';
                
                // Obtener el total del carrito
                const total = localStorage.getItem('orderTotal');
                
                // Crear preferencia de MercadoPago
                fetch('https://api.mercadopago.com/checkout/preferences', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer TEST-3595916766790228-121822-82cafcef1b52b84fc52413c41dd35333-228009320',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        items: [{
                            title: "Compra en Aureus",
                            quantity: 1,
                            currency_id: "COP",
                            unit_price: parseFloat(total)
                        }],
                        payment_methods: {
                            default_payment_method_id: "pse"
                        },
                        back_urls: {
                            success: `${window.location.origin}/backend/order-confirmation.html`,
                            failure: `${window.location.origin}/checkout/checkout.html`,
                            pending: `${window.location.origin}/backend/order-confirmation.html`
                        }
                    })
                })
                .then(response => response.json())
                .then(preference => {
                    // Crear botón de MercadoPago
                    mp.checkout({
                        preference: {
                            id: preference.id
                        },
                        render: {
                            container: '#wallet_container',
                            label: 'Pagar con PSE'
                        }
                    });
                });
            } else {
                // Ocultar contenedor de MercadoPago
                walletContainer.style.display = 'none';
            }
        });
    }

    // Escuchar otros cambios de método de pago para ocultar MercadoPago
    const otherPaymentMethods = document.querySelectorAll('input[name="payment-method"]:not(#pse-payment)');
    otherPaymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (walletContainer) {
                walletContainer.style.display = 'none';
            }
        });
    });
});