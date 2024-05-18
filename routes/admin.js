const express = require('express'); 
const router = express.Router();
const db = require('../db/conexion')
const swal = require('sweetalert2');

router.get("/", (req, res) => {
    res.render("admin/index",{
        mostrarAdmin: true,
        footerfijo: true
    });
});

router.get("/integrantes/listar", (req, res) => {
    db.all('SELECT * FROM integrantes ORDER BY orden', (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos de la base de datos');
        }
        res.render("admin/integrantes/index",{
            integrantes: results,
            mostrarAdmin: true,
            footerfijo: true     
        });
    });
});

router.get("/tiposmedia/listar", (req, res) => {
    db.all('SELECT * FROM TiposMedia ORDER BY orden', (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos de la base de datos');
        }
        res.render("admin/tiposmedia/index", {
            tiposMedia: results,
            mostrarAdmin: true,
            footerfijo: true
        });
    });
});

router.get("/media/listar", (req, res) => {
    db.all('SELECT * FROM Media ORDER BY orden', (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos de la base de datos');
        }
        res.render("admin/media/index", {
            media: results,
            mostrarAdmin: true,
            footerfijo: true
        });
    });
});

router.get("/colores/listar", (req, res) => {
    db.all('SELECT * FROM Colores', (err, results) => {
        if (err) {
            console.error('Error al obtener datos:', err);
            return res.status(500).send('Error al obtener datos de la base de datos');
        }
        res.render("admin/colores/index", {
            colores: results,
            mostrarAdmin: true,
            footerfijo: true
        });
    });
});

router.get('/integrantes/crear', (req, res) => {
    res.render('admin/integrantes/crearIntegrante', {
        integrante: req.query,  // Pasa la query anterior para rellenar el formulario en caso de error
        error: req.query.error  // Pasa el mensaje de error si existe
    });
});

router.post('/integrantes/create', (req, res) => {
    const { nombre, apellido, matricula, orden } = req.body;
    const activo = req.body.activo ? 1 : 0;

    if (!nombre || !apellido || !matricula || !orden) {
        req.session.message = {
            type: 'error',
            text: 'Todos los campos son obligatorios.'
        };
        return res.redirect('/admin/integrantes/crear');
    }

    const query = `INSERT INTO Integrantes (nombre, apellido, matricula, activo, orden) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [nombre, apellido, matricula, activo, orden], function(err) {
        if (err) {
            req.session.message = {
                type: 'error',
                text: 'Error al insertar en la base de datos.'
            };
            return res.redirect('/admin/integrantes/crear');
        }

        req.session.message = {
            type: 'success',
            text: 'Integrante creado correctamente!'
        };
        req.session.save(() => {
            res.redirect('/admin/integrantes/listar');
        });
    });
});






module.exports = router;