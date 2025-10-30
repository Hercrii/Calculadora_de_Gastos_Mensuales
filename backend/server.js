const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuración de CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Conexión a MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gastos_db'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
    } else {
        console.log('✅ Conectado a MySQL correctamente');
    }
});

// RUTAS DE GASTOS

// Obtener todos los gastos
app.get('/gastos', (req, res) => {
    const query = 'SELECT * FROM gastos ORDER BY fecha DESC, id DESC';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener gastos:', err);
            return res.status(500).json({ error: 'Error al obtener gastos' });
        }
        res.json(results);
    });
});

// Crear un nuevo gasto
app.post('/gastos', (req, res) => {
    const { descripcion, monto, categoria, fecha } = req.body;
    
    if (!descripcion || !monto || !categoria || !fecha) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const query = 'INSERT INTO gastos (descripcion, monto, categoria, fecha) VALUES (?, ?, ?, ?)';
    
    connection.query(query, [descripcion, monto, categoria, fecha], (err, results) => {
        if (err) {
            console.error('Error al crear gasto:', err);
            return res.status(500).json({ error: 'Error al crear gasto' });
        }
        
        res.json({ 
            id: results.insertId,
            message: 'Gasto creado correctamente'
        });
    });
});

// Actualizar un gasto
app.put('/gastos/:id', (req, res) => {
    const { id } = req.params;
    const { descripcion, monto, categoria, fecha } = req.body;
    
    const query = 'UPDATE gastos SET descripcion = ?, monto = ?, categoria = ?, fecha = ? WHERE id = ?';
    
    connection.query(query, [descripcion, monto, categoria, fecha, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar gasto:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        
        res.json({ message: 'Gasto actualizado correctamente' });
    });
});

// Eliminar un gasto
app.delete('/gastos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM gastos WHERE id = ?';
    
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar gasto:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        
        res.json({ message: 'Gasto eliminado correctamente' });
    });
});

// Obtener un gasto por ID (para editar)
app.get('/gastos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM gastos WHERE id = ?';
    
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener gasto:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        
        res.json(results[0]);
    });
});

// Ruta principal - servir el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Gestor de Gastos disponible en http://localhost:${PORT}`);
});
