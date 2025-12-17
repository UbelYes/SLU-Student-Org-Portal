# Admin Server Presentation Script
## SLU Student Organization Portal

---

## INTRODUCTION (30 seconds)

Good [morning/afternoon/evening], everyone. Today I'll be presenting the **Admin Server** component of the SLU Student Organization Portal. This is a Node.js/Express application that handles admin authentication, session management, and real-time user monitoring on **port 3001**, running separately from our main PHP application.

Let me walk you through how this system works, from the ground up.

---

## PART 1: ARCHITECTURE OVERVIEW (1 minute)

### The Big Picture

Our portal uses a **dual-backend architecture**:
- **Port 80**: Main PHP application (handles OSA and organization portals)
- **Port 3001**: Admin server (Node.js/Express) - what we're discussing today

**Why separate?**
- Different technology stack requirements
- Independent scaling
- Isolated admin functionality for security

**Core Responsibilities:**
1. Admin authentication
2. Session management with concurrent login prevention
3. Real-time user monitoring
4. Live dashboard updates every 5-10 seconds

---

## PART 2: TECHNOLOGY STACK (2 minutes)

### Dependencies Breakdown

Let me show you what powers this server. Starting with our `package.json`:

#### **1. Express.js (^4.18.2)**
- The web application framework
- Handles HTTP routing, middleware pipeline, and request/response management
- Industry standard for Node.js web servers

#### **2. mysql2 (^3.15.3)**
- Modern MySQL database driver
- **Why mysql2 over mysql?**
  - Native Promise support with `mysql2/promise`
  - Better performance
  - Full MySQL 8+ compatibility
  - Built-in prepared statements for SQL injection prevention

#### **3. express-session (^1.17.3)**
- Session management middleware
- Creates unique session IDs
- Stores session data in memory
- Enables the `req.session` object that tracks logged-in users

#### **4. cors (^2.8.5)**
- Cross-Origin Resource Sharing
- Allows our frontend to communicate with the backend on different ports
- Browsers block cross-origin requests by default - CORS enables it securely

#### **5. nodemon (^3.0.2)** - Dev Dependency
- Development tool that auto-restarts the server when code changes
- `npm start` → manual restart needed
- `npm run dev` → automatic restart on file changes

---

## PART 3: SERVER INITIALIZATION (2 minutes)

### How the Server Starts

When we run `npm start`, here's what happens:

**Step 1: Load Dependencies**
```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
```
Node.js loads these packages from `node_modules/` and makes them available.

**Step 2: Create Express App**
```javascript
const app = express();
const PORT = 3001;
```
- Creates our Express application instance
- Sets port to 3001 (avoiding conflicts with PHP on port 80)

**Step 3: Database Configuration**
```javascript
const db = {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'slu_org_portal'
};
```
This configuration object is used throughout the app to connect to MySQL.

---

## PART 4: MIDDLEWARE PIPELINE (4 minutes)

### Understanding Middleware

Think of middleware as a **security checkpoint and processing pipeline**. Every request flows through these in order:

```
Request → [Middleware 1] → [Middleware 2] → [Middleware 3] → Route Handler → Response
```

Let me explain each middleware layer:

---

### **Middleware 1: CORS (Lines 38-46)**

```javascript
app.use(cors({
    origin: [
        'http://0.0.0.0:3001',
        'http://127.0.0.1:3001',
        'http://localhost:3001'
    ],
    credentials: true
}));
```

**What it does:**
- Browser sends request with `Origin: http://localhost:3001`
- CORS checks against whitelist
- Adds `Access-Control-Allow-Origin` header to response
- `credentials: true` allows cookies to be sent with requests

**Without this:** Browsers would block all requests due to cross-origin policy.

---

### **Middleware 2: JSON Parser (Line 49)**

```javascript
app.use(express.json());
```

**Critical for login functionality!**

**Flow:**
1. Client sends: `{"email":"admin@slu.edu.ph","password":"admin123"}`
2. This middleware parses JSON string into JavaScript object
3. Populates `req.body = {email: '...', password: '...'}`
4. Route handlers can now access the data

**Without this:** `req.body` would be `undefined` and login would always fail.

---

### **Middleware 3: Static File Serving (Lines 52-54)**

```javascript
app.use('/styles', express.static(path.join(__dirname, '..', 'styles')));
app.use('/resources', express.static(path.join(__dirname, '..', 'resources')));
app.use(express.static(path.join(__dirname)));
```

**Maps URLs to files:**
- `GET /styles/admin-dashboard.css` → Serves `../styles/admin-dashboard.css`
- `GET /admin-login.html` → Serves `./admin-login.html`

This is how the login page and dashboard HTML/CSS are delivered to browsers.

---

### **Middleware 4: Session Management (Lines 57-62)**

```javascript
app.use(session({
    secret: 'admin-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
```

**The heart of our authentication system.**

**How sessions work:**

**First Login:**
1. User logs in successfully
2. `req.session.user = {id: 1, email: '...'}`
3. Server generates session ID: `abc123def456`
4. Sends cookie: `Set-Cookie: connect.sid=s%3Aabc123...`
5. Browser stores cookie

**Subsequent Requests:**
1. Browser sends: `Cookie: connect.sid=s%3Aabc123...`
2. Session middleware looks up ID in memory
3. Loads session data into `req.session`
4. Route handler has access to user data

**Configuration explained:**
- `secret`: Signing key (prevents cookie tampering)
- `resave: false`: Only save when session data changes (performance)
- `saveUninitialized: false`: Don't create sessions for non-logged-in users (privacy)
- `cookie: {secure: false}`: Allow HTTP in development (would be `true` with HTTPS in production)

---

### **Middleware 5: Cache Control (Lines 65-68)**

```javascript
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});
```

**Critical for security and real-time updates!**

**Why `no-store` is essential:**
1. Session checks happen every 5 seconds
2. Account list refreshes every 10 seconds
3. Without `no-store`, browser would return cached data
4. Concurrent login detection would fail
5. Online/offline status wouldn't update

**Without this:** The admin dashboard would show stale data and security features would break.

---

## PART 5: AUTHENTICATION FLOW (5 minutes)

### The Login Process

Let me walk through what happens when an admin logs in.

**Step 1: User Visits Portal**
```
Browser: http://localhost:3001/
    ↓
Root route redirects to /admin-login.html
    ↓
Static middleware serves the login page
```

**Step 2: User Submits Credentials**

Frontend JavaScript:
```javascript
fetch('http://localhost:3001/api/admin/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        email: 'admin@slu.edu.ph',
        password: 'admin123'
    })
});
```

**Step 3: Request Flows Through Middleware**
```
POST /api/admin/login
    ↓
[CORS] → Adds CORS headers ✓
    ↓
[JSON Parser] → req.body = {email, password} ✓
    ↓
[Static Files] → Not a static file, skip ✓
    ↓
[Session] → req.session = {} (empty, not logged in yet) ✓
    ↓
[Cache Control] → Adds no-store header ✓
    ↓
[Route Handler] → Matches app.post('/api/admin/login')
```

**Step 4: Login Route Handler (Lines 98-157)**

```javascript
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
            // User found! Now implement concurrent login prevention...
        }
    } catch (err) {
        // Handle errors
    }
});
```

**Key Points:**
- Uses `async/await` for clean asynchronous code
- Prepared statements (`?` placeholders) prevent SQL injection
- Only admins can log in (user_type = "admin")

---

### Concurrent Login Prevention

This is a **unique security feature** of our system. Here's the problem and solution:

**Problem:**
- Admin logs in on Computer A
- Admin logs in on Computer B
- Now admin has TWO active sessions
- Security risk and license violation

**Solution: Force logout the old session**

```javascript
if (rows.length > 0) {
    // Step 1: Mark any existing sessions as offline
    await conn.execute(
        'UPDATE users SET is_online = 0 WHERE id = ?',
        [rows[0].id]
    );

    // Step 2: Mark THIS session as online
    await conn.execute(
        'UPDATE users SET is_online = 1, last_activity = NOW() WHERE id = ?',
        [rows[0].id]
    );

    // Step 3: Store user in session
    req.session.user = rows[0];

    // Success response
    res.json({
        success: true,
        user: {
            email: rows[0].email,
            type: rows[0].user_type,
            name: rows[0].name
        }
    });
}
```

**What happens:**
1. Computer A: Admin logged in (`is_online = 1`)
2. Computer B: Admin logs in
3. Database: `is_online` set to 0 for Computer A's session
4. Database: `is_online` set to 1 for Computer B's session
5. Computer A's next session-check (every 5 seconds):
   - Finds `is_online = 0` in database
   - Realizes another session took over
   - Destroys local session
   - Shows alert: "Logged out from another device"
   - Redirects to login page

**Result:** Only one active admin session at a time! ✓

---

## PART 6: SESSION MONITORING (3 minutes)

### Real-Time Session Checks

Our admin portal constantly monitors for concurrent logins. Here's how:

**Frontend Code (runs every 5 seconds):**
```javascript
setInterval(() => {
    fetch('/api/admin/session-check', {
        credentials: 'include'  // Send session cookie
    })
    .then(res => res.json())
    .then(data => {
        if (data.force_logout) {
            alert('Logged out from another device');
            window.location.href = '/';
        }
    });
}, 5000);
```

**Backend Route (Lines 226-259):**
```javascript
app.get('/api/admin/session-check', async (req, res) => {
    if (req.session.user && req.session.user.id) {
        try {
            // Check database for online status
            const conn = await mysql.createConnection(db);
            const [rows] = await conn.execute(
                'SELECT is_online FROM users WHERE id = ?',
                [req.session.user.id]
            );
            await conn.end();

            // If marked offline, someone else logged in
            if (rows.length > 0 && rows[0].is_online == 0) {
                req.session.destroy();
                return res.json({
                    logged_in: false,
                    force_logout: true
                });
            }
        } catch (err) {
            // Silently fail on database errors
        }
    }

    res.json({ logged_in: true });
});
```

**Flow:**
```
Every 5 seconds:
    Frontend asks: "Am I still logged in?"
        ↓
    Backend checks database: is_online status
        ↓
    is_online = 1? → "Yes, you're still logged in"
    is_online = 0? → "No, you were logged in elsewhere. Goodbye!"
```

---

### Real-Time Dashboard Updates

The admin dashboard shows all users and their online status:

**Frontend Code (runs every 10 seconds):**
```javascript
setInterval(() => {
    fetch('/api/admin/accounts', {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        updateAccountsTable(data.accounts);
    });
}, 10000);
```

**Backend Route (Lines 274-295):**
```javascript
app.get('/api/admin/accounts', async (req, res) => {
    try {
        const conn = await mysql.createConnection(db);
        const [accounts] = await conn.execute(
            'SELECT id, email, user_type, name, last_activity, is_online as status FROM users'
        );
        await conn.end();

        res.json({
            success: true,
            accounts
        });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});
```

**Response Example:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": 1,
      "email": "admin@slu.edu.ph",
      "user_type": "admin",
      "name": "Admin",
      "last_activity": "2025-12-17 10:30:00",
      "status": 1  ← Online
    },
    {
      "id": 2,
      "email": "osa@slu.edu.ph",
      "user_type": "osa",
      "name": "OSA Staff",
      "last_activity": "2025-12-17 09:15:00",
      "status": 0  ← Offline
    }
  ]
}
```

The dashboard updates in real-time without page refresh!

---

## PART 7: SECURITY FEATURES (3 minutes)

### What We Did Right

**1. Prepared Statements (SQL Injection Prevention)**
```javascript
// ✓ SAFE - Uses placeholders
await conn.execute(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password]
);

// ✗ DANGEROUS - String concatenation
await conn.execute(
    `SELECT * FROM users WHERE email = '${email}'`
);
```

**2. CORS Restrictions**
- Only whitelisted origins can access the API
- Credentials must be explicitly requested
- Prevents unauthorized cross-origin access

**3. HttpOnly Cookies**
- Session cookie automatically has `HttpOnly` flag
- JavaScript cannot access it via `document.cookie`
- Protects against XSS attacks

**4. Cache Prevention**
- `Cache-Control: no-store` on all responses
- Prevents sensitive session data from being cached
- Browser always fetches fresh data

**5. Concurrent Login Prevention**
- Database-backed session validation
- Only one active session per user
- Real-time detection (5-second polling)

---

### Critical Security Issues

**⚠️ Important: The following issues exist for demonstration purposes only:**

**1. Plaintext Passwords**
```javascript
// Current: Password stored as-is
password: 'admin123'

// Should be: Hashed with bcrypt
password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
```

**2. Hardcoded Database Credentials**
```javascript
// Current: Credentials in code
const db = {
    user: 'root',
    password: ''
};

// Should be: Environment variables
const db = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};
```

**3. In-Memory Sessions**
```
Problem: Sessions stored in RAM
    ↓
Server restarts → All sessions lost → Everyone logged out
    ↓
Can't scale to multiple servers

Solution: Use Redis or database-backed sessions
```

**4. No HTTPS**
```javascript
// Current: Allows HTTP
cookie: { secure: false }

// Production: Require HTTPS
cookie: { secure: true }
```

**5. Full User Row in Session**
```javascript
// Current: Stores password in session
req.session.user = rows[0];  // Includes password column!

// Should be: Only store necessary fields
req.session.user = {
    id: rows[0].id,
    email: rows[0].email,
    user_type: rows[0].user_type,
    name: rows[0].name
};
```

---

## PART 8: COMPLETE REQUEST LIFECYCLE (3 minutes)

Let me trace a complete login request from start to finish:

**Timeline: Admin Login**

```
T=0ms: User clicks "Login" button
    ↓
T=5ms: Frontend sends POST request
    POST http://localhost:3001/api/admin/login
    Body: {"email":"admin@slu.edu.ph","password":"admin123"}
    ↓
T=10ms: Request arrives at server
    ↓
T=15ms: CORS middleware adds headers
    ↓
T=20ms: JSON parser creates req.body object
    ↓
T=25ms: Static files middleware - skipped (not static)
    ↓
T=30ms: Session middleware - req.session = {} (empty)
    ↓
T=35ms: Cache control adds no-store header
    ↓
T=40ms: Route handler matched!
    app.post('/api/admin/login', ...)
    ↓
T=45ms: Extract credentials from req.body
    ↓
T=50ms: Connect to MySQL database ⏸️
    await mysql.createConnection(db)
    ↓
T=100ms: Query for user ⏸️
    SELECT * FROM users WHERE email = ? AND password = ?
    ↓
T=200ms: User found! Start concurrent login prevention
    ↓
T=210ms: UPDATE is_online = 0 (mark old sessions offline) ⏸️
    ↓
T=260ms: UPDATE is_online = 1 (mark this session online) ⏸️
    ↓
T=310ms: Store in session
    req.session.user = rows[0]
    ↓
T=320ms: Close database connection ⏸️
    ↓
T=325ms: Send success response
    {success: true, user: {...}}
    ↓
T=330ms: Session middleware saves session to memory
    Generates session ID: abc123
    ↓
T=335ms: Response sent to client
    Set-Cookie: connect.sid=s%3Aabc123.signature; HttpOnly
    Cache-Control: no-store
    ↓
T=340ms: Frontend receives response
    ↓
T=345ms: Redirect to admin portal
    window.location.href = '/admin-portal.html'
    ↓
DONE: Total time ~345ms
```

**Key Observations:**
- Database operations are the slowest (await points)
- Middleware runs sequentially
- Session saved automatically after route handler
- Cookie sent with response

---

## PART 9: ASYNC/AWAIT EXPLAINED (2 minutes)

### Why We Use async/await

**The Problem with Callbacks (Old Way):**
```javascript
// Callback hell - hard to read!
mysql.createConnection(db, (err, conn) => {
    if (err) return handleError(err);
    conn.execute(query, [email, password], (err, rows) => {
        if (err) return handleError(err);
        conn.execute(updateQuery, [id], (err, result) => {
            if (err) return handleError(err);
            conn.end((err) => {
                if (err) return handleError(err);
                res.json({success: true});
            });
        });
    });
});
```

**The Solution with async/await (Modern Way):**
```javascript
// Clean, readable, sequential code!
try {
    const conn = await mysql.createConnection(db);
    const [rows] = await conn.execute(query, [email, password]);
    await conn.execute(updateQuery, [id]);
    await conn.end();
    res.json({success: true});
} catch (err) {
    handleError(err);
}
```

**How It Works:**
1. `async` keyword: Marks function as asynchronous
2. `await` keyword: Pauses execution until Promise resolves
3. Code looks synchronous but runs asynchronously
4. Errors handled with try/catch

**Real Example from Our Code:**
```javascript
app.post('/api/admin/login', async (req, res) => {
//                           ↑ async keyword
    const conn = await mysql.createConnection(db);
//               ↑ await - waits for connection
    const [rows] = await conn.execute(...);
//                 ↑ await - waits for query
    await conn.end();
//  ↑ await - waits for connection close
});
```

**Without async/await:** We'd have deeply nested callbacks (pyramid of doom).

---

## PART 10: WHY SERVER.LISTEN IS AT THE BOTTOM (1 minute)

You might wonder: Why is `app.listen()` at the very end of the file?

**Critical Requirement: Order Matters!**

```javascript
// ✓ CORRECT ORDER
app.use(express.json());        // Register middleware
app.post('/api/login', ...);    // Define routes
app.listen(3001);               // Start listening
```

**What happens if we listen first?**
```javascript
// ✗ WRONG ORDER
app.listen(3001);               // Server starts
app.use(express.json());        // Middleware registered AFTER
app.post('/api/login', ...);    // Routes defined AFTER

// Result: Incoming requests won't have middleware or routes!
// They'll hit the server but nothing is configured yet
```

**The Rule:**
1. Load dependencies
2. Configure database
3. Register ALL middleware
4. Define ALL routes
5. THEN start listening

Think of it like building a house:
- Middleware and routes = rooms and wiring
- app.listen() = opening the front door

You don't open the door until everything inside is ready!

---

## PART 11: DATABASE SCHEMA (1 minute)

### Users Table

Our admin server relies on the `users` table:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'osa', 'org') NOT NULL,
    name VARCHAR(255) NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields Used by Admin Server:**

| Field | Purpose |
|-------|---------|
| `id` | User identifier (stored in session) |
| `email` | Login credential |
| `password` | Login credential (plaintext - security issue!) |
| `user_type` | Must be 'admin' for admin portal access |
| `name` | Display name in dashboard |
| `is_online` | Concurrent login detection (1=online, 0=offline) |
| `last_activity` | Track when user was last active |

**Sample Data:**
```sql
INSERT INTO users VALUES
(1, 'admin@slu.edu.ph', 'admin123', 'admin', 'Admin User', NOW(), 1, NOW()),
(2, 'osa@slu.edu.ph', 'osa123', 'osa', 'OSA Staff', NOW(), 0, NOW());
```

---

## PART 12: API ENDPOINTS SUMMARY (1 minute)

Quick reference for all available endpoints:

| Method | Endpoint | Purpose | Auth Required | Frontend Call Frequency |
|--------|----------|---------|---------------|------------------------|
| GET | `/` | Redirect to login page | No | Once (page load) |
| POST | `/api/admin/login` | Authenticate admin | No | Once (form submit) |
| GET | `/api/admin/session` | Check if logged in | Session | Once (page load) |
| GET | `/api/admin/session-check` | Detect concurrent logins | Session | Every 5 seconds |
| GET | `/api/admin/accounts` | Get all users | Session | Every 10 seconds |
| POST | `/api/admin/logout` | End session | Session | Once (logout button) |

**Performance Consideration:**
- Session checks every 5 seconds
- Account list refresh every 10 seconds
- These polling intervals could be optimized with WebSockets in future versions

---

## PART 13: RUNNING THE SERVER (1 minute)

### Development vs Production

**First Time Setup:**
```bash
cd admin
npm install  # Installs all dependencies
```

**Development Mode (recommended):**
```bash
npm run dev
# Runs: nodemon server.js
# Auto-restarts on code changes
# Perfect for development
```

**Production Mode:**
```bash
npm start
# Runs: node server.js
# Manual restart needed for changes
# Use in production environment
```

**Expected Console Output:**
```
Admin server on http://localhost:3001
```

**Access Points:**
- Admin login: `http://localhost:3001/`
- Direct dashboard: `http://localhost:3001/admin-portal.html`
- API endpoints: `http://localhost:3001/api/admin/*`

**Testing:**
```
Email: admin@slu.edu.ph
Password: admin123
```

---

## PART 14: TROUBLESHOOTING (1 minute)

### Common Issues and Solutions

**Issue 1: "Port 3001 already in use"**
```bash
# Find process using port
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change port in server.js
const PORT = 3002;
```

**Issue 2: "Database connection failed"**
```
Checklist:
✓ Is MySQL running? (sudo service mysql status)
✓ Does database 'slu_org_portal' exist?
✓ Are credentials correct in db object?
✓ Is MySQL on port 3306?
```

**Issue 3: "Session not persisting"**
```
Checklist:
✓ Are cookies enabled in browser?
✓ Is fetch using credentials: 'include'?
✓ Does CORS origin match exactly?
✓ Are you using the same domain/port?
```

**Issue 4: "Can't access from other devices"**
```
Server binds to 0.0.0.0 (all interfaces)
Access via: http://<server-ip>:3001

Checklist:
✓ Is firewall allowing port 3001?
✓ Are both devices on same network?
✓ Try: curl http://<server-ip>:3001
```

---

## PART 15: FUTURE IMPROVEMENTS (2 minutes)

### Production Readiness Checklist

If we were to deploy this to production, here's what we'd need to fix:

**1. Password Security**
```javascript
// Install bcrypt
npm install bcrypt

// Hash password on registration
const hashedPassword = await bcrypt.hash(password, 10);

// Verify on login
const isValid = await bcrypt.compare(password, storedHash);
```

**2. Environment Variables**
```bash
# Create .env file
DB_HOST=127.0.0.1
DB_USER=admin_user
DB_PASSWORD=secure_password_here
DB_NAME=slu_org_portal
SESSION_SECRET=random_64_character_secret
PORT=3001
```

```javascript
// Load in server.js
require('dotenv').config();
const db = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};
```

**3. Redis Sessions (Persistent, Scalable)**
```javascript
// Install redis store
npm install connect-redis redis

// Configure
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const redisClient = redis.createClient();

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,  // HTTPS only
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24  // 24 hours
    }
}));
```

**Benefits:**
- Sessions survive server restart
- Can scale to multiple servers
- Professional session management

**4. Security Headers (Helmet Middleware)**
```javascript
npm install helmet

const helmet = require('helmet');
app.use(helmet());

// Adds headers:
// - X-Frame-Options: DENY
// - X-Content-Type-Options: nosniff
// - X-XSS-Protection: 1; mode=block
// - Content-Security-Policy: ...
```

**5. HTTPS with SSL Certificates**
```javascript
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('private-key.pem'),
    cert: fs.readFileSync('certificate.pem')
};

https.createServer(options, app).listen(3001);
```

**6. Rate Limiting (Brute Force Protection)**
```javascript
npm install express-rate-limit

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,  // 5 attempts
    message: 'Too many login attempts, please try again later'
});

app.post('/api/admin/login', loginLimiter, async (req, res) => {
    // Login logic
});
```

**7. Logging (Winston or Morgan)**
```javascript
npm install winston morgan

const winston = require('winston');
const morgan = require('morgan');

// HTTP request logging
app.use(morgan('combined'));

// Application logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

**8. Code Organization (Express Router)**
```javascript
// routes/admin.js
const router = require('express').Router();

router.post('/login', async (req, res) => { /* ... */ });
router.post('/logout', async (req, res) => { /* ... */ });
router.get('/session', async (req, res) => { /* ... */ });

module.exports = router;

// server.js
app.use('/api/admin', require('./routes/admin'));
```

---

## CONCLUSION (1 minute)

### Summary

Today we covered the **Admin Server** component of the SLU Student Organization Portal:

**Key Takeaways:**

1. **Architecture**: Dual-backend system (PHP + Node.js) running on separate ports
2. **Technology**: Express.js, mysql2/promise, express-session, CORS
3. **Security**: Concurrent login prevention, prepared statements, HttpOnly cookies
4. **Real-time**: 5-second session checks, 10-second dashboard updates
5. **Flow**: Request → Middleware Pipeline → Route Handler → Response

**Unique Features:**
- Concurrent login prevention with database-backed validation
- Real-time user monitoring without WebSockets
- Clean async/await patterns for database operations
- In-memory session management for development

**Current State:**
- Functional for development/demonstration
- Needs hardening for production (password hashing, HTTPS, Redis sessions, etc.)

**The Server in One Sentence:**
*A Node.js/Express application that handles admin authentication with concurrent login prevention and real-time user monitoring through polling-based session checks.*

---

### Questions to Anticipate

**Q1: "Why not use WebSockets instead of polling?"**
A: Great question! WebSockets would be more efficient for real-time updates. We used polling for simplicity and to avoid additional dependencies. In production, WebSockets with Socket.io would be the better choice.

**Q2: "Why in-memory sessions instead of database sessions?"**
A: In-memory sessions are simpler for development and don't require additional setup. For production, we'd use Redis or database-backed sessions for persistence and scalability.

**Q3: "What happens if two admins try to log in at the exact same time?"**
A: The database transaction order determines the winner. The second UPDATE sets is_online=1, and the first login gets kicked out on the next 5-second session check.

**Q4: "How would you handle multiple admin users simultaneously?"**
A: Currently, the system prevents concurrent logins for the *same* admin user. Different admin users can log in simultaneously without issues. If you want multiple concurrent sessions for the same user, you'd need to change the `is_online` field to a session token comparison system.

**Q5: "What's the performance impact of polling every 5 seconds?"**
A: With 10 concurrent admins:
- Session checks: 10 req/sec * simple SELECT queries
- Negligible database load
- For 100+ admins, consider WebSockets or increase interval

**Q6: "Why mysql2/promise instead of an ORM like Sequelize?"**
A: For this project's scope, raw SQL with prepared statements is sufficient and more performant. ORMs add abstraction overhead. For larger projects with complex relationships, ORMs are beneficial.

---

### Thank You!

**Resources:**
- Source code: `/admin/server.js`
- Documentation: `/admin/README.md`
- Dependencies: `/admin/package.json`

**Contact for questions:**
[Your contact information]

---

**END OF PRESENTATION**

*Estimated total time: 25-30 minutes*
*Adjust pacing based on audience technical level*
