const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware para procesar datos JSON

// Ruta para guardar los datos
app.post('/guardar-datos', (req, res) => {
    console.log('Datos recibidos:', req.body); // Imprime los datos en la terminal
    res.status(200).send('Datos guardados correctamente');
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
