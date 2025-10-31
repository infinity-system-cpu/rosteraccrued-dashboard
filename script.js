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
    const nav = document.getElementById('main-nav');
    const overlay = document.getElementById('nav-overlay');
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser'); // 👈 Añadir esto
    document.getElementById('main-header').style.display = 'none';
    document.querySelector('main').style.display = 'none';
    document.getElementById('login-section').style.display = 'flex';
    
    // Limpiar formulario de login
    document.getElementById('login-form').reset();
}

function showSection(sectionId) {
    console.log("Intentando mostrar sección:", sectionId, "Usuario actual:", currentUser);
    
    if (!currentUser) {
        console.log("No hay usuario logueado, redirigiendo al login");
        alert("Debes iniciar sesión primero.");
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('main-header').style.display = 'none';
        document.querySelector('main').style.display = 'none';
        return;
    }
    
    // Cerrar menú móvil
    toggleMenu();
    
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error("Sección no encontrada:", sectionId);
        showSection('home');
        return;
    }
    
    // Actualizar menú según permisos
    updateMenuByRole();
    
    // 🔥 NUEVO: Actualizar visibilidad de campos según rol
    if (sectionId === 'add') {
        populateUserDropdowns();
        togglePlantillaEncuestaFields();
    }
    
    // Ejecutar funciones específicas de cada sección
    switch(sectionId) {
        case 'home':
            updateDashboard();
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
            console.log("Cargando sección de filtros...");
            initializeFilterSection();
            break;
        case 'planos':
            // Inicializar visor de planos
            setTimeout(() => {
                document.getElementById('carpeta-select').value = 'planos';
                cargarArchivosCarpeta('planos');
            }, 100);
            break;
        case 'summary':
            // Permitir acceso a técnicos también
            if (currentUser && ['supervisor', 'gerente', 'administrativo'].includes(currentUser.role)) {
                console.log("Acceso permitido a Resumen Técnicos");
            }
            break;
        case 'base':
            initializeBaseSection();
            break;
    }
}

// ======================
// CONTROL DE CAMPOS PLANTILLA Y ENCUESTA
// ======================

function togglePlantillaEncuestaFields() {
    const plantillaField = document.querySelector('.form-row:has(select[name="plantilla"])');
    const encuestaField = document.querySelector('.form-row:has(select[name="encuesta"])');
    
    if (currentUser && currentUser.role === 'tecnico') {
        // Ocultar para técnicos
        if (plantillaField) plantillaField.style.display = 'none';
        if (encuestaField) encuestaField.style.display = 'none';
    } else {
        // Mostrar para otros roles
        if (plantillaField) plantillaField.style.display = 'flex';
        if (encuestaField) encuestaField.style.display = 'flex';
    }
}

// ======================
// SECCIÓN BASE DE FOLIOS
// ======================

let folioSeleccionado = null;

function initializeBaseSection() {
    console.log("Inicializando sección BASE...");
    
    // Configurar fechas por defecto
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
    
    document.getElementById('base-desde').value = oneWeekAgoStr;
    document.getElementById('base-hasta').value = today;
    
    // Poblar dropdown de técnicos
    populateBaseTecnicoDropdown();
    
    // Configurar event listeners
    document.getElementById('base-filter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        applyBaseFilter();
    });
    
    // Ocultar controles de edición inicialmente
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
    
    // Ocultar controles de edición al cargar nuevos resultados
    document.getElementById('base-edit-controls').style.display = 'none';
    folioSeleccionado = null;
}

function selectFolioForEdit(folioId, index) {
    // Remover selección anterior
    document.querySelectorAll('#base-table tr').forEach(row => {
        row.classList.remove('selected');
    });
    
    // Agregar selección actual
    const selectedRow = document.querySelector(`tr[data-folio-id="${folioId}"]`);
    if (selectedRow) {
        selectedRow.classList.add('selected');
    }
    
    // Encontrar el folio seleccionado
    folioSeleccionado = folios.find(f => f.id === folioId);
    
    if (folioSeleccionado) {
        // Llenar los campos de edición
        document.getElementById('edit-plantilla').value = folioSeleccionado.plantilla || 'OK';
        document.getElementById('edit-encuesta').value = folioSeleccionado.encuesta || 'OK';
        
        // Mostrar controles de edición
        document.getElementById('base-edit-controls').style.display = 'block';
        
        console.log("Folio seleccionado para edición:", folioSeleccionado);
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
        // Actualizar en Firebase
        await db.collection('folios').doc(folioSeleccionado.id).update({
            plantilla: nuevaPlantilla,
            encuesta: nuevaEncuesta,
            actualizado_en: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Actualizar en el array local
        const folioIndex = folios.findIndex(f => f.id === folioSeleccionado.id);
        if (folioIndex !== -1) {
            folios[folioIndex].plantilla = nuevaPlantilla;
            folios[folioIndex].encuesta = nuevaEncuesta;
        }
        
        // Actualizar la tabla
        const selectedRow = document.querySelector(`tr[data-folio-id="${folioSeleccionado.id}"]`);
        if (selectedRow) {
            const cells = selectedRow.cells;
            cells[5].textContent = nuevaPlantilla; // Columna Plantilla
            cells[6].textContent = nuevaEncuesta;  // Columna Encuesta
        }
        
        alert('✅ Cambios guardados correctamente');
        
        // Ocultar controles de edición
        document.getElementById('base-edit-controls').style.display = 'none';
        folioSeleccionado = null;
        
        // Remover selección
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
    
    // Remover selección
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
    console.log("Inicializando sección de filtros...");
    
    // Verificar si hay folios cargados
    if (folios.length === 0) {
        console.log("No hay folios cargados, cargando desde Firebase...");
        loadFoliosFromFirebase().then(() => {
            console.log("Folios cargados después de inicializar filtros:", folios.length);
            // Una vez cargados los folios, aplicar filtro por defecto
            applyDefaultFilter();
        }).catch(error => {
            console.error("Error cargando folios para filtro:", error);
            document.getElementById('filter-results').innerHTML = 
                '<p>Error al cargar los datos. Intenta recargar la página.</p>';
        });
    } else {
        console.log("Folios ya cargados:", folios.length);
        // Ya hay folios cargados, aplicar filtro por defecto
        applyDefaultFilter();
    }
}

function applyDefaultFilter() {
    console.log("Aplicando filtro por defecto...");
    
    // Mostrar todos los folios inicialmente
    displayFilteredResults(folios);
    
    // Configurar fechas por defecto en el formulario de filtro
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
            console.log("Sesión recuperada:", currentUser);
            
            // Ocultar login y mostrar interfaz principal
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('main-header').style.display = 'block';
            document.querySelector('main').style.display = 'block';
            
            // Actualizar interfaz
            document.getElementById('current-user-name').textContent = currentUser.name;

            setTimeout(() => {
                verificarFolioPendienteAlLogin();
            }, 1000);

            updateMenuByRole();
            
            return true;
        }
    } catch (error) {
        console.error("Error recuperando sesión:", error);
        localStorage.removeItem('currentUser'); // Limpiar sesión corrupta
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
    
    // Ocultar todos los items primero
    document.querySelectorAll('.nav-item').forEach(item => {
        item.style.display = 'none';
    });
    
    // Mostrar items según permisos
    Object.keys(menuItems).forEach(sectionId => {
        const shouldShow = menuItems[sectionId] === true || 
                          menuItems[sectionId].includes(currentUser.role);
        
        const navItem = document.querySelector(`.nav-item[onclick="showSection('${sectionId}')"]`);
        if (navItem && shouldShow) {
            navItem.style.display = 'flex';
        }
    });
    
    // 🔥 NUEVO: Actualizar dropdowns después de cambiar permisos
    populateUserDropdowns();
}

function updateDashboard() {
    // Actualizar información del usuario
    document.getElementById('user-role').textContent = currentUser.role.toUpperCase();
    document.getElementById('current-user-name').textContent = currentUser.name;
    
    // Cargar actividad reciente
    loadRecentActivity();
}

function loadRecentActivity() {
    const recentFolios = folios.slice(-5).reverse();
    const activityList = document.getElementById('recent-folios');
    
    if (recentFolios.length === 0) {
        activityList.innerHTML = '<p>No hay actividad reciente</p>';
        return;
    }
    
    let html = '';
    recentFolios.forEach(folio => {
        const fecha = folio.fecha instanceof firebase.firestore.Timestamp ? 
            folio.fecha.toDate().toLocaleDateString() : 
            new Date(folio.fecha).toLocaleDateString();
        
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
}

// ======================
// FUNCIONES DE FIREBASE - USUARIOS
// ======================

async function loadUsersFromFirebase() {
    try {
        console.log("Cargando usuarios desde Firebase...");

        // 🔥 VERIFICAR CONEXIÓN PRIMERO
        console.log("Verificando conexión a Firebase...");
        const testSnapshot = await db.collection('users').limit(1).get();
        console.log("✅ Conexión Firebase OK");

        const snapshot = await db.collection('users').get();
        console.log(`📊 Usuarios encontrados en Firebase: ${snapshot.size}`);
        users = [];
        
        snapshot.forEach(doc => {
            const userData = doc.data();
            console.log(`👤 Usuario cargado: ${userData.name} (${userData.role})`);
            users.push({
                id: doc.id,
                name: userData.name,
                usuario: userData.usuario,
                role: userData.role,
                password: userData.password
            });
        });
        
        console.log(`Se cargaron ${users.length} usuarios desde Firebase`);
        
        // 🔥 MODIFICADO: Solo crear usuarios por defecto si realmente no hay NINGUNO
        if (users.length === 0) {
            console.warn("⚠️ No hay usuarios en Firebase, creando usuarios por defecto...");
            await createDefaultUsers();
        } else {
            console.log("🎉 Usuarios cargados exitosamente desde Firebase");
        }
        
        populateUserDropdowns();
        updateUsersList();
        return users;

    } catch (error) {
        console.error("Error cargando usuarios desde Firebase:", error);

        // 🔥 MEJOR DIAGNÓSTICO DEL ERROR
        if (error.code === 'failed-precondition') {
            console.error("❌ Firestore no está habilitado para este proyecto");
            alert('Error: Firestore no está habilitado. Ve a Firebase Console y habilita Firestore.');
        } else if (error.code === 'permission-denied') {
            console.error("❌ Permisos denegados - Revisa las reglas de seguridad");
            alert('Error de permisos. Revisa las reglas de seguridad de Firestore.');
        } else if (error.code === 'unavailable') {
            console.error("❌ Firebase no disponible - Verifica tu conexión");
            alert('Error de conexión con Firebase. Verifica tu internet.');
        } else {
            console.error("❌ Error desconocido:", error.message);
        }

        // 🔥 MODIFICADO: No usar usuarios por defecto automáticamente
        console.log("🔄 Intentando cargar usuarios desde localStorage...");
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            users = JSON.parse(savedUsers);
            console.log(`📁 Usuarios cargados desde localStorage: ${users.length}`);
        } else {
            console.warn("⚠️ No hay usuarios en localStorage, usando array vacío");
            users = [];
        }

        populateUserDropdowns();
        return users;
    }
}

// Agrega esta función para diagnóstico completo
async function diagnosticFirebaseCompleto() {
    console.log("=== 🔍 DIAGNÓSTICO COMPLETO FIREBASE ===");
    
    try {
        // 1. Verificar configuración Firebase
        console.log("1. Verificando configuración Firebase...");
        if (!firebase.apps.length) {
            console.error("❌ Firebase no está inicializado");
            return;
        }
        console.log("✅ Firebase inicializado");
        
        // 2. Verificar Firestore
        console.log("2. Verificando Firestore...");
        const db = firebase.firestore();
        console.log("✅ Firestore disponible");
        
        // 3. Verificar conexión
        console.log("3. Verificando conexión...");
        const testQuery = await db.collection('users').limit(1).get();
        console.log("✅ Conexión Firestore OK");
        
        // 4. Contar usuarios
        console.log("4. Contando usuarios...");
        const usersSnapshot = await db.collection('users').get();
        console.log(`✅ Usuarios en Firebase: ${usersSnapshot.size}`);
        
        // 5. Mostrar usuarios
        console.log("5. Listando usuarios:");
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            console.log(`   - ${user.name} (${user.role}) - ID: ${doc.id}`);
        });
        
        // 6. Verificar colección folios
        console.log("6. Verificando colección folios...");
        const foliosSnapshot = await db.collection('folios').get();
        console.log(`✅ Folios en Firebase: ${foliosSnapshot.size}`);
        
        console.log("=== ✅ DIAGNÓSTICO COMPLETADO ===");
        
    } catch (error) {
        console.error("❌ ERROR en diagnóstico:", error);
        console.error("Código de error:", error.code);
        console.error("Mensaje:", error.message);
    }
}

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
        return [];
    }
}

async function saveFolioToFirebase(folioData) {
    try {
        console.log("🔄 Preparando datos para Firebase...");
        console.log("Datos recibidos:", folioData);
        
        // 🔥 VALIDACIÓN EXHAUSTIVA DE TODOS LOS CAMPOS
        const firebaseFolio = {
            tecnico_id: 1,
            tecnico_nombre: folioData.tecnico ? String(folioData.tecnico) : 'Técnico No Especificado', // 🔥 CRÍTICO
            tipo: folioData.tipo ? String(folioData.tipo) : 'FIBRA',
            folio_os: folioData.folio ? String(folioData.folio) : '000000000',
            telefono: folioData.telefono ? String(folioData.telefono) : '0000000000',
            tarea: folioData.tarea ? String(folioData.tarea) : 'Sin tarea',
            distrito: folioData.distrito ? String(folioData.distrito) : 'Sin distrito',
            cope: folioData.cope ? String(folioData.cope) : '', // 🔥 NUEVO
            fecha: folioData.fecha ? 
                firebase.firestore.Timestamp.fromDate(new Date(folioData.fecha)) : 
                firebase.firestore.FieldValue.serverTimestamp(),
            instalacion: folioData.instalacion ? String(folioData.instalacion) : 'AEREA',
            metraje: parseInt(folioData.metraje) || 0,
            alfanumerico: folioData.alfanumerico ? String(folioData.alfanumerico) : '',
            comentarios: folioData.comentarios ? String(folioData.comentarios) : '',
            ventanas: parseInt(folioData.ventanas) || 0,
            radiales: parseInt(folioData.radiales) || 0,
            pendiente: folioData.pendiente === 'si',
            telefono_pendiente: folioData.telefono_pendiente ? String(folioData.telefono_pendiente) : '',
            comentarios_pendiente: folioData.comentarios_pendiente ? String(folioData.comentarios_pendiente) : '',
            plantilla: folioData.plantilla ? String(folioData.plantilla) : 'OK',
            encuesta: folioData.encuesta ? String(folioData.encuesta) : 'OK',
            latitud: null,
            longitud: null,
            creado_en: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 🔥 VALIDACIÓN FINAL ANTES DE ENVIAR
        console.log("✅ Datos validados para Firebase:", firebaseFolio);
        
        // Verificar que ningún campo sea undefined
        Object.keys(firebaseFolio).forEach(key => {
            if (firebaseFolio[key] === undefined) {
                console.error(`❌ CAMPO UNDEFINED: ${key}`);
                throw new Error(`Campo ${key} es undefined`);
            }
        });

        const docRef = await db.collection('folios').add(firebaseFolio);
        console.log("🎉 Folio guardado en Firebase con ID:", docRef.id);
        
        return docRef.id;
    } catch (error) {
        console.error("❌ Error guardando folio en Firebase:", error);
        console.error("📦 Datos que causaron el error:", folioData);
        throw error;
    }
}

async function deleteFolioFromFirebase(folioId) {
    // 🔥 AGREGAR VALIDACIÓN EXTRA DE SEGURIDAD
    if (!currentUser) {
        console.error("Intento de eliminación sin usuario autenticado");
        return false;
    }
    
    // 🔥 REGISTRAR QUIÉN ELIMINA Y CUÁNDO
    console.warn(`⚠️ ELIMINACIÓN SOLICITADA - Usuario: ${currentUser.name}, Folio: ${folioId}, Hora: ${new Date().toISOString()}`);
    
    // 🔥 CONFIRMACIÓN EXTRA PARA ELIMINACIONES
    if (!confirm('¿ESTÁ SEGURO de eliminar este folio? Esta acción no se puede deshacer.')) {
        return false;
    }
    
    try {
        await db.collection('folios').doc(folioId).delete();
        console.log(`✅ Folio eliminado de Firebase: ${folioId} por usuario: ${currentUser.name}`);
        return true;
    } catch (error) {
        console.error("Error eliminando folio de Firebase:", error);
        return false;
    }
}

// ======================
// FUNCIONES DE ALMACENAMIENTO
// ======================

async function loadFromStorage() {
    try {
        // Cargar usuarios desde Firebase
        await loadUsersFromFirebase();
        
        // Cargar folios desde Firebase
        await loadFoliosFromFirebase();
        
        // Cargar precios y plantilla desde localStorage
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
    const form = e.target;
    const usernameInput = form.usuario.value.trim();
    const password = form.password.value;
    console.log("Intentando login con:", usernameInput);

    if (users.length === 0) {
        console.error("No hay usuarios cargados");
        alert('Error: No se pudieron cargar los usuarios. Recarga la página.');
        return;
    }

    // 🔥 CORREGIDO: Buscar por el campo 'usuario', NO por 'name'
    const user = users.find(u => 
        u.usuario && u.usuario.trim().toLowerCase() === usernameInput.toLowerCase() && 
        u.password === password
    );

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('main-header').style.display = 'block';
        document.querySelector('main').style.display = 'block';
        document.getElementById('current-user-name').textContent = user.name; // 👈 sigue mostrando 'name'
        updateMenuByRole();

        // 🔥 Verificar folio pendiente después del login
        setTimeout(() => {
            verificarFolioPendienteAlLogin();
        }, 1000);

        showSection('home');
        console.log("Login exitoso:", user);
        setTimeout(() => createBackup(), 3000);
    } else {
        console.log("Login fallido - usuario no encontrado o contraseña incorrecta");
        alert('Usuario o contraseña incorrectos');
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
    // 🔥 Incluir gerentes y administrativos como supervisores válidos
    const supervisores = users.filter(u => 
        ['supervisor', 'gerente', 'administrativo'].includes(u.role)
    );

    tecnicoSelects.forEach(select => {
        // Caso especial: dropdown de supervisor (ahora incluye gerente y administrativo)
        if (select.name === 'supervisor-nombre') {
            const supervisorOptions = supervisores.map(u => 
                `<option value="${u.name}">${u.name}</option>`
            ).join('');
            select.innerHTML = '<option value="">Seleccionar</option>' + supervisorOptions;
            return;
        }

        // Caso: usuario es técnico → solo su nombre
        if (currentUser && currentUser.role === 'tecnico') {
            const tecnicoName = currentUser.name || 'Técnico No Identificado';
            select.innerHTML = `<option value="${tecnicoName}" selected>${tecnicoName}</option>`;
            select.disabled = false;
            select.title = "Como técnico, solo puedes ver tus propios folios";
            const parentRow = select.closest('.form-row');
            if (parentRow) parentRow.classList.add('tech-only-field');
            return;
        }

        // Caso: otros roles → todos los técnicos
        const tecnicoOptions = tecnicos.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
        select.innerHTML = '<option value="">Seleccionar</option>' + tecnicoOptions;
        select.disabled = false;
        const parentRow = select.closest('.form-row');
        if (parentRow) parentRow.classList.remove('tech-only-field');
    });
}

// ======================
// MANEJO DE FOLIOS - ACTUALIZADO
// ======================

document.getElementById('folio-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validar manualmente el formulario
    if (!validateFolioForm()) {
        return;
    }
    
    const formData = new FormData(this);
    const folio = {};
    
    for (let [key, value] of formData.entries()) {
        folio[key] = value === '' ? '0' : value;
    }
    
    // 🔥 CORRECIÓN CRÍTICA: Asegurar que el campo tecnico tenga valor
    const tecnicoSelect = this.querySelector('select[name="tecnico"]');
    if (tecnicoSelect) {
        // Si el select está deshabilitado (para técnicos), obtener el valor directamente
        if (tecnicoSelect.disabled) {
            folio.tecnico = tecnicoSelect.value;
            console.log("🔧 Campo técnico (deshabilitado):", folio.tecnico);
        } else {
            // Para selects normales, usar el valor del FormData
            folio.tecnico = folio.tecnico || tecnicoSelect.value;
            console.log("🔧 Campo técnico (normal):", folio.tecnico);
        }
    }
    
    // 🔥 VALIDACIÓN EXTRA: Asegurar que tecnico no sea undefined
    if (!folio.tecnico || folio.tecnico === '') {
        console.error("❌ ERROR: Campo tecnico es undefined o vacío");
        alert('Error: No se pudo determinar el técnico. Contacta al administrador.');
        return;
    }
    
    if (!folio.fecha) {
        folio.fecha = new Date().toISOString();
    }
    
    // Convertir números
    folio.ventanas = parseInt(folio.ventanas) || 0;
    folio.radiales = parseInt(folio.radiales) || 0;
    folio.pendiente = folio.pendiente || 'no';
    
    // Solo procesar campos pendiente si es pendiente
    if (folio.pendiente === 'si') {
        folio.telefono_pendiente = folio.telefono_pendiente || '';
        folio.comentarios_pendiente = folio.comentarios_pendiente || '';
    } else {
        folio.telefono_pendiente = '';
        folio.comentarios_pendiente = '';
    }
    
    // 🔥 CORRECIÓN: Asegurar que los campos opcionales tengan valores por defecto
    folio.plantilla = folio.plantilla || 'OK';
    folio.encuesta = folio.encuesta || 'OK';
    folio.alfanumerico = folio.alfanumerico || '';
    folio.comentarios = folio.comentarios || '';
    folio.cope = folio.cope || ''; // 🔥 NUEVO: Campo que faltaba
    
    console.log("📦 Datos del folio a guardar:", folio);
    
    try {
        const folioId = await saveFolioToFirebase(folio);
        folio.id = folioId;
        
        folios.push(folio);
        saveToStorage();
        
        alert('✅ Folio guardado correctamente en la nube');
        this.reset();
        
        // Restablecer fecha actual
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.querySelector('input[name="fecha"]').value = localDateTime;
        
        // Restablecer estado de campos pendiente
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
    
    // Limpiar mensajes de error previos
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    let isValid = true;
    
    if (esPendiente) {
        // Validar campos pendiente
        const telefonoPendiente = form.querySelector('input[name="telefono_pendiente"]');
        if (!telefonoPendiente.value.trim()) {
            showFieldError(telefonoPendiente, 'El teléfono pendiente es requerido');
            isValid = false;
        } else if (!/^\d{10}$/.test(telefonoPendiente.value.trim())) {
            showFieldError(telefonoPendiente, 'El teléfono pendiente debe tener 10 dígitos');
            isValid = false;
        }
    } else {
        // Validar campos normales
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
    // Remover error previo si existe
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Agregar estilo de error al campo
    field.style.borderColor = '#dc3545';
    
    // Crear elemento de error
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
        // Configurar el estado inicial
        togglePendienteFields(pendienteSelect.value === 'si');
        
        // Agregar event listener
        pendienteSelect.addEventListener('change', function() {
            togglePendienteFields(this.value === 'si');
        });
    }
}

function togglePendienteFields(esPendiente) {
    console.log("Cambiando estado de campos pendiente:", esPendiente);
    
    const camposNormales = document.querySelectorAll('.campo-normal');
    const camposPendiente = document.querySelectorAll('.pendiente-campos');
    
    // Manejar campos normales
    camposNormales.forEach(el => {
        const input = el.querySelector('input, select, textarea');
        if (input) {
            if (esPendiente) {
                // Cuando es pendiente, deshabilitar y quitar required
                input.disabled = true;
                input.removeAttribute('required');
                // Guardar el estado anterior de required
                if (input.hasAttribute('required')) {
                    input.setAttribute('data-was-required', 'true');
                }
            } else {
                // Cuando no es pendiente, habilitar y restaurar required si era requerido
                input.disabled = false;
                if (input.getAttribute('data-was-required') === 'true') {
                    input.setAttribute('required', 'true');
                }
                input.removeAttribute('data-was-required');
            }
        }
        el.style.display = esPendiente ? 'none' : 'flex';
    });
    
    // Manejar campos pendiente
    camposPendiente.forEach(el => {
        const input = el.querySelector('input, textarea');
        if (input) {
            if (esPendiente) {
                // Cuando es pendiente, habilitar y hacer required
                input.disabled = false;
                input.setAttribute('required', 'true');
            } else {
                // Cuando no es pendiente, deshabilitar y quitar required
                input.disabled = true;
                input.removeAttribute('required');
            }
        }
        el.style.display = esPendiente ? 'flex' : 'none';
    });
    
    // Limpiar validación del formulario
    const form = document.getElementById('folio-form');
    if (form) {
        form.classList.remove('was-validated');
    }
}

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
// FILTROS Y ELIMINACIÓN
// ======================

document.getElementById('filter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar que el usuario esté logueado
    if (!currentUser) {
        console.error("Intento de filtrar sin usuario logueado");
        alert("Sesión expirada. Inicia sesión nuevamente.");
        showSection('home'); // Redirigir al home en lugar del login
        return;
    }
    
    console.log("Aplicando filtro con usuario:", currentUser.name);
    displayFilteredResults(folios);
});

function displayFilteredResults(data) {
    if (currentUser && currentUser.role === 'tecnico') {
    data = data.filter(f => f.tecnico === currentUser.name);
    }
    console.log("Mostrando resultados filtrados. Datos:", data.length);
    
    const formData = new FormData(document.getElementById('filter-form'));
    const filtroTecnico = formData.get('filtro-tecnico');
    const fechaDesde = formData.get('fecha-desde');
    const fechaHasta = formData.get('fecha-hasta');
    const filtroFolio = formData.get('filtro-folio');
    
    console.log("Parámetros de filtro:", {
        tecnico: filtroTecnico,
        desde: fechaDesde,
        hasta: fechaHasta,
        folio: filtroFolio
    });
    
    let filtered = [...data];
    
    if (filtroTecnico) {
        filtered = filtered.filter(f => f.tecnico === filtroTecnico);
        console.log("Después de filtrar por técnico:", filtered.length);
    }
    
    if (fechaDesde) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString() : f.fecha;
            return fecha >= fechaDesde + 'T00:00:00';
        });
        console.log("Después de filtrar por fecha desde:", filtered.length);
    }
    
    if (fechaHasta) {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            const fecha = f.fecha instanceof firebase.firestore.Timestamp ? 
                f.fecha.toDate().toISOString() : f.fecha;
            return fecha <= fechaHasta + 'T23:59:59';
        });
        console.log("Después de filtrar por fecha hasta:", filtered.length);
    }
    
    if (filtroFolio) {
        filtered = filtered.filter(f => f.folio && f.folio.includes(filtroFolio));
        console.log("Después de filtrar por folio:", filtered.length);
    }
    
    const container = document.getElementById('filter-results');
    if (!container) {
        console.error("Contenedor de resultados no encontrado!");
        return;
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<p>No se encontraron resultados para los criterios de búsqueda.</p>';
        return;
    }
    
    console.log("Generando tabla con", filtered.length, "resultados");
    
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
        // Determinar botones según rol
        if (currentUser && currentUser.role === 'tecnico') {
            // Solo técnico: solo modificar
            html += `<button onclick="openEditModal('${f.id}')" class="btn-primary">Modificar</button>`;
        } else if (['gerente', 'administrativo', 'supervisor'].includes(currentUser?.role)) {
            // Otros roles: modificar + eliminar
            html += `
                <button onclick="openEditModal('${f.id}')" class="btn-small btn-primary">Modificar</button>
                <button onclick="deleteFolio('${f.id}')" class="btn-small btn-danger">Eliminar</button>
            `;
        }
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    console.log("Tabla generada correctamente");
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

let folioEnEdicion = null;

function openEditModal(folioId) {
    const folio = folios.find(f => f.id === folioId);
    if (!folio) {
        alert('Folio no encontrado.');
        return;
    }
    folioEnEdicion = folio;

    // Llenar dropdowns
    populateUserDropdowns();

    // Rellenar formulario
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

    // Manejar campos pendiente
    const esPendiente = folio.pendiente === 'si';
    document.querySelectorAll('.pendiente-campos').forEach(el => {
        el.style.display = esPendiente ? 'flex' : 'none';
    });
    document.querySelectorAll('.campo-normal').forEach(el => {
        el.style.display = esPendiente ? 'none' : 'flex';
    });

    // Dentro de openEditModal(), después de llenar los campos y antes de mostrar el modal
    const plantillaEncuestaFields = document.querySelectorAll('#edit-modal .campo-plantilla-encuesta');
    if (currentUser && currentUser.role === 'tecnico') {
        plantillaEncuestaFields.forEach(el => el.style.display = 'none');
    } else {
        plantillaEncuestaFields.forEach(el => el.style.display = 'flex');
    }

    // Mostrar modal
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    folioEnEdicion = null;
}

// Guardar cambios
document.getElementById('edit-folio-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!folioEnEdicion) return;

    const formData = new FormData(this);
    const updatedData = {};
    for (let [key, value] of formData.entries()) {
        updatedData[key] = value;
    }

    // 🔒 Si es técnico, NO modificar plantilla ni encuesta
    if (currentUser && currentUser.role === 'tecnico') {
        delete updatedData.plantilla;
        delete updatedData.encuesta;
    }

    try {
        // Actualizar en Firebase
        await db.collection('folios').doc(folioEnEdicion.id).update({
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
        });

        // Solo incluir plantilla y encuesta si el usuario NO es técnico
        if (currentUser && currentUser.role !== 'tecnico') {
            updateData.plantilla = updatedData.plantilla || 'OK';
            updateData.encuesta = updatedData.encuesta || 'OK';
        }

        // Actualizar en memoria
        const idx = folios.findIndex(f => f.id === folioEnEdicion.id);
        if (idx !== -1) {
            folios[idx] = { ...folios[idx], ...updatedData };
        }

        alert('✅ Folio actualizado correctamente.');
        closeEditModal();

        // Refrescar tabla si está en la sección de filtros
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
    if (!currentUser) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        return;
    }
    if (!['administrativo', 'gerente'].includes(currentUser.role)) {
        alert('No tienes permisos para gestionar usuarios.');
        return;
    }
    const formData = new FormData(this);
    const usuario = formData.get('user-usuario').trim();
    const name = formData.get('user-name').trim();
    const role = formData.get('user-role');
    const password = formData.get('user-password');

    // Validar que el usuario (login) sea único
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
// CONFIGURACIÓN DE PRECIOS
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

        // Filtrar solo los folios del técnico actual
        const foliosTecnico = data.filter(f => f.tecnico === tecnico);
        
        foliosTecnico.forEach(f => {
            // Calcular el número de instalaciones anteriores (incluyendo este folio)
            const instalacionesAnteriores = foliosTecnico.filter(f2 => 
                compararFechas(f.fecha, f2.fecha)
            );
            const esDecima = instalacionesAnteriores.length >= 10;

            // Calcular costo normal
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

            // Mostrar folio normal
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
                <td>${f.folio || 'N/A'}</td>
                <td>$${costo}</td>
                <td>${f.tipo || 'N/A'}</td>
                <td>${f.instalacion || 'N/A'}</td>
            `;
            cuerpo.appendChild(row);

            // ✅ Mostrar folio PENDIENTE si existe
            if (f.pendiente === 'si' && f.telefono_pendiente) {
                // Calcular costo para el pendiente (mismo tipo y condiciones)
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

        // Sumar ventanas y radiales
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
    
    // Agregar event listeners para los campos editables
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
    
    // Agregar event listener a la nueva celda
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
    
    const existingFilter = container.querySelector('.form-container');
    if (!existingFilter || !existingFilter.querySelector('#ffth-desde')) {
        const header = container.querySelector('.section-header');
        header.insertAdjacentHTML('afterend', filterHTML);
    }
}

function setupCobreFilters() {
    const container = document.getElementById('carga-cobre');
    if (!container) return;
    
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
    
    const existingFilter = container.querySelector('.form-container');
    if (!existingFilter || !existingFilter.querySelector('#cobre-desde')) {
        const header = container.querySelector('.section-header');
        header.insertAdjacentHTML('afterend', filterHTML);
    }
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
    
    // Usar la misma lógica de displayFFTHTable pero con los datos filtrados
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
    
    // Filtrar folios de tipo FIBRA
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
    
    // Filtrar folios de tipo COBRE
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
    
    // Crear tabla HTML
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
    
    // Convertir a Excel (usando una librería simple)
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

    // Clonar el recibo para impresión
    const printContent = receiptElement.querySelector('.receipt').cloneNode(true);

    // Ocultar elementos no imprimibles
    const noImprimir = printContent.querySelectorAll('.no-imprimir, .btn-eliminar');
    noImprimir.forEach(el => el.remove());

    // Crear contenedor temporal
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.appendChild(printContent);

    // Agregar estilos básicos para impresión
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

function printSupervisor() {
    const receiptElement = document.getElementById('supervisor-receipt');
    if (!receiptElement || !receiptElement.querySelector('.receipt')) {
        alert('No hay recibo de supervisor para imprimir.');
        return;
    }

    // Clonar el recibo para impresión
    const printContent = receiptElement.querySelector('.receipt').cloneNode(true);

    // Eliminar botones y controles no imprimibles
    const noImprimir = printContent.querySelectorAll('.no-imprimir, .btn-eliminar');
    noImprimir.forEach(el => el.remove());

    // Crear contenedor temporal
    const printArea = document.createElement('div');
    printArea.id = 'print-area';
    printArea.appendChild(printContent);

    // Estilos para impresión
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
        .footer-note, .recibo-table tfoot td {
            font-weight: bold;
        }
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

    // Estilos mínimos para impresión
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

    // Rellenar formulario manual
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

    // Fecha
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
// MODAL: Folio Pendiente de Liquidar (Botón independiente)
// ======================
function abrirModalFolioPendiente() {
    // Verificar que el usuario sea técnico
    if (!currentUser || currentUser.role !== 'tecnico') {
        alert('Solo los técnicos pueden registrar folios pendientes.');
        return;
    }

    // Crear modal dinámicamente
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

    // Establecer fecha actual
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('fp-fecha').value = local;

    // Mostrar modal
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

// Verificar folio pendiente al iniciar sesión
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
// INICIALIZACIÓN (ACTUALIZADA)
// ======================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Inicializando sistema...");
    
    // 🔥 PRIMERO verificar si hay una sesión activa
    if (checkExistingSession()) {
        console.log("Sesión existente encontrada, continuando...");
    }
    // 🔥 CONEXIÓN DEL LOGIN
    document.getElementById('login-form').addEventListener('submit', login);

    // 🔥 INICIALIZAR CAMPOS PENDIENTE
    initializePendienteFields();
    
    try {
        // Cargar todo desde Firebase
        console.log("Cargando datos desde Firebase...");
        // Limpiar cache local primero
        users = [];
        folios = [];

        await loadFromStorage();
        await loadUsersFromFirebase();
        await loadFoliosFromFirebase();
        console.log("Datos cargados correctamente");
        console.log(`👤 Usuarios finales: ${users.length}`);
        console.log(`📋 Folios finales: ${folios.length}`);

        // 🔥 EJECUTAR DIAGNÓSTICO
        setTimeout(() => {
            diagnosticFirebaseCompleto();
        }, 1000);
        
    } catch (error) {
        console.error("Error en inicialización:", error);
        alert("Error al cargar los datos del sistema. Recarga la página.");
    }
    
    // Configurar fecha por defecto en los formularios
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = today;
        }
        // 🔥 CREAR BACKUP AL INICIAR
        setTimeout(() => {
            createBackup();
            }, 5000);

    function cerrarModalPendiente() {
    document.getElementById('modal-pendiente').style.display = 'none';
    }

    function guardarPendienteDesdeModal() {
        const tipo = document.getElementById('pendiente-tipo').value;
        const cope = document.getElementById('pendiente-cope').value;
        const fecha = document.getElementById('pendiente-fecha').value;
        const telefono = document.getElementById('pendiente-telefono').value;
        const comentarios = document.getElementById('pendiente-comentarios').value;

        if (!telefono || !/^\d{10}$/.test(telefono)) {
            alert('El teléfono pendiente debe tener 10 dígitos.');
            return;
        }

        // Guardar en campos ocultos del formulario principal
        document.querySelector('select[name="pendiente"]').value = 'si';
        document.querySelector('input[name="telefono_pendiente"]').value = telefono;
        document.querySelector('textarea[name="comentarios_pendiente"]').value = comentarios;

        cerrarModalPendiente();
        alert('✅ Datos de folio pendiente guardados.');
    }

        // Reemplazar el comportamiento del select "pendiente"
        document.addEventListener('DOMContentLoaded', () => {
            const selectPendiente = document.querySelector('select[name="pendiente"]');
            if (selectPendiente) {
                selectPendiente.addEventListener('change', function() {
                    if (this.value === 'si') {
                // Abrir modal en lugar de mostrar campos inline
                        const now = new Date();
                        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                        document.getElementById('pendiente-fecha').value = local;
                        document.getElementById('modal-pendiente').style.display = 'flex';
                        this.value = 'no'; // evita conflicto con togglePendienteFields
                    }
                });
            }
        });
    });
    
    // Configurar fecha y hora por defecto en el formulario de folios
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const fechaInput = document.querySelector('input[name="fecha"]');
    if (fechaInput && !fechaInput.value) {
        fechaInput.value = localDateTime;
    }
    
    console.log("Sistema inicializado correctamente");
    console.log("Usuarios cargados:", users.length);
    console.log("Folios cargados:", folios.length);

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

    // Manejo del formulario de Resumen Técnicos
document.getElementById('summary-filter').addEventListener('submit', function(e) {
    e.preventDefault(); // 🔥 Evita el comportamiento por defecto (recargar/ir a home)
    
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

    // Filtrar folios en el rango
    const filtered = folios.filter(f => {
        if (!f.fecha) return false;
        const fechaFolio = f.fecha instanceof firebase.firestore.Timestamp 
            ? f.fecha.toDate().toISOString().split('T')[0]
            : (f.fecha.split ? f.fecha.split('T')[0] : '');
        return fechaFolio >= desde && fechaFolio <= hasta;
    });

    if (filtered.length === 0) {
        document.getElementById('summary-table').innerHTML = '<p>No hay folios en el rango seleccionado.</p>';
        document.getElementById('summary-chart-container').style.display = 'none';
        return;
    }

    // Generar tabla y gráfico
    generateSummaryTable(filtered, desde, hasta);
    generateSummaryChart(filtered);
});

function generateSummaryTable(data, desde, hasta) {
    const tecnicos = [...new Set(data.map(f => f.tecnico).filter(t => t))];
    const tableContainer = document.getElementById('summary-table');
    let html = `<h3>Resumen del ${desde} al ${hasta}</h3><table><thead><tr><th>Técnico</th><th>Folios</th><th>Total ($)</th></tr></thead><tbody>`;

    tecnicos.forEach(tecnico => {
        const foliosTecnico = data.filter(f => f.tecnico === tecnico);
        let total = 0;
        foliosTecnico.forEach(f => {
            const esDecima = foliosTecnico.filter(ff => 
                (ff.fecha instanceof firebase.firestore.Timestamp ? ff.fecha.toDate() : new Date(ff.fecha)) <= 
                (f.fecha instanceof firebase.firestore.Timestamp ? f.fecha.toDate() : new Date(f.fecha))
            ).length >= 10;

            if (f.tipo === 'FIBRA') {
                total += f.instalacion === 'AEREA' 
                    ? (esDecima ? precios.fibra_aerea_10 : precios.fibra_aerea)
                    : (esDecima ? precios.fibra_sub_10 : precios.fibra_sub);
            } else {
                total += f.instalacion === 'AEREA' 
                    ? (esDecima ? precios.cobre_aerea_10 : precios.cobre_aerea)
                    : (esDecima ? precios.cobre_sub_10 : precios.cobre_sub);
            }
        });
        html += `<tr><td>${tecnico}</td><td>${foliosTecnico.length}</td><td>$${total.toFixed(2)}</td></tr>`;
    });

    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function generateSummaryChart(data) {
    const ctx = document.getElementById('summary-chart').getContext('2d');
    const tecnicos = [...new Set(data.map(f => f.tecnico).filter(t => t))];
    const counts = tecnicos.map(t => data.filter(f => f.tecnico === t).length);

    // Destruir gráfico anterior si existe
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
// SISTEMA DE BACKUP
// ======================

async function createBackup() {
    try {
        const backupData = {
            folios: folios,
            users: users,
            precios: precios,
            plantillaAdmin: plantillaAdmin,
            timestamp: new Date().toISOString(),
            user: currentUser ? currentUser.name : 'Sistema'
        };
        
        // Guardar en localStorage
        localStorage.setItem('backup_' + new Date().toISOString().split('T')[0], JSON.stringify(backupData));
        
        // Mantener solo los últimos 7 backups
        cleanupOldBackups();
        
        console.log("✅ Backup creado exitosamente");
    } catch (error) {
        console.error("Error creando backup:", error);
    }
}

function cleanupOldBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('backup_')) {
            backups.push(key);
        }
    }
    
    // Ordenar por fecha (más reciente primero)
    backups.sort().reverse();
    
    // Eliminar backups viejos (mantener solo últimos 7)
    if (backups.length > 7) {
        for (let i = 7; i < backups.length; i++) {
            localStorage.removeItem(backups[i]);
        }
    }
}

function listBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('backup_')) {
            const data = JSON.parse(localStorage.getItem(key));
            backups.push({
                fecha: key.replace('backup_', ''),
                usuario: data.user,
                folios: data.folios.length
            });
        }
    }
    
    return backups.sort().reverse();
}

// ======================
// RESTAURACIÓN DESDE BACKUP
// ======================

function showBackupRestore() {
    const backups = listBackups();
    
    if (backups.length === 0) {
        alert('No hay backups disponibles para restaurar.');
        return;
    }
    
    let message = '📋 BACKUPS DISPONIBLES:\n\n';
    backups.forEach((backup, index) => {
        message += `${index + 1}. ${backup.fecha} - ${backup.folios} folios (por: ${backup.usuario})\n`;
    });
    
    message += '\n¿Qué backup deseas restaurar? (ingresa el número)';
    
    const selection = prompt(message);
    const selectedIndex = parseInt(selection) - 1;
    
    if (selectedIndex >= 0 && selectedIndex < backups.length) {
        const backupKey = 'backup_' + backups[selectedIndex].fecha;
        restoreFromBackup(backupKey);
    }
}

async function restoreFromBackup(backupKey) {
    if (!confirm('⚠️ ¿ESTÁS SEGURO DE RESTAURAR DESDE BACKUP? Esto sobrescribirá los datos actuales.')) {
        return;
    }
    
    try {
        const backupData = JSON.parse(localStorage.getItem(backupKey));
        
        if (!backupData) {
            alert('Backup no encontrado.');
            return;
        }
        
        // 🔥 RESTAURAR A FIREBASE (esto es opcional y requiere cuidado)
        alert(`Backup del ${backupData.timestamp} encontrado con ${backupData.folios.length} folios. Los datos se restaurarán localmente.`);
        
        // Restaurar datos locales
        folios = backupData.folios || [];
        users = backupData.users || users;
        precios = backupData.precios || precios;
        plantillaAdmin = backupData.plantillaAdmin || plantillaAdmin;
        
        // Guardar en localStorage
        saveToStorage();
        
        // Actualizar interfaz
        updateStats();
        populateUserDropdowns();
        
        alert('✅ Datos restaurados correctamente desde el backup.');
        
    } catch (error) {
        console.error("Error restaurando backup:", error);
        alert('❌ Error al restaurar el backup.');
    }
}
    
    // Cargar tablas después de la inicialización
    setTimeout(() => {
        displayFFTHTable();
        displayCobreTable();
    }, 1000);
});