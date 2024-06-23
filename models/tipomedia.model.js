const db = require('../db/conexion');

const TiposMediaModel = {
    getAll: (filters = {}) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM TiposMedia WHERE activo = 1";
            let queryParams = [];
            
            // Aplicar filtros si están presentes
            if (filters.id) {
                sql += " AND id = ?";
                queryParams.push(filters.id);
            }
            if (filters.nombre) {
                sql += " AND nombre LIKE ?";
                queryParams.push('%' + filters.nombre + '%');
            }
            if (filters.orden) {
                sql += " AND orden LIKE ?";
                queryParams.push('%' + filters.orden + '%');
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
            const query = 'SELECT * FROM TiposMedia WHERE id = ?';
            db.get(query, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    create: async (data) => {
        const { nombre, activo } = data;
        const orden = await getNextOrder('TiposMedia');
        
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO TiposMedia (nombre, activo, orden) VALUES (?, ?, ?)`;
            db.run(query, [nombre, activo, orden], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
            });
        });
    },

    update: (id, data) => {
        const { nombre, activo } = data;
        const activoEstado = activo ? 1 : 0;
        return new Promise((resolve, reject) => {
            const query = `UPDATE TiposMedia SET nombre = ?, activo = ? WHERE id = ?`;
            db.run(query, [nombre, activo, id], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });
    },


    delete: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE TiposMedia SET activo = 0 WHERE id = ?';
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
                resolve(row.maxOrder ? row.maxOrder + 1 : 1); // Si no hay registros, empezamos desde 1
            }
        });
    });
}

module.exports = TiposMediaModel;
