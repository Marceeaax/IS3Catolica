const express = require('express');
const router = express.Router();
const db = require('../db/conexion');
const multer = require('multer'); // Primero debes requerir multer antes de usarlo

// Configuración del almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Asegúrate de que el directorio 'uploads/' exista
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
    }
});

// Crear la instancia de multer usando la configuración de almacenamiento
const upload = multer({ storage: storage }); // Guarda archivos en la carpeta 'uploads'

// Aquí continúan tus rutas...
router.post('/media/create', upload.single('file'), (req, res) => {
    // lógica para manejar la carga de archivos y guardar datos en la base de datos
});


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
        integrante: req.session.formData || {}, // Usar datos de la sesión o un objeto vacío si no hay datos
        error: req.flash('error') // Asegúrate de que los mensajes flash están configurados correctamente
    });
});

router.post('/integrantes/create', (req, res) => {
    const { nombre, apellido, matricula, orden } = req.body;
    const activo = req.body.activo ? 1 : 0;

    if (!nombre || !apellido || !matricula || !orden) {
        req.flash('error', 'Todos los campos son obligatorios.');
        req.session.formData = req.body; // Guardar datos del formulario en la sesión
        return res.redirect('/admin/integrantes/crear');
    }

    const query = `INSERT INTO Integrantes (nombre, apellido, matricula, activo, orden) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [nombre, apellido, matricula, activo, orden], function(err) {
        if (err) {
            let errorMessage = 'Error al insertar en la base de datos.';
            if (err.message && err.message.includes('UNIQUE constraint failed: Integrantes.matricula')) {
                errorMessage = 'Error al insertar en la base de datos: Registro duplicado, la matrícula ya existe.';
            }
            req.flash('error', errorMessage);
            req.session.formData = req.body; // Guardar datos del formulario en la sesión
            return res.redirect('/admin/integrantes/crear');
        }

        delete req.session.formData; // Limpiar los datos del formulario de la sesión
        req.flash('success', 'Integrante creado correctamente!');
        res.redirect('/admin/integrantes/listar');
    });
});



router.get('/tiposmedia/crear', (req, res) => {
    res.render('admin/tiposmedia/creartipomedia', {
        nombre: req.query.nombre || '',
        orden: req.query.orden || '',
        activo: req.query.activo === '1', // mantiene el checkbox marcado si activo es 1
        error: req.flash('error'),
        success: req.flash('success')
    });
});


router.post('/tiposmedia/create', (req, res) => {
    const { nombre, orden } = req.body;
    const activo = req.body.activo ? 1 : 0;

    if (!nombre || !orden) {
        req.flash('error', 'Todos los campos son obligatorios.');
        // Guarda los datos ingresados para rellenar el formulario nuevamente
        return res.redirect(`/admin/tiposmedia/crear?nombre=${encodeURIComponent(nombre)}&orden=${encodeURIComponent(orden)}&activo=${activo}`);
    }

    const query = `INSERT INTO TiposMedia (nombre, activo, orden) VALUES (?, ?, ?)`;
    db.run(query, [nombre, activo, orden], function(err) {
        if (err) {
            req.flash('error', 'Error al insertar en la base de datos.');
            return res.redirect(`/admin/tiposmedia/crear?nombre=${encodeURIComponent(nombre)}&orden=${encodeURIComponent(orden)}&activo=${activo}`);
        }

        req.flash('success', 'Tipo de media creado correctamente!');
        res.redirect('/admin/tiposmedia/listar');
    });
});


router.get('/media/crear', async (req, res) => {
    try {
        const integrantes = await new Promise((resolve, reject) => {
            db.all('SELECT id, nombre FROM Integrantes ORDER BY nombre', (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        const tiposMedia = await new Promise((resolve, reject) => {
            db.all('SELECT id, nombre FROM TiposMedia ORDER BY nombre', (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        res.render('admin/media/crearMedia', { 
            integrantes,
            tiposMedia
        });
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos');
    }
});


router.post('/media/create', upload.single('file'), (req, res) => {
    const { integranteId, tiposmediaId, url, nombrearchivo, orden } = req.body;
    const activo = req.body.activo ? 1 : 0;  // Convertir activo a entero (1 para true, 0 para false)
    const file = req.file; // Accede al archivo subido

    // Validación de campos necesarios
    if (!integranteId || !tiposmediaId) {
        req.flash('error', 'Los campos de ID de integrante y ID de tipo de media son obligatorios.');
        return res.redirect('/admin/media/crear');  // Ajusta la URL según tus rutas
    }

    // Determinar si el tipo de media requiere un archivo y si ha sido proporcionado
    let filePath = '';
    if (tiposmediaId === '1' && file) {
        filePath = file.path; // Guarda la ruta del archivo subido
    } else if (tiposmediaId === '1' && !file) {
        req.flash('error', 'Se requiere un archivo para el tipo de media seleccionado.');
        return res.redirect('/admin/media/crear');
    }

    const query = `INSERT INTO Media (integranteId, tiposmediaId, url, nombrearchivo, orden, activo, filePath) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [integranteId, tiposmediaId, url, nombrearchivo, orden, activo, filePath], function(err) {
        if (err) {
            req.flash('error', 'Error al insertar en la base de datos. ' + err.message);
            return res.redirect('/admin/media/crear');
        }
        req.flash('success', 'Media creada correctamente!');
        res.redirect('/admin/media/listar');
    });
});


router.get('/colores/crear', (req, res) => {
    res.render('admin/colores/crearColores', {
        integranteId: req.query.integranteId || '',
        background: req.query.background || '',
        headerBackground: req.query.headerBackground || '',
        sectionBackground: req.query.sectionBackground || '',
        error: req.flash('error'),
        success: req.flash('success')
    });
});



router.post('/colores/create', (req, res) => {
    const { integranteId, background, headerBackground, sectionBackground } = req.body;

    if (!integranteId || !background || !headerBackground || !sectionBackground) {
        req.flash('error', 'Todos los campos son obligatorios.');
        return res.redirect(`/admin/colores/crear?integranteId=${encodeURIComponent(integranteId)}&background=${encodeURIComponent(background)}&headerBackground=${encodeURIComponent(headerBackground)}&sectionBackground=${encodeURIComponent(sectionBackground)}`);
    }

    const query = `INSERT INTO Colores (integranteId, background, headerBackground, sectionBackground) VALUES (?, ?, ?, ?)`;
    db.run(query, [integranteId, background, headerBackground, sectionBackground], function(err) {
        if (err) {
            req.flash('error', 'Error al insertar en la base de datos.');
            return res.redirect(`/admin/colores/crear?integranteId=${encodeURIComponent(integranteId)}&background=${encodeURIComponent(background)}&headerBackground=${encodeURIComponent(headerBackground)}&sectionBackground=${encodeURIComponent(sectionBackground)}`);
        }

        req.flash('success', 'Colores asignados correctamente!');
        res.redirect('/admin/colores/listar');  // Asegúrate de que esta ruta exista y esté configurada correctamente
    });
});



module.exports = router;