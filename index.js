const express = require('express');
const hbs = require('hbs');
const db = require("./db/data")

//Aplicacion express
const app = express();

//configuracion para motor de vistas hbs
app.use(express.static('public'));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

hbs.registerPartials(__dirname + "/views/partials");

//CORRECCION DE RUTAS

// Pagina principal
app.get("/", (request, response) => {
    response.render("index");
});

// este me hace dudar 
app.get("/index.html", (request, response) => {
    response.render("index");
});


// Lujan
app.get("/paginas/Y18624/index.html", (request, response) => {
    response.render("Y18624/index");
});

// Steven
app.get("/paginas/Y12887/index.html", (request, response) => {
    response.render("Y12887/index");
});

// Christian
app.get("/paginas/Y25366/index.html", (request, response) => {
    response.render("Y25366/index");
});

// Marcio
app.get("/paginas/3850665/index.html", (request, response) => {
    response.render("3850665/index");
});

// Word Cloud
app.get("/paginas/wordcloud.html", (request, response) => {
    response.render("wordcloud");
});

// Informacion del curso
app.get("/paginas/info_curso.html", (request, response) => {
    response.render("info_curso");
});

// Correr el servidor en el puerto 3000
app.listen(3000, () => {
    console.log("El servidor se está ejecutando en http://localhost:3000");
});

//console.log("Base de datos simulada", db);
//console.log(db.integrantes[0].Codigo);