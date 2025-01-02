const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const paypal = require('@paypal/checkout-server-sdk');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const router = express.Router();

// Ruta para guardar la orden
const Order = require('./orderModel');  // Importar el modelo de la orden
// Configuración de CORS más permisiva para desarrollo
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000', 'http://aureus-gcph.onrender.com/' ],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());


mongoose.connect('mongodb+srv://admin_aureus:JEsteban9907@clientaureus.smjo7.mongodb.net/aureusDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Conectado a MongoDB');
})
.catch(err => {
    console.error('Error al conectar a MongoDB', err);
});



// Configuración de PayPal
const environment = new paypal.core.SandboxEnvironment(
    'AffJ8Bg8BWFqNdOzI1_-0HYnu_lwp-VJt2oAkzxINlpwgIaVDoDP_0WEcJJVomg-XM6BioOJNqyqOX6R', // Client ID
    'EAleamWidr09atqTD67J5HgXx1452Ww63LnCmTybt_PuXj2ergRjd5jzCksEej83jItVwLppb3QRGDsm' // Reemplaza con tu Client Secret
);
const client = new paypal.core.PayPalHttpClient(environment);




// Ruta para crear orden de PayPal
app.post('/create-paypal-order', async (req, res) => {
    try {
        const ordersData = await fs.readFile('orders.json', 'utf8');
        const orders = JSON.parse(ordersData);
        const lastOrder = orders[orders.length - 1];
        const total = lastOrder.cart.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '').replace(',', '')), 0);

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: total.toFixed(2)
                }
            }]
        });

        const order = await client.execute(request);
        res.json({ id: order.result.id, total: total.toFixed(2) });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ message: 'Hubo un problema al procesar el pago de PayPal', error: error.message });
    }
});


app.post('/save-order', async (req, res) => {
    try {
        const orderData = req.body;
        orderData.id = uuidv4(); // Añadir un ID único a cada orden
        orderData.status = 'pendiente'; // Estado inicial

        // Crear una nueva orden con el modelo de MongoDB
        const newOrder = new Order(orderData);

        // Guardar la nueva orden en la base de datos
        await newOrder.save();

        res.status(200).json({ message: 'Pedido guardado exitosamente', orderId: newOrder.id });
    } catch (error) {
        console.error('Error al guardar la orden:', error);
        res.status(500).json({ message: 'Error al guardar la orden.', error: error.toString() });
    }
});

// Agregar esta ruta en tu archivo de rutas
app.post('/update-tracking', async (req, res) => {
    try {
        const { orderId, trackingStatus } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            orderId,
            { tracking: trackingStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.json({ 
            success: true, 
            message: 'Estado de tracking actualizado exitosamente',
            order 
        });
    } catch (error) {
        console.error('Error al actualizar tracking:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar el estado de tracking' 
        });
    }
});

// Ruta para actualizar el estado de una orden
app.post('/update-order-status', async (req, res) => {
    const { orderId, status } = req.body;

    console.log('Recibido: ', orderId, status);

    try {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada.' });
        }

        console.log('Orden actualizada:', order);
        res.json({ message: 'Estado de la orden actualizado.', order });
    } catch (error) {
        console.error('Error al actualizar el estado de la orden:', error);
        res.status(500).json({ message: 'Error al actualizar el estado.' });
    }
});



// Ruta para confirmar pago
app.post('/confirm-payment', async (req, res) => {
    const { orderId } = req.body;

    try {
        const data = await fs.readFile('orders.json', 'utf8');
        let orders = JSON.parse(data);
        const orderIndex = orders.findIndex(order => order.id === orderId);

        if (orderIndex !== -1) {
            orders[orderIndex].status = 'confirmado'; // Cambiar el estado a 'confirmado'
            await fs.writeFile('orders.json', JSON.stringify(orders, null, 2));
            res.json({ message: 'Pago confirmado exitosamente' });
        } else {
            res.status(404).json({ message: 'Orden no encontrada' });
        }
    } catch (error) {
        console.error('Error al confirmar pago:', error);
        res.status(500).json({ message: 'Error al confirmar el pago', error: error.message });
    }
});

// Ruta para eliminar una orden
app.delete('/delete-order/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada.' });
        }

        res.json({ message: 'Orden eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la orden:', error);
        res.status(500).json({ message: 'Error al eliminar la orden.' });
    }
});


// Ruta para obtener las órdenes
app.get('/get-orders', async (req, res) => {
    try {
        const orders = await Order.find(); // Buscar todas las órdenes en la base de datos
        res.json(orders);
    } catch (error) {
        console.error('Error al obtener las órdenes:', error);
        res.status(500).json({ message: 'Error al obtener las órdenes', error: error.message });
    }
});

// Añade esta ruta en tu archivo server.js
app.get('/get-order/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error al obtener la orden:', error);
        res.status(500).json({ message: 'Error al obtener la orden', error: error.message });
    }
});


router.get('/get-orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id; // Obtén el ID desde los parámetros de la URL
        const order = await Order.findById(orderId); // Busca el pedido en la base de datos
        if (order) {
            res.status(200).json(order); // Devuelve el pedido si existe
        } else {
            res.status(404).json({ message: 'Pedido no encontrado' }); // Manejo si no se encuentra
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el pedido', error }); // Manejo de errores
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});


