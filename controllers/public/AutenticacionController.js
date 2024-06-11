const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../../db/conexion');

const confirmationCodes = new Map(); // Almacén temporal para los códigos de confirmación

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cacereslujan183@gmail.com',
        pass: '974067Ma'
    }
});

const AutenticacionController = {
    showLogin: (req, res) => {
        res.render('login', {
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    login: (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            req.flash('error', 'Email y contraseña son obligatorios');
            return res.redirect('/login');
        }

        db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Error al buscar el usuario:', err.message);
                req.flash('error', 'Error interno del servidor');
                return res.redirect('/login');
            }

            if (user && await bcrypt.compare(password, user.password)) {
                if (confirmationCodes.has(email)) {
                    req.flash('error', 'Por favor, confirme su cuenta antes de iniciar sesión');
                    return res.redirect('/login');
                }

                req.session.logueado = true;
                req.session.email = email;
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
            error: req.flash('error')
        });
    },

    register: [
        body('email').isEmail().withMessage('Debe ser un correo válido'),
        body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash('error', errors.array().map(err => err.msg).join(', '));
                return res.redirect('/register');
            }

            const { email, password } = req.body;

            if (!email || !password) {
                req.flash('error', 'Email y contraseña son obligatorios');
                return res.redirect('/register');
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const confirmationCode = uuid.v4();

                db.run('INSERT INTO usuarios (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
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
                    } else {
                        confirmationCodes.set(email, confirmationCode);
                        const confirmationLink = `http://localhost:3000/auth/confirm/${confirmationCode}`;

                        const mailOptions = {
                            from: 'your-email@gmail.com',
                            to: email,
                            subject: 'Confirme su cuenta',
                            html: `<p>Por favor, confirme su cuenta haciendo clic en el siguiente enlace: <a href="${confirmationLink}">Confirmar cuenta</a></p>`
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error('Error al enviar el correo electrónico:', error);
                                req.flash('error', 'Error al enviar el correo electrónico');
                                return res.redirect('/register');
                            }
                            req.flash('success', 'Registro exitoso. Por favor, verifique su correo electrónico.');
                            res.redirect('/login');
                        });
                    }
                });
            } catch (error) {
                console.error('Error al hashear la contraseña:', error.message);
                req.flash('error', 'Error interno del servidor');
                res.redirect('/register');
            }
        }
    ],

    confirm: (req, res) => {
        const { confirmationCode } = req.params;

        for (const [email, code] of confirmationCodes) {
            if (code === confirmationCode) {
                confirmationCodes.delete(email);
                req.flash('success', 'Cuenta confirmada. Ahora puede iniciar sesión.');
                return res.redirect('/login');
            }
        }

        req.flash('error', 'Código de confirmación no válido');
        res.redirect('/login');
    }
};

module.exports = AutenticacionController;
