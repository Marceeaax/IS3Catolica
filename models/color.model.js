const db = require('../db/conexion');

const ColoresModel = {
    getAll: (filters = {}) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Colores WHERE activo = 1";
            let queryParams = [];
            
            // Aplicar filtros si están presentes
            if (filters.id) {
                sql += " AND integranteId = ?";
                queryParams.push(filters.id);
            }
            if (filters.background) {
                sql += " AND background = ?";
                queryParams.push(filters.background);
            }
            if (filters.headerBackground) {
                sql += " AND headerBackground = ?";
                queryParams.push(filters.headerBackground);
            }
            if (filters.sectionBackground) {
                sql += " AND sectionBackground = ?";
                queryParams.push(filters.sectionBackground);
            }

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
            const query = 'SELECT * FROM Colores WHERE integranteId = ?';
            db.get(query, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    create: (data) => {
        const { integranteId, background, headerBackground, sectionBackground, activo } = data;
        
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO Colores (integranteId, background, headerBackground, sectionBackground, activo) VALUES (?, ?, ?, ?, ?)`;
            db.run(query, [integranteId, background, headerBackground, sectionBackground, activo], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
            });
        });
    },

    update: (id, data) => {
        const { background, headerBackground, sectionBackground, activo } = data;

        return new Promise((resolve, reject) => {
            const query = `UPDATE Colores SET background = ?, headerBackground = ?, sectionBackground = ?, activo = ? WHERE integranteId = ?`;
            db.run(query, [background, headerBackground, sectionBackground, activo, id], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE Colores SET activo = 0 WHERE integranteId = ?';
            db.run(query, [id], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });
    }
};

module.exports = ColoresModel;
