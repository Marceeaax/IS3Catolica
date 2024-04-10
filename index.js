const express = require("express");

//creamos la aplicacion express
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// iniciar app escuchando puerto parametro
app.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 3000");
});