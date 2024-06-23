const db = require('../db/conexion');
const path = require('path');
const fs = require('fs');

const MediaModel = {
    getAll: (filters = {}) => {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    id, 
                    CONCAT((SELECT nombre FROM integrantes WHERE id = media.integranteid), " - ", (SELECT matricula FROM integrantes WHERE id = media.integranteid)) AS integranteId, 
                    (SELECT nombre FROM tiposmedia WHERE id = media.tiposmediaid) AS tiposmediaId, 
                    URL, 
                    nombrearchivo, 
                    orden 
                FROM 
                    Media 
                WHERE 
                    activo = 1 
            `;
            let queryParams = [];
            
            // Aplicar filtros si están presentes
            if (filters.id) {
                sql += " AND id = ?";
                queryParams.push(filters.id);
            }
            if (filters.integrante) {
                sql += " AND (CONCAT((SELECT nombre FROM integrantes WHERE id = media.integranteid), ' - ', (SELECT matricula FROM integrantes WHERE id = media.integranteid)) LIKE ?)";
                queryParams.push('%' + filters.integrante + '%');
            }
            if (filters.tipomedia) {
                sql += " AND (SELECT nombre FROM tiposmedia WHERE id = media.tiposmediaid) LIKE ?";
                queryParams.push('%' + filters.tipomedia + '%');
            }
            if (filters.orden) {
                sql += " AND orden LIKE ?";
                queryParams.push('%' + filters.orden + '%');
            }
        
            sql += " ORDER BY orden";
        
            db.all(sql, queryParams, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    },

    getById: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Media WHERE id = ?';
            db.get(query, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    create: async (data, file) => {
        let { integranteId, tiposmediaId, url, nombrearchivo, activo } = data;
        const orden = await getNextOrder('Media');

        if (tiposmediaId === "imagen") {
            tiposmediaId = 2;  // Si es "imagen", asignar 2
        } else if (tiposmediaId === "dibujo") {
            tiposmediaId = 3;  // Si es "dibujo", asignar 3
        } else {
            tiposmediaId = 1;  // Para cualquier otro caso, asignar 1
        }
        
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO Media (integranteId, tiposmediaId, url, nombrearchivo, orden, activo) VALUES (?, ?, ?, ?, ?, ?)`;
            
            if (file) {
                const newFileName = `${tiposmediaId}-${integranteId}-${Date.now()}${path.extname(file.originalname)}`;
                const newFilePath = path.join('public/images', newFileName);
                fs.rename(file.path, newFilePath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    const nombrearchivo = `/images/${newFileName}`;
                    db.run(query, [integranteId, tiposmediaId, url, nombrearchivo, orden, activo], function(err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(this.lastID);
                    });
                });
            } else {
                db.run(query, [integranteId, tiposmediaId, url, null, orden, activo], function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(this.lastID);
                });
            }
        });
    },

    update: async (id, data, file) => {
        const { url, tiposmediaId, activo } = data;

        return new Promise((resolve, reject) => {
            if (url) {
                const query = `UPDATE Media SET url = ?, activo = ? WHERE id = ?`;
                db.run(query, [url, activo, id], function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(this.changes);
                });
            } else if (file) {
                const newFileName = `${tiposmediaId}-${id}-${Date.now()}${path.extname(file.originalname)}`;
                const newFilePath = path.join('public/images', newFileName);
                fs.rename(file.path, newFilePath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    const newFileNamePath = `/images/${newFileName}`;
                    const query = `UPDATE Media SET nombrearchivo = ?, activo = ? WHERE id = ?`;
                    db.run(query, [newFileNamePath, activo, id], function (err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(this.changes);
                    });
                });
            } else {
                const query = `UPDATE Media SET activo = ? WHERE id = ?`;
                db.run(query, [activo, id], function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(this.changes);
                });
            }
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE Media SET activo = 0 WHERE id = ?';
            db.run(query, [id], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });
    },

    getAllIntegrantes: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT id, nombre FROM Integrantes WHERE activo = 1 ORDER BY nombre', (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getAllTiposMedia: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT id, nombre FROM TiposMedia WHERE activo = 1 ORDER BY nombre', (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getMediaByIntegrante: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT integranteId, tiposmediaId FROM Media WHERE activo = 1', (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
};

async function getNextOrder(tableName) {
    return new Promise((resolve, reject) => {
        const query = `SELECT MAX(orden) as maxOrder FROM ${tableName}`;
        db.get(query, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.maxOrder ? row.maxOrder + 1 : 1);
            }
        });
    });
}

module.exports = MediaModel;
