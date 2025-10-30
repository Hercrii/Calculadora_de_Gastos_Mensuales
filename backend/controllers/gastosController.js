const db = require('../config/database');

// Obtener todos los gastos
exports.obtenerGastos = (req, res) => {
    console.log('📥 Solicitando todos los gastos');
    
    const query = 'SELECT * FROM gastos ORDER BY fecha DESC, id DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error en obtenerGastos:', err);
            return res.status(500).json({ 
                error: 'Error al obtener gastos de la base de datos',
                details: err.message 
            });
        }
        
        console.log(`✅ Se encontraron ${results.length} gastos`);
        res.json(results);
    });
};

// Obtener un gasto por ID
exports.obtenerGastoPorId = (req, res) => {
    const { id } = req.params;
    console.log(`📥 Solicitando gasto con ID: ${id}`);
    
    const query = 'SELECT * FROM gastos WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('❌ Error en obtenerGastoPorId:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        
        res.json(results[0]);
    });
};

// Crear un nuevo gasto
exports.crearGasto = (req, res) => {
    console.log('📥 Creando nuevo gasto:', req.body);
    
    const { descripcion, monto, categoria, fecha } = req.body;
    
    // Validaciones
    if (!descripcion || !monto || !categoria || !fecha) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const query = 'INSERT INTO gastos (descripcion, monto, categoria, fecha) VALUES (?, ?, ?, ?)';
    
    db.query(query, [descripcion, monto, categoria, fecha], (err, results) => {
        if (err) {
            console.error('❌ Error en crearGasto:', err);
            return res.status(500).json({ 
                error: 'Error al crear gasto',
                details: err.message 
            });
        }
        
        console.log(`✅ Gasto creado con ID: ${results.insertId}`);
        res.status(201).json({ 
            id: results.insertId,
            message: 'Gasto creado correctamente'
        });
    });
};

// Actualizar un gasto existente
exports.actualizarGasto = (req, res) => {
    const { id } = req.params;
    const { descripcion, monto, categoria, fecha } = req.body;
    
    console.log(`📥 Actualizando gasto ID: ${id}`, req.body);
    
    const query = 'UPDATE gastos SET descripcion = ?, monto = ?, categoria = ?, fecha = ? WHERE id = ?';
    
    db.query(query, [descripcion, monto, categoria, fecha, id], (err, results) => {
        if (err) {
            console.error('❌ Error en actualizarGasto:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        
        res.json({ message: 'Gasto actualizado correctamente' });
    });
};

// Eliminar un gasto
exports.eliminarGasto = (req, res) => {
    const { id } = req.params;
    console.log(`📥 Eliminando gasto ID: ${id}`);
    
    const query = 'DELETE FROM gastos WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('❌ Error en eliminarGasto:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        
        res.json({ message: 'Gasto eliminado correctamente' });
    });
};