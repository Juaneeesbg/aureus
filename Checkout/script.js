// Variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para convertir COP a USD (usando tasa de cambio aproximada)
function convertCOPtoUSD(copAmount) {
    const exchangeRate = 0.00025;
    return (copAmount * exchangeRate).toFixed(2);
}

// Función para validar el formulario
function isFormComplete() {
    const requiredFields = ['name', 'address', 'phone', 'email', 'city'];
    return requiredFields.every(field => {
        const element = document.getElementById(field);
        return element && element.value.trim() !== '';
    });
}

// Función para actualizar la visibilidad y mensajes de los métodos de pago
function updatePaymentMethods() {
    const isValid = isFormComplete();
    const paypalContainer = document.getElementById('paypal-button-container');
    const walletContainer = document.getElementById('wallet_container');
    const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
    
    // PayPal
    if (paypalContainer) {
        let errorMsg = paypalContainer.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.className = 'error-message';
            paypalContainer.insertBefore(errorMsg, paypalContainer.firstChild);
        }
        errorMsg.style.color = 'red';
        errorMsg.style.display = isValid ? 'none' : 'block';
        errorMsg.textContent = 'Por favor, complete todos los campos del formulario';
        
        if (selectedPaymentMethod === 'paypal') {
            paypalContainer.style.display = 'block';
            if (isValid) {
                const paypalButton = paypalContainer.querySelector('.paypal-buttons');
                if (!paypalButton) {
                    configurePayPalButton();
                } else {
                    paypalButton.style.display = 'block';
                }
            }
        }
    }
    
    // MercadoPago
    if (walletContainer) {
        let errorMsg = walletContainer.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.className = 'error-message';
            walletContainer.insertBefore(errorMsg, walletContainer.firstChild);
        }
        errorMsg.style.color = 'red';
        errorMsg.style.display = isValid ? 'none' : 'block';
        errorMsg.textContent = 'Por favor, complete todos los campos del formulario';
        
        if (selectedPaymentMethod === 'pse') {
            walletContainer.style.display = 'block';
            if (isValid) {
                if (!walletContainer.querySelector('.mercadopago-button')) {
                    configurePSEPayment();
                }
            } else {
                // Limpiar el contenedor cuando el formulario es inválido
                walletContainer.innerHTML = '';
                // Recrear el mensaje de error
                const newErrorMsg = document.createElement('p');
                newErrorMsg.className = 'error-message';
                newErrorMsg.style.color = 'red';
                newErrorMsg.textContent = 'Por favor, complete todos los campos del formulario';
                walletContainer.appendChild(newErrorMsg);
            }
        }
    }
    
    return isValid;
}

// Inicialización y manejo de pagos
document.addEventListener('DOMContentLoaded', function() {
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const paypalAdditionalInfo = document.getElementById('paypal-additional-info');
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    const confirmOrderButton = document.getElementById('confirm-order-button');
    const walletContainer = document.getElementById('wallet_container');
    let paypalButtonInstance = null;

    // Inicializar MercadoPago si está disponible
    let mp;
    if (typeof MercadoPago !== 'undefined') {
        mp = new MercadoPago('TEST-ae78a8d4-5f93-4696-8b9e-861462ba5de7');
    }

    // Event listeners para el formulario
    const form = document.getElementById('customer-info');
    if (form) {
        const formInputs = form.querySelectorAll('input[required]');
        formInputs.forEach(input => {
            input.addEventListener('input', updatePaymentMethods);
        });
    }

    // Función para crear preferencia de MercadoPago
    async function createMercadoPagoPreference(total) {
        try {
            const preferenceData = {
                items: [{
                    title: "Compra en Aureus",
                    quantity: 1,
                    currency_id: "COP",
                    unit_price: parseFloat(total)
                }],
                payment_methods: {
                    excluded_payment_types: [],
                    installments: 1
                },
                back_urls: {
                    success: `${window.location.origin}/backend/order-confirmation.html`,
                    failure: `${window.location.origin}/checkout/checkout.html`,
                    pending: `${window.location.origin}/backend/order-confirmation.html`
                },
                auto_return: "approved",
                statement_descriptor: "Aureus Store",
                external_reference: new Date().getTime().toString()
            };

            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer TEST-3595916766790228-121822-82cafcef1b52b84fc52413c41dd35333-228009320',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferenceData)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear la preferencia:', error);
            throw error;
        }
    }

    // Función para inicializar el botón de MercadoPago
    function initializeMercadoPagoButton(preferenceId) {
        if (!walletContainer || !mp) return;
        
        walletContainer.innerHTML = '';
        
        if (!isFormComplete()) {
            updatePaymentMethods();
            return;
        }
    
        const mpButton = mp.checkout({
            preference: {
                id: preferenceId
            },
            render: {
                container: '#wallet_container',
                label: 'Pagar con Mercado Pago',
                type: 'wallet'
            },
            theme: {
                elementsColor: '#2D3277',
                headerColor: '#2D3277'
            },
            onClick: function() {
                if (!isFormComplete()) {
                    updatePaymentMethods();
                    return false;
                }
                return true;
            },
            onSubmit: function() {
                if (!isFormComplete()) {
                    updatePaymentMethods();
                    return false;
                }
                const orderData = {
                    name: document.getElementById('name').value,
                    address: document.getElementById('address').value,
                    phone: document.getElementById('phone').value,
                    city: document.getElementById('city').value,
                    email: document.getElementById('email').value,
                    notes: document.getElementById('notes').value,
                    paymentMethod: 'pse',
                    cart: cart,
                    total: parseFloat(localStorage.getItem('orderTotal') || '0'),
                    discountCode: localStorage.getItem('appliedPromoCode') || 'No código', // Añadido
                    total: parseFloat(localStorage.getItem('orderTotal') || '0'),
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('lastOrder', JSON.stringify(orderData));
                localStorage.setItem('paymentMethod', 'pse');
                return true;
            }
        });
    }

    // Función para manejar diferentes métodos de pago
    function handlePaymentMethod(paymentMethod) {
        if (paypalAdditionalInfo) {
            paypalAdditionalInfo.style.display = paymentMethod === 'paypal' ? 'block' : 'none';
        }
        if (paypalButtonContainer) {
            paypalButtonContainer.style.display = paymentMethod === 'paypal' ? 'block' : 'none';
        }
        if (confirmOrderButton) {
            confirmOrderButton.style.display = (paymentMethod === 'paypal' || paymentMethod === 'pse') ? 'none' : 'block';
        }
        if (walletContainer) {
            walletContainer.style.display = paymentMethod === 'pse' ? 'block' : 'none';
        }

        if (paymentMethod === 'paypal' && !paypalButtonInstance) {
            configurePayPalButton();
        }

        if (paymentMethod === 'pse') {
            configurePSEPayment();
        }

        updatePaymentMethods();
    }

    // Configurar PayPal
    function configurePayPalButton() {
        if (!paypalButtonContainer) return;
    
        if (!isFormComplete()) {
            updatePaymentMethods();
            return;
        }
    
        paypalButtonInstance = paypal.Buttons({
            onClick: function(data, actions) {
                if (!isFormComplete()) {
                    updatePaymentMethods();
                    return false;
                }
                return true;
            },
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
            onApprove: async function(data, actions) {
                try {
                    const details = await actions.order.capture();
                    const orderData = {
                        name: document.getElementById('name').value,
                        address: document.getElementById('address').value,
                        phone: document.getElementById('phone').value,
                        city: document.getElementById('city').value,
                        email: document.getElementById('email').value,
                        notes: document.getElementById('notes').value,
                        paymentMethod: 'paypal',
                        cart: cart,
                        total: parseFloat(localStorage.getItem('orderTotal') || '0'),
                        discountCode: localStorage.getItem('appliedPromoCode') || 'No código', // Añadido
                        timestamp: new Date().toISOString(),
                        paypalDetails: details
                    };
    
                    // Save order to backend before redirecting
                    const response = await fetch('https://aureus-gcph.onrender.com/save-order', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(orderData),
                    });
    
                    if (response.ok) {
                        const result = await response.json();
                        localStorage.setItem('lastOrder', JSON.stringify(orderData));
                        localStorage.setItem('orderId', result.orderId);
                        localStorage.setItem('paymentMethod', 'paypal');
                        localStorage.removeItem('cart');
                        window.location.href = '../backend/order-confirmation.html';
                    } else {
                        throw new Error('Error al guardar el pedido');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al procesar el pedido. Por favor, intenta nuevamente.');
                }
            },
            onError: function(err) {
                console.error('PayPal Error:', err);
                alert('Hubo un problema con el pago de PayPal. Intenta nuevamente.');
            }
        });
        paypalButtonInstance.render('#paypal-button-container');
    }
    
    // Configurar PSE
    async function configurePSEPayment() {
        try {
            const total = localStorage.getItem('orderTotal');
            if (!total || isNaN(parseFloat(total))) {
                throw new Error('Total inválido');
            }

            const preferenceResponse = await createMercadoPagoPreference(parseFloat(total));
            initializeMercadoPagoButton(preferenceResponse.id);
        } catch (error) {
            console.error('Error al configurar PSE:', error);
            alert('Error al configurar el pago PSE. Por favor, intenta nuevamente.');
        }
    }

    // Event Listeners
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            handlePaymentMethod(this.value);
        });
    });

    // Manejar envío del formulario para Nequi/Daviplata
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
            if (!paymentMethod) {
                alert('Por favor, selecciona un método de pago.');
                return;
            }

            if (!isFormComplete()) {
                alert('Por favor, completa todos los campos requeridos.');
                return;
            }

            // Obtener el código de descuento si existe
            const discountCode = localStorage.getItem('appliedPromoCode') || '';
            const total = parseFloat(localStorage.getItem('orderTotal') || '0');

            const orderData = {
                name: document.getElementById('name').value,
                address: document.getElementById('address').value,
                phone: document.getElementById('phone').value,
                city: document.getElementById('city').value,
                email: document.getElementById('email').value,
                notes: document.getElementById('notes').value,
                paymentMethod: paymentMethod.value,
                cart: cart,
                total: parseFloat(localStorage.getItem('orderTotal') || '0'),
                discountCode: localStorage.getItem('appliedPromoCode') || 'No código', // Añadido
                timestamp: new Date().toISOString()
            };

            if (paymentMethod.value === 'nequi' || paymentMethod.value === 'credit-card') {
                try {
                    const response = await fetch('https://aureus-gcph.onrender.com/save-order', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(orderData),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        localStorage.setItem('lastOrder', JSON.stringify(orderData));
                        localStorage.setItem('orderId', result.orderId);
                        localStorage.setItem('paymentMethod', paymentMethod.value);
                        localStorage.removeItem('cart');
                        window.location.href = '../backend/order-confirmation.html';
                    } else {
                        throw new Error('Error al procesar el pedido');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al procesar el pedido. Por favor, intenta nuevamente.');
                }
            }
        });
    }
});










const formValidation = {
    isValid: {},
    
    checkAllFields() {
        return Object.values(this.isValid).every(valid => valid === true);
    },
    
    updateFieldStatus(fieldId, status) {
        this.isValid[fieldId] = status;
        this.updateSubmitButton();
    },
    
    updateSubmitButton() {
        const confirmButton = document.getElementById('confirm-order-button');
        if (confirmButton) {
            confirmButton.disabled = !this.checkAllFields();
        }
    }
};

const fields = {
    name: {
        regex: /^[a-zA-Z\s]{3,}$/,
        message: 'Por favor, ingresa un nombre válido (mínimo 3 letras)',
        required: true
    },
    email: {
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Por favor, ingresa un correo electrónico válido',
        required: true
    },
    phone: {
        regex: /^\d{10}$/,
        message: 'Por favor, ingresa un número de teléfono válido (10 dígitos)',
        required: true
    },
    address: {
        regex: /.{10,}/,
        message: 'Por favor, ingresa una dirección válida (mínimo 10 caracteres)',
        required: true
    },
    city: {
        regex: /^[a-zA-Z\s]{3,}$/,
        message: 'Por favor, ingresa una ciudad válida',
        required: true
    },
    'postal-code': {
        regex: /^\d{5,6}$/,
        message: 'Por favor, ingresa un código postal válido',
        required: true
    }
};

// Inicializar validación de campos
Object.keys(fields).forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (!input) return;

    // Inicializar el estado de validación como neutro
    if (fields[fieldId].required) {
        formValidation.isValid[fieldId] = false;
    }

    // Crear elementos de validación
    const validationIcon = document.createElement('span');
    validationIcon.className = 'validation-icon';
    validationIcon.style.display = 'none'; // Inicialmente oculto

    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'none'; // Inicialmente oculto

    // Agregar elementos al DOM
    input.parentNode.appendChild(validationIcon);
    input.parentNode.appendChild(errorMessage);

    // Evento de validación
    input.addEventListener('input', function() {
        // Mostrar validación solo si el campo no está vacío o si ya se intentó enviar el formulario
        if (this.value.trim() !== '') {
            const isValid = fields[fieldId].regex.test(this.value);
            validationIcon.style.display = 'block';
            
            if (isValid) {
                this.style.borderColor = '#4CAF50';
                validationIcon.style.color = '#4CAF50';
                errorMessage.style.display = 'none';
            } else {
                this.style.borderColor = '#f44336';
                validationIcon.style.color = '#f44336';
                errorMessage.textContent = fields[fieldId].message;
                errorMessage.style.display = 'block';
            }
            
            if (fields[fieldId].required) {
                formValidation.updateFieldStatus(fieldId, isValid);
            }
        } else {
            // Campo vacío: restaurar estado inicial
            this.style.borderColor = '';
            validationIcon.style.display = 'none';
            errorMessage.style.display = 'none';
            if (fields[fieldId].required) {
                formValidation.updateFieldStatus(fieldId, false);
            }
        }
    });
});

// Funcionalidad de la barra de progreso
const progressBar = {
    currentStep: 1,
    descriptions: [
        "Llena tus datos personales para recibir tu pedido.",
        "Selecciona tu método de pago preferido.",
        "Revisa tu pedido antes de confirmar."
    ],
    
    updateProgress(step) {
        this.currentStep = step;
        document.querySelectorAll('.progress-step').forEach((el, index) => {
            if (index < step) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        const progressLine = document.querySelector('.progress-line-fill');
        progressLine.style.width = `${((step - 1) / 2) * 100}%`;

        const description = document.querySelector('.progress-description');
        description.textContent = this.descriptions[step - 1];
    }
};



// Datos de los productos
const products = [
    {
        //Camiseta 1
        title: "Roadmap - Oversized Negra",
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
        title: "Legacy - Oversized Negra",
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
        title: "ByFire - Oversized Blanca",
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
        title: "NoLove - Oversized Negra",
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
        title: "Roadmap - Oversized Blanca",
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
        title: "ByFire - Oversized Negra",
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


// Funcionalidad del popup de productos relacionados
const relatedProductsPopup = {
    popup: document.querySelector('.related-products-popup'),
    shownForCurrentPayment: false,
    
    show() {
        if (!this.shownForCurrentPayment) {
            this.generateRandomProducts();
            this.popup.style.display = 'flex';
            this.shownForCurrentPayment = true;
        }
    },
    
    hide() {
        this.popup.style.display = 'none';
    },

    generateRandomProducts() {
        const urlParams = new URLSearchParams(window.location.search);
        const currentProductId = parseInt(urlParams.get('productId')) || 0;
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartProductTitles = currentCart.map(item => item.title);
        const availableProducts = products.filter((product, index) => {
            return index !== currentProductId && !cartProductTitles.includes(product.title);
        });
        
        if (availableProducts.length < 2) {
            this.popup.querySelector('.related-products').innerHTML = `
                <p>¡Ya tienes la mayoría de nuestros productos en tu carrito!</p>
            `;
            return;
        }

        const selectedProducts = [];
        while (selectedProducts.length < 2 && availableProducts.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableProducts.length);
            const product = availableProducts.splice(randomIndex, 1)[0];
            selectedProducts.push(product);
        }

        const productsContainer = this.popup.querySelector('.related-products');
        productsContainer.innerHTML = selectedProducts.map((product) => `
            <div class="related-product" data-id="${products.indexOf(product)}">
                <img src="${product.mainImage}" alt="${product.title}">
                <h4>${product.title}</h4>
                <p>${product.price}</p>
                <select class="size-selector">
                    <option value="">Seleccionar talla</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                </select>
                <button class="add-related">Agregar al pedido</button>
            </div>
        `).join('');

        this.initProductListeners();
    },

    initProductListeners() {
        document.querySelectorAll('.related-product').forEach(product => {
            const img = product.querySelector('img');
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                const productId = product.dataset.id;
                window.location.href = `../PAG1/Product.html?productId=${productId}`;
            });

            const addButton = product.querySelector('.add-related');
            const sizeSelector = product.querySelector('.size-selector');

            addButton.addEventListener('click', () => {
                const selectedSize = sizeSelector.value;
                if (!selectedSize) {
                    alert('Por favor selecciona una talla');
                    return;
                }

                const productId = parseInt(product.dataset.id);
                const productData = {
                    title: products[productId].title,
                    price: products[productId].price,
                    image: products[productId].mainImage,
                    size: selectedSize
                };

                cart.push(productData);
                localStorage.setItem('cart', JSON.stringify(cart));
                
                updateCartCount();
                showCart();
                showCheckoutItems();
                
                addButton.textContent = '¡Agregado!';
                addButton.style.backgroundColor = '#4CAF50';
            });
        });
    },

    init() {
        // Inicializar el botón de "No, gracias"
        const closeButton = document.querySelector('.close-popup');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hide();
            });
        }
    }
};



// Funcionalidad del código promocional
const promoCode = {
    validCodes: {
        'AUREUS10': 10000,
        'WELCOME20': 20000
    },
    appliedCode: null,

    init() {
        const applyButton = document.getElementById('apply-promo');
        if (!applyButton) return;

        applyButton.addEventListener('click', () => {
            const promoInput = document.getElementById('promo-code');
            const message = document.getElementById('promo-message');
            const code = promoInput.value.trim().toUpperCase();
            
            if (this.validCodes[code]) {
                if (this.appliedCode) {
                    message.style.color = '#f44336';
                    message.textContent = 'Ya hay un código aplicado';
                    return;
                }
            
                this.appliedCode = code;
                const discount = this.validCodes[code];
                
                // Obtener el total actual como número
                const currentTotal = parseFloat(localStorage.getItem('orderTotal') || '0');
                const newTotal = Math.max(0, currentTotal - discount);
                
                // Actualizar localStorage con el total y el código
                localStorage.setItem('orderTotal', newTotal.toString());
                localStorage.setItem('appliedPromoCode', code); // Añade esta línea
                
                // Actualizar la UI
                const totalElement = document.getElementById('checkout-total');
                if (totalElement) {
                    totalElement.textContent = `$${newTotal.toLocaleString('es-CO')}`;
                }
                
                message.style.color = '#4CAF50';
                message.textContent = `¡Código aplicado! Descuento: $${discount.toLocaleString('es-CO')}`;
                promoInput.disabled = true;
                applyButton.disabled = true;
            } else {
                message.style.color = '#f44336';
                message.textContent = 'El código ingresado no es válido';
            }
        });
    }
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    const errorContainer = document.createElement('div');
    errorContainer.style.color = '#f44336';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.marginBottom = '10px';
    errorContainer.style.display = 'none';
    
    const paymentMethodsContainer = document.querySelector('.payment-methods');
    if (paymentMethodsContainer) {
        paymentMethodsContainer.insertBefore(errorContainer, paymentMethodsContainer.firstChild);
    }

    // Event listeners para métodos de pago
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.checked) {
                // Mostrar el popup inmediatamente
                relatedProductsPopup.show();
                progressBar.updateProgress(2);
                
                // Mostrar mensaje de error si el formulario está incompleto
                if (!formValidation.checkAllFields()) {
                    errorContainer.textContent = 'Por favor, complete todos los campos del formulario antes de seleccionar un método de pago';
                    errorContainer.style.display = 'block';
                } else {
                    errorContainer.style.display = 'none';
                }
            }
        });
    });

    // Escuchar cambios en los campos del formulario
    document.querySelectorAll('input[required]').forEach(input => {
        input.addEventListener('input', () => {
            if (formValidation.checkAllFields()) {
                errorContainer.style.display = 'none';
            }
        });
    });

    // Inicializar el popup y el código promocional
    relatedProductsPopup.init();
    promoCode.init();
});
















// Función para mostrar el carrito
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

    // Actualizar contador del carrito
    updateCartCount();
}

// Función para eliminar un producto del carrito
function removeItem(index) {
    cart.splice(index, 1); // Eliminar el producto
    
    // Guardar el carrito actualizado en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar todas las vistas
    updateAllViews();
}
function updateAllViews() {
    // Actualizar el carrito
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel) {
        showCart();
    }
    
    // Actualizar el checkout
    const checkoutItems = document.getElementById('checkout-items');
    if (checkoutItems) {
        showCheckoutItems();
    }
    
    // Actualizar el contador del carrito
    updateCartCount();
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
    }
}

// Función para mostrar items en el checkout y calcular el total global
function showCheckoutItems() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutTotalElement = document.getElementById('checkout-total');

    if (!checkoutItemsContainer || !checkoutTotalElement) return;

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

// Inicializar la visualización de productos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const cartIcon = document.getElementById('cart-icon');
    const sidePanel = document.getElementById('side-panel');
    const closePanel = document.getElementById('close-panel');

    if (cartIcon) {
        cartIcon.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("Carrito abierto"); // Verifica si se dispara el evento
            sidePanel.classList.add('open');
            showCart();
        });
    }
    

    if (closePanel) {
        closePanel.addEventListener('click', function() {
            sidePanel.classList.remove('open');
        });
    }

    // Inicializar el contador del carrito
    updateCartCount();
    showCheckoutItems();
});
