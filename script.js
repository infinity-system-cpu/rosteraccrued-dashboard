// ======================
// VARIABLES GLOBALES
// ======================

let folios = [];
let users = []; // Ahora se cargarán desde Firebase
let precios = {
    fibra_aerea: 330,
    fibra_sub: 350,
    fibra_aerea_10: 350,
    fibra_sub_10: 370,
    cobre_aerea: 300,
    cobre_sub: 320,
    cobre_aerea_10: 320,
    cobre_sub_10: 340
};

let plantillaAdmin = {
    encabezado: "RECIBO DE PAGO",
    pie: "CON ESTE PAGO QUEDAN LIQUIDADOS MIS SERVICIOS REALIZADOS SIN NINGUNA ADEUDO",
    observaciones: "OBSERVACIONES",
    logoBase64: ""
};

let currentUser = null;
let currentTecnicoNomina = null;
let currentDesdeNomina = null;
let currentHastaNomina = null;

// ======================
// FUNCIONES DE FIREBASE - USUARIOS
// ======================

// Cargar usuarios desde Firebase
async function loadUsersFromFirebase() {
    try {
        console.log("Cargando usuarios desde Firebase...");
        const snapshot = await db.collection('users').get();
        users = [];
        
        snapshot.forEach(doc => {
            const userData = doc.data();
            users.push({
                id: doc.id,
                name: userData.name,
                role: userData.role,
                password: userData.password
            });
        });
        
        console.log(`Se cargaron ${users.length} usuarios desde Firebase`);
        
        // Si no hay usuarios en Firebase, crear algunos por defecto
        if (users.length === 0) {
            await createDefaultUsers();
        }
        
        populateUserDropdowns();
        updateUsersList();
        return users;
    } catch (error) {
        console.error("Error cargando usuarios desde Firebase:", error);
        // Fallback a usuarios por defecto
        users = [
            { name: "Admin", role: "administrativo", password: "admin123" },
            { name: "Gerente1", role: "gerente", password: "gerente123" },
            { name: "Supervisor1", role: "supervisor", password: "supervisor123" },
            { name: "Tecnico1", role: "tecnico", password: "tecnico123" }
        ];
        return users;
    }
}

// Crear usuarios por defecto en Firebase
async function createDefaultUsers() {
    const defaultUsers = [
        { name: "Admin", role: "administrativo", password: "admin123" },
        { name: "Gerente1", role: "gerente", password: "gerente123" },
        { name: "Supervisor1", role: "supervisor", password: "supervisor123" },
        { name: "Tecnico1", role: "tecnico", password: "tecnico123" }
    ];
    
    try {
        for (const user of defaultUsers) {
            await db.collection('users').add(user);
        }
        console.log("Usuarios por defecto creados en Firebase");
        users = defaultUsers;
    } catch (error) {
        console.error("Error creando usuarios por defecto:", error);
    }
}

// Guardar usuario en Firebase
async function saveUserToFirebase(userData) {
    try {
        const userRef = await db.collection('users').add(userData);
        console.log("Usuario guardado en Firebase con ID:", userRef.id);
        return userRef.id;
    } catch (error) {
        console.error("Error guardando usuario en Firebase:", error);
        throw error;
    }
}

// Eliminar usuario de Firebase
async function deleteUserFromFirebase(userId) {
    try {
        await db.collection('users').doc(userId).delete();
        console.log("Usuario eliminado de Firebase:", userId);
        return true;
    } catch (error) {
        console.error("Error eliminando usuario de Firebase:", error);
        return false;
    }
}

// ======================
// FUNCIONES DE FIREBASE - FOLIOS
// ======================

// Cargar folios desde Firebase
async function loadFoliosFromFirebase() {
    try {
        console.log("Cargando folios desde Firebase...");
        const snapshot = await db.collection('folios').get();
        folios = [];
        
        snapshot.forEach(doc => {
            const folioData = doc.data();
            folios.push({
                id: doc.id,
                ...folioData,
                // Asegurar compatibilidad con el formato existente
                pendiente: folioData.pendiente ? 'si' : 'no',
                tecnico: folioData.tecnico_nombre || folioData.tecnico,
                folio: folioData.folio_os || folioData.folio
            });
        });
        
        console.log(`Se cargaron ${folios.length} folios desde Firebase`);
        updateStats();
        return folios;
    } catch (error) {
        console.error("Error cargando folios desde Firebase:", error);
        alert("Error al cargar los datos. Usando almacenamiento local.");
        loadFromStorage(); // Fallback a localStorage
        return [];
    }
}

// Guardar folio en Firebase
async function saveFolioToFirebase(folioData) {
    try {
        // Convertir al formato de Firebase
        const firebaseFolio = {
            tecnico_id: 1, // Por defecto 1 si no hay ID
            tecnico_nombre: folioData.tecnico,
            tipo: folioData.tipo,
            folio_os: folioData.folio,
            telefono: folioData.telefono,
            tarea: folioData.tarea,
            distrito: folioData.distrito,
            fecha: firebase.firestore.Timestamp.fromDate(new Date(folioData.fecha)),
            instalacion: folioData.instalacion,
            metraje: parseInt(folioData.metraje),
            alfanumerico: folioData.alfanumerico || '',
            comentarios: folioData.comentarios || '',
            ventanas: parseInt(folioData.ventanas) || 0,
            radiales: parseInt(folioData.radiales) || 0,
            pendiente: folioData.pendiente === 'si',
            telefono_pendiente: folioData.telefono_pendiente || '',
            comentarios_pendiente: folioData.comentarios_pendiente || '',
            latitud: null,
            longitud: null,
            creado_en: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('folios').add(firebaseFolio);
        console.log("Folio guardado en Firebase con ID:", docRef.id);
        
        // Agregar también al array local con el ID de Firebase
        folios.push({
            id: docRef.id,
            ...folioData
        });
        
        return docRef.id;
    } catch (error) {
        console.error("Error guardando folio en Firebase:", error);
        throw error;
    }
}

// Eliminar folio de Firebase
async function deleteFolioFromFirebase(folioId) {
    try {
        await db.collection('folios').doc(folioId).delete();
        console.log("Folio eliminado de Firebase:", folioId);
        return true;
    } catch (error) {
        console.error("Error eliminando folio de Firebase:", error);
        return false;
    }
}

// ======================
// FUNCIONES DE ALMACENAMIENTO (híbrido - Firebase + localStorage)
// ======================

async function loadFromStorage() {
    try {
        // Primero cargar usuarios desde Firebase
        await loadUsersFromFirebase();
        
        // Luego cargar folios desde Firebase
        await loadFoliosFromFirebase();
        
        // Cargar precios y plantilla desde localStorage
        const savedPrecios = localStorage.getItem('precios');
        const savedPlantillaAdmin = localStorage.getItem('plantillaAdmin');
        
        if (savedPrecios) precios = JSON.parse(savedPrecios);
        if (savedPlantillaAdmin) plantillaAdmin = JSON.parse(savedPlantillaAdmin);
        
        updateStats();
        populateUserDropdowns();
        updateUsersList();
        
    } catch (error) {
        console.error("Error en loadFromStorage:", error);
    }
}

function saveToStorage() {
    // Solo guardar en localStorage los datos que no están en Firebase
    localStorage.setItem('precios', JSON.stringify(precios));
    localStorage.setItem('plantillaAdmin', JSON.stringify(plantillaAdmin));
}

// ======================
// LOGIN (ACTUALIZADO PARA FIREBASE)
// ======================

function login(e) {
    e.preventDefault();
    const form = e.target;
    const usernameInput = form.usuario.value.trim();
    const password = form.password.value;

    console.log("Intentando login con:", usernameInput);
    console.log("Usuarios disponibles:", users);

    const user = users.find(u => 
        u.name.trim().toLowerCase() === usernameInput.toLowerCase() && 
        u.password === password
    );
    
    if (user) {
        currentUser = user;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('main-header').style.display = 'block';
        document.querySelector('main').style.display = 'block';
        updateMenuByRole();
        showSection('home');
        console.log("Login exitoso:", user);
    } else {
        console.log("Login fallido - usuario no encontrado o contraseña incorrecta");
        alert('Usuario o contraseña incorrectos');
    }
}

document.getElementById('login-form').addEventListener('submit', login);

// ======================
// PROTECCIÓN DE SESIÓN
// ======================

function showSection(sectionId) {
    if (!currentUser) {
        alert("Debes iniciar sesión primero.");
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('main-header').style.display = 'none';
        document.querySelector('main').style.display = 'none';
        return;
    }
    
    if (['precios', 'users'].includes(sectionId)) {
        if (!['administrativo', 'gerente'].includes(currentUser.role)) {
            alert('Acceso denegado');
            return;
        }
    }
    
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    // Ejecutar funciones específicas de cada sección
    if (sectionId === 'carga-ffth') {
        displayFFTHTable();
    } else if (sectionId === 'carga-cobre') {
        displayCobreTable();
    } else if (sectionId === 'users') {
        updateUsersList();
    } else if (sectionId === 'filter') {
        // Recargar datos al entrar a filtrar
        loadFoliosFromFirebase().then(() => {
            document.getElementById('filter-form').dispatchEvent(new Event('submit'));
        });
    }
}

// ======================
// UTILIDADES
// ======================

function updateStats() {
    document.getElementById('total-folios').textContent = folios.length;
    document.getElementById('total-tecnicos').textContent = users.filter(u => u.role === 'tecnico').length;
    
    const today = new Date().toISOString().split('T')[0];
    const foliosToday = folios.filter(f => {
        if (!f.fecha) return false;
        const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
            f.fecha.toDate().toISOString().split('T')[0] : 
            f.fecha.split('T')[0];
        return fecha === today;
    }).length;
    
    document.getElementById('folios-hoy').textContent = foliosToday;
}

function populateUserDropdowns() {
    const tecnicoSelects = document.querySelectorAll(
        'select[name="tecnico"], select[name="filtro-tecnico"], select[name="nomina-tecnico"], ' +
        'select[name="supervisor-nombre"]'
    );
    
    const tecnicos = users.filter(u => u.role === 'tecnico');
    const supervisores = users.filter(u => u.role === 'supervisor');
    
    const tecnicoOptions = tecnicos.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
    const supervisorOptions = supervisores.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
    
    tecnicoSelects.forEach(select => {
        if (select.name === 'supervisor-nombre') {
            select.innerHTML = '<option value="">Seleccionar</option>' + supervisorOptions;
        } else {
            select.innerHTML = '<option value="">Seleccionar</option>' + tecnicoOptions;
        }
    });
}

function updateMenuByRole() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    // MOSTRAR TODOS LOS BOTONES TEMPORALMENTE
    navButtons.forEach(btn => {
        btn.style.display = 'inline-block';
    });
}

// ======================
// MANEJO DE FOLIOS (ACTUALIZADO PARA FIREBASE)
// ======================

document.getElementById('folio-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const folio = {};
    
    for (let [key, value] of formData.entries()) {
        folio[key] = value === '' ? '0' : value;
    }
    
    if (!folio.fecha) {
        folio.fecha = new Date().toISOString();
    }
    
    folio.ventanas = parseInt(folio.ventanas) || 0;
    folio.radiales = parseInt(folio.radiales) || 0;
    folio.pendiente = folio.pendiente || 'no';
    
    if (folio.pendiente === 'si') {
        folio.telefono_pendiente = folio.telefono_pendiente || '';
        folio.comentarios_pendiente = folio.comentarios_pendiente || '';
    }
    
    try {
        // Guardar en Firebase
        const folioId = await saveFolioToFirebase(folio);
        folio.id = folioId;
        
        // También guardar en localStorage como backup
        folios.push(folio);
        saveToStorage();
        
        alert('Folio guardado correctamente en la nube');
        this.reset();
        
        // Restablecer fecha actual
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.querySelector('input[name="fecha"]').value = localDateTime;
        
        updateStats();
        
    } catch (error) {
        console.error("Error guardando folio:", error);
        alert('Error al guardar el folio. Inténtalo de nuevo.');
    }
});

// Mostrar/ocultar campos pendiente
document.querySelector('select[name="pendiente"]').addEventListener('change', function() {
    const esPendiente = this.value === 'si';
    const camposNormales = document.querySelectorAll('.campo-normal');
    const camposPendiente = document.querySelectorAll('.pendiente-campos');
    
    camposNormales.forEach(el => {
        const input = el.querySelector('input, select, textarea');
        if (input) input.disabled = esPendiente;
        el.style.display = esPendiente ? 'none' : 'flex';
    });
    
    camposPendiente.forEach(el => {
        el.style.display = esPendiente ? 'flex' : 'none';
        const input = el.querySelector('input, textarea');
        if (input) input.disabled = false;
    });
});

function addMultipleFolios() {
    const count = prompt('¿Cuántos folios desea agregar?', '1');
    if (!count || isNaN(count) || count <= 0) return;
    
    for (let i = 0; i < parseInt(count); i++) {
        const folio = {
            tipo: 'FIBRA',
            cope: 'TROJES',
            telefono: '0000000000',
            folio: '000000000',
            tarea: 'INSTALACION',
            distrito: 'DISTRITO',
            tecnico: users.find(u => u.role === 'tecnico')?.name || '',
            fecha: new Date().toISOString(),
            plantilla: 'OK',
            encuesta: 'OK',
            instalacion: 'AEREA',
            metraje: 50,
            ventanas: 0,
            radiales: 0,
            pendiente: 'no',
            alfanumerico: '',
            comentarios: ''
        };
        
        folios.push(folio);
    }
    
    saveToStorage();
    alert(`Se agregaron ${count} folios`);
    updateStats();
}

// ======================
// FILTROS Y ELIMINACIÓN (ACTUALIZADO PARA FIREBASE)
// ======================

document.getElementById('filter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    displayFilteredResults(folios);
});

function displayFilteredResults(data) {
    const formData = new FormData(document.getElementById('filter-form'));
    const filtroTecnico = formData.get('filtro-tecnico');
    const fechaDesde = formData.get('fecha-desde');
    const fechaHasta = formData.get('fecha-hasta');
    const filtroFolio = formData.get('filtro-folio');
    
    let filtered = [...data];
    
    if (filtroTecnico) {
        filtered = filtered.filter(f => f.tecnico === filtroTecnico);
    }
    
    if (fechaDesde) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString() : f.fecha;
            return fecha >= fechaDesde + 'T00:00:00';
        });
    }
    
    if (fechaHasta) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString() : f.fecha;
            return fecha <= fechaHasta + 'T23:59:59';
        });
    }
    
    if (filtroFolio) {
        filtered = filtered.filter(f => f.folio && f.folio.includes(filtroFolio));
    }
    
    const container = document.getElementById('filter-results');
    if (filtered.length === 0) {
        container.innerHTML = '<p>No se encontraron resultados.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Folio</th>
                    <th>Técnico</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Instalación</th>
                    <th>Metraje</th>
                    <th>Ventanas</th>
                    <th>Radiales</th>
                    <th>Pendiente</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filtered.forEach(f => {
        let fechaStr = 'Sin fecha';
        if (f.fecha) {
            if (f.fecha instanceof firebase.firestore.Timestamp) {
                fechaStr = f.fecha.toDate().toLocaleString();
            } else {
                fechaStr = new Date(f.fecha).toLocaleString();
            }
        }
        
        html += `
            <tr>
                <td>${f.folio || 'N/A'}</td>
                <td>${f.tecnico || 'N/A'}</td>
                <td>${fechaStr}</td>
                <td>${f.tipo || 'N/A'}</td>
                <td>${f.instalacion || 'N/A'}</td>
                <td>${f.metraje || '0'} m</td>
                <td>${f.ventanas || '0'}</td>
                <td>${f.radiales || '0'}</td>
                <td>${f.pendiente === 'si' ? 'Sí' : 'No'}</td>
                <td><button onclick="deleteFolio('${f.id || f.folio}')">Eliminar</button></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function deleteFolio(folioId) {
    if (currentUser && currentUser.role === 'tecnico') {
        alert('No tienes permisos para eliminar folios.');
        return;
    }
    
    if (!confirm('¿Está seguro de eliminar este folio?')) {
        return;
    }
    
    try {
        // Intentar eliminar de Firebase primero
        const success = await deleteFolioFromFirebase(folioId);
        
        if (success) {
            // Eliminar del array local
            folios = folios.filter(f => f.id !== folioId && f.folio !== folioId);
            saveToStorage();
            updateStats();
            
            if (document.getElementById('filter').classList.contains('active')) {
                document.getElementById('filter-form').dispatchEvent(new Event('submit'));
            }
            
            alert('Folio eliminado correctamente');
        } else {
            alert('Error al eliminar el folio de la nube');
        }
    } catch (error) {
        console.error("Error eliminando folio:", error);
        alert('Error al eliminar el folio');
    }
}

// ======================
// GESTIÓN DE USUARIOS (ACTUALIZADO PARA FIREBASE)
// ======================

document.getElementById('user-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        return;
    }
    if (!['administrativo', 'gerente'].includes(currentUser.role)) {
        alert('No tienes permisos para gestionar usuarios.');
        return;
    }
    
    const formData = new FormData(this);
    const name = formData.get('user-name');
    const role = formData.get('user-role');
    const password = formData.get('user-password');
    
    if (users.some(u => u.name === name)) {
        alert('Ya existe un usuario con ese nombre.');
        return;
    }
    
    try {
        const userData = { name, role, password };
        const userId = await saveUserToFirebase(userData);
        
        // Agregar al array local
        users.push({ id: userId, ...userData });
        populateUserDropdowns();
        updateUsersList();
        this.reset();
        alert('Usuario agregado correctamente en la nube.');
        
    } catch (error) {
        console.error("Error guardando usuario:", error);
        alert('Error al guardar el usuario. Inténtalo de nuevo.');
    }
});

function updateUsersList() {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '<p>No hay usuarios registrados.</p>';
        return;
    }
    
    let html = `<table><thead><tr><th>Nombre</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>`;
    
    users.forEach((user, index) => {
        // No permitir eliminar al usuario actual
        const puedeEliminar = currentUser && currentUser.name !== user.name;
        html += `
            <tr>
                <td>${user.name} ${currentUser && currentUser.name === user.name ? '(Tú)' : ''}</td>
                <td>${user.role}</td>
                <td>
                    ${puedeEliminar ? 
                        `<button onclick="deleteUser('${user.id}', ${index})">Eliminar</button>` : 
                        '<span style="color:#999;">No se puede eliminar</span>'
                    }
                </td>
            </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function deleteUser(userId, index) {
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        return;
    }
    if (!['administrativo', 'gerente'].includes(currentUser.role)) {
        alert('No tienes permisos para eliminar usuarios.');
        return;
    }
    
    const userToDelete = users[index];
    if (userToDelete.name === currentUser.name) {
        alert('No puedes eliminar tu propio usuario.');
        return;
    }
    
    if (confirm(`¿Está seguro de eliminar al usuario "${userToDelete.name}"?`)) {
        try {
            const success = await deleteUserFromFirebase(userId);
            
            if (success) {
                users.splice(index, 1);
                populateUserDropdowns();
                updateUsersList();
                alert('Usuario eliminado correctamente de la nube.');
            } else {
                alert('Error al eliminar el usuario de la nube.');
            }
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            alert('Error al eliminar el usuario.');
        }
    }
}

// ======================
// IMPRESIÓN
// ======================

function printFilteredData() {
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = document.getElementById('filter-results').outerHTML;
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
}

// ======================
// RESUMEN POR TÉCNICO
// ======================

document.getElementById('summary-filter').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        return;
    }
    
    const formData = new FormData(this);
    const desde = formData.get('summary-desde');
    const hasta = formData.get('summary-hasta');
    
    let filtered = [...folios];
    
    if (desde) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString() : f.fecha;
            return fecha >= desde + 'T00:00:00';
        });
    }
    
    if (hasta) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString() : f.fecha;
            return fecha <= hasta + 'T23:59:59';
        });
    }
    
    generateSummary(filtered);
});

function generateSummary(data) {
    const summary = {};
    
    data.forEach(f => {
        if (!summary[f.tecnico]) {
            summary[f.tecnico] = 0;
        }
        summary[f.tecnico]++;
    });
    
    const ctx = document.getElementById('summary-chart').getContext('2d');
    if (ctx) {
        // Destruir gráfico anterior si existe
        if (window.summaryChart) {
            window.summaryChart.destroy();
        }
        
        window.summaryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(summary),
                datasets: [{
                    label: 'Folios Liquidados',
                    data: Object.values(summary),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw}` } }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    const tableContainer = document.getElementById('summary-table');
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Técnico</th>
                    <th>Total Folios</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (const [tecnico, total] of Object.entries(summary)) {
        html += `<tr><td>${tecnico}</td><td>${total}</td></tr>`;
    }
    
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function printSummary() {
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = document.getElementById('summary-chart-container').outerHTML + 
                         document.getElementById('summary-table').outerHTML;
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
}

// ======================
// CARGA FFTH Y COBRE (EXCLUYE PENDIENTES)
// ======================

function generateFFTHData() {
    return folios.filter(f => f.pendiente !== 'si' && f.tipo === 'FIBRA').map(f => {
        const row = {
            Tipo: f.tipo,
            Fecha: f.fecha ? (f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString().split('T')[0] : f.fecha.split('T')[0]) : 'Sin fecha',
            Folio: f.folio,
            Telefono: f.telefono,
            'Tipo de tarea': f.tarea,
            'Bajante aereo de 25m': 0,
            'Bajante aereo de 50m': 0,
            'Bajante aereo de 75m': 0,
            'Bajante aereo de 100m': 0,
            'Bajante aereo de 125m': 0,
            'Bajante aereo de 150m': 0,
            'Bajante aereo de 175m': 0,
            'Bajante aereo de 200m': 0,
            'Bajante aereo de 250m': 0,
            'Bajante subterraneo de 25m': 0,
            'Bajante subterraneo de 50m': 0,
            'Bajante subterraneo de 75m': 0,
            'Bajante subterraneo de 100m': 0,
            'Bajante subterraneo de 125m': 0,
            'Bajante subterraneo de 150m': 0,
            'Bajante subterraneo de 175m': 0,
            'Bajante subterraneo de 200m': 0,
            'Bajante subterraneo de 250m': 0,
            'Migracion exitosa de servicio de voz en cobre a voz en fibra optica (VSI)': 0,
            Alfanumerico: f.alfanumerico,
            Metraje: f.metraje,
            'Aerea/Sub': f.instalacion
        };
        
        const metraje = parseInt(f.metraje) || 0;
        
        if (f.instalacion === 'AEREA') {
            if (metraje >= 10 && metraje <= 25) row['Bajante aereo de 25m'] = 1;
            else if (metraje >= 26 && metraje <= 50) row['Bajante aereo de 50m'] = 1;
            else if (metraje >= 51 && metraje <= 75) row['Bajante aereo de 75m'] = 1;
            else if (metraje >= 76 && metraje <= 100) row['Bajante aereo de 100m'] = 1;
            else if (metraje >= 101 && metraje <= 125) row['Bajante aereo de 125m'] = 1;
            else if (metraje >= 126 && metraje <= 150) row['Bajante aereo de 150m'] = 1;
            else if (metraje >= 151 && metraje <= 175) row['Bajante aereo de 175m'] = 1;
            else if (metraje >= 176 && metraje <= 200) row['Bajante aereo de 200m'] = 1;
            else if (metraje >= 201 && metraje <= 250) row['Bajante aereo de 250m'] = 1;
        }
        
        if (f.instalacion === 'SUBTERRANEA') {
            if (metraje >= 10 && metraje <= 25) row['Bajante subterraneo de 25m'] = 1;
            else if (metraje >= 26 && metraje <= 50) row['Bajante subterraneo de 50m'] = 1;
            else if (metraje >= 51 && metraje <= 75) row['Bajante subterraneo de 75m'] = 1;
            else if (metraje >= 76 && metraje <= 100) row['Bajante subterraneo de 100m'] = 1;
            else if (metraje >= 101 && metraje <= 125) row['Bajante subterraneo de 125m'] = 1;
            else if (metraje >= 126 && metraje <= 150) row['Bajante subterraneo de 150m'] = 1;
            else if (metraje >= 151 && metraje <= 175) row['Bajante subterraneo de 175m'] = 1;
            else if (metraje >= 176 && metraje <= 200) row['Bajante subterraneo de 200m'] = 1;
            else if (metraje >= 201 && metraje <= 250) row['Bajante subterraneo de 250m'] = 1;
        }
        
        if (f.tipo && f.tipo.startsWith('TS')) {
            row['Migracion exitosa de servicio de voz en cobre a voz en fibra optica (VSI)'] = 1;
        }
        
        return row;
    });
}

function generateCobreData() {
    return folios.filter(f => f.pendiente !== 'si' && f.tipo === 'COBRE').map(f => {
        const row = {
            Tipo: f.tipo,
            Fecha: f.fecha ? (f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString().split('T')[0] : f.fecha.split('T')[0]) : 'Sin fecha',
            Folio: f.folio,
            Telefono: f.telefono,
            'Tipo de tarea': f.tarea,
            'Linea de cliente basica de 1 par (bajante c/modem)': 0,
            'Montaje de puete en distribuidor general': 0,
            Alfanumerico: f.alfanumerico,
            Metraje: f.metraje
        };
        
        const tarea = f.tarea ? f.tarea.toUpperCase() : '';
        if (tarea.includes('ML')) row['Montaje de puete en distribuidor general'] = 1;
        else if (tarea.includes('1L') || tarea.includes('2L') || tarea.includes('9L')) {
            row['Montaje de puete en distribuidor general'] = 2;
        }
        
        return row;
    });
}

function displayFFTHTable() {
    const data = generateFFTHData();
    const tableContainer = document.getElementById('ffth-table');
    
    if (data.length === 0) {
        tableContainer.innerHTML = '<p>No hay datos FFTH para mostrar.</p>';
        return;
    }
    
    let html = `<table><thead><tr>
        <th>Tipo</th><th>Fecha</th><th>Folio</th><th>Telefono</th><th>Tipo de tarea</th>
        <th>Bajante aereo 25m</th><th>Bajante aereo 50m</th><th>Bajante aereo 75m</th>
        <th>Bajante aereo 100m</th><th>Bajante aereo 125m</th><th>Bajante aereo 150m</th>
        <th>Bajante aereo 175m</th><th>Bajante aereo 200m</th><th>Bajante aereo 250m</th>
        <th>Bajante sub 25m</th><th>Bajante sub 50m</th><th>Bajante sub 75m</th>
        <th>Bajante sub 100m</th><th>Bajante sub 125m</th><th>Bajante sub 150m</th>
        <th>Bajante sub 175m</th><th>Bajante sub 200m</th><th>Bajante sub 250m</th>
        <th>Migración VSI</th><th>Alfanumerico</th><th>Metraje</th><th>Aerea/Sub</th>
    </tr></thead><tbody>`;
    
    data.forEach(row => {
        html += `<tr>
            <td>${row.Tipo}</td><td>${row.Fecha}</td><td>${row.Folio}</td><td>${row.Telefono}</td>
            <td>${row['Tipo de tarea']}</td><td>${row['Bajante aereo de 25m']}</td>
            <td>${row['Bajante aereo de 50m']}</td><td>${row['Bajante aereo de 75m']}</td>
            <td>${row['Bajante aereo de 100m']}</td><td>${row['Bajante aereo de 125m']}</td>
            <td>${row['Bajante aereo de 150m']}</td><td>${row['Bajante aereo de 175m']}</td>
            <td>${row['Bajante aereo de 200m']}</td><td>${row['Bajante aereo de 250m']}</td>
            <td>${row['Bajante subterraneo de 25m']}</td><td>${row['Bajante subterraneo de 50m']}</td>
            <td>${row['Bajante subterraneo de 75m']}</td><td>${row['Bajante subterraneo de 100m']}</td>
            <td>${row['Bajante subterraneo de 125m']}</td><td>${row['Bajante subterraneo de 150m']}</td>
            <td>${row['Bajante subterraneo de 175m']}</td><td>${row['Bajante subterraneo de 200m']}</td>
            <td>${row['Bajante subterraneo de 250m']}</td>
            <td>${row['Migracion exitosa de servicio de voz en cobre a voz en fibra optica (VSI)']}</td>
            <td>${row.Alfanumerico}</td><td>${row.Metraje}</td><td>${row['Aerea/Sub']}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function displayCobreTable() {
    const data = generateCobreData();
    const tableContainer = document.getElementById('cobre-table');
    
    if (data.length === 0) {
        tableContainer.innerHTML = '<p>No hay datos de COBRE para mostrar.</p>';
        return;
    }
    
    let html = `<table><thead><tr>
        <th>Tipo</th><th>Fecha</th><th>Folio</th><th>Telefono</th><th>Tipo de tarea</th>
        <th>Linea de cliente basica</th><th>Montaje de puente</th><th>Alfanumerico</th><th>Metraje</th>
    </tr></thead><tbody>`;
    
    data.forEach(row => {
        html += `<tr>
            <td>${row.Tipo}</td><td>${row.Fecha}</td><td>${row.Folio}</td><td>${row.Telefono}</td>
            <td>${row['Tipo de tarea']}</td>
            <td>${row['Linea de cliente basica de 1 par (bajante c/modem)']}</td>
            <td>${row['Montaje de puente en distribuidor general']}</td>
            <td>${row.Alfanumerico}</td><td>${row.Metraje}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function exportToExcel(type) {
    let data;
    let filename;
    
    if (type === 'ffth') {
        data = generateFFTHData();
        filename = 'CARGA_FFTH.xlsx';
    } else if (type === 'cobre') {
        data = generateCobreData();
        filename = 'CARGA_COBRE.xlsx';
    }
    
    if (!data || data.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }
    
    let table = '<table><thead><tr>';
    const headers = Object.keys(data[0]);
    headers.forEach(h => table += `<th>${h}</th>`);
    table += '</tr></thead><tbody>';
    
    data.forEach(row => {
        table += '<tr>';
        headers.forEach(h => table += `<td>${row[h]}</td>`);
        table += '</tr>';
    });
    
    table += '</tbody></table>';
    
    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ======================
// NÓMINAS (MEJORADAS)
// ======================

function generateNominaReceipt(tecnico, data, desde, hasta) {
    try {
        const receiptDiv = document.getElementById('nomina-receipt');
        const today = new Date().toLocaleDateString();
        
        currentTecnicoNomina = tecnico;
        currentDesdeNomina = desde;
        currentHastaNomina = hasta;
        
        const keyEditables = `editables_nomina_${tecnico}`;
        let valoresEditables = JSON.parse(localStorage.getItem(keyEditables)) || [];
        
        const logoSrc = plantillaAdmin.logoBase64 || 
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAxMDAgNTAiPgogIDxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiM5OTkiLz4KICA8dGV4dCB4PSI1MCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TE9HTzwvdGV4dD4KPC9zdmc+';
        
        let totalVentanas = 0;
        let totalRadiales = 0;
        data.forEach(f => {
            totalVentanas += parseInt(f.ventanas) || 0;
            totalRadiales += parseInt(f.radiales) || 0;
        });
        const costoVentanas = totalVentanas * 50;
        const costoRadiales = totalRadiales * 100;
        
        let html = `<div class="receipt">
            <div class="logo-header">
                <img src="${logoSrc}" alt="Logo">
                <div class="titulo-centrado">RECIBO DE PAGO</div>
            </div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <div><strong>FECHA:</strong> <span id="fecha-rango">${desde} AL ${hasta}</span></div>
                <div><strong>TECNICO INSTALADC:</strong> <span id="tecnico-nomina">${tecnico}</span></div>
            </div>
            
            <div style="text-align:center; font-weight:bold; margin-bottom:0.5rem;">Técnico Destajista</div>
            
            <table class="recibo-table" id="tabla-folios">
                <thead>
                    <tr>
                        <th>FECHA</th>
                        <th>OS</th>
                        <th>COSTO</th>
                        <th>FTTH/COBRE</th>
                        <th>AEREA/SUB</th>
                    </tr>
                </thead>
                <tbody id="cuerpo-folios"></tbody>
                <tfoot id="pie-editable">
        `;
        
        if (totalVentanas > 0) {
            html += `<tr>
                <td colspan="2" style="text-align:right;">VENTANAS (${totalVentanas})</td>
                <td colspan="3">$${costoVentanas.toFixed(2)}</td>
            </tr>`;
        }
        if (totalRadiales > 0) {
            html += `<tr>
                <td colspan="2" style="text-align:right;">RADIALES (${totalRadiales})</td>
                <td colspan="3">$${costoRadiales.toFixed(2)}</td>
            </tr>`;
        }
        
        html += `
                    <tr class="total-row">
                        <td colspan="2" style="text-align:right; font-weight:bold;">TOTAL</td>
                        <td colspan="3" id="total-costo" style="text-align:center;">$0.00</td>
                    </tr>
        `;
        
        // Campos editables
        valoresEditables.forEach((campo, index) => {
            html += `
                <tr class="fila-editable" data-index="${index}">
                    <td colspan="2" style="text-align:right;" contenteditable="true" class="nombre-editable">${campo.nombre}</td>
                    <td colspan="3" contenteditable="true" class="valor-editable">${campo.valor}</td>
                </tr>
            `;
        });
        
        html += `</tfoot></table>
            <div class="no-imprimir" style="margin: 1rem 0; text-align:center;">
                <button type="button" onclick="agregarCampoEditableEnRecibo('${tecnico}')">+ Añadir Campo</button>
                <button type="button" onclick="guardarCamposEditables('${tecnico}')">💾 Guardar Cambios</button>
            </div>
            <div class="signature-line">
                <div>NOMBRE Y FIRMA</div>
                <div style="margin-top:0.5rem; border-top:1px solid #333; padding-top:0.5rem;"></div>
            </div>
            <div class="footer-note">
                CON ESTE PAGO QUEDAN LIQUIDADOS MIS SERVICIOS REALIZADOS SIN NINGUNA ADEUDO
            </div>
            <div style="margin-top:1rem; border-top:2px solid red; padding:0.5rem; font-weight:bold;">
                OBSERVACIONES
            </div>
            <div style="margin-top:1rem; text-align:right; font-size:0.8rem;">
                Jardín de Versalles #211<br>
                Versalles Primera Sección<br>
                Aguascalientes, Ags CP 20285
            </div>
        </div>`;
        
        receiptDiv.innerHTML = html;
        attachEditableEvents(tecnico);
        actualizarDatosDinamicos(tecnico, data, desde, hasta);
        
    } catch (error) {
        console.error("Error al generar el recibo:", error);
        alert("Error al generar el recibo. Verifica la consola.");
    }
}

function attachEditableEvents(tecnico) {
    document.querySelectorAll('.nombre-editable, .valor-editable').forEach(el => {
        el.addEventListener('blur', () => guardarCamposEditables(tecnico));
    });
    
    document.querySelectorAll('.fila-editable').forEach(row => {
        let btn = row.querySelector('.btn-eliminar');
        if (!btn) {
            btn = document.createElement('button');
            btn.textContent = '🗑️';
            btn.className = 'btn-eliminar no-imprimir';
            btn.style.cssText = 'margin-left:10px; background:none; border:none; cursor:pointer; font-size:0.8rem; vertical-align:middle;';
            btn.onclick = () => {
                if (confirm('¿Eliminar este campo?')) {
                    row.remove();
                    guardarCamposEditables(tecnico);
                }
            };
            row.querySelector('.valor-editable').appendChild(btn);
        } else {
            btn.classList.add('no-imprimir');
        }
    });
}

function agregarCampoEditableEnRecibo(tecnico) {
    const newRow = document.createElement('tr');
    newRow.className = 'fila-editable';
    newRow.innerHTML = `
        <td colspan="2" style="text-align:right;" contenteditable="true" class="nombre-editable">Nuevo campo</td>
        <td colspan="3" contenteditable="true" class="valor-editable">$0.00</td>
    `;
    
    const totalRow = document.querySelector('.total-row:last-of-type');
    if (totalRow) {
        totalRow.parentNode.insertBefore(newRow, totalRow.nextSibling);
    } else {
        document.getElementById('pie-editable').appendChild(newRow);
    }
    
    const btn = document.createElement('button');
    btn.textContent = '🗑️';
    btn.className = 'btn-eliminar no-imprimir';
    btn.style.cssText = 'margin-left:10px; background:none; border:none; cursor:pointer; font-size:0.8rem; vertical-align:middle;';
    btn.onclick = () => {
        if (confirm('¿Eliminar este campo?')) {
            newRow.remove();
            guardarCamposEditables(tecnico);
        }
    };
    newRow.querySelector('.valor-editable').appendChild(btn);
    guardarCamposEditables(tecnico);
}

function guardarCamposEditables(tecnico) {
    const campos = [];
    document.querySelectorAll('.fila-editable').forEach(row => {
        const nombre = row.querySelector('.nombre-editable')?.textContent.trim();
        const valor = row.querySelector('.valor-editable')?.textContent.replace('🗑️', '').replace(/\s*$/, '').trim();
        if (nombre || valor) campos.push({ nombre, valor });
    });
    
    localStorage.setItem(`editables_nomina_${tecnico}`, JSON.stringify(campos));
}

// Función auxiliar para comparar fechas
function compararFechas(fecha1, fecha2) {
    let date1, date2;
    
    if (fecha1 instanceof firebase.firestore.Timestamp) {
        date1 = fecha1.toDate();
    } else {
        date1 = new Date(fecha1);
    }
    
    if (fecha2 instanceof firebase.firestore.Timestamp) {
        date2 = fecha2.toDate();
    } else {
        date2 = new Date(fecha2);
    }
    
    return date2 <= date1;
}

function actualizarDatosDinamicos(tecnico, data, desde, hasta) {
    try {
        document.getElementById('fecha-rango').textContent = `${desde} AL ${hasta}`;
        document.getElementById('tecnico-nomina').textContent = tecnico;
        
        const cuerpo = document.getElementById('cuerpo-folios');
        if (!cuerpo) return;
        
        cuerpo.innerHTML = '';
        let totalCosto = 0;
        
        data.forEach(f => {
            const instalacionesTecnico = data.filter(f2 => 
                f2.tecnico === tecnico && compararFechas(f.fecha, f2.fecha)
            );
            const esDecima = instalacionesTecnico.length >= 10;
            
            let costo;
            if (f.tipo === 'FIBRA') {
                costo = f.instalacion === 'AEREA' ? 
                    (esDecima ? precios.fibra_aerea_10 : precios.fibra_aerea) :
                    (esDecima ? precios.fibra_sub_10 : precios.fibra_sub);
            } else {
                costo = f.instalacion === 'AEREA' ? 
                    (esDecima ? precios.cobre_aerea_10 : precios.cobre_aerea) :
                    (esDecima ? precios.cobre_sub_10 : precios.cobre_sub);
            }
            
            totalCosto += costo;
            
            const row = document.createElement('tr');
            let fechaStr = 'Sin fecha';
            if (f.fecha) {
                if (f.fecha instanceof firebase.firestore.Timestamp) {
                    fechaStr = f.fecha.toDate().toLocaleString();
                } else {
                    fechaStr = new Date(f.fecha).toLocaleString();
                }
            }
            
            row.innerHTML = `
                <td>${fechaStr}</td>
                <td>${f.folio}</td>
                <td>$${costo}</td>
                <td>${f.tipo}</td>
                <td>${f.instalacion}</td>
            `;
            cuerpo.appendChild(row);
            
            // Agregar fila de pendiente si existe
            if (f.pendiente === 'si' && f.telefono_pendiente) {
                let costoPendiente;
                if (f.tipo === 'FIBRA') {
                    costoPendiente = f.instalacion === 'AEREA' ? 
                        (esDecima ? precios.fibra_aerea_10 : precios.fibra_aerea) :
                        (esDecima ? precios.fibra_sub_10 : precios.fibra_sub);
                } else {
                    costoPendiente = f.instalacion === 'AEREA' ? 
                        (esDecima ? precios.cobre_aerea_10 : precios.cobre_aerea) :
                        (esDecima ? precios.cobre_sub_10 : precios.cobre_sub);
                }
                
                totalCosto += costoPendiente;
                
                const rowPendiente = document.createElement('tr');
                rowPendiente.innerHTML = `
                    <td>${fechaStr}</td>
                    <td>${f.telefono_pendiente}</td>
                    <td>$${costoPendiente}</td>
                    <td>Pendiente liquidar</td>
                    <td>${f.comentarios_pendiente || ''}</td>
                `;
                cuerpo.appendChild(rowPendiente);
            }
        });
        
        let totalVentanas = 0;
        let totalRadiales = 0;
        data.forEach(f => {
            totalVentanas += parseInt(f.ventanas) || 0;
            totalRadiales += parseInt(f.radiales) || 0;
        });
        totalCosto += (totalVentanas * 50) + (totalRadiales * 100);
        
        document.getElementById('total-costo').textContent = `$${totalCosto.toFixed(2)}`;
    } catch (error) {
        console.error("Error al actualizar datos:", error);
    }
}

// ======================
// NÓMINA SUPERVISOR
// ======================

function generateSupervisorReceipt(supervisor, desde, hasta) {
    try {
        const receiptDiv = document.getElementById('supervisor-receipt');
        const today = new Date().toLocaleDateString();
        
        const keyEditables = `editables_supervisor_${supervisor}`;
        let valoresEditables = JSON.parse(localStorage.getItem(keyEditables)) || [
            { dias: "LUNES", tipo: "EMPLEADO", costo: "" },
            { dias: "MARTES", tipo: "EMPLEADO", costo: "" },
            { dias: "MIERCOLES", tipo: "EMPLEADO", costo: "" },
            { dias: "JUEVES", tipo: "EMPLEADO", costo: "" },
            { dias: "VIERNES", tipo: "EMPLEADO", costo: "" },
            { dias: "SABADO", tipo: "EMPLEADO", costo: "" },
            { dias: "DOMINGO", tipo: "EMPLEADO", costo: "" },
            { dias: "HORAS EXTRAS", tipo: "", costo: "" }
        ];
        
        const logoSrc = plantillaAdmin.logoBase64 || 
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAxMDAgNTAiPgogIDxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiM5OTkiLz4KICA8dGV4dCB4PSI1MCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TE9HTzwvdGV4dD4KPC9zdmc+';
        
        let html = `<div class="receipt">
            <div class="logo-header">
                <img src="${logoSrc}" alt="Logo">
                <div class="titulo-centrado">RECIBO DE PAGO SUPERVISOR</div>
            </div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <div><strong>FECHA:</strong> ${desde} AL ${hasta}</div>
                <div><strong>NOMBRE:</strong> ${supervisor}</div>
            </div>
            
            <table class="recibo-table">
                <thead>
                    <tr>
                        <th>FECHA</th>
                        <th>TIPO</th>
                        <th>COSTO</th>
                    </tr>
                </thead>
                <tbody id="cuerpo-supervisor">
        `;
        
        valoresEditables.forEach((fila, index) => {
            html += `
                <tr class="fila-supervisor" data-index="${index}">
                    <td contenteditable="true" class="dia-editable">${fila.dias}</td>
                    <td contenteditable="true" class="tipo-editable">${fila.tipo}</td>
                    <td contenteditable="true" class="costo-editable" oninput="actualizarTotalSupervisor('${supervisor}')">${fila.costo}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="text-align:center; font-weight:bold;">TOTAL</td>
                        <td id="total-supervisor" style="text-align:center;">$0.00</td>
                    </tr>
                    <tr class="fila-extra" data-tipo="depositada">
                        <td colspan="2" contenteditable="true" class="nombre-extra">NOMNA DEPOSITADA BNTE.</td>
                        <td contenteditable="true" class="valor-extra"></td>
                    </tr>
                    <tr class="fila-extra" data-tipo="infonavit">
                        <td colspan="2" contenteditable="true" class="nombre-extra">INFONAVIT + PENSION A. + PRESTAMO</td>
                        <td contenteditable="true" class="valor-extra"></td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="no-imprimir" style="margin: 1rem 0; text-align:center;">
                <button type="button" onclick="agregarFilaSupervisor('${supervisor}')">+ Añadir Fila</button>
                <button type="button" onclick="guardarCamposSupervisor('${supervisor}')">💾 Guardar Cambios</button>
            </div>
            
            <div class="signature-line">
                <div>NOMBRE Y FIRMA</div>
                <div style="margin-top:0.5rem; border-top:1px solid #333; padding-top:0.5rem;"></div>
            </div>
            <div style="border-top: 1px solid #333; padding: 0.5rem; font-size: 0.8rem;">
                CON ESTE PAGO QUEDAN LIQUIDADOS MIS SERVICIOS REALIZADOS SIN NINGUNA ADEUDO
            </div>
            <div style="margin-top: 1rem; border-top: 2px solid red; padding: 0.5rem; font-weight:bold;">
                OBSERVACIONES
            </div>
            <div style="margin-top:1rem; text-align:right; font-size:0.8rem;">
                Jardín de Versalles #211<br>
                Versalles Primera Sección<br>
                Aguascalientes, Ags CP 20285
            </div>
        </div>`;
        
        receiptDiv.innerHTML = html;
        actualizarTotalSupervisor(supervisor);
        attachEventosSupervisor(supervisor);
        
    } catch (error) {
        console.error("Error al generar recibo de supervisor:", error);
        alert("Error al generar el recibo. Verifica la consola.");
    }
}

function actualizarTotalSupervisor(supervisor) {
    try {
        let total = 0;
        document.querySelectorAll('.costo-editable').forEach(el => {
            const valorStr = el.textContent.trim().replace('$', '').replace(',', '');
            const valor = parseFloat(valorStr) || 0;
            total += valor;
        });
        document.getElementById('total-supervisor').textContent = `$${total.toFixed(2)}`;
        guardarCamposSupervisor(supervisor);
    } catch (error) {
        console.error("Error al actualizar total:", error);
    }
}

function attachEventosSupervisor(supervisor) {
    document.querySelectorAll('.fila-supervisor, .fila-extra').forEach(row => {
        let btn = row.querySelector('.btn-eliminar');
        if (!btn) {
            btn = document.createElement('button');
            btn.textContent = '🗑️';
            btn.className = 'btn-eliminar no-imprimir';
            btn.style.cssText = 'margin-left:10px; background:none; border:none; cursor:pointer; font-size:0.8rem; vertical-align:middle;';
            btn.onclick = () => {
                if (confirm('¿Eliminar esta fila?')) {
                    row.remove();
                    actualizarTotalSupervisor(supervisor);
                }
            };
            row.querySelector('td:last-child').appendChild(btn);
        } else {
            btn.classList.add('no-imprimir');
        }
    });
}

function agregarFilaSupervisor(supervisor) {
    const newRow = document.createElement('tr');
    newRow.className = 'fila-supervisor';
    newRow.innerHTML = `
        <td contenteditable="true" class="dia-editable">Nuevo día</td>
        <td contenteditable="true" class="tipo-editable">Tipo</td>
        <td contenteditable="true" class="costo-editable" oninput="actualizarTotalSupervisor('${supervisor}')">$0.00</td>
    `;
    
    const cuerpo = document.getElementById('cuerpo-supervisor');
    cuerpo.appendChild(newRow);
    
    const btn = document.createElement('button');
    btn.textContent = '🗑️';
    btn.className = 'btn-eliminar no-imprimir';
    btn.style.cssText = 'margin-left:10px; background:none; border:none; cursor:pointer; font-size:0.8rem; vertical-align:middle;';
    btn.onclick = () => {
        if (confirm('¿Eliminar esta fila?')) {
            newRow.remove();
            actualizarTotalSupervisor(supervisor);
        }
    };
    newRow.querySelector('td:last-child').appendChild(btn);
    
    guardarCamposSupervisor(supervisor);
}

function guardarCamposSupervisor(supervisor) {
    const filas = [];
    document.querySelectorAll('.fila-supervisor').forEach(row => {
        const dia = row.querySelector('.dia-editable')?.textContent.trim() || '';
        const tipo = row.querySelector('.tipo-editable')?.textContent.trim() || '';
        const costo = row.querySelector('.costo-editable')?.textContent.trim() || '';
        if (dia || tipo || costo) {
            filas.push({ dias: dia, tipo: tipo, costo: costo });
        }
    });
    
    const extras = {};
    document.querySelectorAll('.fila-extra').forEach(row => {
        const nombre = row.querySelector('.nombre-extra')?.textContent.trim() || '';
        const valor = row.querySelector('.valor-extra')?.textContent.trim() || '';
        const tipo = row.dataset.tipo;
        if (tipo) {
            extras[tipo] = { nombre, valor };
        }
    });
    
    localStorage.setItem(`editables_supervisor_${supervisor}`, JSON.stringify(filas));
    localStorage.setItem(`extras_supervisor_${supervisor}`, JSON.stringify(extras));
}

// ======================
// ACUMULADO (CORREGIDO)
// ======================

document.getElementById('acumulado-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        return;
    }
    
    const formData = new FormData(this);
    const desde = formData.get('acumulado-desde');
    const hasta = formData.get('acumulado-hasta');
    
    let filtered = [...folios];
    
    if (desde) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString() : f.fecha;
            return fecha >= desde + 'T00:00:00';
        });
    }
    
    if (hasta) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString() : f.fecha;
            return fecha <= hasta + 'T23:59:59';
        });
    }
    
    generateAcumuladoTable(filtered);
});

function generateAcumuladoTable(data) {
    const tecnicos = [...new Set(data.map(f => f.tecnico))].filter(t => t);
    const tableContainer = document.getElementById('acumulado-table');
    
    if (tecnicos.length === 0) {
        tableContainer.innerHTML = '<p>No hay datos para el período seleccionado.</p>';
        return;
    }
    
    let html = `<table><thead><tr><th></th>`;
    
    tecnicos.forEach(t => html += `<th>${t}</th>`);
    html += `<th>NEWBE</th></tr></thead><tbody>`;
    
    for (let i = 0; i < 20; i++) {
        html += '<tr><td>' + (i + 1) + '</td>';
        tecnicos.forEach(t => {
            const foliosTecnico = data.filter(f => f.tecnico === t);
            const folio = foliosTecnico[i];
            html += `<td>${folio ? folio.folio : '0'}</td>`;
        });
        html += '<td>0</td></tr>';
    }
    
    html += `
        <tr><td>SOPORTE Y PLATILLAS:</td>${tecnicos.map(() => '<td>0</td>').join('')}<td>0</td></tr>
        <tr><td>TOTAL</td>${tecnicos.map(() => '<td>0</td>').join('')}<td>0</td></tr>
    </tbody></table>`;
    
    tableContainer.innerHTML = html;
}

function printAcumulado() {
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = document.getElementById('acumulado-table').outerHTML;
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
}

// ======================
// TOTAL GENERAL NÓMINAS (CORREGIDO)
// ======================

document.getElementById('total-nominas-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        return;
    }
    
    const formData = new FormData(this);
    const desde = formData.get('total-desde');
    const hasta = formData.get('total-hasta');
    
    let filtered = [...folios];
    
    if (desde) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString() : f.fecha;
            return fecha >= desde + 'T00:00:00';
        });
    }
    
    if (hasta) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString() : f.fecha;
            return fecha <= hasta + 'T23:59:59';
        });
    }
    
    generateTotalNominas(filtered);
});

function generateTotalNominas(data) {
    const totals = {};
    data.forEach(f => {
        if (!f.tecnico) return;
        
        if (!totals[f.tecnico]) {
            totals[f.tecnico] = { count: 0, cost: 0 };
        }
        const instalacionesTecnico = data.filter(f2 => 
            f2.tecnico === f.tecnico && compararFechas(f.fecha, f2.fecha)
        );
        const esDecima = instalacionesTecnico.length >= 10;
        let costo;
        if (f.tipo === 'FIBRA') {
            costo = f.instalacion === 'AEREA' ? 
                (esDecima ? precios.fibra_aerea_10 : precios.fibra_aerea) :
                (esDecima ? precios.fibra_sub_10 : precios.fibra_sub);
        } else {
            costo = f.instalacion === 'AEREA' ? 
                (esDecima ? precios.cobre_aerea_10 : precios.cobre_aerea) :
                (esDecima ? precios.cobre_sub_10 : precios.cobre_sub);
        }
        totals[f.tecnico].count++;
        totals[f.tecnico].cost += costo;
    });
    
    const tableContainer = document.getElementById('total-nominas-table');
    let html = `<table><thead><tr><th>FECHA</th><th>10/10/2025</th><th>16/10/2025</th></tr></thead><tbody>
        <tr><td colspan="3" style="text-align:center; font-weight:bold; background:#000; color:white;">NOMBRE</td></tr>`;
    
    for (const [tecnico, info] of Object.entries(totals)) {
        html += `<tr><td>${tecnico}</td><td>${info.count}</td><td>$${info.cost.toFixed(2)}</td></tr>`;
    }
    
    const totalCost = Object.values(totals).reduce((sum, info) => sum + info.cost, 0);
    const totalCount = Object.values(totals).reduce((sum, info) => sum + info.count, 0);
    
    html += `
        <tr><td colspan="2" style="text-align:right; font-weight:bold;">TOTAL DE NOMINAS</td><td>$${totalCost.toFixed(2)}</td></tr>
        <tr><td colspan="2" style="text-align:right; font-weight:bold;">OS PAGADAS</td><td>${totalCount}</td></tr>
    </tbody></table>
    
    <div style="margin-top: 2rem;">
        <h3>GASTOS OFICINA</h3>
        <table><thead><tr><th>DESCRIPCION</th><th>CANTIDAD</th></tr></thead><tbody>
            <tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr>
            <tr><td></td><td></td></tr><tr><td></td><td></td></tr>
        </tbody></table>
        <div style="display:flex; justify-content:space-between; margin-top:1rem;">
            <div><strong>TOTAL PARCIAL</strong> $ -</div>
            <div style="background:yellow; padding:0.5rem; font-weight:bold;">NOMINA TOTAL $${totalCost.toFixed(2)}</div>
        </div>
    </div>`;
    
    tableContainer.innerHTML = html;
}

function printTotalNominas() {
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = document.getElementById('total-nominas-table').outerHTML;
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
}

// ======================
// CONFIGURAR PRECIOS (CORREGIDO)
// ======================

document.getElementById('precios-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        return;
    }
    if (!['administrativo', 'gerente'].includes(currentUser.role)) {
        alert('No tienes permisos para modificar precios.');
        return;
    }
    
    const formData = new FormData(this);
    Object.keys(precios).forEach(key => {
        const value = formData.get(key);
        precios[key] = value ? parseFloat(value) : precios[key];
    });
    
    saveToStorage();
    alert('Precios actualizados correctamente.');
});

// ======================
// GESTIÓN DE USUARIOS
// ======================

document.getElementById('user-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        return;
    }
    if (!['administrativo', 'gerente'].includes(currentUser.role)) {
        alert('No tienes permisos para gestionar usuarios.');
        return;
    }
    
    const formData = new FormData(this);
    const name = formData.get('user-name');
    const role = formData.get('user-role');
    const password = formData.get('user-password');
    
    if (users.some(u => u.name === name)) {
        alert('Ya existe un usuario con ese nombre.');
        return;
    }
    
    users.push({ name, role, password });
    saveToStorage();
    populateUserDropdowns();
    updateUsersList();
    this.reset();
    alert('Usuario agregado correctamente.');
});

function updateUsersList() {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '<p>No hay usuarios registrados.</p>';
        return;
    }
    
    let html = `<table><thead><tr><th>Nombre</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>`;
    
    users.forEach((user, index) => {
        // No permitir eliminar al usuario actual
        const puedeEliminar = currentUser && currentUser.name !== user.name;
        html += `
            <tr>
                <td>${user.name} ${currentUser && currentUser.name === user.name ? '(Tú)' : ''}</td>
                <td>${user.role}</td>
                <td>
                    ${puedeEliminar ? 
                        `<button onclick="deleteUser(${index})">Eliminar</button>` : 
                        '<span style="color:#999;">No se puede eliminar</span>'
                    }
                </td>
            </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function deleteUser(index) {
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        return;
    }
    if (!['administrativo', 'gerente'].includes(currentUser.role)) {
        alert('No tienes permisos para eliminar usuarios.');
        return;
    }
    
    const userToDelete = users[index];
    if (userToDelete.name === currentUser.name) {
        alert('No puedes eliminar tu propio usuario.');
        return;
    }
    
    if (confirm(`¿Está seguro de eliminar al usuario "${userToDelete.name}"?`)) {
        users.splice(index, 1);
        saveToStorage();
        populateUserDropdowns();
        updateUsersList();
        alert('Usuario eliminado correctamente.');
    }
}

// ======================
// IMPRESIÓN
// ======================

function printNomina() {
    const noImprimir = document.querySelectorAll('.no-imprimir, .btn-eliminar');
    noImprimir.forEach(el => {
        el.style.display = 'none';
    });
    
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = document.getElementById('nomina-receipt').outerHTML;
    document.body.appendChild(printArea);
    window.print();
    
    noImprimir.forEach(el => {
        el.style.display = '';
    });
    document.body.removeChild(printArea);
}

function printSupervisor() {
    const noImprimir = document.querySelectorAll('.no-imprimir, .btn-eliminar');
    noImprimir.forEach(el => {
        el.style.display = 'none';
    });
    
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = document.getElementById('supervisor-receipt').outerHTML;
    document.body.appendChild(printArea);
    window.print();
    
    noImprimir.forEach(el => {
        el.style.display = '';
    });
    document.body.removeChild(printArea);
}

// ======================
// INICIALIZACIÓN
// ======================

// ======================
// INICIALIZACIÓN (ACTUALIZADA)
// ======================

document.addEventListener('DOMContentLoaded', async () => {
    // Cargar todo desde Firebase
    await loadFromStorage();
    
    // Configurar fecha por defecto en los formularios
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
    
    // Configurar fecha y hora por defecto en el formulario de folios
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const fechaInput = document.querySelector('input[name="fecha"]');
    if (fechaInput && !fechaInput.value) {
        fechaInput.value = localDateTime;
    }
    
    console.log("Sistema inicializado correctamente");
    console.log("Usuarios cargados:", users);

// Mostrar sección home por defecto al cargar
// showSection('home'); // Esto se ejecutará después del login
    
    populateUserDropdowns();
    updateUsersList();
    
    // Configurar event listeners para nóminas
    document.getElementById('nomina-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (!currentUser) {
            alert("Sesión expirada. Inicia sesión de nuevo.");
            return;
        }
        
        const tecnico = this.querySelector('[name="nomina-tecnico"]').value;
        const desde = this.querySelector('[name="nomina-desde"]').value;
        const hasta = this.querySelector('[name="nomina-hasta"]').value;
        
        if (!tecnico || !desde || !hasta) {
            alert("Completa todos los campos.");
            return;
        }
        
        const filtered = folios.filter(f => {
            if (f.tecnico !== tecnico) return false;
            
            let fecha;
            if (f.fecha instanceof firebase.firestore.Timestamp) {
                fecha = f.fecha.toDate().toISOString().split('T')[0];
            } else {
                fecha = f.fecha ? f.fecha.split('T')[0] : '';
            }
            
            return fecha >= desde && fecha <= hasta;
        });
        
        if (filtered.length === 0) {
            alert("No se encontraron folios para el técnico y período seleccionados.");
            return;
        }
        
        generateNominaReceipt(tecnico, filtered, desde, hasta);
    });
    
    document.getElementById('supervisor-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (!currentUser) {
            alert("Sesión expirada. Inicia sesión de nuevo.");
            return;
        }
        
        const supervisor = this.querySelector('[name="supervisor-nombre"]').value;
        const desde = this.querySelector('[name="supervisor-desde"]').value;
        const hasta = this.querySelector('[name="supervisor-hasta"]').value;
        
        if (!supervisor || !desde || !hasta) {
            alert("Completa todos los campos.");
            return;
        }
        
        generateSupervisorReceipt(supervisor, desde, hasta);
    });
    
    // Cargar tablas después de la inicialización
    setTimeout(() => {
        displayFFTHTable();
        displayCobreTable();
    }, 1000);
});

// Mostrar sección home por defecto al cargar
showSection('home');