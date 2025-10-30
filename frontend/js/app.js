// Configuración - SIN API en las URLs
const BASE_URL = 'http://localhost:3000';

// Clase para manejar la aplicación de gastos
class GastosApp {
    constructor() {
        this.gastos = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.setDefaultDate();
        this.cargarGastos();
        this.setupValidaciones();
    }

    bindEvents() {
        document.getElementById('gastoForm').addEventListener('submit', (e) => this.agregarGasto(e));
        document.getElementById('btnActualizar').addEventListener('click', () => this.cargarGastos());
        document.getElementById('btnGuardarCambios').addEventListener('click', () => this.guardarCambiosGasto());
    }

    setupValidaciones() {
        const descripcionInput = document.getElementById('descripcion');
        const editarDescripcionInput = document.getElementById('editarDescripcion');

        [descripcionInput, editarDescripcionInput].forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => this.validarSoloLetras(e));
                input.addEventListener('blur', (e) => this.formatearTexto(e));
            }
        });
    }

    // VALIDACIÓN SOLO LETRAS
    validarSoloLetras(event) {
        const input = event.target;
        let valor = input.value;
        
        // SOLO permite letras y espacios
        const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;
        
        if (!soloLetras.test(valor)) {
            input.value = valor.slice(0, -1);
            this.mostrarErrorInput(input, 'Solo se permiten letras y espacios');
            return;
        }
        
        this.limpiarErrorInput(input);
    }

    formatearTexto(event) {
        const input = event.target;
        let valor = input.value.trim();
        valor = valor.replace(/\s+/g, ' ');
        
        if (valor.length > 0) {
            valor = valor.toLowerCase().replace(/\b\w/g, function(letra) {
                return letra.toUpperCase();
            });
        }
        
        input.value = valor;
    }

    setDefaultDate() {
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            fechaInput.value = new Date().toISOString().split('T')[0];
        }
    }

    async cargarGastos() {
        try {
            this.mostrarCargando(true);
            
            const respuesta = await fetch(`${BASE_URL}/gastos`);
            
            if (!respuesta.ok) {
                throw new Error(`Error ${respuesta.status}`);
            }
            
            const datos = await respuesta.json();
            this.gastos = Array.isArray(datos) ? datos : [];
            
            this.mostrarGastos();
            this.calcularResumen();
            
        } catch (error) {
            console.error('Error al cargar gastos:', error);
            this.mostrarError('No se pudieron cargar los gastos');
            this.mostrarGastos([]);
        } finally {
            this.mostrarCargando(false);
        }
    }

    mostrarCargando(cargando) {
        const spinner = document.getElementById('spinner');
        const btnActualizar = document.getElementById('btnActualizar');
        
        if (cargando) {
            spinner.classList.remove('d-none');
            btnActualizar.disabled = true;
        } else {
            spinner.classList.add('d-none');
            btnActualizar.disabled = false;
        }
    }

    mostrarGastos() {
        const tbody = document.getElementById('tablaGastos');
        
        if (!this.gastos || this.gastos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <p>No hay gastos registrados</p>
                        <small class="text-muted">¡Agrega tu primer gasto!</small>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.gastos.map(gasto => `
            <tr>
                <td>${this.escapeHtml(gasto.descripcion || 'Sin descripción')}</td>
                <td><strong class="text-primary">$${parseFloat(gasto.monto || 0).toFixed(2)}</strong></td>
                <td><span class="badge bg-secondary">${this.escapeHtml(gasto.categoria || 'Sin categoría')}</span></td>
                <td>${this.formatearFecha(gasto.fecha)}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="app.editarGasto(${gasto.id})">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.eliminarGasto(${gasto.id})">
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    calcularResumen() {
        const total = this.gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto || 0), 0);
        const promedio = this.gastos.length > 0 ? total / this.gastos.length : 0;
        
        document.getElementById('totalGastado').textContent = `$${total.toFixed(2)}`;
        document.getElementById('gastoPromedio').textContent = `$${promedio.toFixed(2)}`;
        document.getElementById('numeroGastos').textContent = this.gastos.length;
        
        const totalElement = document.getElementById('totalGastado');
        totalElement.className = total > 1000 ? 'text-danger' : 'text-success';
    }

    async agregarGasto(event) {
        event.preventDefault();
        
        const descripcion = document.getElementById('descripcion').value.trim();
        const monto = document.getElementById('monto').value;
        const categoria = document.getElementById('categoria').value;
        const fecha = document.getElementById('fecha').value;
        
        if (!this.validarFormulario(descripcion, monto, categoria, fecha)) {
            return;
        }
        
        try {
            const respuesta = await fetch(`${BASE_URL}/gastos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    descripcion,
                    monto: parseFloat(monto),
                    categoria,
                    fecha
                })
            });
            
            if (!respuesta.ok) {
                const errorData = await respuesta.json();
                throw new Error(errorData.error || `Error ${respuesta.status}`);
            }
            
            document.getElementById('gastoForm').reset();
            this.setDefaultDate();
            
            await this.cargarGastos();
            this.mostrarExito('¡Gasto agregado correctamente!');
            
        } catch (error) {
            console.error('Error al agregar gasto:', error);
            this.mostrarError('Error al agregar gasto: ' + error.message);
        }
    }

    validarFormulario(descripcion, monto, categoria, fecha) {
        let esValido = true;
        
        const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
        if (!descripcion || !regexLetras.test(descripcion)) {
            this.mostrarErrorInput(document.getElementById('descripcion'), 'Solo se permiten letras y espacios');
            esValido = false;
        }
        
        if (!monto || parseFloat(monto) <= 0) {
            this.mostrarErrorInput(document.getElementById('monto'), 'El monto debe ser mayor a 0');
            esValido = false;
        }
        
        if (!categoria) {
            this.mostrarErrorInput(document.getElementById('categoria'), 'Selecciona una categoría');
            esValido = false;
        }
        
        if (!fecha) {
            this.mostrarErrorInput(document.getElementById('fecha'), 'La fecha es obligatoria');
            esValido = false;
        }
        
        return esValido;
    }

    async editarGasto(id) {
        try {
            const respuesta = await fetch(`${BASE_URL}/gastos/${id}`);
            
            if (!respuesta.ok) {
                throw new Error(`Error ${respuesta.status}`);
            }
            
            const gasto = await respuesta.json();
            
            document.getElementById('editarId').value = gasto.id;
            document.getElementById('editarDescripcion').value = gasto.descripcion;
            document.getElementById('editarMonto').value = gasto.monto;
            document.getElementById('editarCategoria').value = gasto.categoria;
            document.getElementById('editarFecha').value = gasto.fecha;
            
            const modal = new bootstrap.Modal(document.getElementById('editarGastoModal'));
            modal.show();
            
        } catch (error) {
            console.error('Error al cargar gasto:', error);
            this.mostrarError('Error al cargar gasto para editar');
        }
    }

    async eliminarGasto(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este gasto?\nEsta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            const respuesta = await fetch(`${BASE_URL}/gastos/${id}`, {
                method: 'DELETE'
            });
            
            if (!respuesta.ok) {
                throw new Error(`Error ${respuesta.status}`);
            }
            
            await this.cargarGastos();
            this.mostrarExito('¡Gasto eliminado correctamente!');
            
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
            this.mostrarError('Error al eliminar gasto');
        }
    }

    async guardarCambiosGasto() {
        const id = document.getElementById('editarId').value;
        const descripcion = document.getElementById('editarDescripcion').value.trim();
        const monto = document.getElementById('editarMonto').value;
        const categoria = document.getElementById('editarCategoria').value;
        const fecha = document.getElementById('editarFecha').value;
        
        const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
        if (!descripcion || !regexLetras.test(descripcion)) {
            this.mostrarErrorInput(document.getElementById('editarDescripcion'), 'Solo se permiten letras y espacios');
            return;
        }
        
        if (!monto || parseFloat(monto) <= 0) {
            this.mostrarErrorInput(document.getElementById('editarMonto'), 'El monto debe ser mayor a 0');
            return;
        }
        
        try {
            this.mostrarCargandoGuardar(true);
            
            const respuesta = await fetch(`${BASE_URL}/gastos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    descripcion,
                    monto: parseFloat(monto),
                    categoria,
                    fecha
                })
            });
            
            if (!respuesta.ok) {
                throw new Error(`Error ${respuesta.status}`);
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarGastoModal'));
            modal.hide();
            
            await this.cargarGastos();
            this.mostrarExito('¡Gasto actualizado correctamente!');
            
        } catch (error) {
            console.error('Error al actualizar gasto:', error);
            this.mostrarError('Error al actualizar gasto');
        } finally {
            this.mostrarCargandoGuardar(false);
        }
    }

    mostrarCargandoGuardar(cargando) {
        const spinner = document.getElementById('guardarSpinner');
        const btnGuardar = document.getElementById('btnGuardarCambios');
        
        if (cargando) {
            spinner.classList.remove('d-none');
            btnGuardar.disabled = true;
        } else {
            spinner.classList.add('d-none');
            btnGuardar.disabled = false;
        }
    }

    // UTILIDADES
    formatearFecha(fechaString) {
        try {
            return new Date(fechaString).toLocaleDateString('es-ES');
        } catch {
            return fechaString;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    mostrarErrorInput(input, mensaje) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = mensaje;
        }
    }

    limpiarErrorInput(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    }

    mostrarError(mensaje) {
        alert('❌ ' + mensaje);
    }

    mostrarExito(mensaje) {
        alert('✅ ' + mensaje);
    }
}

// Inicializar la aplicación
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new GastosApp();
});