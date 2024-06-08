// controllers/public/AutenticacionController.js
const bcrypt = require('bcrypt');

const users = [
    {
        username: 'admin',
        password: '$2b$10$VnE7.6W67KdJq9Z9wYGhRO1nN.zow3iZOVvPQ9/c9VPAQOxLZ/6vi' // 'password' hashed
    }
];

const AutenticacionController = {
    showLogin: (req, res) => {
        res.render('login', { flashMessages: req.flash() });
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username);

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.logueado = true;
            req.session.username = username;
            req.flash('success', 'Login successful');
            res.redirect('/');
        } else {
            req.flash('error', 'Invalid username or password');
            res.redirect('/login');
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.redirect('/login');
        });
    },

    showRegister: (req, res) => {
        res.render('register', { flashMessages: req.flash() });
    },

    register: async (req, res) => {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Aquí puedes guardar el usuario en tu base de datos.
        // Por simplicidad, estamos agregándolo al array de usuarios.
        users.push({ username, password: hashedPassword });

        req.flash('success', 'Registro exitoso');
        res.redirect('/');
    }
};

module.exports = AutenticacionController;
