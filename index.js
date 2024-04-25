
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

function dbPersonalizada(db, index) {
    // Crear una copia del array original
    let dbPersonalizado = [...db];
    // Elimina el elemento en el índice especificado
    dbPersonalizado.splice(index, 1);
    return dbPersonalizado;
}


/////////////////////////////////////////////RUTAS///////////////////////////////////////////////////////////
// Pagina principal
app.get("/", (request, response) => {
    response.render("index", { 
        integrantes: db.integrantes,
        ocultarLinkInfoCurso: true,
        ocultarLinkWordCloud: true
    });
});

// Lujan
app.get("/Lujan", (request, response) => {
    let integrantesP = dbPersonalizada(db.integrantes, 0);
    response.render("Y18624/index", { 
        integrantes: integrantesP, 
        media: db.media["Y18624"] 
    });
});

// Christian
app.get("/Christian", (request, response) => {
    let integrantesP = dbPersonalizada(db.integrantes, 1);
    response.render("Y25366/index", { 
        integrantes: integrantesP, 
        media: db.media["Y25366"] 
    });
});

// Steven
app.get("/Steven", (request, response) => {
    let integrantesP = dbPersonalizada(db.integrantes, 2);
    response.render("Y12887/index", { 
        integrantes: integrantesP, 
        media: db.media["Y12887"] 
    });
});

// Marcio
app.get("/Marcio", (request, response) => {
    let integrantesP = dbPersonalizada(db.integrantes, 3);
    response.render("3850665/index", { 
        integrantes: integrantesP, 
        media: db.media["3850665"] 
    });
});

// Informacion del curso
app.get("/InfoCurso", (request, response) => {
    response.render("info_curso", { 
        integrantes: db.integrantes,
        ocultarLinkInfoCurso: true 
    });
});

// Word Cloud
app.get("/WordCloud", (request, response) => {
    response.render("wordcloud", { 
        integrantes: db.integrantes,
        ocultarLinkWordCloud: true 
    });
});

// Para errores 404
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


