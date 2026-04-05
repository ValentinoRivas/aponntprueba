const express = require('express');
const Database = require('better-sqlite3');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const db = new Database('app.db');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'clave-secreta-app-2024',
  resave: false,
  saveUninitialized: false,
}));

// --- Database setup ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    role TEXT NOT NULL
  );
`);

// Seed users and modules
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  const hash1 = bcrypt.hashSync('admin123', 10);
  const hash2 = bcrypt.hashSync('user123', 10);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash1, 'admin');
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('usuario', hash2, 'usuario');

  // Modules for admin
  db.prepare('INSERT INTO modules (name, icon, role) VALUES (?, ?, ?)').run('Autos', '🚗', 'admin');
  db.prepare('INSERT INTO modules (name, icon, role) VALUES (?, ?, ?)').run('Reportes', '📊', 'admin');
  db.prepare('INSERT INTO modules (name, icon, role) VALUES (?, ?, ?)').run('Configuración', '⚙️', 'admin');
  db.prepare('INSERT INTO modules (name, icon, role) VALUES (?, ?, ?)').run('Usuarios', '👥', 'admin');
  db.prepare('INSERT INTO modules (name, icon, role) VALUES (?, ?, ?)').run('Inventario', '📦', 'admin');

  // Modules for usuario
  db.prepare('INSERT INTO modules (name, icon, role) VALUES (?, ?, ?)').run('Autos', '🚗', 'usuario');
  db.prepare('INSERT INTO modules (name, icon, role) VALUES (?, ?, ?)').run('Mis Pedidos', '📋', 'usuario');
  db.prepare('INSERT INTO modules (name, icon, role) VALUES (?, ?, ?)').run('Perfil', '👤', 'usuario');

  console.log('Base de datos inicializada con usuarios y módulos');
}

// --- Auth middleware ---
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'No autenticado' });
  next();
}

// --- API Routes ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.json({ username: user.username, role: user.role });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json(req.session.user);
});

app.get('/api/modules', requireAuth, (req, res) => {
  const modules = db.prepare('SELECT * FROM modules WHERE role = ?').all(req.session.user.role);
  res.json(modules);
});

// --- Serve SPA ---
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
