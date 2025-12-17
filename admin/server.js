// ============================================================================
// SLU STUDENT ORGANIZATION PORTAL - ADMIN SERVER
// ============================================================================
// Port: 3001 (Separate from main PHP application on port 80)
// Purpose: Admin authentication, session management, and user monitoring
// ============================================================================

// ----------------------------------------------------------------------------
// DEPENDENCIES
// ----------------------------------------------------------------------------
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// ----------------------------------------------------------------------------
// APPLICATION SETUP
// ----------------------------------------------------------------------------
const app = express();
const PORT = 3001;

// ----------------------------------------------------------------------------
// DATABASE CONFIGURATION
// ----------------------------------------------------------------------------
const db = {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'slu_org_portal'
};

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// CORS - Allow cross-origin requests from admin origins
app.use(cors({
    origin: [
        'http://0.0.0.0:3001',
        'http://127.0.0.1:3001',
        'http://localhost:3001'
    ],
    credentials: true
}));

// JSON Body Parser - Parse incoming JSON request bodies
app.use(express.json());

// Static File Serving - Serve CSS, images, and HTML files
app.use('/styles', express.static(path.join(__dirname, '..', 'styles')));
app.use('/resources', express.static(path.join(__dirname, '..', 'resources')));
app.use(express.static(path.join(__dirname)));

// Session Management - Track logged-in users
app.use(session({
    secret: 'admin-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Cache Control - Prevent browser caching of sensitive data
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// ============================================================================
// ROUTES
// ============================================================================

// ----------------------------------------------------------------------------
// ROOT ROUTE - Redirect to Login Page
// ----------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.redirect('/admin-login.html');
});

// ----------------------------------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------------------------------

/**
 * POST /api/admin/login
 * Authenticates admin user and creates session
 *
 * Request Body:
 *   - email: Admin email address
 *   - password: Admin password
 *
 * Response:
 *   - success: true/false
 *   - user: { email, type, name } (if successful)
 *   - message: Error message (if failed)
 */
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Connect to database
        const conn = await mysql.createConnection(db);

        // Query for admin user with matching credentials
        const [rows] = await conn.execute(
            'SELECT * FROM users WHERE email = ? AND password = ? AND user_type = "admin"',
            [email, password]
        );

        if (rows.length > 0) {
            // User found - Implement concurrent login prevention

            // Step 1: Mark any existing sessions as offline
            await conn.execute(
                'UPDATE users SET is_online = 0 WHERE id = ?',
                [rows[0].id]
            );

            // Step 2: Mark this session as online
            await conn.execute(
                'UPDATE users SET is_online = 1, last_activity = NOW() WHERE id = ?',
                [rows[0].id]
            );

            // Step 3: Store user data in session
            req.session.user = rows[0];

            // Close database connection
            await conn.end();

            // Return success response
            res.json({
                success: true,
                user: {
                    email: rows[0].email,
                    type: rows[0].user_type,
                    name: rows[0].name
                }
            });
        } else {
            // No matching user found
            await conn.end();
            res.json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (err) {
        // Database error
        console.error("Database connection failed", err);
        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});

/**
 * POST /api/admin/logout
 * Logs out admin user and destroys session
 *
 * Response:
 *   - success: true
 */
app.post('/api/admin/logout', async (req, res) => {
    // Update database to mark user as offline
    if (req.session.user) {
        try {
            const conn = await mysql.createConnection(db);
            await conn.execute(
                'UPDATE users SET is_online = 0 WHERE id = ?',
                [req.session.user.id]
            );
            await conn.end();
        } catch (err) {
            // Silently fail - session will be destroyed anyway
        }
    }

    // Destroy session on server
    req.session.destroy();

    // Return success
    res.json({ success: true });
});

// ----------------------------------------------------------------------------
// SESSION MANAGEMENT ROUTES
// ----------------------------------------------------------------------------

/**
 * GET /api/admin/session
 * Checks if admin has active session
 *
 * Response:
 *   - logged_in: true/false
 *   - user: { email, type, name } (if logged in)
 */
app.get('/api/admin/session', (req, res) => {
    if (req.session.user) {
        // User has active session
        res.json({
            logged_in: true,
            user: {
                email: req.session.user.email,
                type: req.session.user.user_type,
                name: req.session.user.name
            }
        });
    } else {
        // No active session
        res.json({ logged_in: false });
    }
});

/**
 * GET /api/admin/session-check
 * Detects concurrent logins and forces logout if necessary
 * Called every 5 seconds by frontend
 *
 * Response:
 *   - logged_in: true/false
 *   - force_logout: true (if logged in elsewhere)
 */
app.get('/api/admin/session-check', async (req, res) => {
    // Only check if user has session
    if (req.session.user && req.session.user.id) {
        try {
            // Connect to database
            const conn = await mysql.createConnection(db);

            // Check if user is still marked as online in database
            const [rows] = await conn.execute(
                'SELECT is_online FROM users WHERE id = ?',
                [req.session.user.id]
            );

            await conn.end();

            // If user is marked offline, another session has taken over
            if (rows.length > 0 && rows[0].is_online == 0) {
                // Destroy this session
                req.session.destroy();

                // Tell frontend to force logout
                return res.json({
                    logged_in: false,
                    force_logout: true
                });
            }
        } catch (err) {
            // Silently fail on database errors
        }
    }

    // Session is valid
    res.json({ logged_in: true });
});

// ----------------------------------------------------------------------------
// DATA RETRIEVAL ROUTES
// ----------------------------------------------------------------------------

/**
 * GET /api/admin/accounts
 * Retrieves all user accounts for admin dashboard
 * Called every 10 seconds by frontend for real-time updates
 *
 * Response:
 *   - success: true/false
 *   - accounts: Array of user objects
 */
app.get('/api/admin/accounts', async (req, res) => {
    try {
        // Connect to database
        const conn = await mysql.createConnection(db);

        // Get all users with their online status
        const [accounts] = await conn.execute(
            'SELECT id, email, user_type, name, last_activity, is_online as status FROM users'
        );

        await conn.end();

        // Return user list
        res.json({
            success: true,
            accounts
        });
    } catch (err) {
        // Database error
        res.status(500).json({ success: false });
    }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Admin server on http://localhost:${PORT}`);
});
