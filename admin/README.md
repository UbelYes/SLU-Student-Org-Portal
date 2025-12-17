# Admin Server - SLU Student Organization Portal

## Table of Contents
1. [Overview](#overview)
2. [Package.json - Dependencies](#packagejson---dependencies)
3. [Server.js - Code Flow](#serverjs---code-flow)
4. [Request Flow Examples](#request-flow-examples)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Session Management](#session-management)
8. [Security Features](#security-features)

---

## Overview

The **Admin Server** is a Node.js/Express application that runs on **port 3001**, separate from the main PHP application (port 80). It handles:
- Admin authentication
- Session management
- Real-time user monitoring
- Concurrent login prevention

**Technology Stack:**
- Node.js with Express.js
- MySQL database (mysql2/promise)
- Express sessions (in-memory)
- CORS for cross-origin requests

---

## Package.json - Dependencies

### File Location
```
/admin/package.json
```

### Application Metadata
```json
{
  "name": "admin",
  "version": "1.0.0",
  "description": "Admin Portal",
  "main": "server.js"
}
```

**Explanation:**
- `name`: Package identifier
- `version`: Semantic versioning (major.minor.patch)
- `description`: Brief description of the application
- `main`: Entry point file that runs when you execute `npm start`

---

### Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Usage:**

**Production:**
```bash
npm start
# Runs: node server.js
# Starts server normally (manual restart needed for code changes)
```

**Development:**
```bash
npm run dev
# Runs: nodemon server.js
# Auto-restarts server when code changes detected
```

---

### Dependencies (Runtime)

#### 1. express (^4.18.2)
```json
"express": "^4.18.2"
```
- **Purpose:** Web application framework
- **What it does:**
  - Creates HTTP server
  - Handles routing (app.get, app.post, etc.)
  - Manages middleware
  - Simplifies request/response handling

---

#### 2. mysql2 (^3.15.3)
```json
"mysql2": "^3.15.3"
```
- **Purpose:** MySQL database driver
- **What it does:**
  - Connects to MySQL database
  - Executes SQL queries
  - Supports prepared statements (prevents SQL injection)
  - Provides async/await interface (`mysql2/promise`)

**Why mysql2 and not mysql?**
- Faster performance
- Modern async/await support
- Better MySQL 8+ compatibility
- Built-in prepared statements

---

#### 3. express-session (^1.17.3)
```json
"express-session": "^1.17.3"
```
- **Purpose:** Session management middleware
- **What it does:**
  - Creates unique session IDs
  - Stores session data (in-memory by default)
  - Sets session cookies
  - Enables `req.session` object
  - Tracks logged-in users

---

#### 4. cors (^2.8.5)
```json
"cors": "^2.8.5"
```
- **Purpose:** Cross-Origin Resource Sharing
- **What it does:**
  - Allows browsers from specific origins to access the API
  - Adds CORS headers to responses
  - Enables credential sharing (cookies/sessions)

**Why needed?**
- Browser security blocks cross-origin requests by default
- This allows frontend to communicate with backend on different port

---

#### 5. dotenv (^16.3.1)
```json
"dotenv": "^16.3.1"
```
- **Purpose:** Environment variable management
- **What it does:**
  - Loads variables from `.env` file
  - Separates configuration from code
  - Different configs for dev/staging/production

**Note:** Currently not used in server.js, but available for future use

---

### Dev Dependencies

#### nodemon (^3.0.2)
```json
"nodemon": "^3.0.2"
```
- **Purpose:** Development auto-reload tool
- **What it does:**
  - Watches files for changes
  - Automatically restarts server
  - Saves time during development

**Only for development** - not included in production

---

### Version Ranges Explained

**Caret (^) Symbol:**
```json
"express": "^4.18.2"
```
- Allows updates to minor and patch versions
- Will install: `4.18.2`, `4.19.0`, `4.20.5`, etc.
- Will NOT install: `5.0.0` (major version change)
- Ensures compatibility while getting bug fixes

---

### Installing Dependencies

**First time setup:**
```bash
cd admin
npm install
```
This reads `package.json` and installs all dependencies into `node_modules/` folder.

**Update dependencies:**
```bash
npm update
```

**Install specific package:**
```bash
npm install express-session
```

---

## Server.js - Code Flow

### File Location
```
/admin/server.js
```

### Complete Execution Flow

```
Server Start
    ↓
Load Dependencies (Lines 11-15)
    ↓
Create Express App (Line 20)
    ↓
Configure Database (Lines 26-32)
    ↓
Register Middleware (Lines 38-68)
    ├─ CORS
    ├─ JSON Parser
    ├─ Static Files
    ├─ Session Management
    └─ Cache Control
    ↓
Define Routes (Lines 77-295)
    ├─ Root Route
    ├─ Authentication Routes
    ├─ Session Management Routes
    └─ Data Retrieval Routes
    ↓
Start Listening on Port 3001 (Line 301)
    ↓
Server Ready! ✅
```

---

### Section 1: Dependencies (Lines 11-15)

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
```

**What happens:**
1. Node.js looks in `node_modules/` for each package
2. Loads the package into memory
3. Assigns to a constant variable
4. Makes functionality available for use

**Import Order:**
- Doesn't matter for functionality
- Convention: core modules first, then third-party

---

### Section 2: Application Setup (Lines 20-21)

```javascript
const app = express();
const PORT = 3001;
```

**Line 20: `const app = express();`**
- Creates Express application instance
- `app` is the main object you'll use
- Provides methods: `app.use()`, `app.get()`, `app.post()`, etc.

**Line 21: `const PORT = 3001;`**
- Defines which port server listens on
- Port 3001 chosen to avoid conflict with:
  - PHP app (port 80)
  - Common dev servers (3000, 8080)

---

### Section 3: Database Configuration (Lines 26-32)

```javascript
const db = {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'slu_org_portal'
};
```

**Connection Parameters:**

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `host` | `127.0.0.1` | MySQL server address (localhost) |
| `port` | `3306` | MySQL default port |
| `user` | `root` | Database username |
| `password` | `''` | Empty password (development only) |
| `database` | `slu_org_portal` | Database name to use |

**Usage in Routes:**
```javascript
const conn = await mysql.createConnection(db);
// Creates connection using these parameters
```

---

### Section 4: Middleware Configuration (Lines 38-68)

**What is Middleware?**
Functions that run **before** your route handlers. They process the request in a pipeline.

```
Request → Middleware 1 → Middleware 2 → Middleware 3 → Route Handler → Response
```

---

#### Middleware 1: CORS (Lines 38-46)

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

**Purpose:** Allow browsers from these URLs to make requests

**Flow:**
```
Browser sends request with:
Origin: http://localhost:3001
    ↓
CORS middleware checks whitelist
    ↓
Origin matches? ✅
    ↓
Adds headers to response:
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Credentials: true
    ↓
Browser accepts response
```

---

#### Middleware 2: JSON Parser (Line 49)

```javascript
app.use(express.json());
```

**Purpose:** Parse JSON request bodies

**Flow:**
```
Client sends:
POST /api/admin/login
Content-Type: application/json
{"email":"admin@slu.edu.ph","password":"admin123"}
    ↓
express.json() middleware runs
    ↓
Parses JSON string → JavaScript object
    ↓
Populates req.body:
req.body = {
    email: 'admin@slu.edu.ph',
    password: 'admin123'
}
    ↓
Route handler can now use req.body
```

---

#### Middleware 3: Static Files (Lines 52-54)

```javascript
app.use('/styles', express.static(path.join(__dirname, '..', 'styles')));
app.use('/resources', express.static(path.join(__dirname, '..', 'resources')));
app.use(express.static(path.join(__dirname)));
```

**Purpose:** Serve HTML, CSS, images, JavaScript files

**Mapping:**

| URL Request | Physical File |
|-------------|---------------|
| `GET /styles/admin-dashboard.css` | `../styles/admin-dashboard.css` |
| `GET /resources/images/logo.png` | `../resources/images/logo.png` |
| `GET /admin-login.html` | `./admin-login.html` |

**Flow:**
```
Browser requests: http://localhost:3001/styles/admin-dashboard.css
    ↓
Static middleware checks: ../styles/admin-dashboard.css
    ↓
File exists? ✅
    ↓
Reads file from disk
    ↓
Sends file as response with Content-Type: text/css
```

---

#### Middleware 4: Session Management (Lines 57-62)

```javascript
app.use(session({
    secret: 'admin-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
```

**Purpose:** Track logged-in users across requests

**How it works:**

**First Request (No Session):**
```
Request arrives
    ↓
Session middleware runs
    ↓
No session cookie found
    ↓
req.session = {} (empty object)
    ↓
Route handler runs
```

**After Login (Creating Session):**
```
Route handler:
req.session.user = {id: 1, email: 'admin@slu.edu.ph', ...}
    ↓
Session middleware saves data in memory
    ↓
Generates session ID: abc123def456
    ↓
Sends cookie to browser:
Set-Cookie: connect.sid=s%3Aabc123def456.signature; HttpOnly
```

**Subsequent Requests (With Session):**
```
Request arrives with:
Cookie: connect.sid=s%3Aabc123def456.signature
    ↓
Session middleware reads cookie
    ↓
Looks up session ID in memory
    ↓
Loads session data
    ↓
req.session.user = {id: 1, email: 'admin@slu.edu.ph', ...}
    ↓
Route handler has access to user data
```

**Configuration Options:**

| Option | Value | Meaning |
|--------|-------|---------|
| `secret` | `'admin-secret'` | Key to sign cookies (prevents tampering) |
| `resave` | `false` | Don't save unchanged sessions |
| `saveUninitialized` | `false` | Don't create session until data stored |
| `cookie.secure` | `false` | Allow HTTP (not just HTTPS) |

---

#### Middleware 5: Cache Control (Lines 65-68)

```javascript
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});
```

**Purpose:** Prevent browser from caching sensitive data

**Flow:**
```
Request arrives
    ↓
This middleware runs
    ↓
Adds header to response:
Cache-Control: no-store
    ↓
Calls next() to continue to next middleware
    ↓
Eventually response sent with no-store header
    ↓
Browser doesn't cache response
```

**Why important:**
- Prevents cached login credentials
- Ensures fresh session checks
- Security best practice for sensitive data

---

### Section 5: Routes (Lines 77-295)

Routes define **what happens** when specific URLs are requested.

**Route Structure:**
```javascript
app.METHOD('/path', handler);
     ↓      ↓         ↓
   HTTP   URL     Function
   method  path    to run
```

---

#### Route 1: Root Redirect (Lines 77-79)

```javascript
app.get('/', (req, res) => {
    res.redirect('/admin-login.html');
});
```

**When:** User visits `http://localhost:3001/`
**What:** Redirects to admin login page
**How:**
```
GET /
    ↓
Route matches
    ↓
res.redirect('/admin-login.html')
    ↓
Sends HTTP 302 with:
Location: /admin-login.html
    ↓
Browser automatically requests /admin-login.html
    ↓
Static middleware serves file
```

---

#### Route 2: Login (Lines 98-157)

```javascript
app.post('/api/admin/login', async (req, res) => {
    // 1. Extract credentials from request body
    const { email, password } = req.body;

    try {
        // 2. Connect to database
        const conn = await mysql.createConnection(db);

        // 3. Query for admin user
        const [rows] = await conn.execute(
            'SELECT * FROM users WHERE email = ? AND password = ? AND user_type = "admin"',
            [email, password]
        );

        if (rows.length > 0) {
            // 4. User found - implement concurrent login prevention

            // 4a. Clear old sessions (mark offline)
            await conn.execute(
                'UPDATE users SET is_online = 0 WHERE id = ?',
                [rows[0].id]
            );

            // 4b. Mark this session as active
            await conn.execute(
                'UPDATE users SET is_online = 1, last_activity = NOW() WHERE id = ?',
                [rows[0].id]
            );

            // 4c. Store user in session
            req.session.user = rows[0];

            // 5. Close connection
            await conn.end();

            // 6. Send success response
            res.json({
                success: true,
                user: {
                    email: rows[0].email,
                    type: rows[0].user_type,
                    name: rows[0].name
                }
            });
        } else {
            // User not found
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
```

**Complete Flow:**
```
POST /api/admin/login
Body: {email: "admin@slu.edu.ph", password: "admin123"}
    ↓
Middleware stack processes request
    ↓
JSON parser: req.body populated ✅
    ↓
Route handler starts (Line 98)
    ↓
Extract credentials (Line 99)
    ↓
Connect to database (Line 103) ⏸️ await
    ↓
Query for user (Line 106) ⏸️ await
    ↓
User found?
    ├─ YES → Step 4a: Mark old sessions offline ⏸️
    │        Step 4b: Mark this session online ⏸️
    │        Step 4c: Store in req.session
    │        Close connection ⏸️
    │        Send success response ✅
    │
    └─ NO  → Close connection
             Send error response ❌
```

**Concurrent Login Prevention:**
```
Computer A: Admin logged in (is_online = 1)
Computer B: Admin logs in
    ↓
Line 115: UPDATE users SET is_online = 0 WHERE id = 1
    ↓
Computer A marked offline in database
    ↓
Line 121: UPDATE users SET is_online = 1 WHERE id = 1
    ↓
Computer B marked online in database
    ↓
Computer A's next session-check:
    - Finds is_online = 0
    - Destroys Computer A's session
    - Computer A kicked out ✅
```

---

#### Route 3: Session Check (Lines 200-215)

```javascript
app.get('/api/admin/session', (req, res) => {
    if (req.session.user) {
        res.json({
            logged_in: true,
            user: {
                email: req.session.user.email,
                type: req.session.user.user_type,
                name: req.session.user.name
            }
        });
    } else {
        res.json({ logged_in: false });
    }
});
```

**Purpose:** Check if admin has active session

**Flow:**
```
GET /api/admin/session
    ↓
Session middleware loads req.session
    ↓
Check: req.session.user exists?
    ├─ YES → Return logged_in: true + user data
    └─ NO  → Return logged_in: false
```

**Called by frontend:**
- On page load
- To verify session is still valid

---

#### Route 4: Session Check - Concurrent Login Detection (Lines 226-259)

```javascript
app.get('/api/admin/session-check', async (req, res) => {
    if (req.session.user && req.session.user.id) {
        try {
            const conn = await mysql.createConnection(db);
            const [rows] = await conn.execute(
                'SELECT is_online FROM users WHERE id = ?',
                [req.session.user.id]
            );
            await conn.end();

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

**Purpose:** Detect if user logged in elsewhere

**Called:** Every 5 seconds by frontend

**Flow:**
```
GET /api/admin/session-check
    ↓
Has session?
    ├─ NO  → Return logged_in: true (let them continue)
    │
    └─ YES → Check database: is_online status
               ↓
               is_online = 0? (logged in elsewhere)
               ├─ YES → Destroy session
               │        Return force_logout: true
               │        Frontend shows alert & redirects
               │
               └─ NO  → Return logged_in: true
```

---

#### Route 5: Get All Accounts (Lines 274-295)

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

**Purpose:** Get all users for admin dashboard

**Called:** Every 10 seconds for real-time updates

**Flow:**
```
GET /api/admin/accounts
    ↓
Connect to database
    ↓
Query all users
    ↓
Return array of user objects
```

**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": 1,
      "email": "admin@slu.edu.ph",
      "user_type": "admin",
      "name": "Admin",
      "last_activity": "2025-12-15 10:30:00",
      "status": 1
    },
    {
      "id": 2,
      "email": "osa@slu.edu.ph",
      "user_type": "osa",
      "name": "OSA Staff",
      "last_activity": "2025-12-15 09:15:00",
      "status": 0
    }
  ]
}
```

---

#### Route 6: Logout (Lines 166-186)

```javascript
app.post('/api/admin/logout', async (req, res) => {
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

    req.session.destroy();
    res.json({ success: true });
});
```

**Purpose:** Log out admin user

**Flow:**
```
POST /api/admin/logout
    ↓
Has session?
    ├─ YES → Update database: is_online = 0
    └─ NO  → Skip database update
    ↓
Destroy session (req.session.destroy())
    ↓
Return success
```

**What happens:**
- Session data deleted from memory
- Cookie invalidated
- Next request won't have session

---

### Section 6: Start Server (Line 301-303)

```javascript
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Admin server on http://localhost:${PORT}`);
});
```

**What happens:**
1. Express binds to port 3001
2. Listens on all network interfaces (`0.0.0.0`)
3. Server ready to accept HTTP requests
4. Callback runs: prints message to console

**Console output:**
```
Admin server on http://localhost:3001
```

**Why at the bottom?**
- All middleware must be registered BEFORE listening
- All routes must be defined BEFORE listening
- If you listen first, routes won't work!

---

## Request Flow Examples

### Example 1: Admin Login

```
1. Frontend Form Submission
   User enters: admin@slu.edu.ph / admin123
   Clicks "Login"
        ↓
2. JavaScript Sends Request
   fetch('http://localhost:3001/api/admin/login', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({email: '...', password: '...'})
   })
        ↓
3. Request Arrives at Server
   POST http://localhost:3001/api/admin/login
   Body: {"email":"admin@slu.edu.ph","password":"admin123"}
        ↓
4. Middleware Pipeline
   ├─ CORS: Adds CORS headers ✅
   ├─ JSON Parser: req.body = {email: '...', password: '...'} ✅
   ├─ Static Files: Not static file, skip ✅
   ├─ Session: req.session = {} (empty) ✅
   └─ Cache Control: Add no-store header ✅
        ↓
5. Route Handler Matches
   app.post('/api/admin/login', ...) ← MATCH!
        ↓
6. Database Operations
   ├─ Connect to MySQL ⏸️ await (50ms)
   ├─ Query for user ⏸️ await (100ms)
   ├─ User found ✅
   ├─ UPDATE is_online = 0 ⏸️ await (50ms)
   ├─ UPDATE is_online = 1 ⏸️ await (50ms)
   ├─ Store in session: req.session.user = {...}
   └─ Close connection ⏸️ await (5ms)
        ↓
7. Session Middleware Saves Session
   Generates session ID: abc123
   Stores in memory: {abc123: {user: {...}}}
        ↓
8. Response Sent
   HTTP/1.1 200 OK
   Set-Cookie: connect.sid=s%3Aabc123.signature; HttpOnly
   Cache-Control: no-store
   Content-Type: application/json

   {"success":true,"user":{"email":"admin@slu.edu.ph",...}}
        ↓
9. Frontend Receives Response
   if (data.success) {
       window.location.href = '/admin-portal.html';
   }
        ↓
10. Browser Redirects to Portal
    Stores cookie for future requests
```

**Total time:** ~255ms

---

### Example 2: Session Check (Every 5 Seconds)

```
1. Frontend Timer Triggers
   setInterval(() => {
       fetch('/api/admin/session-check', {credentials: 'include'})
   }, 5000);
        ↓
2. Request with Cookie
   GET http://localhost:3001/api/admin/session-check
   Cookie: connect.sid=s%3Aabc123.signature
        ↓
3. Session Middleware Reads Cookie
   Looks up session ID: abc123
   Loads data: req.session.user = {id: 1, ...}
        ↓
4. Route Handler
   Check database: is_online status
        ├─ is_online = 1 → Still logged in ✅
        │  Return {logged_in: true}
        │
        └─ is_online = 0 → Logged in elsewhere ❌
           Destroy session
           Return {logged_in: false, force_logout: true}
        ↓
5. Frontend Handles Response
   if (data.force_logout) {
       alert('Logged out from another device');
       window.location.href = '/';
   }
```

---

## API Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/` | Redirect to login page | No |
| POST | `/api/admin/login` | Authenticate admin | No |
| GET | `/api/admin/session` | Check if logged in | No (checks session) |
| GET | `/api/admin/session-check` | Detect concurrent logins | Yes (session) |
| GET | `/api/admin/accounts` | Get all users | Yes (session) |
| POST | `/api/admin/logout` | End session | Yes (session) |

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'osa', 'org') NOT NULL,
    name VARCHAR(255) NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online TINYINT(1) DEFAULT 0,
    session_token VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields Used by Admin Server:**

| Field | Type | Purpose |
|-------|------|---------|
| `id` | INT | User identifier |
| `email` | VARCHAR | Login credential |
| `password` | VARCHAR | Login credential (plaintext - security issue!) |
| `user_type` | ENUM | Must be 'admin' for admin login |
| `name` | VARCHAR | Display name |
| `last_activity` | TIMESTAMP | Track when last active |
| `is_online` | TINYINT | Concurrent login detection (1=online, 0=offline) |

---

## Session Management

### In-Memory Sessions

**Storage:** RAM (lost on server restart)

**Structure:**
```javascript
{
  "abc123def456": {
    user: {
      id: 1,
      email: "admin@slu.edu.ph",
      password: "admin123",  // Security issue: full row stored
      user_type: "admin",
      name: "Admin",
      // ... all columns
    }
  }
}
```

**Session Cookie:**
```
connect.sid=s%3Aabc123def456.signature; Path=/; HttpOnly
```

**Session Lifecycle:**
```
Login → Session Created → Store user data → Send cookie
    ↓
Multiple Requests → Cookie sent with each request → Data available
    ↓
Logout → Session Destroyed → Cookie invalidated
```

---

## Security Features

### 1. Concurrent Login Prevention
- Only one active session per user
- New login kicks out old session
- Checked every 5 seconds

### 2. Session Tracking
- `is_online` flag in database
- `last_activity` timestamp
- Session tokens

### 3. Prepared Statements
- All SQL queries use `?` placeholders
- Values passed separately
- Prevents SQL injection

### 4. CORS Restrictions
- Only specific origins allowed
- Credentials must be explicitly requested

### 5. Cache Prevention
- `Cache-Control: no-store` on all responses
- Prevents sensitive data caching

### 6. HttpOnly Cookies
- Session cookie not accessible via JavaScript
- XSS protection

---

## Security Issues

⚠️ **Critical Issues in Current Code:**

1. **Plaintext Passwords**
   - Passwords stored without hashing
   - Should use bcrypt

2. **Full User Row in Session**
   - `req.session.user = rows[0]` stores password too
   - Should only store: `{id, email, user_type, name}`

3. **No HTTPS**
   - `cookie: {secure: false}`
   - Should use HTTPS in production

4. **Hardcoded Secrets**
   - `secret: 'admin-secret'`
   - Should use environment variables

5. **In-Memory Sessions**
   - Lost on server restart
   - Can't scale to multiple servers
   - Should use Redis or database store

---

## Running the Server

### Start Server
```bash
# Navigate to admin folder
cd admin

# Install dependencies (first time only)
npm install

# Start in production mode
npm start

# Start in development mode (auto-restart)
npm run dev
```

### Expected Output
```
Admin server on http://localhost:3001
```

### Access Admin Portal
```
http://localhost:3001/
```

### Test Credentials
```
Email: admin@slu.edu.ph
Password: admin123
```

---

## File Structure

```
admin/
├── package.json          ← Dependencies and scripts
├── server.js             ← Main server code (this guide)
├── admin-login.html      ← Login page
├── admin-login.js        ← Login frontend logic
├── admin-portal.html     ← Dashboard page
├── admin-portal.js       ← Dashboard frontend logic
└── node_modules/         ← Installed dependencies (gitignored)
```

---

## Troubleshooting

### Server won't start
```bash
# Check if port 3001 is already in use
lsof -i :3001

# Kill process using port
kill -9 <PID>
```

### Database connection fails
- Check MySQL is running
- Verify database `slu_org_portal` exists
- Check credentials in `db` object (line 26-32)

### Session not persisting
- Check if cookies are enabled
- Verify `credentials: 'include'` in fetch requests
- Check CORS origin matches

### Can't access from other devices
- Server binds to `0.0.0.0` (all interfaces)
- Access via: `http://<server-ip>:3001`
- Check firewall allows port 3001

---

## Next Steps

1. **Add password hashing** (bcrypt)
2. **Use environment variables** (.env file)
3. **Implement Redis sessions** (persistent, scalable)
4. **Add security headers** (helmet middleware)
5. **Enable HTTPS** (SSL certificates)
6. **Add rate limiting** (prevent brute force)
7. **Separate routes into modules** (better organization)

---

**End of README** 📖
