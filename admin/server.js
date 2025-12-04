const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors({ origin: ['http://0.0.0.0:3001', 'http://127.0.0.1:3001', 'http://localhost:3001'], credentials: true }));
app.use(express.json());
app.use('/styles', express.static(path.join(__dirname, '..', 'styles')));
app.use('/resources', express.static(path.join(__dirname, '..', 'resources')));
app.use(express.static(path.join(__dirname)));
app.use(session({ secret: 'admin-secret', resave: false, saveUninitialized: false, cookie: { secure: false } }));
// Prevent caching of sensitive admin responses
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

const db = { host: '127.0.0.1' ,port: '3306', user: 'root', password: '', database: 'simple_portal' };

// Redirect root to login page
app.get('/', (req, res) => res.redirect('/admin-login.html'));

// Login
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const conn = await mysql.createConnection(db);
        const [rows] = await conn.execute('SELECT * FROM users WHERE email = ? AND password = ? AND user_type = "admin"', [email, password]);
        
        if (rows.length > 0) {
            // Force logout any existing session by setting is_online to 0 first
            await conn.execute('UPDATE users SET is_online = 0 WHERE id = ?', [rows[0].id]);
            // Update user as online
            await conn.execute('UPDATE users SET is_online = 1, last_activity = NOW() WHERE id = ?', [rows[0].id]);
            req.session.user = rows[0];
            await conn.end();
            res.json({ success: true, user: { email: rows[0].email, type: rows[0].user_type, name: rows[0].name } });
        } else {
            await conn.end();
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
	console.error("Database connection failed", err);
        res.status(500).json({ success: false, message: 'Database connection failed' });
    }
});

// Session check
app.get('/api/admin/session', (req, res) => {
    res.json(req.session.user ? { logged_in: true, user: { email: req.session.user.email, type: req.session.user.user_type, name: req.session.user.name } } : { logged_in: false });
});

// Session check for forced logout
app.get('/api/admin/session-check', async (req, res) => {
    if (req.session.user && req.session.user.id) {
        try {
            const conn = await mysql.createConnection(db);
            const [rows] = await conn.execute('SELECT is_online FROM users WHERE id = ?', [req.session.user.id]);
            await conn.end();
            
            if (rows.length > 0 && rows[0].is_online == 0) {
                req.session.destroy();
                return res.json({ logged_in: false, force_logout: true });
            }
        } catch (err) {}
    }
    res.json({ logged_in: true });
});

// Get accounts
app.get('/api/admin/accounts', async (req, res) => {
    try {
        const conn = await mysql.createConnection(db);
        const [accounts] = await conn.execute('SELECT id, email, user_type, name, last_activity, is_online as status FROM users');
        await conn.end();
        res.json({ success: true, accounts });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Logout
app.post('/api/admin/logout', async (req, res) => {
    if (req.session.user) {
        try {
            const conn = await mysql.createConnection(db);
            await conn.execute('UPDATE users SET is_online = 0 WHERE id = ?', [req.session.user.id]);
            await conn.end();
        } catch (err) {}
    }
    req.session.destroy();
    res.json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => console.log(`Admin server on http://localhost:${PORT}`));
