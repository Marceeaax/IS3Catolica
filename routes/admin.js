const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../db/conexion');
const multer = require('multer'); // Primero debes requerir multer antes de usarlo

const app = express();
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded
app.use(express.json());


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const tempFileName = `${uniqueSuffix}${path.extname(file.originalname)}`;
        cb(null, tempFileName);
    }
});


// Crear la instancia de multer usando la configuración de almacenamiento
const upload = multer({ storage: storage }); // Guarda archivos en la carpeta 'uploads'

require('dotenv').config();

// Define un objeto `info` con las variables de entorno importantes para las vistas
const info = {
    repo: process.env.GITLAB_REPO_URL,
    nombre: process.env.FULL_NAME,
    materia: process.env.SUBJECT_DETAILS
};

function getYouTubeEmbedUrl(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

router.get("/", (req, res) => {
    res.render("admin/index",{
        mostrarAdmin: true,
        footerfijo: true
    });
});

router.get("/integrantes/listar", (req, res) => {
    db.all('SELECT * FROM integrantes WHERE activo = 1 ORDER BY orden', (err, results) => {
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
    db.all('SELECT * FROM Media WHERE activo = 1 ORDER BY orden ', (err, results) => {
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
                errorMessage = 'Error al insertar en la base de datos: La matrícula ya existe.';
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
        const allIntegrantes = await new Promise((resolve, reject) => {
            db.all('SELECT id, nombre FROM Integrantes WHERE activo = 1 ORDER BY nombre', (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        const allTiposMedia = await new Promise((resolve, reject) => {
            db.all('SELECT id, nombre FROM TiposMedia ORDER BY nombre', (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        const mediaByIntegrante = await new Promise((resolve, reject) => {
            db.all('SELECT integranteId, tiposmediaId FROM Media WHERE activo = 1', (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        const tiposMediaMap = {};
        allTiposMedia.forEach(tipo => {
            tiposMediaMap[tipo.id] = tipo.nombre;
        });

        const integrantesFaltantes = [];
        const integrantesMap = {};

        allIntegrantes.forEach(integrante => {
            integrantesMap[integrante.id] = {
                ...integrante,
                tiposFaltantes: new Set(Object.values(tiposMediaMap))
            };
        });

        mediaByIntegrante.forEach(media => {
            if (integrantesMap[media.integranteId]) {
                integrantesMap[media.integranteId].tiposFaltantes.delete(tiposMediaMap[media.tiposmediaId]);
            }
        });

        Object.values(integrantesMap).forEach(integrante => {
            if (integrante.tiposFaltantes.size > 0) {
                integrantesFaltantes.push({
                    id: integrante.id,
                    nombre: integrante.nombre,
                    tiposFaltantes: Array.from(integrante.tiposFaltantes)
                });
            }
        });

        res.render('admin/media/crearMedia', { 
            integrantes: integrantesFaltantes
        });
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos');
    }
});


router.post('/media/create', upload.single('file'), async (req, res) => {
    const { integranteId, tiposmediaId, url, orden } = req.body;
    const activo = req.body.activo ? 1 : 0;
    const file = req.file;

    if (!integranteId || !tiposmediaId) {
        req.flash('error', 'Los campos de ID de integrante y tipo de media son obligatorios.');
        return res.redirect('/admin/media/crear');
    }

    try {
        // Consulta para obtener los datos del integrante
        const integrante = await new Promise((resolve, reject) => {
            db.get(`SELECT nombre, apellido FROM Integrantes WHERE id = ?`, integranteId, (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!integrante) {
            req.flash('error', 'Integrante no encontrado.');
            return res.redirect('/admin/media/crear');
        }

        // Consulta para obtener el ID del tipo de media
        const tipoMedia = await new Promise((resolve, reject) => {
            db.get(`SELECT id FROM TiposMedia WHERE nombre = ?`, tiposmediaId, (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!tipoMedia) {
            req.flash('error', 'Tipo de media no encontrado.');
            return res.redirect('/admin/media/crear');
        }

        let finalUrl = url;
        if (tiposmediaId === 'youtube') {
            finalUrl = getYouTubeEmbedUrl(url);
            if (!finalUrl) {
                req.flash('error', 'URL de YouTube no válida.');
                return res.redirect('/admin/media/crear');
            }
        }

        const query = `INSERT INTO Media (integranteId, tiposmediaId, url, nombrearchivo, orden, activo) VALUES (?, ?, ?, ?, ?, ?)`;
        if (tiposmediaId === 'youtube') {
            db.run(query, [integranteId, tipoMedia.id, finalUrl, null, orden, activo], function(err) {
                if (err) {
                    req.flash('error', 'Error al insertar en la base de datos. ' + err.message);
                    return res.redirect('/admin/media/crear');
                }
                req.flash('success', 'Media creada correctamente!');
                res.redirect('/admin/media/listar');
            });
        } else {
            // Define el nuevo nombre del archivo
            const newFileName = `${tipoMedia.id}-${integrante.nombre}-${integrante.apellido}-${Date.now()}${path.extname(file.originalname)}`;
            const newFilePath = path.join('public/images', newFileName);

            // Renombra el archivo
            fs.rename(file.path, newFilePath, (err) => {
                if (err) {
                    req.flash('error', 'Error al renombrar el archivo. ' + err.message);
                    return res.redirect('/admin/media/crear');
                }

                // Utiliza el nombre de archivo generado por multer como 'nombrearchivo'
                const nombrearchivo = `/images/${newFileName}`;

                db.run(query, [integranteId, tipoMedia.id, finalUrl, nombrearchivo, orden, activo], function(err) {
                    if (err) {
                        req.flash('error', 'Error al insertar en la base de datos. ' + err.message);
                        return res.redirect('/admin/media/crear');
                    }
                    req.flash('success', 'Media creada correctamente!');
                    res.redirect('/admin/media/listar');
                });
            });
        }
    } catch (error) {
        console.error('Error al realizar consultas:', error);
        req.flash('error', 'Error al realizar consultas. ' + error.message);
        res.redirect('/admin/media/crear');
    }
});

module.exports = router;



router.get('/colores/crear', async (req, res) => {
    try {
        // Consulta a la base de datos para obtener los integrantes que no tienen entrada en la tabla de Colores
        const integrantesSinColores = await new Promise((resolve, reject) => {
            db.all(`
                SELECT i.id, i.nombre
                FROM Integrantes i
                LEFT JOIN Colores c ON i.id = c.integranteId
                WHERE c.integranteId IS NULL;
            `, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        // Renderizar la plantilla con los datos de los integrantes sin colores y cualquier mensaje flash
        res.render('admin/colores/crearColores', {
            integrantes: integrantesSinColores, // Pasar la lista de integrantes sin colores como integranteId
            background: req.query.background || '',
            headerBackground: req.query.headerBackground || '',
            sectionBackground: req.query.sectionBackground || '',
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        // Manejo de errores: si hay un error en la consulta, mostrar un mensaje de error
        console.error('Error al obtener integrantes sin colores:', error);
        req.flash('error', 'Error al obtener la lista de integrantes sin colores.');
        res.redirect('/ruta/de/error'); // Redirigir a una página de error adecuada
    }
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

// Imprimir en la consola los contenidos de la tabla media de la base de datos

db.all('SELECT * FROM media', (err, rows) => {
    if (err) {
        console.error('Error al obtener los datos:', err.message);
    } else {
        console.log('Media:', rows);
    }
});
