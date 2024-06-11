// controllers/public/AutenticacionController.js
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../../db/conexion');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cacereslujan183@gmail.com',
        pass: 'efli dynf twsy lzcs'
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
                if (!user.confirmed) {
                    req.flash('error', 'Por favor, confirme su cuenta antes de iniciar sesión');
                    return res.redirect('/login');
                }

                req.session.logueado = true;
                req.session.email = email;
                req.session.username = user.email;
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
        db.all(`
            SELECT matricula 
            FROM Integrantes 
            WHERE matricula NOT IN (SELECT integranteId FROM Usuarios WHERE integranteId IS NOT NULL)
        `,
            (err, rows) => {
                if (err) {
                    console.error('Error al obtener las matrículas disponibles:', err.message);
                    req.flash('error', 'Error interno del servidor');
                    return res.redirect('/register');
                }

                console.log('Matrículas disponibles:', rows); 
                res.render('register', {
                    error: req.flash('error'),
                    integrantes: rows
                });
            }
        );
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

            const { email, password, matricula } = req.body;

            if (!email || !password || !matricula) {
                req.flash('error', 'Email, contraseña y matrícula son obligatorios');
                return res.redirect('/register');
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const confirmationCode = uuid.v4();

                db.run('INSERT INTO usuarios (email, password, integranteId, confirmationCode, confirmed) VALUES (?, ?, ?, ?, 0)', 
                    [email, hashedPassword, matricula, confirmationCode], 
                    (err) => {
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
                            const confirmationLink = `http://localhost:3000/confirm/${confirmationCode}`;

                            const mailOptions = {
                                from: 'cacereslujan183@gmail.com',
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
                    }
                );
            } catch (error) {
                console.error('Error al hashear la contraseña:', error.message);
                req.flash('error', 'Error interno del servidor');
                res.redirect('/register');
            }
        }
    ],

    confirm: (req, res) => {
        const { confirmationCode } = req.params;

        db.run('UPDATE usuarios SET confirmed = 1 WHERE confirmationCode = ?', [confirmationCode], function (err) {
            if (err) {
                console.error('Error al confirmar el usuario:', err.message);
                req.flash('error', 'Error al confirmar la cuenta');
                return res.redirect('/login');
            }

            if (this.changes === 0) {
                req.flash('error', 'Código de confirmación no válido');
                return res.redirect('/login');
            }

            req.flash('success', 'Cuenta confirmada. Ahora puede iniciar sesión.');
            res.redirect('/login');
        });
    },

    forgotPassword: (req, res) => {
        const { email } = req.body;

        console.log('Recibida solicitud de forgotPassword con email:', email); // Mensaje de depuración

        if (!email) {
            console.log('El correo electrónico es obligatorio'); // Mensaje de depuración
            return res.status(400).json({ success: false, error: 'El correo electrónico es obligatorio' });
        }

        console.log(`Buscando usuario con email: ${email}`); // Mensaje de depuración

        db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
            if (err) {
                console.error('Error al buscar el usuario:', err.message);
                return res.status(500).json({ success: false, error: 'Error interno del servidor' });
            }

            if (!user) {
                console.log(`No se encontró un usuario con el email: ${email}`); // Mensaje de depuración
                return res.status(404).json({ success: false, error: 'No se encontró un usuario con ese correo electrónico' });
            }

            const resetToken = uuid.v4();
            const resetLink = `http://localhost:3000/resetpassword/${resetToken}`;

            console.log(`Generando resetToken: ${resetToken} para email: ${email}`); // Mensaje de depuración

            db.run('UPDATE usuarios SET resetToken = ? WHERE email = ?', [resetToken, email], (err) => {
                if (err) {
                    console.error('Error al generar el token de restablecimiento:', err.message);
                    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
                }

                const mailOptions = {
                    from: 'cacereslujan183@gmail.com',
                    to: email,
                    subject: 'Restablecer contraseña',
                    html: `<p>Haga clic en el siguiente enlace para restablecer su contraseña: <a href="${resetLink}">Restablecer contraseña</a></p>`
                };

                console.log(`Enviando correo a: ${email}`); // Mensaje de depuración

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error al enviar el correo electrónico:', error);
                        return res.status(500).json({ success: false, error: 'Error al enviar el correo electrónico' });
                    }
                    console.log('Correo enviado:', info.response); // Mensaje de depuración
                    req.flash('success', 'Se ha enviado un correo con las instrucciones para restablecer la contraseña');
                    return res.redirect('/login');
                });
            });
        });
    },

    showResetPassword: (req, res) => {
        const { token } = req.params;

        db.get('SELECT * FROM usuarios WHERE resetToken = ?', [token], (err, user) => {
            if (err) {
                console.error('Error al verificar el token:', err.message);
                req.flash('error', 'Error interno del servidor');
                return res.redirect('/login');
            }

            if (!user) {
                req.flash('error', 'Token de restablecimiento no válido');
                return res.redirect('/login');
            }

            res.render('login/resetpassword', { token });
        });
    },

    resetPassword: [
        body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        async (req, res) => {
            const { token } = req.params;
            const { password } = req.body;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                req.flash('error', errors.array().map(err => err.msg).join(', '));
                return res.redirect(`/reset-password/${token}`);
            }

            try {
                // Obtener el usuario con el token de restablecimiento
                db.get('SELECT * FROM usuarios WHERE resetToken = ?', [token], async (err, user) => {
                    if (err) {
                        console.error('Error al verificar el token:', err.message);
                        req.flash('error', 'Error interno del servidor');
                        return res.redirect('/login');
                    }

                    if (!user) {
                        req.flash('error', 'Token de restablecimiento no válido');
                        return res.redirect('/login');
                    }

                    // Comparar la nueva contraseña con la contraseña actual
                    const isSamePassword = await bcrypt.compare(password, user.password);
                    if (isSamePassword) {
                        req.flash('error', 'La nueva contraseña no puede ser la misma que la anterior.');
                        return res.redirect(`/reset-password/${token}`);
                    }

                    // Hashear la nueva contraseña y actualizarla en la base de datos
                    const hashedPassword = await bcrypt.hash(password, 10);
                    db.run('UPDATE usuarios SET password = ?, resetToken = NULL WHERE resetToken = ?', 
                        [hashedPassword, token], 
                        (err) => {
                            if (err) {
                                console.error('Error al actualizar la contraseña:', err.message);
                                req.flash('error', 'Error interno del servidor');
                                return res.redirect(`/reset-password/${token}`);
                            }

                            req.flash('success', 'Contraseña restablecida con éxito. Ahora puede iniciar sesión.');
                            res.redirect('/login');
                        }
                    );
                });
            } catch (error) {
                console.error('Error al hashear la contraseña:', error.message);
                req.flash('error', 'Error interno del servidor');
                res.redirect(`/reset-password/${token}`);
            }
        }
    ]
};

module.exports = AutenticacionController;
