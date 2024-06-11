const bcrypt = require('bcrypt');
const dbUsuarios = require('../../db/conexionUsuario'); // Asegúrate de que la ruta sea correcta a tu archivo de conexión a la base de datos

const AutenticacionController = {
    showLogin: (req, res) => {
        res.render('login', {
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    login: (req, res) => {
        const { username, password } = req.body;

        dbUsuarios.get('SELECT * FROM usuarios WHERE username = ?', [username], async (err, user) => {
            if (err) {
                console.error('Error al buscar el usuario:', err.message);
                req.flash('error', 'Error interno del servidor');
                return res.redirect('/login');
            }

            if (user && await bcrypt.compare(password, user.password)) {
                req.session.logueado = true;
                req.session.username = username;
                req.flash('success', 'Login exitoso');
                res.redirect('/');
            } else {
                req.flash('error', 'Usuario o contraseña incorrectos');
                res.redirect('/login');
            }
        });
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destruyendo la sesión:', err);
            }
            res.redirect('/');
        });
    },

    showRegister: (req, res) => {
        res.render('register', {
            error: req.flash('error'),
        });
    },

    register: async (req, res) => {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        dbUsuarios.run('INSERT INTO usuarios (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    console.log('El usuario ya existe:', err.message);
                    req.flash('error', 'El usuario ya existe');
                    res.redirect('/register');
                } else {
                    console.error('Error al registrar el usuario:', err.message);
                    req.flash('error', 'Error interno del servidor');
                    res.redirect('/register');
                }
                console.log(req.flash());
            }
            else {
                req.flash('success', 'Registro exitoso');
                res.redirect('/');
            }
        });
    }
};

module.exports = AutenticacionController;
