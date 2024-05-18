const express = require('express'); 
const router = express.Router();
const db = require('../db/conexion')

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
    res.render('admin/integrantes/crearIntegrante');  // Asegúrate de que el nombre del archivo hbs sea correcto
});

router.post('/crearIntegrante/create', (req, res) => {
    const { nombre, apellido, matricula, orden } = req.body;
    const activo = req.body.activo ? 1 : 0; // Verificar si 'activo' está marcado

    // Validación simple de ejemplo
    if (!nombre || !apellido || !matricula || !orden) {
        // Error: faltan datos
        return res.redirect('/admin/crearIntegrante/create');
    }

    // Insertar en la base de datos (simulación)
    // Aquí deberías usar tu lógica de acceso a datos para insertar el registro
    console.log('Insertando en la base de datos:', { nombre, apellido, matricula, activo, orden });

    // Simular inserción exitosa y redireccionar al listado
    res.redirect('/admin/crearIntegrante?success=true');
});

module.exports = router;