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
        console.log(data);
        const orden = await getNextOrder('Media');
        
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO Media (integranteId, tiposmediaId, url, nombrearchivo, orden, activo) VALUES (?, ?, ?, ?, ?, ?)`;
            if (tiposmediaId == "youtube" && url) { // Assuming id 1 is for YouTube
                const finalUrl = getYouTubeEmbedUrl(url);
                tiposmediaId = 1;
                if (!finalUrl) {
                    return reject(new Error('URL de YouTube no válida.'));
                }
                db.run(query, [integranteId, tiposmediaId, finalUrl, null, orden, activo], function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(this.lastID);
                });
            } else {
                tiposmediaId == "imagen" ? tiposmediaId = 2 : tiposmediaId = 3;
                if (!file) {
                    return reject(new Error('No existe nombre de archivo.'));
                }
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
            }
        });
    },

    update: async (id, data, file) => {
        const { url, tiposmediaId, activo } = data;
        let finalUrl = url;
        if (tiposmediaId == 1 && url) { // Assuming id 1 is for YouTube
            finalUrl = getYouTubeEmbedUrl(url);
            if (!finalUrl) {
                return new Promise((_, reject) => reject(new Error('URL de YouTube no válida.')));
            }
        }

        return new Promise((resolve, reject) => {
            if (url) {
                const query = `UPDATE Media SET url = ?, activo = ? WHERE id = ?`;
                db.run(query, [finalUrl, activo, id], function (err) {
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

function getYouTubeEmbedUrl(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

module.exports = MediaModel;
