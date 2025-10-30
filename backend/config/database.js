const mysql = require('mysql2');

// Configuración de conexión CORREGIDA - solo opciones válidas
const dbConfig = {
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'gastos_db',
    // Solo mantener opciones válidas para mysql2
    connectTimeout: 60000,
    // Remover 'timeout' y 'reconnect' ya que no son opciones válidas
    charset: 'utf8mb4'
};

// Crear conexión
const connection = mysql.createConnection(dbConfig);

// Conectar con manejo de errores mejorado
connection.connect((err) => {
    if (err) {
        console.error('❌ ERROR de conexión a MySQL:', err.message);
        console.log('🔧 Configuración usada:', {
            host: dbConfig.host,
            user: dbConfig.user,
            database: dbConfig.database
        });
        console.log('💡 Soluciones posibles:');
        console.log('   1. Verifica que MySQL esté ejecutándose');
        console.log('   2. Verifica que la base de datos "gastos_db" exista');
        console.log('   3. Verifica usuario y contraseña');
    } else {
        console.log('✅ Conectado a MySQL correctamente');
        console.log('📊 Base de datos:', dbConfig.database);
        
        // Verificar que la tabla existe
        connection.query('SHOW TABLES LIKE "gastos"', (err, results) => {
            if (err) {
                console.error('❌ Error verificando tabla:', err);
            } else if (results.length === 0) {
                console.log('⚠️  La tabla "gastos" no existe. Creándola...');
                crearTablaGastos();
            } else {
                console.log('✅ Tabla "gastos" verificada correctamente');
            }
        });
    }
});


// Manejar errores de conexión
connection.on('error', (err) => {
    console.error('❌ Error de MySQL:', err.message);
});

module.exports = connection;