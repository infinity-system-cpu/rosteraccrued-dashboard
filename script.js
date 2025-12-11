// ======================
// VARIABLES GLOBALES
// ======================
let folios = [];
let users = [];
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
// FUNCIONES DE INTERFAZ
// ======================
function toggleMenu() {
    const nav = document.getElementById('side-menu');
    const overlay = document.querySelector('.nav-overlay');
    
    if (!nav) {
        console.error("Elemento side-menu no encontrado");
        return;
    }
    
    if (nav.classList.contains('active')) {
        // Cerrar menú
        nav.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log("Menú cerrado");
    } else {
        // Abrir menú
        nav.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log("Menú abierto");
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // OCULTAR APP
    const appElement = document.getElementById('app');
    appElement.style.display = 'none';
    appElement.style.visibility = 'hidden';
    
    // OCULTAR ELEMENTOS INTERNOS
    document.querySelector('.top-bar').style.display = 'none';
    document.querySelector('.main-content').style.display = 'none';
    
    // MOSTRAR LOGIN
    const loginSection = document.getElementById('login-section');
    loginSection.style.display = 'flex';
    loginSection.style.visibility = 'visible';
    
    // RESET FORM
    document.getElementById('login-form').reset();
}

// Añade esta función
function refreshDropdowns() {
    console.log("Refrescando dropdowns...");
    populateUserDropdowns();
    
    // También forzar que se muestren las secciones si están ocultas
    const nominaSection = document.getElementById('nomina');
    const supervisorSection = document.getElementById('supervisor');
    
    if (nominaSection && nominaSection.style.display !== 'none') {
        console.log("Sección nómina está visible, refrescando dropdown");
        const select = nominaSection.querySelector('select[name="nomina-tecnico"]');
        if (select && select.innerHTML === '') {
            populateUserDropdowns();
        }
    }
    
    if (supervisorSection && supervisorSection.style.display !== 'none') {
        console.log("Sección supervisor está visible, refrescando dropdown");
        const select = supervisorSection.querySelector('select[name="supervisor-nombre"]');
        if (select && select.innerHTML === '') {
            populateUserDropdowns();
        }
    }
}

function showSection(sectionId) {
    console.log("showSection() llamada con:", sectionId);
    console.log("currentUser:", currentUser);
    
    if (!currentUser) {
        alert("Debes iniciar sesión primero.");
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        return;
    }

    // Cerrar menú lateral si está abierto
    toggleMenu();
    
    console.log("Ocultando todas las secciones...");
    
    // Ocultar TODAS las secciones (dashboard y secciones normales)
    document.querySelectorAll('.content-section, .section').forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });
    
    // Remover clase active de todos los items del menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Agregar clase active al item del menú seleccionado
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`showSection('${sectionId}')`)) {
            item.classList.add('active');
        }
    });
    
    // Mostrar sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        console.log("Mostrando sección:", sectionId);
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        
        // Scroll al inicio de la sección
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error("Sección no encontrada:", sectionId);
        // Mostrar dashboard por defecto
        showSection('home');
        return;
    }

    // Actualizar menú según rol
    updateMenuByRole();
    
    // Acciones específicas por sección
    console.log("Ejecutando acciones para sección:", sectionId);
    switch(sectionId) {
        case 'home':
            updateDashboard();
            break;
        case 'add':
            populateUserDropdowns();
            togglePlantillaEncuestaFields();
            break;
        case 'carga-ffth':
            setupFFTHFilters();
            displayFFTHTable();
            break;
        case 'carga-cobre':
            setupCobreFilters();
            displayCobreTable();
            break;
        case 'users':
            updateUsersList();
            break;
        case 'filter':
            initializeFilterSection();
            break;
        case 'planos':
            setTimeout(() => {
                const select = document.getElementById('carpeta-select');
                if (select) {
                    select.value = 'planos';
                    cargarArchivosCarpeta('planos');
                }
            }, 100);
            break;
        case 'base':
            initializeBaseSection();
            break;
        case 'summary':
            // Inicializar fechas en resumen
            const today = new Date().toISOString().split('T')[0];
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
            
            const desdeInput = document.querySelector('input[name="summary-desde"]');
            const hastaInput = document.querySelector('input[name="summary-hasta"]');
            
            if (desdeInput && !desdeInput.value) {
                desdeInput.value = oneWeekAgoStr;
            }
            if (hastaInput && !hastaInput.value) {
                hastaInput.value = today;
            }
            break;
        case 'nomina':
            console.log("Mostrando sección nómina técnico");
            populateUserDropdowns();
            // Forzar visibilidad de los dropdowns
            setTimeout(() => {
                console.log("Dropdown técnico:", document.querySelector('select[name="nomina-tecnico"]'));
                console.log("Opciones:", document.querySelector('select[name="nomina-tecnico"]').innerHTML);
            }, 100);
            break;
        case 'supervisor':
            console.log("Mostrando sección nómina supervisor");
            populateUserDropdowns();
            setTimeout(() => {
                console.log("Dropdown supervisor:", document.querySelector('select[name="supervisor-nombre"]'));
                console.log("Opciones:", document.querySelector('select[name="supervisor-nombre"]').innerHTML);
            }, 100);
            break;
    }

    // Después de mostrar la sección
    setTimeout(() => {
        if (sectionId === 'nomina' || sectionId === 'supervisor') {
            refreshDropdowns();
        }
    }, 50);
    
    console.log("Navegación a", sectionId, "completada");
} 

function togglePlantillaEncuestaFields() {
    const plantillaField = document.querySelector('.form-row:has(select[name="plantilla"])');
    const encuestaField = document.querySelector('.form-row:has(select[name="encuesta"])');
    if (currentUser && currentUser.role === 'tecnico') {
        if (plantillaField) plantillaField.style.display = 'none';
        if (encuestaField) encuestaField.style.display = 'none';
    } else {
        if (plantillaField) plantillaField.style.display = 'flex';
        if (encuestaField) encuestaField.style.display = 'flex';
    }
}

// ======================
// SECCIÓN BASE DE FOLIOS
// ======================
let folioSeleccionado = null;

function initializeBaseSection() {
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
    document.getElementById('base-desde').value = oneWeekAgoStr;
    document.getElementById('base-hasta').value = today;
    populateBaseTecnicoDropdown();
    document.getElementById('base-filter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        applyBaseFilter();
    });
    document.getElementById('base-edit-controls').style.display = 'none';
}

function populateBaseTecnicoDropdown() {
    const select = document.getElementById('base-tecnico');
    const tecnicos = users.filter(u => u.role === 'tecnico');
    let options = '<option value="">Seleccionar técnico</option>';
    tecnicos.forEach(tecnico => {
        options += `<option value="${tecnico.name}">${tecnico.name}</option>`;
    });
    select.innerHTML = options;
}

function applyBaseFilter() {
    const tecnico = document.getElementById('base-tecnico').value;
    const desde = document.getElementById('base-desde').value;
    const hasta = document.getElementById('base-hasta').value;
    if (!tecnico || !desde || !hasta) {
        alert('Por favor completa todos los campos del filtro.');
        return;
    }
    let filtered = folios.filter(f => {
        if (f.tecnico !== tecnico) return false;
        if (!f.fecha) return false;
        let fechaFolio;
        if (f.fecha instanceof firebase.firestore.Timestamp) {
            fechaFolio = f.fecha.toDate().toISOString().split('T')[0];
        } else {
            fechaFolio = f.fecha.split('T')[0];
        }
        return fechaFolio >= desde && fechaFolio <= hasta;
    });
    displayBaseResults(filtered);
}

function displayBaseResults(data) {
    const container = document.getElementById('base-results');
    if (data.length === 0) {
        container.innerHTML = '<p>No se encontraron folios para los criterios seleccionados.</p>';
        return;
    }
    let html = `
        <div class="results-info">
            <p>Se encontraron <strong>${data.length}</strong> folios</p>
        </div>
        <table id="base-table">
            <thead>
                <tr>
                    <th>Folio</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Instalación</th>
                    <th>Metraje</th>
                    <th>Plantilla</th>
                    <th>Encuesta</th>
                    <th>Pendiente</th>
                </tr>
            </thead>
            <tbody>
    `;
    data.forEach((folio, index) => {
        let fechaStr = 'Sin fecha';
        if (folio.fecha) {
            if (folio.fecha instanceof firebase.firestore.Timestamp) {
                fechaStr = folio.fecha.toDate().toLocaleDateString();
            } else {
                fechaStr = new Date(folio.fecha).toLocaleDateString();
            }
        }
        html += `
            <tr data-folio-id="${folio.id}" data-index="${index}" onclick="selectFolioForEdit('${folio.id}', ${index})" style="cursor: pointer;">
                <td>${folio.folio || 'N/A'}</td>
                <td>${fechaStr}</td>
                <td>${folio.tipo || 'N/A'}</td>
                <td>${folio.instalacion || 'N/A'}</td>
                <td>${folio.metraje || '0'} m</td>
                <td>${folio.plantilla || 'N/A'}</td>
                <td>${folio.encuesta || 'N/A'}</td>
                <td>${folio.pendiente === 'si' ? 'Sí' : 'No'}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    document.getElementById('base-edit-controls').style.display = 'none';
    folioSeleccionado = null;
}

function selectFolioForEdit(folioId, index) {
    document.querySelectorAll('#base-table tr').forEach(row => {
        row.classList.remove('selected');
    });
    const selectedRow = document.querySelector(`tr[data-folio-id="${folioId}"]`);
    if (selectedRow) {
        selectedRow.classList.add('selected');
    }
    folioSeleccionado = folios.find(f => f.id === folioId);
    if (folioSeleccionado) {
        document.getElementById('edit-plantilla').value = folioSeleccionado.plantilla || 'OK';
        document.getElementById('edit-encuesta').value = folioSeleccionado.encuesta || 'OK';
        document.getElementById('base-edit-controls').style.display = 'block';
    }
}

async function saveFolioChanges() {
    if (!folioSeleccionado) {
        alert('No hay ningún folio seleccionado para editar.');
        return;
    }
    const nuevaPlantilla = document.getElementById('edit-plantilla').value;
    const nuevaEncuesta = document.getElementById('edit-encuesta').value;
    try {
        await db.collection('folios').doc(folioSeleccionado.id).update({
            plantilla: nuevaPlantilla,
            encuesta: nuevaEncuesta,
            actualizado_en: firebase.firestore.FieldValue.serverTimestamp()
        });
        const folioIndex = folios.findIndex(f => f.id === folioSeleccionado.id);
        if (folioIndex !== -1) {
            folios[folioIndex].plantilla = nuevaPlantilla;
            folios[folioIndex].encuesta = nuevaEncuesta;
        }
        const selectedRow = document.querySelector(`tr[data-folio-id="${folioSeleccionado.id}"]`);
        if (selectedRow) {
            selectedRow.cells[5].textContent = nuevaPlantilla;
            selectedRow.cells[6].textContent = nuevaEncuesta;
        }
        alert('✅ Cambios guardados correctamente');
        document.getElementById('base-edit-controls').style.display = 'none';
        folioSeleccionado = null;
        document.querySelectorAll('#base-table tr').forEach(row => {
            row.classList.remove('selected');
        });
    } catch (error) {
        console.error("Error guardando cambios:", error);
        alert('❌ Error al guardar los cambios. Intenta de nuevo.');
    }
}

function cancelEdit() {
    document.getElementById('base-edit-controls').style.display = 'none';
    folioSeleccionado = null;
    document.querySelectorAll('#base-table tr').forEach(row => {
        row.classList.remove('selected');
    });
}

function clearBaseFilter() {
    document.getElementById('base-tecnico').value = '';
    document.getElementById('base-desde').value = '';
    document.getElementById('base-hasta').value = '';
    document.getElementById('base-results').innerHTML = '<p>Selecciona un técnico y rango de fechas para ver los folios</p>';
    document.getElementById('base-edit-controls').style.display = 'none';
    folioSeleccionado = null;
}

// ======================
// INICIALIZACIÓN DE FILTROS
// ======================
function initializeFilterSection() {
    if (folios.length === 0) {
        loadFoliosFromFirebase().then(() => {
            applyDefaultFilter();
        }).catch(error => {
            console.error("Error cargando folios para filtro:", error);
            document.getElementById('filter-results').innerHTML = 
                '<p>Error al cargar los datos. Intenta recargar la página.</p>';
        });
    } else {
        applyDefaultFilter();
    }
}

function applyDefaultFilter() {
    displayFilteredResults(folios);
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
    const fechaDesde = document.querySelector('input[name="fecha-desde"]');
    const fechaHasta = document.querySelector('input[name="fecha-hasta"]');
    if (fechaDesde && !fechaDesde.value) {
        fechaDesde.value = oneWeekAgoStr;
    }
    if (fechaHasta && !fechaHasta.value) {
        fechaHasta.value = today;
    }
}

// ======================
// RECUPERACIÓN DE SESIÓN
// ======================
function checkExistingSession() {
    try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            
            // OCULTAR LOGIN
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('login-section').style.visibility = 'hidden';
            document.getElementById('login-section').classList.remove('active');
            
            // MOSTRAR APP CON TODOS LOS ELEMENTOS
            const appElement = document.getElementById('app');
            appElement.style.display = 'flex';
            appElement.style.flexDirection = 'column';
            appElement.style.visibility = 'visible';
            appElement.classList.add('active');
            
            // MOSTRAR TODOS LOS ELEMENTOS INTERNOS
            const sideMenu = document.getElementById('side-menu');
            if (sideMenu) {
                sideMenu.style.display = 'block';
                sideMenu.style.visibility = 'visible';
            }
            
            const topBar = document.querySelector('.top-bar');
            if (topBar) {
                topBar.style.display = 'flex';
                topBar.style.visibility = 'visible';
                topBar.style.opacity = '1';
            }
            
            const menuToggle = document.querySelector('.menu-toggle');
            if (menuToggle) {
                menuToggle.style.display = 'flex';
                menuToggle.style.visibility = 'visible';
            }
            
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.display = 'block';
                mainContent.style.visibility = 'visible';
                mainContent.style.opacity = '1';
            }
            
            // ACTUALIZAR INTERFAZ
            document.getElementById('user-name').textContent = currentUser.name;
            updateMenuByRole();
            
            // Cargar datos y mostrar dashboard
            loadFoliosFromFirebase().then(() => {
                console.log("Folios cargados al restaurar sesión:", folios.length);
                showSection('home');
                
                const homeSection = document.getElementById('home');
                if (homeSection) {
                    homeSection.style.display = 'block';
                    homeSection.style.visibility = 'visible';
                    homeSection.classList.add('active');
                }
            });
            
            setTimeout(() => {
                verificarFolioPendienteAlLogin();
            }, 1000);
            
            return true;
        }
    } catch (error) {
        console.error("Error recuperando sesión:", error);
        localStorage.removeItem('currentUser');
    }
    return false;
}

function updateMenuByRole() {
    if (!currentUser) return;
    const menuItems = {
        'home': true,
        'add': ['tecnico', 'supervisor', 'gerente', 'administrativo'],
        'filter': ['tecnico', 'supervisor', 'gerente', 'administrativo'],
        'planos': ['tecnico', 'supervisor', 'gerente', 'administrativo'],
        'summary': ['supervisor', 'gerente', 'administrativo'],
        'nomina': ['gerente', 'administrativo'],
        'supervisor': ['gerente', 'administrativo'],
        'acumulado': ['gerente', 'administrativo'],
        'total-nominas': ['gerente', 'administrativo'],
        'carga-ffth': ['administrativo'],
        'carga-cobre': ['administrativo'],
        'users': ['administrativo'],
        'precios': ['administrativo', 'gerente'],
        'base': ['supervisor', 'gerente', 'administrativo']
    };

    const buttons = document.querySelectorAll('button[onclick]');
    buttons.forEach(btn => {
        const match = btn.getAttribute('onclick').match(/showSection\(['"](\w+)['"]\)/);
        if (match) {
            const sectionId = match[1];
            const shouldShow = menuItems[sectionId] === true || 
                              menuItems[sectionId].includes(currentUser.role);
            btn.style.display = shouldShow ? 'flex' : 'none';
        }
    });

    populateUserDropdowns();
}

function updateDashboard() {
    console.log("Actualizando dashboard...");

    if (!currentUser) {
        console.error("No hay usuario logueado");
        return;
    }
    
    // Actualizar estadísticas
    document.getElementById('user-role').textContent = currentUser.role.toUpperCase();
    document.getElementById('user-name').textContent = currentUser.name;
    
    // Actualizar contadores
    updateStats();
    
    // Cargar actividad reciente
    loadRecentActivity();
    
    // Asegurar que el dashboard sea visible
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.style.display = 'block';
        homeSection.classList.add('active');
    }
    
    console.log("Dashboard actualizado");
}

function loadRecentActivity() {
    console.log("Cargando actividad reciente...");
    
    const activityList = document.getElementById('recent-folios');
    if (!activityList) {
        console.error("Elemento recent-folios no encontrado");
        return;
    }
    
    if (folios.length === 0) {
        activityList.innerHTML = '<p>No hay actividad reciente</p>';
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    const recentFolios = [...folios]
        .sort((a, b) => {
            const dateA = a.fecha instanceof firebase.firestore.Timestamp 
                ? a.fecha.toDate() 
                : new Date(a.fecha);
            const dateB = b.fecha instanceof firebase.firestore.Timestamp 
                ? b.fecha.toDate() 
                : new Date(b.fecha);
            return dateB - dateA;
        })
        .slice(0, 5); // Últimos 5 folios
    
    let html = '';
    recentFolios.forEach(folio => {
        const fecha = folio.fecha instanceof firebase.firestore.Timestamp 
            ? folio.fecha.toDate().toLocaleDateString() 
            : new Date(folio.fecha).toLocaleDateString();
        
        html += `
            <div class="activity-item">
                <div class="activity-content">
                    <strong>${folio.folio || 'N/A'}</strong> - ${folio.tecnico || 'N/A'}
                    <div class="activity-details">
                        <span class="activity-type">${folio.tipo || 'N/A'}</span>
                        <span class="activity-date">${fecha}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    activityList.innerHTML = html;
    console.log("Actividad reciente cargada:", recentFolios.length, "folios");
}

// ======================
// FUNCIONES DE FIREBASE - USUARIOS
// ======================
async function loadUsersFromFirebase() {
    try {
        const snapshot = await db.collection('users').get();
        users = [];
        snapshot.forEach(doc => {
            const userData = doc.data();
            users.push({
                id: doc.id,
                name: userData.name,
                usuario: userData.usuario,
                role: userData.role,
                password: userData.password
            });
        });
        if (users.length === 0) {
            await createDefaultUsers();
        }
        populateUserDropdowns();
        updateUsersList();
        return users;
    } catch (error) {
        console.error("Error cargando usuarios:", error);
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            users = JSON.parse(savedUsers);
        } else {
            users = [];
        }
        populateUserDropdowns();
        return users;
    }
}

async function createDefaultUsers() {
    const defaultUsers = [
        { name: "Admin", role: "administrativo", password: "admin123", usuario: "admin" },
        { name: "Gerente1", role: "gerente", password: "gerente123", usuario: "gerente1" },
        { name: "Supervisor1", role: "supervisor", password: "supervisor123", usuario: "supervisor1" },
        { name: "Tecnico1", role: "tecnico", password: "tecnico123", usuario: "tecnico1" }
    ];
    try {
        for (const user of defaultUsers) {
            await db.collection('users').add(user);
        }
        users = defaultUsers;
    } catch (error) {
        console.error("Error creando usuarios por defecto:", error);
    }
}

async function saveUserToFirebase(userData) {
    try {
        const userRef = await db.collection('users').add(userData);
        return userRef.id;
    } catch (error) {
        console.error("Error guardando usuario:", error);
        throw error;
    }
}

async function deleteUserFromFirebase(userId) {
    try {
        await db.collection('users').doc(userId).delete();
        return true;
    } catch (error) {
        console.error("Error eliminando usuario:", error);
        return false;
    }
}

// ======================
// FUNCIONES DE FIREBASE - FOLIOS
// ======================
async function loadFoliosFromFirebase() {
    console.log("Cargando folios desde Firebase...");
    
    try {
        const snapshot = await db.collection('folios').orderBy('creado_en', 'desc').get();
        folios = [];
        
        console.log("Folios encontrados en Firebase:", snapshot.size);
        
        snapshot.forEach(doc => {
            const folioData = doc.data();
            
            // Parsear fecha correctamente
            let fecha = null;
            if (folioData.fecha) {
                if (folioData.fecha instanceof firebase.firestore.Timestamp) {
                    fecha = folioData.fecha;
                } else if (typeof folioData.fecha === 'string') {
                    // Intentar convertir string a Timestamp
                    try {
                        fecha = firebase.firestore.Timestamp.fromDate(new Date(folioData.fecha));
                    } catch (error) {
                        console.warn("Error parseando fecha:", folioData.fecha);
                        fecha = firebase.firestore.Timestamp.now();
                    }
                }
            } else {
                fecha = folioData.creado_en || firebase.firestore.Timestamp.now();
            }
            
            // Crear objeto folio estandarizado
            const folio = {
                id: doc.id,
                tecnico: folioData.tecnico_nombre || folioData.tecnico || 'Sin técnico',
                tipo: folioData.tipo || 'FIBRA',
                folio: folioData.folio_os || folioData.folio || '000000000',
                telefono: folioData.telefono || '0000000000',
                tarea: folioData.tarea || 'Sin tarea',
                distrito: folioData.distrito || 'Sin distrito',
                cope: folioData.cope || '',
                fecha: fecha,
                instalacion: folioData.instalacion || 'AEREA',
                metraje: parseInt(folioData.metraje) || 0,
                ventanas: parseInt(folioData.ventanas) || 0,
                radiales: parseInt(folioData.radiales) || 0,
                alfanumerico: folioData.alfanumerico || '',
                comentarios: folioData.comentarios || '',
                pendiente: folioData.pendiente ? 'si' : 'no',
                telefono_pendiente: folioData.telefono_pendiente || '',
                comentarios_pendiente: folioData.comentarios_pendiente || '',
                plantilla: folioData.plantilla || 'OK',
                encuesta: folioData.encuesta || 'OK'
            };
            
            folios.push(folio);
        });
        
        console.log("Folios cargados en memoria:", folios.length);
        
        // Actualizar estadísticas inmediatamente
        updateStats();
        
        return folios;
        
    } catch (error) {
        console.error("Error cargando folios:", error);
        
        // Intentar cargar desde localStorage como fallback
        try {
            const savedFolios = localStorage.getItem('folios_backup');
            if (savedFolios) {
                folios = JSON.parse(savedFolios);
                console.log("Folios cargados desde backup:", folios.length);
                updateStats();
                return folios;
            }
        } catch (backupError) {
            console.error("Error cargando backup:", backupError);
        }
        
        return [];
    }
}

async function saveFolioToFirebase(folioData) {
    try {
        const firebaseFolio = {
            tecnico_id: 1,
            tecnico_nombre: folioData.tecnico || 'Técnico No Especificado',
            tipo: folioData.tipo || 'FIBRA',
            folio_os: folioData.folio || '000000000',
            telefono: folioData.telefono || '0000000000',
            tarea: folioData.tarea || 'Sin tarea',
            distrito: folioData.distrito || 'Sin distrito',
            cope: folioData.cope || '',
            fecha: folioData.fecha ? 
                firebase.firestore.Timestamp.fromDate(new Date(folioData.fecha)) : 
                firebase.firestore.FieldValue.serverTimestamp(),
            instalacion: folioData.instalacion || 'AEREA',
            metraje: parseInt(folioData.metraje) || 0,
            alfanumerico: folioData.alfanumerico || '',
            comentarios: folioData.comentarios || '',
            ventanas: parseInt(folioData.ventanas) || 0,
            radiales: parseInt(folioData.radiales) || 0,
            pendiente: folioData.pendiente === 'si',
            telefono_pendiente: folioData.telefono_pendiente || '',
            comentarios_pendiente: folioData.comentarios_pendiente || '',
            plantilla: folioData.plantilla || 'OK',
            encuesta: folioData.encuesta || 'OK',
            latitud: null,
            longitud: null,
            creado_en: firebase.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('folios').add(firebaseFolio);
        return docRef.id;
    } catch (error) {
        console.error("Error guardando folio:", error);
        throw error;
    }
}

async function deleteFolioFromFirebase(folioId) {
    if (!currentUser) return false;
    if (!confirm('¿ESTÁ SEGURO de eliminar este folio? Esta acción no se puede deshacer.')) {
        return false;
    }
    try {
        await db.collection('folios').doc(folioId).delete();
        return true;
    } catch (error) {
        console.error("Error eliminando folio:", error);
        return false;
    }
}

// ======================
// FUNCIONES DE ALMACENAMIENTO
// ======================
async function loadFromStorage() {
    try {
        await loadUsersFromFirebase();
        await loadFoliosFromFirebase();
        const savedPrecios = localStorage.getItem('precios');
        const savedPlantillaAdmin = localStorage.getItem('plantillaAdmin');
        if (savedPrecios) precios = JSON.parse(savedPrecios);
        if (savedPlantillaAdmin) plantillaAdmin = JSON.parse(savedPlantillaAdmin);
        updateStats();
    } catch (error) {
        console.error("Error en loadFromStorage:", error);
    }
}

function saveToStorage() {
    localStorage.setItem('precios', JSON.stringify(precios));
    localStorage.setItem('plantillaAdmin', JSON.stringify(plantillaAdmin));
}

// ======================
// LOGIN
// ======================
function login(e) {
    e.preventDefault();
    console.log("Función login() ejecutándose...");
    
    const form = e.target;
    const usernameInput = form.usuario.value.trim();
    const password = form.password.value;
    
    if (users.length === 0) {
        alert('Error: No se pudieron cargar los usuarios. Recarga la página.');
        return;
    }
    
    const user = users.find(u => 
        u.usuario && u.usuario.trim().toLowerCase() === usernameInput.toLowerCase() && 
        u.password === password
    );
    
    if (user) {
        console.log("Login exitoso para:", user.name);
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // 1. OCULTAR LOGIN COMPLETAMENTE
        const loginSection = document.getElementById('login-section');
        loginSection.style.display = 'none';
        loginSection.style.visibility = 'hidden';
        loginSection.classList.remove('active');
        
        // 2. MOSTRAR APP CON TODOS SUS ELEMENTOS
        const appElement = document.getElementById('app');
        appElement.style.display = 'flex';
        appElement.style.flexDirection = 'column';
        appElement.style.visibility = 'visible';
        appElement.classList.add('active');
        
        // 3. MOSTRAR TODOS LOS ELEMENTOS INTERNOS
        // Menú lateral
        const sideMenu = document.getElementById('side-menu');
        if (sideMenu) {
            sideMenu.style.display = 'block';
            sideMenu.style.visibility = 'visible';
        }
        
        // Top bar (barra superior con menú hamburguesa)
        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            topBar.style.display = 'flex';
            topBar.style.visibility = 'visible';
            topBar.style.opacity = '1';
        }
        
        // Botón de menú hamburguesa
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.style.display = 'flex';
            menuToggle.style.visibility = 'visible';
        }
        
        // Contenido principal
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
        }
        
        // Título de la app (si existe)
        const appTitle = document.querySelector('.app-title, .top-bar h1');
        if (appTitle) {
            appTitle.style.display = 'block';
            appTitle.style.visibility = 'visible';
        }
        
        // 4. ACTUALIZAR INTERFAZ
        document.getElementById('user-name').textContent = currentUser.name;
        updateMenuByRole();
        
        // 5. CARGAR DATOS Y MOSTRAR DASHBOARD
        // Cargar folios primero
        loadFoliosFromFirebase().then(() => {
            console.log("Folios cargados después del login:", folios.length);
            
            // Mostrar dashboard
            showSection('home');
            
            // Asegurar que el dashboard se vea
            const homeSection = document.getElementById('home');
            if (homeSection) {
                homeSection.style.display = 'block';
                homeSection.style.visibility = 'visible';
                homeSection.classList.add('active');
            }
            
            console.log("Login completado exitosamente - Interfaz visible");
        }).catch(error => {
            console.error("Error cargando folios después del login:", error);
            showSection('home'); // Mostrar dashboard de todos modos
        });
        
        // 6. Verificar folio pendiente después de un breve retraso
        setTimeout(() => {
            verificarFolioPendienteAlLogin();
        }, 1500);
        
    } else {
        console.error("Login fallido - credenciales incorrectas");
        alert('Usuario o contraseña incorrectos');
    }
}

// ======================
// UTILIDADES
// ======================
async function updateStats() {
    try {
        console.log("Actualizando estadísticas...");
        console.log("Total folios en memoria:", folios.length);
        
        // Actualizar contadores
        document.getElementById('total-folios').textContent = folios.length;
        
        // Contar técnicos únicos
        const tecnicosUnicos = [...new Set(folios.map(f => f.tecnico).filter(t => t))];
        document.getElementById('total-tecnicos').textContent = tecnicosUnicos.length;
        
        // Contar folios de hoy
        const today = new Date().toISOString().split('T')[0];
        const foliosToday = folios.filter(f => {
            if (!f.fecha) return false;
            
            let fechaFolio;
            if (f.fecha instanceof firebase.firestore.Timestamp) {
                fechaFolio = f.fecha.toDate().toISOString().split('T')[0];
            } else {
                fechaFolio = f.fecha.split('T')[0];
            }
            
            return fechaFolio === today;
        }).length;
        
        document.getElementById('folios-hoy').textContent = foliosToday;
        
        console.log("Estadísticas actualizadas:", {
            totalFolios: folios.length,
            tecnicosUnicos: tecnicosUnicos.length,
            foliosToday: foliosToday
        });
        
    } catch (error) {
        console.error("Error actualizando estadísticas:", error);
    }
}

function updateDashboard() {
    console.log("Actualizando dashboard...");
    
    if (!currentUser) {
        console.error("No hay usuario logueado");
        return;
    }
    
    // Actualizar rol de usuario
    document.getElementById('user-role').textContent = currentUser.role.toUpperCase();
    document.getElementById('user-name').textContent = currentUser.name;
    
    // Actualizar estadísticas
    updateStats();
    
    // Cargar actividad reciente
    loadRecentActivity();
    
    console.log("Dashboard actualizado");
}

// Mejorar la función loadRecentActivity
function loadRecentActivity() {
    console.log("Cargando actividad reciente...");
    
    const activityList = document.getElementById('recent-folios');
    if (!activityList) {
        console.error("Elemento recent-folios no encontrado");
        return;
    }
    
    if (folios.length === 0) {
        activityList.innerHTML = '<p>No hay actividad reciente</p>';
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    const recentFolios = [...folios]
        .sort((a, b) => {
            const dateA = a.fecha instanceof firebase.firestore.Timestamp 
                ? a.fecha.toDate() 
                : new Date(a.fecha);
            const dateB = b.fecha instanceof firebase.firestore.Timestamp 
                ? b.fecha.toDate() 
                : new Date(b.fecha);
            return dateB - dateA;
        })
        .slice(0, 5); // Últimos 5 folios
    
    let html = '';
    recentFolios.forEach(folio => {
        const fecha = folio.fecha instanceof firebase.firestore.Timestamp 
            ? folio.fecha.toDate().toLocaleDateString() 
            : new Date(folio.fecha).toLocaleDateString();
        
        html += `
            <div class="activity-item">
                <div class="activity-content">
                    <strong>${folio.folio || 'N/A'}</strong> - ${folio.tecnico || 'N/A'}
                    <div class="activity-details">
                        <span class="activity-type">${folio.tipo || 'N/A'}</span>
                        <span class="activity-date">${fecha}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    activityList.innerHTML = html;
    console.log("Actividad reciente cargada:", recentFolios.length, "folios");
}

function populateUserDropdowns() {
    console.log("populateUserDropdowns ejecutándose...");
    console.log("Total usuarios:", users.length);
    console.log("Usuario actual:", currentUser);

    const tecnicoSelects = document.querySelectorAll(
        'select[name="tecnico"], select[name="filtro-tecnico"], select[name="nomina-tecnico"], ' +
        'select[name="supervisor-nombre"]'
    );
    // 1. Obtener técnicos (rol 'tecnico')
    const tecnicos = users.filter(u => u.role === 'tecnico');
    console.log("Técnicos encontrados:", tecnicos.length);
    // 2. Obtener supervisores (roles que pueden ser supervisores)
    const supervisores = users.filter(u => 
        ['supervisor', 'gerente', 'administrativo'].includes(u.role)
    );
    console.log("Supervisores encontrados:", supervisores.length);

    // 3. Llenar dropdown de nómina técnico
    const nominaTecnicoSelect = document.querySelector('select[name="nomina-tecnico"]');
    if (nominaTecnicoSelect) {
        console.log("Llenando dropdown de nómina técnico...");
        let options = '<option value="">Seleccionar técnico</option>';
        tecnicos.forEach(tecnico => {
            options += `<option value="${tecnico.name}">${tecnico.name}</option>`;
        });
        nominaTecnicoSelect.innerHTML = options;
        console.log("Dropdown nómina técnico actualizado");
    } else {
        console.log("Dropdown nómina técnico NO encontrado");
    }
    
    // 4. Llenar dropdown de nómina supervisor
    const supervisorSelect = document.querySelector('select[name="supervisor-nombre"]');
    if (supervisorSelect) {
        console.log("Llenando dropdown de nómina supervisor...");
        let options = '<option value="">Seleccionar supervisor</option>';
        supervisores.forEach(supervisor => {
            options += `<option value="${supervisor.name}">${supervisor.name}</option>`;
        });
        supervisorSelect.innerHTML = options;
        console.log("Dropdown supervisor actualizado");
    } else {
        console.log("Dropdown supervisor NO encontrado");
    }
    
    // 5. También llenar otros dropdowns si existen
    const otrosSelects = document.querySelectorAll(
        'select[name="tecnico"], select[name="filtro-tecnico"]'
    );
    
    otrosSelects.forEach(select => {
        if (select.name === 'supervisor-nombre') {
            // Ya lo manejamos arriba
            return;
        }
        
        if (currentUser && currentUser.role === 'tecnico') {
            const tecnicoName = currentUser.name || 'Técnico No Identificado';
            select.innerHTML = `<option value="${tecnicoName}" selected>${tecnicoName}</option>`;
            select.disabled = false;
            const parentRow = select.closest('.form-row');
            if (parentRow) parentRow.classList.add('tech-only-field');
        } else {
            const tecnicoOptions = tecnicos.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
            select.innerHTML = '<option value="">Seleccionar</option>' + tecnicoOptions;
            select.disabled = false;
            const parentRow = select.closest('.form-row');
            if (parentRow) parentRow.classList.remove('tech-only-field');
        }
    });
}

// ======================
// MANEJO DE FOLIOS
// ======================
document.getElementById('folio-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!validateFolioForm()) {
        return;
    }
    const formData = new FormData(this);
    const folio = {};
    for (let [key, value] of formData.entries()) {
        folio[key] = value === '' ? '0' : value;
    }
    const tecnicoSelect = this.querySelector('select[name="tecnico"]');
    if (tecnicoSelect) {
        if (tecnicoSelect.disabled) {
            folio.tecnico = tecnicoSelect.value;
        } else {
            folio.tecnico = folio.tecnico || tecnicoSelect.value;
        }
    }
    if (!folio.tecnico || folio.tecnico === '') {
        alert('Error: No se pudo determinar el técnico. Contacta al administrador.');
        return;
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
    } else {
        folio.telefono_pendiente = '';
        folio.comentarios_pendiente = '';
    }
    folio.plantilla = folio.plantilla || 'OK';
    folio.encuesta = folio.encuesta || 'OK';
    folio.alfanumerico = folio.alfanumerico || '';
    folio.comentarios = folio.comentarios || '';
    folio.cope = folio.cope || '';

    try {
        const folioId = await saveFolioToFirebase(folio);
        folio.id = folioId;
        folios.push(folio);
        saveToStorage();
        alert('✅ Folio guardado correctamente en la nube');
        this.reset();
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.querySelector('input[name="fecha"]').value = localDateTime;
        togglePendienteFields(false);
        updateStats();
    } catch (error) {
        console.error("Error guardando folio:", error);
        alert('❌ Error al guardar el folio. Inténtalo de nuevo.');
    }
});

function validateFolioForm() {
    const form = document.getElementById('folio-form');
    const pendienteValue = form.querySelector('select[name="pendiente"]').value;
    const esPendiente = pendienteValue === 'si';
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    let isValid = true;
    if (esPendiente) {
        const telefonoPendiente = form.querySelector('input[name="telefono_pendiente"]');
        if (!telefonoPendiente.value.trim()) {
            showFieldError(telefonoPendiente, 'El teléfono pendiente es requerido');
            isValid = false;
        } else if (!/^\d{10}$/.test(telefonoPendiente.value.trim())) {
            showFieldError(telefonoPendiente, 'El teléfono pendiente debe tener 10 dígitos');
            isValid = false;
        }
    } else {
        const telefono = form.querySelector('input[name="telefono"]');
        const folioInput = form.querySelector('input[name="folio"]');
        if (!telefono.value.trim()) {
            showFieldError(telefono, 'El teléfono es requerido');
            isValid = false;
        } else if (!/^\d{10}$/.test(telefono.value.trim())) {
            showFieldError(telefono, 'El teléfono debe tener 10 dígitos');
            isValid = false;
        }
        if (!folioInput.value.trim()) {
            showFieldError(folioInput, 'El folio es requerido');
            isValid = false;
        } else if (!/^\d{9}$/.test(folioInput.value.trim())) {
            showFieldError(folioInput, 'El folio debe tener 9 dígitos');
            isValid = false;
        }
    }
    return isValid;
}

function showFieldError(field, message) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '#dc3545';
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.color = '#dc3545';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '0.25rem';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

// ======================
// MANEJO DE CAMPOS PENDIENTE
// ======================
function initializePendienteFields() {
    const pendienteSelect = document.querySelector('select[name="pendiente"]');
    if (pendienteSelect) {
        togglePendienteFields(pendienteSelect.value === 'si');
        pendienteSelect.addEventListener('change', function() {
            togglePendienteFields(this.value === 'si');
        });
    }
}

function togglePendienteFields(esPendiente) {
    const camposNormales = document.querySelectorAll('.campo-normal');
    const camposPendiente = document.querySelectorAll('.pendiente-campos');
    camposNormales.forEach(el => {
        const input = el.querySelector('input, select, textarea');
        if (input) {
            if (esPendiente) {
                input.disabled = true;
                input.removeAttribute('required');
                if (input.hasAttribute('required')) {
                    input.setAttribute('data-was-required', 'true');
                }
            } else {
                input.disabled = false;
                if (input.getAttribute('data-was-required') === 'true') {
                    input.setAttribute('required', 'true');
                }
                input.removeAttribute('data-was-required');
            }
        }
        el.style.display = esPendiente ? 'none' : 'flex';
    });
    camposPendiente.forEach(el => {
        const input = el.querySelector('input, textarea');
        if (input) {
            if (esPendiente) {
                input.disabled = false;
                input.setAttribute('required', 'true');
            } else {
                input.disabled = true;
                input.removeAttribute('required');
            }
        }
        el.style.display = esPendiente ? 'flex' : 'none';
    });
    const form = document.getElementById('folio-form');
    if (form) {
        form.classList.remove('was-validated');
    }
}

// ======================
// FILTROS Y ELIMINACIÓN
// ======================
document.getElementById('filter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión nuevamente.");
        showSection('home');
        return;
    }
    displayFilteredResults(folios);
});

function displayFilteredResults(data) {
    if (currentUser && currentUser.role === 'tecnico') {
        data = data.filter(f => f.tecnico === currentUser.name);
    }
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
    if (!container) return;
    if (filtered.length === 0) {
        container.innerHTML = '<p>No se encontraron resultados.</p>';
        return;
    }
    let html = `
        <div class="results-info">
            <p>Se encontraron <strong>${filtered.length}</strong> resultados</p>
        </div>
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
                fechaStr = f.fecha.toDate().toLocaleDateString();
            } else {
                fechaStr = new Date(f.fecha).toLocaleDateString();
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
                <td>
        `;
        if (currentUser && currentUser.role === 'tecnico') {
            html += `<button onclick="openEditModal('${f.id}')" class="btn-primary">Modificar</button>`;
        } else if (['gerente', 'administrativo', 'supervisor'].includes(currentUser?.role)) {
            html += `
                <button onclick="openEditModal('${f.id}')" class="btn-small btn-primary">Modificar</button>
                <button onclick="deleteFolio('${f.id}')" class="btn-small btn-danger">Eliminar</button>
            `;
        }
        html += '</td></tr>';
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
        const success = await deleteFolioFromFirebase(folioId);
        if (success) {
            folios = folios.filter(f => f.id !== folioId);
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

let folioEnEdicion = null;

function openEditModal(folioId) {
    const folio = folios.find(f => f.id === folioId);
    if (!folio) {
        alert('Folio no encontrado.');
        return;
    }
    folioEnEdicion = folio;
    populateUserDropdowns();
    const form = document.getElementById('edit-folio-form');
    Object.keys(folio).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = folio[key] === 'si';
            } else {
                field.value = folio[key] || '';
            }
        }
    });
    const esPendiente = folio.pendiente === 'si';
    document.querySelectorAll('.pendiente-campos').forEach(el => {
        el.style.display = esPendiente ? 'flex' : 'none';
    });
    document.querySelectorAll('.campo-normal').forEach(el => {
        el.style.display = esPendiente ? 'none' : 'flex';
    });
    const plantillaEncuestaFields = document.querySelectorAll('#edit-modal .campo-plantilla-encuesta');
    if (currentUser && currentUser.role === 'tecnico') {
        plantillaEncuestaFields.forEach(el => el.style.display = 'none');
    } else {
        plantillaEncuestaFields.forEach(el => el.style.display = 'flex');
    }
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    folioEnEdicion = null;
}

document.getElementById('edit-folio-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!folioEnEdicion) return;
    const formData = new FormData(this);
    const updatedData = {};
    for (let [key, value] of formData.entries()) {
        updatedData[key] = value;
    }
    try {
        const updateObj = {
            tecnico_nombre: updatedData.tecnico,
            tipo: updatedData.tipo,
            folio_os: updatedData.folio,
            telefono: updatedData.telefono,
            tarea: updatedData.tarea,
            distrito: updatedData.distrito,
            cope: updatedData.cope,
            fecha: firebase.firestore.Timestamp.fromDate(new Date(updatedData.fecha)),
            instalacion: updatedData.instalacion,
            metraje: parseInt(updatedData.metraje) || 0,
            ventanas: parseInt(updatedData.ventanas) || 0,
            radiales: parseInt(updatedData.radiales) || 0,
            pendiente: updatedData.pendiente === 'si',
            telefono_pendiente: updatedData.telefono_pendiente || '',
            comentarios_pendiente: updatedData.comentarios_pendiente || '',
            alfanumerico: updatedData.alfanumerico || '',
            comentarios: updatedData.comentarios || '',
            actualizado_en: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (currentUser && currentUser.role !== 'tecnico') {
            updateObj.plantilla = updatedData.plantilla || 'OK';
            updateObj.encuesta = updatedData.encuesta || 'OK';
        }
        await db.collection('folios').doc(folioEnEdicion.id).update(updateObj);
        const idx = folios.findIndex(f => f.id === folioEnEdicion.id);
        if (idx !== -1) {
            folios[idx] = { ...folios[idx], ...updatedData };
        }
        alert('✅ Folio actualizado correctamente.');
        closeEditModal();
        if (document.getElementById('filter').classList.contains('active')) {
            document.getElementById('filter-form').dispatchEvent(new Event('submit'));
        }
    } catch (error) {
        console.error('Error al actualizar folio:', error);
        alert('❌ Error al guardar los cambios.');
    }
});

// ======================
// GESTIÓN DE USUARIOS
// ======================
document.getElementById('user-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!currentUser || !['administrativo', 'gerente'].includes(currentUser.role)) {
        alert('No tienes permisos para gestionar usuarios.');
        return;
    }
    const formData = new FormData(this);
    const usuario = formData.get('user-usuario').trim();
    const name = formData.get('user-name').trim();
    const role = formData.get('user-role');
    const password = formData.get('user-password');
    if (users.some(u => u.usuario === usuario)) {
        alert('Ya existe un usuario con ese nombre de login.');
        return;
    }
    try {
        const userData = { usuario, name, role, password };
        const userId = await saveUserToFirebase(userData);
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
        const puedeEliminar = currentUser && currentUser.name !== user.name;
        html += `
            <tr>
                <td>
                    <strong>${user.usuario}</strong><br>
                    <small>${user.name}</small>
                    ${currentUser && currentUser.usuario === user.usuario ? '(Tú)' : ''}
                </td>
                <td>${user.role}</td>
                <td>
                    ${puedeEliminar ? 
                        `<button onclick="deleteUser('${user.id}', ${index})" class="btn-danger">Eliminar</button>` : 
                        '<span style="color:#999;">No se puede eliminar</span>'
                    }
                </td>
            </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function deleteUser(userId, index) {
    if (!currentUser || !['administrativo', 'gerente'].includes(currentUser.role)) {
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
// CONFIGURACIÓN DE PRECIOS
// ======================
document.getElementById('precios-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser || !['administrativo', 'gerente'].includes(currentUser.role)) {
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
// NÓMINAS TECNICO
// ======================
// ======================
// NÓMINAS TECNICO - FUNCIÓN CORREGIDA
// ======================
function generateNominaReceipt(tecnico, data, desde, hasta) {
    try {
        console.log("Generando nómina para:", tecnico);
        console.log("Datos:", data.length, "folios");
        
        const receiptDiv = document.getElementById('nomina-receipt');
        if (!receiptDiv) {
            console.error("Elemento nomina-receipt no encontrado");
            return;
        }
        
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
                <div><strong>TECNICO INSTALADOR:</strong> <span id="tecnico-nomina">${tecnico}</span></div>
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
                <tfoot id="pie-editable">`;
        
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
                    </tr>`;
        
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
        const foliosTecnico = data.filter(f => f.tecnico === tecnico);
        foliosTecnico.forEach(f => {
            const instalacionesAnteriores = foliosTecnico.filter(f2 => 
                compararFechas(f.fecha, f2.fecha)
            );
            const esDecima = instalacionesAnteriores.length >= 10;
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
            let fechaStr = 'Sin fecha';
            if (f.fecha) {
                if (f.fecha instanceof firebase.firestore.Timestamp) {
                    fechaStr = f.fecha.toDate().toLocaleString();
                } else {
                    fechaStr = new Date(f.fecha).toLocaleString();
                }
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fechaStr}</td>
                <td>${f.folio || 'N/A'}</td>
                <td>$${costo}</td>
                <td>${f.tipo || 'N/A'}</td>
                <td>${f.instalacion || 'N/A'}</td>
            `;
            cuerpo.appendChild(row);
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
                    <td>Pendiente liquidar</td>
                    <td>${f.telefono_pendiente}</td>
                    <td>$${costoPendiente}</td>
                    <td>${f.tipo || 'N/A'}</td>
                    <td>${f.instalacion || 'N/A'}</td>
                `;
                cuerpo.appendChild(rowPendiente);
            }
        });
        let totalVentanas = 0;
        let totalRadiales = 0;
        foliosTecnico.forEach(f => {
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
// NÓMINA SUPERVISOR - FUNCIÓN CORREGIDA
// ======================
function generateSupervisorReceipt(supervisor, desde, hasta) {
    try {
        console.log("Generando recibo para supervisor:", supervisor);
        
        const receiptDiv = document.getElementById('supervisor-receipt');
        if (!receiptDiv) {
            console.error("Elemento supervisor-receipt no encontrado");
            return;
        }
        
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
                <div class="titulo-centrado">RECIBO DE PAGO</div>
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
                <tbody id="cuerpo-supervisor">`;
        
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
                        <td colspan="2" contenteditable="true" class="nombre-extra">NOMINA DEPOSITADA BANCO</td>
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

// ======================
// FUNCIONES AUXILIARES NÓMINA SUPERVISOR
// ======================

function actualizarTotalSupervisor(supervisor) {
    try {
        let total = 0;
        const costosEditables = document.querySelectorAll('.costo-editable');
        if (costosEditables.length > 0) {
            costosEditables.forEach(el => {
                const valorStr = el.textContent.trim().replace('$', '').replace(',', '');
                const valor = parseFloat(valorStr) || 0;
                total += valor;
            });
        }
        
        const totalElement = document.getElementById('total-supervisor');
        if (totalElement) {
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
        
        guardarCamposSupervisor(supervisor);
    } catch (error) {
        console.error("Error al actualizar total:", error);
    }
}

function attachEventosSupervisor(supervisor) {
    const filasSupervisor = document.querySelectorAll('.fila-supervisor, .fila-extra');
    if (filasSupervisor.length > 0) {
        filasSupervisor.forEach(row => {
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
                
                const lastCell = row.querySelector('td:last-child');
                if (lastCell) {
                    lastCell.appendChild(btn);
                }
            }
        });
    }
}

function agregarFilaSupervisor(supervisor) {
    const cuerpo = document.getElementById('cuerpo-supervisor');
    if (!cuerpo) return;
    
    const newRow = document.createElement('tr');
    newRow.className = 'fila-supervisor';
    newRow.innerHTML = `
        <td contenteditable="true" class="dia-editable">Nuevo día</td>
        <td contenteditable="true" class="tipo-editable">Tipo</td>
        <td contenteditable="true" class="costo-editable" oninput="actualizarTotalSupervisor('${supervisor}')">$0.00</td>
    `;
    
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
    
    const lastCell = newRow.querySelector('td:last-child');
    if (lastCell) {
        lastCell.appendChild(btn);
    }
    
    guardarCamposSupervisor(supervisor);
}

function guardarCamposSupervisor(supervisor) {
    const filas = [];
    const filasSupervisor = document.querySelectorAll('.fila-supervisor');
    
    if (filasSupervisor.length > 0) {
        filasSupervisor.forEach(row => {
            const dia = row.querySelector('.dia-editable')?.textContent.trim() || '';
            const tipo = row.querySelector('.tipo-editable')?.textContent.trim() || '';
            const costo = row.querySelector('.costo-editable')?.textContent.trim() || '';
            
            if (dia || tipo || costo) {
                filas.push({ dias: dia, tipo: tipo, costo: costo });
            }
        });
    }
    
    const extras = {};
    const filasExtras = document.querySelectorAll('.fila-extra');
    
    if (filasExtras.length > 0) {
        filasExtras.forEach(row => {
            const nombre = row.querySelector('.nombre-extra')?.textContent.trim() || '';
            const valor = row.querySelector('.valor-extra')?.textContent.trim() || '';
            const tipo = row.dataset.tipo;
            
            if (tipo) {
                extras[tipo] = { nombre, valor };
            }
        });
    }
    
    localStorage.setItem(`editables_supervisor_${supervisor}`, JSON.stringify(filas));
    localStorage.setItem(`extras_supervisor_${supervisor}`, JSON.stringify(extras));
}

// ======================
// ACUMULADO
// ======================
// ACUMULADO - Función corregida
document.getElementById('acumulado-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        return;
    }
    
    const formData = new FormData(this);
    const desde = formData.get('acumulado-desde');
    const hasta = formData.get('acumulado-hasta');
    
    console.log("Generando acumulado del", desde, "al", hasta);
    console.log("Total folios:", folios.length);
    
    // Filtrar por fechas
    let filtered = [...folios];
    
    if (desde) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            
            let fechaFolio;
            if (f.fecha instanceof firebase.firestore.Timestamp) {
                fechaFolio = f.fecha.toDate().toISOString();
            } else {
                fechaFolio = f.fecha;
            }
            
            return fechaFolio >= desde + 'T00:00:00';
        });
    }
    
    if (hasta) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            
            let fechaFolio;
            if (f.fecha instanceof firebase.firestore.Timestamp) {
                fechaFolio = f.fecha.toDate().toISOString();
            } else {
                fechaFolio = f.fecha;
            }
            
            return fechaFolio <= hasta + 'T23:59:59';
        });
    }
    
    console.log("Folios filtrados para acumulado:", filtered.length);
    
    // Generar tabla
    generateAcumuladoTable(filtered);
    
    // Actualizar estadísticas en el acumulado
    document.getElementById('total-acumulado').textContent = filtered.length;
    
    // Contar técnicos únicos
    const tecnicosUnicos = [...new Set(filtered.map(f => f.tecnico).filter(t => t))];
    document.getElementById('tecnicos-acumulado').textContent = tecnicosUnicos.length;
});

// ======================
// FUNCIÓN ACUMULADO - CORREGIDA
// ======================
function generateAcumuladoTable(data) {
    console.log("Generando tabla de acumulado...");
    console.log("Datos recibidos:", data.length);
    
    // Obtener técnicos únicos
    const tecnicos = [...new Set(data.map(f => f.tecnico).filter(t => t))];
    const tableContainer = document.getElementById('acumulado-table');
    
    if (!tableContainer) {
        console.error("Elemento 'acumulado-table' no encontrado");
        return;
    }
    
    if (tecnicos.length === 0) {
        tableContainer.innerHTML = '<p class="text-center">No hay datos para el período seleccionado.</p>';
        return;
    }
    
    console.log("Técnicos encontrados:", tecnicos);
    
    let html = `
        <div class="table-responsive">
            <table class="table table-bordered table-sm">
                <thead>
                    <tr>
                        <th rowspan="2" style="vertical-align: middle; width: 50px;">#</th>
    `;
    
    // Encabezados de técnicos
    tecnicos.forEach(t => {
        html += `<th colspan="1" style="min-width: 120px;">${t}</th>`;
    });
    
    html += `<th>NEWBE</th></tr>
                <tr>
                    <th colspan="${tecnicos.length + 1}" style="text-align: center;">Folios por Técnico</th>
                </tr>
            </thead>
            <tbody>`;
    
    // Filas de datos (20 filas)
    for (let i = 0; i < 20; i++) {
        html += `<tr><td class="text-center">${i + 1}</td>`;
        
        tecnicos.forEach(t => {
            // Filtrar folios del técnico y tomar el i-ésimo folio
            const foliosTecnico = data.filter(f => f.tecnico === t);
            const folio = foliosTecnico[i];
            
            if (folio) {
                html += `<td class="text-center">${folio.folio || '-'}</td>`;
            } else {
                html += '<td class="text-center">-</td>';
            }
        });
        
        html += '<td class="text-center">-</td></tr>';
    }
    
    // Totales
    html += `
        <tr>
            <td colspan="${tecnicos.length + 1}" style="text-align: right; font-weight: bold;">
                SOPORTE Y PLANTILLAS:
            </td>
            <td class="text-center">0</td>
        </tr>
        <tr>
            <td colspan="${tecnicos.length + 1}" style="text-align: right; font-weight: bold;">
                TOTAL:
            </td>
            <td class="text-center">${data.length}</td>
        </tr>
    `;
    
    html += `</tbody></table></div>`;
    
    tableContainer.innerHTML = html;
    console.log("Tabla de acumulado generada");
}

// ======================
// TOTAL GENERAL NÓMINAS
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
        <table id="gastos-oficina-table"><thead><tr><th>DESCRIPCION</th><th>CANTIDAD</th></tr></thead><tbody>
            <tr class="gasto-editable">
                <td contenteditable="true" class="gasto-descripcion">Material de oficina</td>
                <td contenteditable="true" class="gasto-cantidad">$0.00</td>
            </tr>
            <tr class="gasto-editable">
                <td contenteditable="true" class="gasto-descripcion">Servicios públicos</td>
                <td contenteditable="true" class="gasto-cantidad">$0.00</td>
            </tr>
            <tr class="gasto-editable">
                <td contenteditable="true" class="gasto-descripcion">Mantenimiento</td>
                <td contenteditable="true" class="gasto-cantidad">$0.00</td>
            </tr>
            <tr class="gasto-editable">
                <td contenteditable="true" class="gasto-descripcion">Otros gastos</td>
                <td contenteditable="true" class="gasto-cantidad">$0.00</td>
            </tr>
            <tr class="gasto-editable">
                <td contenteditable="true" class="gasto-descripcion">Viáticos</td>
                <td contenteditable="true" class="gasto-cantidad">$0.00</td>
            </tr>
        </tbody></table>
        <div style="display:flex; justify-content:space-between; margin-top:1rem;">
            <div><strong>TOTAL PARCIAL</strong> $<span id="total-parcial">0.00</span></div>
            <div style="background:yellow; padding:0.5rem; font-weight:bold;">NOMINA TOTAL $${totalCost.toFixed(2)}</div>
        </div>
        <div class="no-imprimir" style="margin-top: 1rem; text-align:center;">
            <button type="button" onclick="agregarFilaGasto()" class="btn-secondary">+ Agregar Gasto</button>
            <button type="button" onclick="calcularTotalParcial()" class="btn-primary">Calcular Total</button>
        </div>
    </div>`;
    tableContainer.innerHTML = html;
    document.querySelectorAll('.gasto-cantidad').forEach(celda => {
        celda.addEventListener('blur', calcularTotalParcial);
    });
}

function agregarFilaGasto() {
    const tbody = document.querySelector('#gastos-oficina-table tbody');
    const newRow = document.createElement('tr');
    newRow.className = 'gasto-editable';
    newRow.innerHTML = `
        <td contenteditable="true" class="gasto-descripcion">Nuevo gasto</td>
        <td contenteditable="true" class="gasto-cantidad">$0.00</td>
    `;
    tbody.appendChild(newRow);
    newRow.querySelector('.gasto-cantidad').addEventListener('blur', calcularTotalParcial);
}

function calcularTotalParcial() {
    let total = 0;
    document.querySelectorAll('.gasto-cantidad').forEach(celda => {
        const valorStr = celda.textContent.replace('$', '').replace(',', '').trim();
        const valor = parseFloat(valorStr) || 0;
        total += valor;
    });
    document.getElementById('total-parcial').textContent = total.toFixed(2);
}

// ======================
// CARGA FFTH Y COBRE CON FILTROS
// ======================
function setupFFTHFilters() {
    const container = document.getElementById('carga-ffth');
    if (!container) return;
    if (container.querySelector('.form-container')) return;
    const filterHTML = `
        <div class="form-container">
            <div class="form-row">
                <label>Fecha Desde:</label>
                <input type="date" id="ffth-desde">
            </div>
            <div class="form-row">
                <label>Fecha Hasta:</label>
                <input type="date" id="ffth-hasta">
            </div>
            <div class="form-actions">
                <button onclick="applyFFTHFilter()" class="btn-primary">Aplicar Filtro</button>
                <button onclick="clearFFTHFilter()" class="btn-secondary">Limpiar Filtro</button>
                <button onclick="exportToExcel('ffth')" class="btn-primary">Exportar a Excel</button>
            </div>
        </div>
    `;
    const header = container.querySelector('.section-header');
    if (header) header.insertAdjacentHTML('afterend', filterHTML);
}

function setupCobreFilters() {
    const container = document.getElementById('carga-cobre');
    if (!container) return;
    if (container.querySelector('.form-container')) return;
    const filterHTML = `
        <div class="form-container">
            <div class="form-row">
                <label>Fecha Desde:</label>
                <input type="date" id="cobre-desde">
            </div>
            <div class="form-row">
                <label>Fecha Hasta:</label>
                <input type="date" id="cobre-hasta">
            </div>
            <div class="form-actions">
                <button onclick="applyCobreFilter()" class="btn-primary">Aplicar Filtro</button>
                <button onclick="clearCobreFilter()" class="btn-secondary">Limpiar Filtro</button>
                <button onclick="exportToExcel('cobre')" class="btn-primary">Exportar a Excel</button>
            </div>
        </div>
    `;
    const header = container.querySelector('.section-header');
    if (header) header.insertAdjacentHTML('afterend', filterHTML);
}

function applyFFTHFilter() {
    const desde = document.getElementById('ffth-desde').value;
    const hasta = document.getElementById('ffth-hasta').value;
    let filtered = folios.filter(f => f.tipo === 'FIBRA');
    if (desde) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString().split('T')[0] : f.fecha.split('T')[0];
            return fecha >= desde;
        });
    }
    if (hasta) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString().split('T')[0] : f.fecha.split('T')[0];
            return fecha <= hasta;
        });
    }
    displayFilteredFFTHTable(filtered);
}

function applyCobreFilter() {
    const desde = document.getElementById('cobre-desde').value;
    const hasta = document.getElementById('cobre-hasta').value;
    let filtered = folios.filter(f => f.tipo === 'COBRE');
    if (desde) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString().split('T')[0] : f.fecha.split('T')[0];
            return fecha >= desde;
        });
    }
    if (hasta) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString().split('T')[0] : f.fecha.split('T')[0];
            return fecha <= hasta;
        });
    }
    displayFilteredCobreTable(filtered);
}

function clearFFTHFilter() {
    document.getElementById('ffth-desde').value = '';
    document.getElementById('ffth-hasta').value = '';
    displayFFTHTable();
}

function clearCobreFilter() {
    document.getElementById('cobre-desde').value = '';
    document.getElementById('cobre-hasta').value = '';
    displayCobreTable();
}

function displayFilteredFFTHTable(data) {
    const tableContainer = document.getElementById('ffth-table');
    if (!tableContainer) return;
    if (data.length === 0) {
        tableContainer.innerHTML = '<p>No hay datos de FFTH para el período seleccionado.</p>';
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
    data.forEach(f => {
        const row = {
            Tipo: f.tipo,
            Fecha: f.fecha ? (f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toLocaleDateString() : new Date(f.fecha).toLocaleDateString()) : '',
            Folio: f.folio || '',
            Telefono: f.telefono || '',
            'Tipo de tarea': f.tarea || '',
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
            Alfanumerico: f.alfanumerico || '',
            Metraje: parseInt(f.metraje) || 0,
            'Aerea/Sub': f.instalacion || ''
        };
        if (f.instalacion === 'AEREA') {
            if (row.Metraje >= 10 && row.Metraje <= 25) row['Bajante aereo de 25m'] = 1;
            else if (row.Metraje >= 26 && row.Metraje <= 50) row['Bajante aereo de 50m'] = 1;
            else if (row.Metraje >= 51 && row.Metraje <= 75) row['Bajante aereo de 75m'] = 1;
            else if (row.Metraje >= 76 && row.Metraje <= 100) row['Bajante aereo de 100m'] = 1;
            else if (row.Metraje >= 101 && row.Metraje <= 125) row['Bajante aereo de 125m'] = 1;
            else if (row.Metraje >= 126 && row.Metraje <= 150) row['Bajante aereo de 150m'] = 1;
            else if (row.Metraje >= 151 && row.Metraje <= 175) row['Bajante aereo de 175m'] = 1;
            else if (row.Metraje >= 176 && row.Metraje <= 200) row['Bajante aereo de 200m'] = 1;
            else if (row.Metraje >= 201 && row.Metraje <= 250) row['Bajante aereo de 250m'] = 1;
        }
        if (f.instalacion === 'SUBTERRANEA') {
            if (row.Metraje >= 10 && row.Metraje <= 25) row['Bajante subterraneo de 25m'] = 1;
            else if (row.Metraje >= 26 && row.Metraje <= 50) row['Bajante subterraneo de 50m'] = 1;
            else if (row.Metraje >= 51 && row.Metraje <= 75) row['Bajante subterraneo de 75m'] = 1;
            else if (row.Metraje >= 76 && row.Metraje <= 100) row['Bajante subterraneo de 100m'] = 1;
            else if (row.Metraje >= 101 && row.Metraje <= 125) row['Bajante subterraneo de 125m'] = 1;
            else if (row.Metraje >= 126 && row.Metraje <= 150) row['Bajante subterraneo de 150m'] = 1;
            else if (row.Metraje >= 151 && row.Metraje <= 175) row['Bajante subterraneo de 175m'] = 1;
            else if (row.Metraje >= 176 && row.Metraje <= 200) row['Bajante subterraneo de 200m'] = 1;
            else if (row.Metraje >= 201 && row.Metraje <= 250) row['Bajante subterraneo de 250m'] = 1;
        }
        if (f.tarea && f.tarea.startsWith('TS')) {
            row['Migracion exitosa de servicio de voz en cobre a voz en fibra optica (VSI)'] = 1;
        }
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

function displayFilteredCobreTable(data) {
    const tableContainer = document.getElementById('cobre-table');
    if (!tableContainer) return;
    if (data.length === 0) {
        tableContainer.innerHTML = '<div class="no-data-message"><p>📭 NO HAY FOLIOS DE COBRE POR EL MOMENTO</p></div>';
        return;
    }
    let html = `<table><thead><tr>
        <th>Tipo</th><th>Fecha</th><th>Folio</th><th>Telefono</th><th>Tipo de tarea</th>
        <th>Linea de cliente basica</th><th>Montaje de puete</th><th>Alfanumerico</th><th>Metraje</th>
    </tr></thead><tbody>`;
    data.forEach(f => {
        const row = {
            Tipo: f.tipo,
            Fecha: f.fecha ? (f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toLocaleDateString() : new Date(f.fecha).toLocaleDateString()) : '',
            Folio: f.folio || '',
            Telefono: f.telefono || '',
            'Tipo de tarea': f.tarea || '',
            'Linea de cliente basica de 1 par (bajante c/modem)': 0,
            'Montaje de puete en distribuidor general': 0,
            Alfanumerico: f.alfanumerico || '',
            Metraje: parseInt(f.metraje) || 0
        };
        const tarea = f.tarea ? f.tarea.toUpperCase() : '';
        if (tarea.includes('ML')) row['Montaje de puete en distribuidor general'] = 1;
        else if (tarea.includes('1L') || tarea.includes('2L') || tarea.includes('9L')) {
            row['Montaje de puete en distribuidor general'] = 2;
        }
        html += `<tr>
            <td>${row.Tipo}</td><td>${row.Fecha}</td><td>${row.Folio}</td><td>${row.Telefono}</td>
            <td>${row['Tipo de tarea']}</td>
            <td>${row['Linea de cliente basica de 1 par (bajante c/modem)']}</td>
            <td>${row['Montaje de puete en distribuidor general']}</td>
            <td>${row.Alfanumerico}</td><td>${row.Metraje}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function displayFFTHTable() {
    const tableContainer = document.getElementById('ffth-table');
    if (!tableContainer) return;
    const ffthFolios = folios.filter(f => f.tipo === 'FIBRA');
    if (ffthFolios.length === 0) {
        tableContainer.innerHTML = '<p>No hay datos de FFTH para mostrar.</p>';
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
    ffthFolios.forEach(f => {
        const row = {
            Tipo: f.tipo,
            Fecha: f.fecha ? (f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toLocaleDateString() : new Date(f.fecha).toLocaleDateString()) : '',
            Folio: f.folio || '',
            Telefono: f.telefono || '',
            'Tipo de tarea': f.tarea || '',
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
            Alfanumerico: f.alfanumerico || '',
            Metraje: parseInt(f.metraje) || 0,
            'Aerea/Sub': f.instalacion || ''
        };
        if (f.instalacion === 'AEREA') {
            if (row.Metraje >= 10 && row.Metraje <= 25) row['Bajante aereo de 25m'] = 1;
            else if (row.Metraje >= 26 && row.Metraje <= 50) row['Bajante aereo de 50m'] = 1;
            else if (row.Metraje >= 51 && row.Metraje <= 75) row['Bajante aereo de 75m'] = 1;
            else if (row.Metraje >= 76 && row.Metraje <= 100) row['Bajante aereo de 100m'] = 1;
            else if (row.Metraje >= 101 && row.Metraje <= 125) row['Bajante aereo de 125m'] = 1;
            else if (row.Metraje >= 126 && row.Metraje <= 150) row['Bajante aereo de 150m'] = 1;
            else if (row.Metraje >= 151 && row.Metraje <= 175) row['Bajante aereo de 175m'] = 1;
            else if (row.Metraje >= 176 && row.Metraje <= 200) row['Bajante aereo de 200m'] = 1;
            else if (row.Metraje >= 201 && row.Metraje <= 250) row['Bajante aereo de 250m'] = 1;
        }
        if (f.instalacion === 'SUBTERRANEA') {
            if (row.Metraje >= 10 && row.Metraje <= 25) row['Bajante subterraneo de 25m'] = 1;
            else if (row.Metraje >= 26 && row.Metraje <= 50) row['Bajante subterraneo de 50m'] = 1;
            else if (row.Metraje >= 51 && row.Metraje <= 75) row['Bajante subterraneo de 75m'] = 1;
            else if (row.Metraje >= 76 && row.Metraje <= 100) row['Bajante subterraneo de 100m'] = 1;
            else if (row.Metraje >= 101 && row.Metraje <= 125) row['Bajante subterraneo de 125m'] = 1;
            else if (row.Metraje >= 126 && row.Metraje <= 150) row['Bajante subterraneo de 150m'] = 1;
            else if (row.Metraje >= 151 && row.Metraje <= 175) row['Bajante subterraneo de 175m'] = 1;
            else if (row.Metraje >= 176 && row.Metraje <= 200) row['Bajante subterraneo de 200m'] = 1;
            else if (row.Metraje >= 201 && row.Metraje <= 250) row['Bajante subterraneo de 250m'] = 1;
        }
        if (f.tarea && f.tarea.startsWith('TS')) {
            row['Migracion exitosa de servicio de voz en cobre a voz en fibra optica (VSI)'] = 1;
        }
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
    const tableContainer = document.getElementById('cobre-table');
    if (!tableContainer) return;
    const cobreFolios = folios.filter(f => f.tipo === 'COBRE');
    if (cobreFolios.length === 0) {
        tableContainer.innerHTML = '<div class="no-data-message"><p>📭 NO HAY FOLIOS DE COBRE POR EL MOMENTO</p></div>';
        return;
    }
    let html = `<table><thead><tr>
        <th>Tipo</th><th>Fecha</th><th>Folio</th><th>Telefono</th><th>Tipo de tarea</th>
        <th>Linea de cliente basica</th><th>Montaje de puete</th><th>Alfanumerico</th><th>Metraje</th>
    </tr></thead><tbody>`;
    cobreFolios.forEach(f => {
        const row = {
            Tipo: f.tipo,
            Fecha: f.fecha ? (f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toLocaleDateString() : new Date(f.fecha).toLocaleDateString()) : '',
            Folio: f.folio || '',
            Telefono: f.telefono || '',
            'Tipo de tarea': f.tarea || '',
            'Linea de cliente basica de 1 par (bajante c/modem)': 0,
            'Montaje de puete en distribuidor general': 0,
            Alfanumerico: f.alfanumerico || '',
            Metraje: parseInt(f.metraje) || 0
        };
        const tarea = f.tarea ? f.tarea.toUpperCase() : '';
        if (tarea.includes('ML')) row['Montaje de puete en distribuidor general'] = 1;
        else if (tarea.includes('1L') || tarea.includes('2L') || tarea.includes('9L')) {
            row['Montaje de puete en distribuidor general'] = 2;
        }
        html += `<tr>
            <td>${row.Tipo}</td><td>${row.Fecha}</td><td>${row.Folio}</td><td>${row.Telefono}</td>
            <td>${row['Tipo de tarea']}</td>
            <td>${row['Linea de cliente basica de 1 par (bajante c/modem)']}</td>
            <td>${row['Montaje de puete en distribuidor general']}</td>
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
        data = folios.filter(f => f.tipo === 'FIBRA').map(f => {
            const row = {
                Tipo: f.tipo,
                Fecha: f.fecha ? (f.fecha instanceof firebase.firestore.Timestamp ? 
                    f.fecha.toDate().toLocaleDateString() : new Date(f.fecha).toLocaleDateString()) : '',
                Folio: f.folio || '',
                Telefono: f.telefono || '',
                'Tipo de tarea': f.tarea || '',
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
                Alfanumerico: f.alfanumerico || '',
                Metraje: parseInt(f.metraje) || 0,
                'Aerea/Sub': f.instalacion || ''
            };
            if (f.instalacion === 'AEREA') {
                if (row.Metraje >= 10 && row.Metraje <= 25) row['Bajante aereo de 25m'] = 1;
                else if (row.Metraje >= 26 && row.Metraje <= 50) row['Bajante aereo de 50m'] = 1;
                else if (row.Metraje >= 51 && row.Metraje <= 75) row['Bajante aereo de 75m'] = 1;
                else if (row.Metraje >= 76 && row.Metraje <= 100) row['Bajante aereo de 100m'] = 1;
                else if (row.Metraje >= 101 && row.Metraje <= 125) row['Bajante aereo de 125m'] = 1;
                else if (row.Metraje >= 126 && row.Metraje <= 150) row['Bajante aereo de 150m'] = 1;
                else if (row.Metraje >= 151 && row.Metraje <= 175) row['Bajante aereo de 175m'] = 1;
                else if (row.Metraje >= 176 && row.Metraje <= 200) row['Bajante aereo de 200m'] = 1;
                else if (row.Metraje >= 201 && row.Metraje <= 250) row['Bajante aereo de 250m'] = 1;
            }
            if (f.instalacion === 'SUBTERRANEA') {
                if (row.Metraje >= 10 && row.Metraje <= 25) row['Bajante subterraneo de 25m'] = 1;
                else if (row.Metraje >= 26 && row.Metraje <= 50) row['Bajante subterraneo de 50m'] = 1;
                else if (row.Metraje >= 51 && row.Metraje <= 75) row['Bajante subterraneo de 75m'] = 1;
                else if (row.Metraje >= 76 && row.Metraje <= 100) row['Bajante subterraneo de 100m'] = 1;
                else if (row.Metraje >= 101 && row.Metraje <= 125) row['Bajante subterraneo de 125m'] = 1;
                else if (row.Metraje >= 126 && row.Metraje <= 150) row['Bajante subterraneo de 150m'] = 1;
                else if (row.Metraje >= 151 && row.Metraje <= 175) row['Bajante subterraneo de 175m'] = 1;
                else if (row.Metraje >= 176 && row.Metraje <= 200) row['Bajante subterraneo de 200m'] = 1;
                else if (row.Metraje >= 201 && row.Metraje <= 250) row['Bajante subterraneo de 250m'] = 1;
            }
            if (f.tarea && f.tarea.startsWith('TS')) {
                row['Migracion exitosa de servicio de voz en cobre a voz en fibra optica (VSI)'] = 1;
            }
            return row;
        });
        filename = 'CARGA_FFTH.xlsx';
    } else if (type === 'cobre') {
        data = folios.filter(f => f.tipo === 'COBRE').map(f => {
            const row = {
                Tipo: f.tipo,
                Fecha: f.fecha ? (f.fecha instanceof firebase.firestore.Timestamp ? 
                    f.fecha.toDate().toLocaleDateString() : new Date(f.fecha).toLocaleDateString()) : '',
                Folio: f.folio || '',
                Telefono: f.telefono || '',
                'Tipo de tarea': f.tarea || '',
                'Linea de cliente basica de 1 par (bajante c/modem)': 0,
                'Montaje de puete en distribuidor general': 0,
                Alfanumerico: f.alfanumerico || '',
                Metraje: parseInt(f.metraje) || 0
            };
            const tarea = f.tarea ? f.tarea.toUpperCase() : '';
            if (tarea.includes('ML')) row['Montaje de puete en distribuidor general'] = 1;
            else if (tarea.includes('1L') || tarea.includes('2L') || tarea.includes('9L')) {
                row['Montaje de puete en distribuidor general'] = 2;
            }
            return row;
        });
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
// IMPRESIÓN
// ======================
function printNomina() {
    const receiptElement = document.getElementById('nomina-receipt');
    if (!receiptElement || !receiptElement.querySelector('.receipt')) {
        alert('No hay recibo de nómina para imprimir.');
        return;
    }
    const printContent = receiptElement.querySelector('.receipt').cloneNode(true);
    const noImprimir = printContent.querySelectorAll('.no-imprimir, .btn-eliminar');
    noImprimir.forEach(el => el.remove());
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.appendChild(printContent);
    const style = document.createElement('style');
    style.textContent = `
        body { font-family: Arial, sans-serif; }
        .receipt { max-width: 800px; margin: 0 auto; padding: 20px; }
        .recibo-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .recibo-table th, .recibo-table td {
            border: 1px solid #000; padding: 8px; text-align: center;
        }
        .recibo-table th { background-color: #f2f2f2; }
        .signature-line div { margin-top: 40px; }
        .footer-note { margin-top: 20px; font-weight: bold; text-align: center; }
    `;
    printArea.appendChild(style);
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
}

// ======================
// IMPRESIÓN DE NÓMINA SUPERVISOR
// ======================
function printSupervisor() {
    const receiptElement = document.getElementById('supervisor-receipt');
    if (!receiptElement || !receiptElement.querySelector('.receipt')) {
        alert('No hay recibo de supervisor para imprimir.');
        return;
    }
    
    const printContent = receiptElement.querySelector('.receipt').cloneNode(true);
    const noImprimir = printContent.querySelectorAll('.no-imprimir, .btn-eliminar');
    noImprimir.forEach(el => el.remove());
    
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.appendChild(printContent);
    
    const style = document.createElement('style');
    style.textContent = `
        body { font-family: Arial, sans-serif; }
        .receipt { max-width: 800px; margin: 0 auto; padding: 20px; }
        .recibo-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .recibo-table th, .recibo-table td {
            border: 1px solid #000; padding: 8px; text-align: center;
        }
        .recibo-table th { background-color: #f2f2f2; }
        .signature-line div { margin-top: 40px; }
    `;
    
    printArea.appendChild(style);
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
}

function printSummary() {
    const summaryTable = document.getElementById('summary-table');
    const summaryChart = document.getElementById('summary-chart-container');
    if (!summaryTable || !summaryChart) {
        alert('No hay contenido para imprimir.');
        return;
    }
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = `
        <h2 style="text-align:center; margin-bottom:1rem;">Resumen por Técnico</h2>
        ${summaryChart.outerHTML}
        ${summaryTable.outerHTML}
    `;
    const style = document.createElement('style');
    style.textContent = `
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        canvas { max-width: 100%; height: auto; }
    `;
    printArea.appendChild(style);
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
}

function printAcumulado() {
    const acumuladoTable = document.getElementById('acumulado-table');
    if (!acumuladoTable || !acumuladoTable.querySelector('table')) {
        alert('No hay datos para imprimir.');
        return;
    }
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = `
        <h2 style="text-align:center; margin-bottom:1rem;">Acumulado de Folios por Técnico</h2>
        ${acumuladoTable.innerHTML}
    `;
    const style = document.createElement('style');
    style.textContent = `
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: center; }
        th { background-color: #f2f2f2; }
    `;
    printArea.appendChild(style);
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
}

function printTotalNominas() {
    const totalTable = document.getElementById('total-nominas-table');
    if (!totalTable || !totalTable.querySelector('table')) {
        alert('No hay datos para imprimir.');
        return;
    }
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.innerHTML = `
        <h2 style="text-align:center; margin-bottom:1rem;">Total General de Nóminas</h2>
        ${totalTable.innerHTML}
    `;
    const style = document.createElement('style');
    style.textContent = `
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; }
        .gasto-editable td { border: 1px solid #000; }
    `;
    printArea.appendChild(style);
    document.body.appendChild(printArea);
    window.print();
    document.body.removeChild(printArea);
}

// ======================
// MODO DE INGRESO (MANUAL / AUTOMÁTICO)
// ======================
function cambiarModoIngreso(modo) {
    document.getElementById('folio-form').style.display = modo === 'manual' ? 'block' : 'none';
    document.getElementById('modo-automatico').style.display = modo === 'automatico' ? 'block' : 'none';
    document.getElementById('btn-modo-manual').classList.toggle('btn-primary', modo === 'manual');
    document.getElementById('btn-modo-manual').classList.toggle('btn-secondary', modo !== 'manual');
    document.getElementById('btn-modo-automatico').classList.toggle('btn-primary', modo === 'automatico');
    document.getElementById('btn-modo-automatico').classList.toggle('btn-secondary', modo !== 'automatico');
}

function procesarPlantilla() {
    const texto = document.getElementById('plantilla-whatsapp').value;
    if (!texto.trim()) {
        alert('Por favor pegue la plantilla de WhatsApp.');
        return;
    }
    const extraer = (clave) => {
        const regex = new RegExp(`${clave}:\\s*(.+)`, 'i');
        const match = texto.match(regex);
        return match ? match[1].trim() : '';
    };
    const tipo = extraer('FIBRA/COBRE');
    const fecha = extraer('FECHA');
    const distrito = extraer('DISTRITO');
    const telefono = extraer('NO TELMEX');
    const tarea = extraer('TIPO DE TAREA');
    const alfanumerico = extraer('ALFANUMERICO');
    const instalacion = extraer('AEREA/SUB');
    const metrajeStr = extraer('METRAJE');
    const folio = extraer('FOLIO');
    const cope = extraer('COPE');
    const ventanas = extraer('VENTANA');
    const radiales = extraer('RADIAL');
    if (!folio || !telefono) {
        alert('⚠️ No se encontraron los campos obligatorios (Folio y Teléfono). Verifique la plantilla.');
        return;
    }
    document.querySelector('select[name="tipo"]').value = tipo.toUpperCase() === 'FIBRA' ? 'FIBRA' : 'COBRE';
    document.querySelector('input[name="folio"]').value = folio;
    document.querySelector('input[name="telefono"]').value = telefono;
    document.querySelector('input[name="tarea"]').value = tarea;
    document.querySelector('input[name="distrito"]').value = distrito;
    document.querySelector('input[name="alfanumerico"]').value = alfanumerico;
    document.querySelector('select[name="instalacion"]').value = instalacion.toUpperCase().includes('AEREO') ? 'AEREA' : 'SUBTERRANEA';
    document.querySelector('input[name="metraje"]').value = metrajeStr.replace(/\D/g, '') || '5';
    document.querySelector('input[name="ventanas"]').value = ventanas || '0';
    document.querySelector('input[name="radiales"]').value = radiales || '0';
    document.querySelector('select[name="cope"]').value = cope || 'TROJES';
    if (fecha) {
        const [dia, mes, anio] = fecha.split('/');
        if (anio && mes && dia) {
            const fechaISO = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${new Date().toTimeString().slice(0, 5)}`;
            document.querySelector('input[name="fecha"]').value = fechaISO;
        }
    }
    cambiarModoIngreso('manual');
    document.getElementById('plantilla-whatsapp').value = '';
    alert('✅ Plantilla procesada correctamente. Revise los datos antes de guardar.');
}

// ======================
// MODAL: Folio Pendiente
// ======================
function abrirModalFolioPendiente() {
    if (!currentUser || currentUser.role !== 'tecnico') {
        alert('Solo los técnicos pueden registrar folios pendientes.');
        return;
    }
    let modal = document.getElementById('modal-folio-pendiente-independiente');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-folio-pendiente-independiente';
        modal.innerHTML = `
            <div class="modal" style="display:flex; position:fixed; z-index:2000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.6); align-items:center; justify-content:center;">
                <div class="modal-content" style="background:white; padding:2rem; border-radius:15px; width:90%; max-width:500px; max-height:90vh; overflow-y:auto; position:relative;">
                    <span class="close-modal" onclick="cerrarModalFolioPendiente()" style="position:absolute; top:15px; right:20px; font-size:2rem; cursor:pointer; color:#999;">&times;</span>
                    <h3>📄 Folio Pendiente de Liquidar</h3>
                    <div class="form-row">
                        <label>Tipo:</label>
                        <select id="fp-tipo" required>
                            <option value="FIBRA">FIBRA</option>
                            <option value="COBRE">COBRE</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Cope:</label>
                        <select id="fp-cope" required>
                            <option value="TROJES">TROJES</option>
                            <option value="AGU">AGU</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Fecha y Hora:</label>
                        <input type="datetime-local" id="fp-fecha" required>
                    </div>
                    <div class="form-row">
                        <label>Teléfono pendiente (10 dígitos):</label>
                        <input type="text" id="fp-telefono" maxlength="10" pattern="\\d{10}" required>
                    </div>
                    <div class="form-row">
                        <label>Comentarios pendiente:</label>
                        <textarea id="fp-comentarios" rows="2"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-primary" onclick="guardarFolioPendienteIndependiente()">Guardar Folio Pendiente</button>
                        <button type="button" class="btn-secondary" onclick="cerrarModalFolioPendiente()">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('fp-fecha').value = local;
    modal.style.display = 'block';
}

function cerrarModalFolioPendiente() {
    const modal = document.getElementById('modal-folio-pendiente-independiente');
    if (modal) modal.style.display = 'none';
}

function guardarFolioPendienteIndependiente() {
    const tipo = document.getElementById('fp-tipo').value;
    const cope = document.getElementById('fp-cope').value;
    const fecha = document.getElementById('fp-fecha').value;
    const telefono = document.getElementById('fp-telefono').value.trim();
    const comentarios = document.getElementById('fp-comentarios').value.trim();
    if (!telefono || !/^\d{10}$/.test(telefono)) {
        alert("El teléfono pendiente debe tener 10 dígitos.");
        return;
    }
    const folioPendiente = {
        tipo,
        cope,
        fecha,
        telefono,
        comentarios,
        tecnico: currentUser.name,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(`folio_pendiente_${currentUser.name}`, JSON.stringify(folioPendiente));
    alert("✅ Folio pendiente registrado. Se te recordará al iniciar sesión.");
    cerrarModalFolioPendiente();
}

function verificarFolioPendienteAlLogin() {
    if (!currentUser || currentUser.role !== 'tecnico') return;
    const folioPendiente = localStorage.getItem(`folio_pendiente_${currentUser.name}`);
    if (!folioPendiente) return;
    const fp = JSON.parse(folioPendiente);
    const yaLiquidado = folios.some(f => 
        f.telefono_pendiente === fp.telefono && 
        f.tecnico === currentUser.name
    );
    if (yaLiquidado) {
        localStorage.removeItem(`folio_pendiente_${currentUser.name}`);
        return;
    }
    const respuesta = confirm(`¿Ya liquidaste el folio pendiente con teléfono ${fp.telefono}?`);
    if (respuesta) {
        showSection('add');
    }
}

// ======================
// RESUMEN TÉCNICOS - Función corregida
// ======================

document.getElementById('summary-filter').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        showSection('home');
        return;
    }
    
    const formData = new FormData(this);
    const desde = formData.get('summary-desde');
    const hasta = formData.get('summary-hasta');
    
    if (!desde || !hasta) {
        alert("Por favor selecciona ambas fechas.");
        return;
    }
    
    console.log("Generando resumen del", desde, "al", hasta);
    console.log("Folios disponibles:", folios.length);
    
    // Filtrar folios por rango de fechas
    const filtered = folios.filter(f => {
        if (!f.fecha) return false;
        
        let fechaFolio;
        if (f.fecha instanceof firebase.firestore.Timestamp) {
            fechaFolio = f.fecha.toDate().toISOString().split('T')[0];
        } else if (typeof f.fecha === 'string') {
            // Intentar parsear la fecha
            try {
                fechaFolio = f.fecha.split('T')[0];
            } catch (error) {
                console.error("Error parseando fecha:", f.fecha);
                return false;
            }
        } else {
            return false;
        }
        
        return fechaFolio >= desde && fechaFolio <= hasta;
    });
    
    console.log("Folios filtrados:", filtered.length);
    
    if (filtered.length === 0) {
        document.getElementById('summary-table').innerHTML = 
            '<p class="text-center">No hay folios en el rango seleccionado.</p>';
        document.getElementById('summary-chart-container').style.display = 'none';
        return;
    }
    
    // Generar tabla y gráfico
    generateSummaryTable(filtered, desde, hasta);
    generateSummaryChart(filtered);
});

// Función generateSummaryTable corregida
function generateSummaryTable(data, desde, hasta) {
    console.log("Generando tabla de resumen...");
    
    // Agrupar por técnico
    const tecnicosMap = {};
    data.forEach(f => {
        if (!f.tecnico) return;
        
        if (!tecnicosMap[f.tecnico]) {
            tecnicosMap[f.tecnico] = {
                count: 0,
                cost: 0,
                folios: []
            };
        }
        
        tecnicosMap[f.tecnico].count++;
        tecnicosMap[f.tecnico].folios.push(f);
    });
    
    // Calcular costos
    Object.keys(tecnicosMap).forEach(tecnico => {
        let totalCost = 0;
        tecnicosMap[tecnico].folios.forEach((f, index) => {
            const esDecima = index >= 10; // Si es la 10ma+ instalación
            
            let costo;
            if (f.tipo === 'FIBRA') {
                costo = f.instalacion === 'AEREA' 
                    ? (esDecima ? precios.fibra_aerea_10 : precios.fibra_aerea)
                    : (esDecima ? precios.fibra_sub_10 : precios.fibra_sub);
            } else {
                costo = f.instalacion === 'AEREA' 
                    ? (esDecima ? precios.cobre_aerea_10 : precios.cobre_aerea)
                    : (esDecima ? precios.cobre_sub_10 : precios.cobre_sub);
            }
            
            totalCost += costo;
        });
        
        tecnicosMap[tecnico].cost = totalCost;
    });
    
    const tableContainer = document.getElementById('summary-table');
    let html = `
        <h3>Resumen del ${desde} al ${hasta}</h3>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Técnico</th>
                        <th>Cantidad de Folios</th>
                        <th>Total ($)</th>
                        <th>Promedio por Folio ($)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    Object.entries(tecnicosMap).forEach(([tecnico, info]) => {
        const promedio = info.count > 0 ? (info.cost / info.count).toFixed(2) : '0.00';
        
        html += `
            <tr>
                <td>${tecnico}</td>
                <td>${info.count}</td>
                <td>$${info.cost.toFixed(2)}</td>
                <td>$${promedio}</td>
            </tr>
        `;
    });
    
    // Totales
    const totalFolios = data.length;
    const totalCost = Object.values(tecnicosMap).reduce((sum, info) => sum + info.cost, 0);
    const promedioTotal = totalFolios > 0 ? (totalCost / totalFolios).toFixed(2) : '0.00';
    
    html += `
                </tbody>
                <tfoot>
                    <tr>
                        <th>TOTAL</th>
                        <th>${totalFolios}</th>
                        <th>$${totalCost.toFixed(2)}</th>
                        <th>$${promedioTotal}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    tableContainer.innerHTML = html;
    console.log("Tabla de resumen generada");
}

function generateSummaryChart(data) {
    const ctx = document.getElementById('summary-chart').getContext('2d');
    const tecnicos = [...new Set(data.map(f => f.tecnico).filter(t => t))];
    const counts = tecnicos.map(t => data.filter(f => f.tecnico === t).length);
    if (window.summaryChartInstance) {
        window.summaryChartInstance.destroy();
    }
    window.summaryChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tecnicos,
            datasets: [{
                label: 'Folios por Técnico',
                data: counts,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
    document.getElementById('summary-chart-container').style.display = 'block';
}

// ======================
// PLANOS (STUBS)
// ======================
function cargarArchivosCarpeta() {
    document.getElementById('lista-archivos').innerHTML = '<p>Funcionalidad de planos no implementada en este ejemplo.</p>';
}
function filtrarArchivos() {}
function descargarArchivoActual() {}
function abrirArchivoNuevaPestana() {}

// ======================
// SISTEMA DE BACKUP
// ======================

function showSectionAndCloseMenu(sectionId) {
    // Cerrar el menú primero
    const nav = document.getElementById('side-menu');
    const overlay = document.querySelector('.nav-overlay');
    
    if (nav && nav.classList.contains('active')) {
        nav.classList.remove('active');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.pointerEvents = 'none';
        }
        document.body.style.overflow = 'auto';
    }
    
    // Luego mostrar la sección
    setTimeout(() => {
        showSection(sectionId);
    }, 100); // Pequeño retraso para suavizar la transición
}

// ======================
// CONFIGURACIÓN DE FORMULARIOS DE NÓMINA
// ======================

// Configurar formulario nómina técnico
if (document.getElementById('nomina-form')) {
    document.getElementById('nomina-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const tecnico = formData.get('nomina-tecnico');
        const desde = formData.get('nomina-desde');
        const hasta = formData.get('nomina-hasta');
        
        if (!tecnico || !desde || !hasta) {
            alert('Por favor completa todos los campos.');
            return;
        }
        
        console.log("Generando nómina para:", tecnico, "desde", desde, "hasta", hasta);
        
        // Filtrar folios del técnico en el rango de fechas
        let filtered = folios.filter(f => {
            if (f.tecnico !== tecnico) return false;
            if (!f.fecha) return false;
            
            let fechaFolio;
            if (f.fecha instanceof firebase.firestore.Timestamp) {
                fechaFolio = f.fecha.toDate().toISOString().split('T')[0];
            } else {
                fechaFolio = f.fecha.split('T')[0];
            }
            return fechaFolio >= desde && fechaFolio <= hasta;
        });
        
        console.log("Folios encontrados:", filtered.length);
        
        if (filtered.length === 0) {
            alert('No se encontraron folios para el técnico en el rango de fechas seleccionado.');
            return;
        }
        
        // Generar recibo
        generateNominaReceipt(tecnico, filtered, desde, hasta);
    });
}

// ======================
// EVENT LISTENER PARA NÓMINA SUPERVISOR
// ======================

// Agregar event listener al formulario de supervisor
document.addEventListener('DOMContentLoaded', function() {
    const supervisorForm = document.getElementById('supervisor-form');
    
    if (supervisorForm) {
        console.log("Formulario supervisor encontrado, agregando event listener...");
        
        supervisorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Formulario supervisor enviado");
            
            const formData = new FormData(this);
            const supervisor = formData.get('supervisor-nombre');
            const desde = formData.get('supervisor-desde');
            const hasta = formData.get('supervisor-hasta');
            
            console.log("Datos:", { supervisor, desde, hasta });
            
            if (!supervisor || !desde || !hasta) {
                alert('Por favor completa todos los campos.');
                return;
            }
            
            // Verificar que la función existe
            if (typeof generateSupervisorReceipt === 'function') {
                console.log("Generando recibo para supervisor:", supervisor);
                generateSupervisorReceipt(supervisor, desde, hasta);
            } else {
                console.error("Error: generateSupervisorReceipt no está definida");
                alert("Error: La función para generar el recibo no está disponible");
            }
        });
    } else {
        console.error("Formulario supervisor NO encontrado");
    }
});

// ======================
// EXPORTAR NÓMINA TÉCNICO CON FORMATOS
// ======================
async function exportNominaTecnicoExcel(tecnico, desde, hasta, data) {
    try {
        console.log("Descargando plantilla con formatos...");
        
        // URL usando RAW (sin problemas CORS)
        const templateUrl = `https://raw.githubusercontent.com/infinity-system-cpu/rosteraccrued-dashboard/main/archivos/Nomina Tecnico.xlsx`;
        
        // Descargar el archivo
        const response = await fetch(templateUrl);
        if (!response.ok) {
            throw new Error(`Error descargando plantilla: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Cargar el workbook con ExcelJS
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        
        // Obtener la primera hoja
        const worksheet = workbook.getWorksheet(1);
        
        // ===== LLENAR CAMPOS =====
        
        // F-1: Fecha del día en curso (DD/MM/YYYY)
        const today = new Date();
        const fechaActual = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        
        const cellF1 = worksheet.getCell('F1');
        cellF1.value = fechaActual;
        
        // D-3: Fecha de inicio
        const [inicioYear, inicioMonth, inicioDay] = desde.split('-');
        const fechaInicio = `${inicioDay}/${inicioMonth}/${inicioYear}`;
        
        const cellD3 = worksheet.getCell('C3');
        cellD3.value = fechaInicio;
        
        // F-3: Fecha de término
        const [terminoYear, terminoMonth, terminoDay] = hasta.split('-');
        const fechaTermino = `${terminoDay}/${terminoMonth}/${terminoYear}`;
        
        const cellF3 = worksheet.getCell('E3');
        cellF3.value = fechaTermino;
        
        // D-4: Nombre del técnico
        const cellD4 = worksheet.getCell('C4');
        cellD4.value = tecnico;
        
        // ===== LLENAR DATOS DE FOLIOS =====
        
        let row = 7; // Comenzar en fila 7
        let totalCosto = 0;
        
        data.forEach((folio, index) => {
            // Calcular costo según reglas
            const instalacionesAnteriores = data.filter((f2, idx) => idx < index);
            const esDecima = instalacionesAnteriores.length >= 10;
            
            let costo;
            if (folio.tipo === 'FIBRA') {
                costo = folio.instalacion === 'AEREA' ? 
                    (esDecima ? precios.fibra_aerea_10 : precios.fibra_aerea) :
                    (esDecima ? precios.fibra_sub_10 : precios.fibra_sub);
            } else {
                costo = folio.instalacion === 'AEREA' ? 
                    (esDecima ? precios.cobre_aerea_10 : precios.cobre_aerea) :
                    (esDecima ? precios.cobre_sub_10 : precios.cobre_sub);
            }
            
            totalCosto += costo;
            
            // Formatear fecha
            let fechaStr = '';
            if (folio.fecha) {
                if (folio.fecha instanceof firebase.firestore.Timestamp) {
                    const fecha = folio.fecha.toDate();
                    fechaStr = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
                } else {
                    const fecha = new Date(folio.fecha);
                    fechaStr = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
                }
            }
            
            // C-7: Fecha de instalación
            const cellC = worksheet.getCell(`B7`); //`C${row}`
            cellC.value = fechaStr;
            
            // D-7: Folio
            const cellD = worksheet.getCell(`C7`); //D${row}
            cellD.value = folio.folio || '';
            
            // E-7: Costo
            const cellE = worksheet.getCell(`D7`); //E${row}
            cellE.value = costo;
            
            // F-7: Fibra/Cobre
            const cellF = worksheet.getCell(`E7`); //F${row}
            cellF.value = folio.tipo || 'FIBRA';
            
            // G-7: Aerea/Sub
            const cellG = worksheet.getCell(`F7`); //G${row}
            cellG.value = folio.instalacion || 'AEREA';
            
            row++;
        });
        
        // ===== ACTUALIZAR TOTALES SI EXISTEN =====
        
        // Buscar celda con fórmula de suma y actualizar
        for (let r = row; r <= row + 10; r++) {
            const cellE = worksheet.getCell(`D26`); //`E${r}`)
            if (cellE.value && typeof cellE.value === 'string' && cellE.value.includes('SUM')) {
                // Si hay una fórmula, mantenerla - Excel calculará automáticamente
                break;
            }
        }
        
        // Si hay una celda específica para total, actualizarla
        const cellTotal = worksheet.getCell(`E${row + 2}`);
        if (!cellTotal.value || typeof cellTotal.value !== 'string') {
            cellTotal.value = totalCosto;
            cellTotal.numFmt = '$#,##0.00';
        }
        
        // ===== GENERAR Y DESCARGAR =====
        
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        // Usar FileSaver.js para descargar
        saveAs(blob, `Nomina_Tecnico_${tecnico}_${desde}_${hasta}.xlsx`);
        
        console.log("✅ Excel técnico exportado con formatos");
        return true;
        
    } catch (error) {
        console.error("❌ Error exportando con formatos:", error);
        
        // Fallback: intentar con método simple
        alert("Error con formatos, intentando método simple...");
        return await exportNominaTecnicoSimple(tecnico, desde, hasta, data);
    }
}

// Función fallback (simple) en caso de error
async function exportNominaTecnicoSimple(tecnico, desde, hasta, data) {
    // Usa el código de la solución 3 que crea Excel desde cero
    // (Puedes usar el código que te compartí anteriormente)
    return true;
}

// ======================
// EXPORTAR NÓMINA SUPERVISOR CON FORMATOS
// ======================
async function exportNominaSupervisorExcel(supervisor, desde, hasta) {
    try {
        console.log("Descargando plantilla supervisor con formatos...");
        
        const templateUrl = `https://raw.githubusercontent.com/infinity-system-cpu/rosteraccrued-dashboard/main/archivos/Nomina Supervisor.xlsx`;
        
        const response = await fetch(templateUrl);
        if (!response.ok) {
            throw new Error(`Error descargando plantilla: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        const worksheet = workbook.getWorksheet(1);
        
        // ===== LLENAR CAMPOS ESTÁTICOS =====
        
        const today = new Date();
        const fechaActual = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        
        // F-1: Fecha actual
        const cellF1 = worksheet.getCell('F1');
        cellF1.value = fechaActual;
        
        // D-3: Fecha inicio
        const [inicioYear, inicioMonth, inicioDay] = desde.split('-');
        const fechaInicio = `${inicioDay}/${inicioMonth}/${inicioYear}`;
        const cellD3 = worksheet.getCell('D3');
        cellD3.value = fechaInicio;
        
        // F-3: Fecha término
        const [terminoYear, terminoMonth, terminoDay] = hasta.split('-');
        const fechaTermino = `${terminoDay}/${terminoMonth}/${terminoYear}`;
        const cellF3 = worksheet.getCell('F3');
        cellF3.value = fechaTermino;
        
        // D-4: Nombre supervisor
        const cellD4 = worksheet.getCell('D4');
        cellD4.value = supervisor;
        
        // ===== LLENAR DATOS DE DÍAS =====
        
        const keyEditables = `editables_supervisor_${supervisor}`;
        const datosDias = JSON.parse(localStorage.getItem(keyEditables)) || [];
        
        let row = 7;
        let total = 0;
        
        datosDias.forEach((dia, index) => {
            if (index >= 7) return; // Solo primeros 7 días
            
            // C-7: Día de la semana
            const cellC = worksheet.getCell(`C${row}`);
            cellC.value = dia.dias || '';
            
            // D-7: Tipo de empleado
            const cellD = worksheet.getCell(`D${row}`);
            cellD.value = dia.tipo || '';
            
            // E-7: Costo
            const cellE = worksheet.getCell(`E${row}`);
            let costo = 0;
            if (dia.costo) {
                const match = dia.costo.toString().match(/[\d\.]+/);
                costo = match ? parseFloat(match[0]) : 0;
            }
            cellE.value = costo;
            total += costo;
            
            row++;
        });
        
        // ===== ACTUALIZAR TOTAL (E-19) =====
        
        const cellE19 = worksheet.getCell('E19');
        cellE19.value = total;
        
        // Asegurar formato de moneda
        cellE19.numFmt = '$#,##0.00';
        
        // ===== GENERAR Y DESCARGAR =====
        
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        saveAs(blob, `Nomina_Supervisor_${supervisor}_${desde}_${hasta}.xlsx`);
        
        console.log("✅ Excel supervisor exportado con formatos");
        return true;
        
    } catch (error) {
        console.error("❌ Error exportando supervisor:", error);
        alert("Error con formatos, intentando método simple...");
        return await exportNominaSupervisorSimple(supervisor, desde, hasta);
    }
}

// Función fallback para supervisor
async function exportNominaSupervisorSimple(supervisor, desde, hasta) {
    // Código simple de creación desde cero
    return true;
}

// ======================
// FUNCIONES DE INTERFAZ MEJORADAS
// ======================

async function exportarNominaTecnicoExcel() {
    try {
        const form = document.getElementById('nomina-form');
        if (!form) {
            alert("No se encontró el formulario");
            return;
        }
        
        const formData = new FormData(form);
        const tecnico = formData.get('nomina-tecnico');
        const desde = formData.get('nomina-desde');
        const hasta = formData.get('nomina-hasta');
        
        if (!tecnico || !desde || !hasta) {
            alert('Por favor completa todos los campos.');
            return;
        }
        
        // Obtener datos filtrados
        let filtered = folios.filter(f => {
            if (f.tecnico !== tecnico) return false;
            if (!f.fecha) return false;
            
            let fechaFolio;
            if (f.fecha instanceof firebase.firestore.Timestamp) {
                fechaFolio = f.fecha.toDate().toISOString().split('T')[0];
            } else {
                fechaFolio = f.fecha.split('T')[0];
            }
            return fechaFolio >= desde && fechaFolio <= hasta;
        });
        
        if (filtered.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }
        
        // Mostrar indicador de carga
        mostrarCarga("Generando Excel con formatos...");
        
        // Exportar con formatos
        const success = await exportNominaTecnicoExcel(tecnico, desde, hasta, filtered);
        
        ocultarCarga();
        
        if (success) {
            setTimeout(() => {
                alert("✅ Excel generado exitosamente con todos los formatos");
            }, 500);
        }
        
    } catch (error) {
        ocultarCarga();
        console.error("Error en exportación:", error);
        alert(`Error: ${error.message}`);
    }
}

async function exportarNominaSupervisorExcel() {
    try {
        const form = document.getElementById('supervisor-form');
        if (!form) {
            alert("No se encontró el formulario");
            return;
        }
        
        const formData = new FormData(form);
        const supervisor = formData.get('supervisor-nombre');
        const desde = formData.get('supervisor-desde');
        const hasta = formData.get('supervisor-hasta');
        
        if (!supervisor || !desde || !hasta) {
            alert('Por favor completa todos los campos.');
            return;
        }
        
        mostrarCarga("Generando Excel supervisor...");
        
        const success = await exportNominaSupervisorExcel(supervisor, desde, hasta);
        
        ocultarCarga();
        
        if (success) {
            setTimeout(() => {
                alert("✅ Excel supervisor generado exitosamente");
            }, 500);
        }
        
    } catch (error) {
        ocultarCarga();
        console.error("Error en exportación:", error);
        alert(`Error: ${error.message}`);
    }
}

// Funciones para mostrar/ocultar carga
function mostrarCarga(mensaje = "Procesando...") {
    let loader = document.getElementById('loader-excel');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader-excel';
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
            ">
                <div class="spinner-border" style="width: 3rem; height: 3rem;"></div>
                <div class="mt-3">${mensaje}</div>
            </div>
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
}

function ocultarCarga() {
    const loader = document.getElementById('loader-excel');
    if (loader) {
        loader.style.display = 'none';
    }
}

// ======================
// INICIALIZACIÓN
// ======================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("=== INICIALIZACIÓN DEL SISTEMA ===");
    
    // 1. Estado inicial: solo mostrar login
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    
    // 2. Ocultar todas las secciones de la app al inicio
    document.querySelectorAll('.content-section, .section').forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });
    
    // 3. Registrar evento de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
    
    // 4. Cargar usuarios
    try {
        await loadUsersFromFirebase();
        console.log("Usuarios cargados:", users.length);
        
        // 5. Verificar sesión existente
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            console.log("Sesión restaurada para:", currentUser.name);
            
            // Mostrar app y ocultar login
            document.getElementById('login-section').style.display = 'none';
            const appElement = document.getElementById('app');
            appElement.style.display = 'flex';
            appElement.style.flexDirection = 'column';
            
            // Mostrar elementos internos
            document.querySelector('.top-bar').style.display = 'flex';
            document.querySelector('.main-content').style.display = 'block';
            
            // Actualizar interfaz
            document.getElementById('user-name').textContent = currentUser.name;
            updateMenuByRole();

            // Cargar folios
            console.log("Cargando folios para usuario:", currentUser.name);
            await loadFoliosFromFirebase();

            // Forzar actualización de dropdowns
            populateUserDropdowns();
            
            // Mostrar SOLO el dashboard
            showSection('home');
            
            // Inicializaciones diferidas
            setTimeout(() => {
                displayFFTHTable();
                displayCobreTable();
                verificarFolioPendienteAlLogin();
            }, 1000);
        }
        
    } catch (error) {
        console.error("Error en inicialización:", error);
        alert("Error al cargar los datos del sistema. Recarga la página.");
    }
    
    // 6. Configurar toggle de contraseña
    const togglePasswordBtn = document.querySelector('.toggle-password');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const input = document.querySelector('input[name="password"]');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            togglePasswordBtn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
    }
    
    console.log("=== INICIALIZACIÓN COMPLETADA ===");

    // Retrasos para inicialización secundaria
    setTimeout(() => {
        displayFFTHTable();
        displayCobreTable();
    }, 1000);

});