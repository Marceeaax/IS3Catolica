const db = require('../db/conexion');

const IntegranteModel = {
    getAll: (filters = {}) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM integrantes WHERE activo = 1";
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
            if (filters.apellido) {
                sql += " AND apellido LIKE ?";
                queryParams.push('%' + filters.apellido + '%');
            }
            if (filters.matricula) {
                sql += " AND matricula LIKE ?";
                queryParams.push('%' + filters.matricula + '%');
            }
            if (filters.orden) {
                sql += " AND orden = ?";
                queryParams.push(filters.orden);
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
            const query = 'SELECT * FROM Integrantes WHERE id = ?';
            db.get(query, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    getByField: (field, value) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Integrantes WHERE ${field} = ?`;
            db.get(query, [value], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    create: async (data) => {
        const { nombre, apellido, matricula, activo } = data;
        const orden = await getNextOrder('integrantes');
        
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO Integrantes (nombre, apellido, matricula, activo, orden) VALUES (?, ?, ?, ?, ?)`;
            db.run(query, [nombre, apellido, matricula, activo ? 1 : 0, orden], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
            });
        });
    },

    update: (id, data) => {
        const { nombre, apellido, matricula, activo } = data;
        const activoEstado = activo ? 1 : 0;

        return new Promise((resolve, reject) => {
            const query = 'UPDATE Integrantes SET nombre = ?, apellido = ?, matricula = ?, activo = ? WHERE id = ?';
            db.run(query, [nombre, apellido, matricula, activoEstado, id], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE Integrantes SET activo = 0 WHERE id = ?';
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

module.exports = IntegranteModel;
