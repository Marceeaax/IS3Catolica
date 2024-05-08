
const express = require('express');

const hbs = require('hbs');
const db = require("./db/data")

//////////////////////////////////////////// VERIFICAR SI SE IMPORTO BIEN LA BASE DE DATOS
//console.log(db.media)

//Aplicacion express
const app = express();

//configuracion para motor de vistas hbs
app.use(express.static('public'));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

hbs.registerPartials(__dirname + "/views/partials");

///////////////////////////////////////////FUNCIONES//////////////////////////////////////////////////////

// Funcion que se pensaba utilizar para evitar redudancia (por ej. si estoy en la pagina de Lujan, no mostrar el boton de Lujan)
// Por falta de tiempo, quedo fuera de la implementacion

function dbPersonalizada(db, index) {
    // Crear una copia del array original
    let dbPersonalizado = [...db];
    // Elimina el elemento en el índice especificado
    dbPersonalizado.splice(index, 1);
    return dbPersonalizado;
}


/////////////////////////////////////////////RUTAS//////////////////////////////////////////////////////////
// Pagina principal
app.get("/", (request, response) => {
    response.render("index", { 
        integrantes: db.integrantes,
        footerfijo: true
    });
});

// Informacion de los integrantes
app.get("/Integrantes", (request, response) => {
    response.render("integrantes", { 
        integrantes: db.integrantes,
        /* media: db.media["Y18624"], */
    });
});

// Informacion del curso
app.get("/InfoCurso", (request, response) => {
    response.render("info_curso", { 
        integrantes: db.integrantes,
        footerfijo: true
    });
});

// Word Cloud
app.get("/WordCloud", (request, response) => {
    response.render("wordcloud", { 
        integrantes: db.integrantes,
        footerfijo: true
    });
});

// Esto es como un API, es una ruta que utilizamos de manera invisible, es decir, nunca nuestro sitio web accedera esa ruta, pero de esta manera
// Actualizamos los datos de manera asincrona en nuestra pagina, mostrando todos los integrantes del grupo de acuerdo al boton que se presione
app.get('/integrantes/:matricula', (request, response) => {
    const matricula = request.params.matricula;
    const integrante = db.integrantes.find(i => i.matricula === matricula);
    const media = db.media[matricula];

    if (integrante && media) {
        response.render('integrantes', {
            integrante,
            media,
            footerfijo: false
        });
    } else {
        response.status(404).render('404', { error: 'Integrante no encontrado' });
    }
});



// Aqui contemplamos la renderizacion de la pagina de error 404 cuando no se puede encontrar una pagina solicitada
// Se genera un numero aleatorio del 0 al 1 con math.random, y mostramos una pagina de error al azar dependiendo del resultado

app.use((req, res, next) => {
    // Renderizar una página de error personalizada
    
    var randomNumber = Math.round(Math.random());
    if (randomNumber === 0) {
        res.status(404).render('error/index');
    }
    else {
        res.status(404).render('error/index2');
    }
});


// Correr el servidor en el puerto 3000
app.listen(3000, () => {
    console.log("El servidor se está ejecutando en http://localhost:3000");
});

//console.log("Base de datos simulada", db);
//console.log(db.integrantes[0].Codigo);


