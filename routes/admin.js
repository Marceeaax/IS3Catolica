const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../db/conexion');
const multer = require('multer');
const paginasController = require('../controllers/admin/PaginasController');

const integrantesController = require('../controllers/admin/IntegrantesController');
const coloresController = require('../controllers/admin/ColoresController');
const tiposmediaController = require('../controllers/admin/TiposMediaController');
const mediaController = require('../controllers/admin/MediaController');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

require('dotenv').config();
const authControl = (req, res, next) => {
    if (!req.session.logueado) {
        return res.redirect("/");
    } else {
        next();
    }
};

router.use(authControl);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const tempFileName = `${uniqueSuffix}${path.extname(file.originalname)}`;
        cb(null, tempFileName);
    }
});

const upload = multer({ storage: storage });

const info = {
    repo: process.env.GITLAB_REPO_URL,
    nombre: process.env.FULL_NAME,
    materia: process.env.SUBJECT_DETAILS
};

// Rutas generales
router.get("/", paginasController.index);

// Rutas para integrantes
router.get("/integrantes/listar", integrantesController.index);
router.get("/integrantes/crear", integrantesController.create);
router.post("/integrantes/create", integrantesController.store);
router.get("/integrantes/:id/ver", integrantesController.show);
router.get("/integrantes/:id/editar", integrantesController.edit);
router.post("/integrantes/:id/update", integrantesController.update);
router.post("/integrantes/:id/delete", integrantesController.destroy);

// Rutas para colores
router.get("/colores/listar", coloresController.index);
router.get("/colores/crear", coloresController.create);
router.post("/colores/create", coloresController.store);
router.get("/colores/:id/editar", coloresController.edit);
router.post("/colores/:id/update", coloresController.update);
router.post("/colores/:id/delete", coloresController.destroy); 

// Rutas para tipos de media
router.get("/tiposmedia/listar", tiposmediaController.index);
router.get("/tiposmedia/crear", tiposmediaController.create);
router.post("/tiposmedia/create", tiposmediaController.store);
// Rutas para métodos aún no implementados
// router.get("/tiposmedia/:id/ver", tiposmediaController.show);
router.get("/tiposmedia/:id/editar", tiposmediaController.edit);
router.post("/tiposmedia/:id/update", tiposmediaController.update);
router.post("/tiposmedia/:id/delete", tiposmediaController.destroy);

// Rutas para media
router.get("/media/listar", mediaController.index);
router.get("/media/crear", mediaController.create);
router.post("/media/create", upload.single('file'), mediaController.store);
// Rutas para métodos comentados
// router.get("/media/:id/ver", mediaController.show);
router.get("/media/:id/editar", mediaController.edit);
router.post("/media/:id/update", upload.single('file'), mediaController.update);
router.post("/media/:id/delete", mediaController.destroy);

module.exports = router;

// Código comentado para imprimir en la consola los contenidos de la tabla media
/*
db.all('SELECT * FROM media', (err, rows) => {
    if (err) {
        console.error('Error al obtener los datos:', err.message);
    } else {
        console.log('Media:', rows);
    }
});
*/
