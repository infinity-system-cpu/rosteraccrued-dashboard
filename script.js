// ======================
// VARIABLES GLOBALES
// ======================
let folios = [];
let users = [];
let precios = {
    fibra_aerea: 330, fibra_sub: 350, fibra_aerea_10: 350,
    fibra_sub_10: 370, cobre_aerea: 300, cobre_sub: 320,
    cobre_aerea_10: 320, cobre_sub_10: 340
};

// AGREGA ESTA VARIABLE AQUÍ:
let plantillaAdmin = {
    encabezado: "RECIBO DE PAGO",
    pie: "CON ESTE PAGO QUEDAN LIQUIDADOS MIS SERVICIOS REALIZADOS SIN NINGUNA ADEUDO",
    observaciones: "OBSERVACIONES",
    logoBase64: ""
};

let currentUser = null;
let logoutTimeouts = [];
let permisosGlobales = {};


// ======================
// FUNCIONES DE INTERFAZ
// ======================

function irALogin() {
    const appElement = document.getElementById('app');
    const loginSection = document.getElementById('login-section');
    
    if (appElement) appElement.classList.add('hidden'); // Usa clases en CSS
    if (loginSection) {
        loginSection.classList.remove('hidden');
        loginSection.style.display = 'flex';
    }
}

function toggleMenu() {
    const nav = document.getElementById('side-menu');
    const overlay = document.querySelector('.nav-overlay');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!nav) {
        console.error("Elemento side-menu no encontrado");
        return;
    }
    
    if (nav.classList.contains('active')) {
        // Cerrar menú
        nav.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Quitar clase open del botón
        if (menuToggle) {
            menuToggle.classList.remove('open');
        }
        
        // Guardar estado del menú
        localStorage.setItem('menuOpen', 'false');
        
        console.log("Menú cerrado");
    } else {
        // Abrir menú
        nav.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Agregar clase open al botón
        if (menuToggle) {
            menuToggle.classList.add('open');
        }
        
        // Guardar estado del menú
        localStorage.setItem('menuOpen', 'true');
        
        console.log("Menú abierto");
    }
}

function restaurarVisibilidadApp() {
    console.log("=== RESTAURANDO VISIBILIDAD ===");
    
    try {
        // 1. Asegurar que la app esté visible
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.style.display = 'flex';
            appElement.style.visibility = 'visible';
            appElement.style.opacity = '1';
            console.log("✅ App mostrada");
        }
        
        // 2. Asegurar que el login esté oculto
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
            loginSection.style.display = 'none';
            console.log("✅ Login oculto");
        }
        
        // 3. Mostrar top bar
        const topBar = document.querySelector('.top-bar');
        if (topBar) {
            topBar.style.display = 'flex';
            topBar.style.visibility = 'visible';
            topBar.style.opacity = '1';
            console.log("✅ Top bar mostrado");
        }
        
        // 4. Mostrar botón hamburguesa
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.style.display = 'flex';
            menuToggle.style.visibility = 'visible';
            console.log("✅ Botón hamburguesa mostrado");
        }
        
        // 5. Mostrar contenido principal
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            console.log("✅ Main content mostrado");
        }
        
        // 6. Mostrar sección home (dashboard)
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.style.display = 'block';
            console.log("✅ Dashboard mostrado");
        }
        
        console.log("=== VISIBILIDAD RESTAURADA ===");
        
    } catch (error) {
        console.error("Error restaurando visibilidad:", error);
    }
}

function closeMenuOnClickOutside(event) {
    const nav = document.getElementById('side-menu');
    const overlay = document.querySelector('.nav-overlay');
    const menuToggle = document.querySelector('.menu-toggle');
    
    // Si el menú está abierto y el clic NO fue en el menú ni en el botón hamburguesa
    if (nav && nav.classList.contains('active') && 
        !nav.contains(event.target) && 
        !menuToggle.contains(event.target)) {
        
        // Cerrar menú
        nav.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log("Menú cerrado (clic fuera)");
    }
}

function logout() {
    currentUser = null;
    localStorage.clear();

    window.location.reload();
    
    setTimeout(() => {
        try {
            currentUser = null;
            localStorage.clear();
        
            resetearInterfazCompleta();
            irALogin();
            
            console.log("✅ Logout exitoso");
        } catch (error) {
            console.error("Error en logout:", error);
        } 
    }, 1500);
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.innerHTML = `<span style="color: white"><strong>${new Date().toLocaleDateString('es-ES', options)}</span>`;
    }
});

// Reemplaza limpiarEstilosInline y limpiarEstadoResidual con esta:
function resetearInterfazCompleta() {
    console.log("Limpiando interfaz...");
    
    // Resetear formularios
    document.querySelectorAll('form').forEach(form => form.reset());
    
    // Cerrar menús
    const nav = document.getElementById('side-menu');
    if (nav) nav.classList.remove('active');
    
    // Habilitar scroll
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Quitar overlays residuales
    document.querySelectorAll('.loading-overlay').forEach(el => el.remove());
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
    
    if (!currentUser) {
        alert("Debes iniciar sesión primero.");
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        return;
    }

    // 🚩 AGREGA ESTO AQUÍ: Actualización global de textos del menú
    const roleElem = document.getElementById('user-role');
    const nameElem = document.getElementById('user-name');
    if (roleElem) roleElem.textContent = currentUser.role.toUpperCase();
    if (nameElem) nameElem.textContent = currentUser.name;

    // Guardar sección actual
    localStorage.setItem('currentSection', sectionId);

    const activeSection = document.querySelector('.content-section.active, .section.active');
    const currentSectionId = activeSection ? activeSection.id : null;

    // Si estamos en la misma sección, solo cerrar el menú si está abierto
    if (currentSectionId === sectionId && sectionId === 'home') {
        console.log("Ya estamos en inicio, cerrando menú si está abierto...");
        const nav = document.getElementById('side-menu');
        if (nav && nav.classList.contains('active')) {
            // Cerrar menú manualmente
            nav.classList.remove('active');
            const overlay = document.querySelector('.nav-overlay');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            const menuToggle = document.querySelector('.menu-toggle');
            if (menuToggle) menuToggle.classList.remove('open');
            
            console.log("Menú cerrado (misma sección)");
        }
        return;
    }
    
    // Cerrar menú lateral si está abierto
    const nav = document.getElementById('side-menu');
    if (nav && nav.classList.contains('active')) {
        nav.classList.remove('active');
        const overlay = document.querySelector('.nav-overlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) menuToggle.classList.remove('open');
        
        console.log("Menú cerrado al navegar");
    }
    
    // ¡NO LLAMAR toggleMenu() aquí!
    
    console.log("Ocultando todas las secciones...");
    
    // Ocultar TODAS las secciones
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
       window.scrollTo(0, 0);
    } else {
        console.error("Sección no encontrada:", sectionId);
        showSection('home');
        return;
    }

    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'block';
    
    if (sectionId === 'precios') mostrarPreciosEnFormulario();

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
            console.log("Mostrando sección de filtros - Forzando recarga de datos");
    
            // Forzar recarga de datos desde Firebase cada vez que se entra
            setTimeout(() => {
                recargarDatosFiltros();
                agregarBotonRecargar();
            }, 200);

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

        // En la función showSection, agrega:
        case 'total-nominas':
            console.log("Mostrando sección Total General Nóminas");
            initializeTotalNominasSection();
            break;

        case 'configuracion':
            console.log("Cargando panel de configuración...");
            cargarPermisosFirebase()
                .then(() => {
                    renderizarMatrizPermisos();
                })
                .catch(err => {
                    console.error("Error al cargar configuración:", err);
                    renderizarMatrizPermisos();
                });
            break;
            }
    // Después de mostrar la sección
    setTimeout(() => {
        if (sectionId === 'nomina' || sectionId === 'supervisor') {
            refreshDropdowns();
        }
    }, 50);
    
    console.log("Navegación a", sectionId, "completada");

    // Actualizar el texto del Breadcrumb
    const titles = {
        'home': 'Panel de Control',
        'add': 'Registrar Folio',
        'filter': 'Buscador Avanzado',
        'nomina': 'Mi Nómina',
        'users': 'Gestión de Usuarios'
    };
    
    const breadcrumb = document.getElementById('current-section-title');
    if (breadcrumb && titles[sectionId]) {
        breadcrumb.innerText = titles[sectionId];
    }
}

// Llama a esto cuando el usuario inicie sesión correctamente
function initAppUI(userName, role) {
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('user-name').innerText = userName;
    document.getElementById('user-role').innerText = role; //header-user-role
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
    console.log("Inicializando sección de filtros...");
    
    // Mostrar estado de carga
    const container = document.getElementById('filter-results');
    if (container) {
        container.innerHTML = '<div class="loading-mini"><i class="fas fa-spinner fa-spin"></i> Cargando datos...</div>';
    }
    
    // Verificar si ya tenemos folios cargados
    if (folios.length > 0) {
        console.log("Usando folios en memoria:", folios.length);
        setTimeout(() => {
            applyDefaultFilter();
        }, 100);
    } else {
        // Cargar desde Firebase
        console.log("Cargando folios desde Firebase...");
        loadFoliosFromFirebase().then(() => {
            console.log("Folios cargados:", folios.length);
            setTimeout(() => {
                applyDefaultFilter();
            }, 100);
        }).catch(error => {
            console.error("Error cargando folios:", error);
            if (container) {
                container.innerHTML = '<p class="error">Error al cargar los datos: ' + error.message + '</p>';
            }
        });
    }
    
    // Configurar evento del formulario
    const form = document.getElementById('filter-form');
    if (form) {
        // Remover event listeners anteriores para evitar duplicados
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Agregar nuevo event listener
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Formulario de filtros enviado");
            
            // Mostrar loading
            const resultsDiv = document.getElementById('filter-results');
            if (resultsDiv) {
                resultsDiv.innerHTML = '<div class="loading-mini"><i class="fas fa-spinner fa-spin"></i> Aplicando filtros...</div>';
            }
            
            // Pequeño delay para que se vea el loading
            setTimeout(() => {
                displayFilteredResults(folios);
            }, 50);
        });
    }
}

function recargarDatosFiltros() {
    console.log("Recargando datos para filtros...");
    
    const container = document.getElementById('filter-results');
    if (container) {
        container.innerHTML = '<div class="loading-mini"><i class="fas fa-spinner fa-spin"></i> Actualizando datos desde Firebase...</div>';
    }
    
    // Recargar folios desde Firebase
    loadFoliosFromFirebase().then(() => {
        console.log("Datos recargados:", folios.length);
        
        // Aplicar filtros actuales
        setTimeout(() => {
            displayFilteredResults(folios);
        }, 100);
        
    }).catch(error => {
        console.error("Error recargando datos:", error);
        if (container) {
            container.innerHTML = '<p class="error">Error al actualizar: ' + error.message + '</p>';
        }
    });
}

// Agregar botón de recarga
function agregarBotonRecargar() {
    const header = document.querySelector('.results-header');
    if (!header) return;
    
    // Verificar si ya existe el botón
    if (document.getElementById('btn-recargar-filtros')) return;
    
    const recargarBtn = document.createElement('button');
    recargarBtn.id = 'btn-recargar-filtros';
    recargarBtn.className = 'btn-secondary';
    recargarBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Datos';
    recargarBtn.style.marginLeft = '10px';
    
    recargarBtn.onclick = function() {
        recargarDatosFiltros();
    };
    
    // Agregar al header
    const actionsDiv = header.querySelector('.results-actions');
    if (actionsDiv) {
        actionsDiv.appendChild(recargarBtn);
    }
}

function applyDefaultFilter() {
    console.log("Aplicando filtro por defecto desde Firebase...");
    
    // Obtener fechas por defecto (última semana)
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
    
    // Establecer valores en el formulario
    const fechaDesdeInput = document.querySelector('input[name="fecha-desde"]');
    const fechaHastaInput = document.querySelector('input[name="fecha-hasta"]');
    
    if (fechaDesdeInput && !fechaDesdeInput.value) {
        fechaDesdeInput.value = oneWeekAgoStr;
    }
    if (fechaHastaInput && !fechaHastaInput.value) {
        fechaHastaInput.value = today;
    }
    
    // Filtrar los datos
    const filtered = folios.filter(f => {
        if (!f.fecha) return false;
        
        let fechaFolio;
        if (f.fecha instanceof firebase.firestore.Timestamp) {
            fechaFolio = f.fecha.toDate().toISOString().split('T')[0];
        } else if (typeof f.fecha === 'string') {
            fechaFolio = f.fecha.split('T')[0];
        } else {
            return false;
        }
        
        return fechaFolio >= oneWeekAgoStr && fechaFolio <= today;
    });
    
    console.log("Resultados del filtro por defecto:", filtered.length);
    displayFilteredResults(filtered);
}

// ======================
// RECUPERACIÓN DE SESIÓN
// ======================
function checkExistingSession() {
    try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            
            // 1. OCULTAR LOGIN INMEDIATAMENTE
            const loginSection = document.getElementById('login-section');
            if (loginSection) {
                loginSection.style.display = 'none';
            }
            
            // 2. RESTAURAR VISIBILIDAD DE LA APP
            restaurarVisibilidadApp();
            
            // 3. Actualizar información del usuario
            document.getElementById('user-name').textContent = currentUser.name;
            document.getElementById('user-role').textContent = currentUser.role.toUpperCase();
            
            // 4. Cargar datos
            setTimeout(() => {
                loadFoliosFromFirebase().then(() => {
                    console.log("Folios cargados al restaurar sesión:", folios.length);
                    
                    // 5. RESTAURAR SECCIÓN ACTIVA
                    const savedSection = localStorage.getItem('currentSection');
                    if (savedSection && document.getElementById(savedSection)) {
                        showSection(savedSection);
                    } else {
                        showSection('home');
                    }
                    
                    // 6. OCULTAR LOADING
                    setTimeout(() => {
                        console.log("✅ Sesión restaurada exitosamente");
                    }, 500);
                    
                }).catch(error => {
                    console.error("Error cargando folios:", error);
                    showSection('home');
                });
            }, 1000); // Reducir tiempo de loading
            
            return true;
        }
    } catch (error) {
        console.error("Error recuperando sesión:", error);
        localStorage.removeItem('currentUser');
    }
    return false;
}

// ======================
// FUNCIÓN PARA RESTAURAR ESTADO DE INTERFAZ
// ======================
function restaurarEstadoInterfaz() {
    console.log("Restaurando estado de interfaz...");
    
    // 1. Asegurar que todos los elementos estén visibles
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
        
        // Restaurar estado del menú hamburguesa
        const isMenuOpen = localStorage.getItem('menuOpen') === 'true';
        if (isMenuOpen && sideMenu) {
            sideMenu.classList.add('active');
            const overlay = document.querySelector('.nav-overlay');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Cambiar icono a "X" si estaba abierto
            menuToggle.classList.add('open');
        }
    }
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.display = 'block';
        mainContent.style.visibility = 'visible';
        mainContent.style.opacity = '1';
    }
    
    // 2. Actualizar información del usuario
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.role.toUpperCase();
    
    // 3. Actualizar menú según rol
    updateMenuByRole();
    
    console.log("Estado de interfaz restaurado");
}

function updateMenuByRole() {
    // Si la variable global está vacía, intentamos recuperarla del LocalStorage inmediatamente
    if (!permisosGlobales || Object.keys(permisosGlobales).length === 0) {
        const cache = localStorage.getItem('permisos_cache');
        if (cache) {
            permisosGlobales = JSON.parse(cache);
            console.log("📦 Usando permisos desde caché temporalmente...");
        } else {
            console.warn("⚠️ No hay permisos disponibles (ni en Firebase ni en Caché)");
            return; // Detenemos la ejecución si no hay datos
        }
    }

    // 2. Seleccionar todos los elementos con navegación
    const menuElements = document.querySelectorAll('.side-menu [onclick]');
    
    menuElements.forEach((el) => {
        const onclickAttr = el.getAttribute('onclick');
        const match = onclickAttr ? onclickAttr.match(/['"]([^'"]+)['"]/) : null;
        
        if (match) {
            const sectionId = match[1];
            if (sectionId === 'home') return;

            const rolesPermitidos = permisosGlobales[sectionId];
            
            // Validación robusta: verifica que sea array y que incluya el rol
            const tieneAcceso = Array.isArray(rolesPermitidos) && 
                               rolesPermitidos.some(r => r.toLowerCase().trim() === currentUser.role.toLowerCase().trim());

            console.log(`Sección: ${sectionId} | Acceso: ${tieneAcceso}`);

            // Aplicamos el cambio con !important para forzar la desaparición
            const displayValue = tieneAcceso ? 'flex' : 'none';
            
            el.style.setProperty('display', displayValue, 'important');

            // Importante: Ocultar también el contenedor .menu-item si existe
            const parentItem = el.closest('.menu-item') || el.parentElement;
            if (parentItem && (parentItem.classList.contains('menu-item') || parentItem.tagName === 'LI')) {
                parentItem.style.setProperty('display', displayValue, 'important');
            }
        }
    });

    // 5. Limpiar títulos de categorías vacías
    if (typeof ocultarTitulosVacios === 'function') {
        ocultarTitulosVacios();
    }
}

// 1. Cargar permisos al iniciar la App
async function cargarPermisosFirebase() {
    console.log("📡 Sincronizando permisos...");
    
    // 1. Intentar cargar desde el respaldo local para velocidad
    const respaldo = localStorage.getItem('permisos_cache');
    if (respaldo) {
        permisosGlobales = JSON.parse(respaldo);
        console.log("📦 Permisos cargados desde caché");
    }

    try {
        // 2. Obtener datos frescos de la nube
        const doc = await db.collection('configuracion').doc('permisos').get();
        if (doc.exists) {
            permisosGlobales = doc.data();
            // 3. Actualizar el cache
            localStorage.setItem('permisos_cache', JSON.stringify(permisosGlobales));
            console.log("✅ Permisos actualizados desde la nube");
            return permisosGlobales; // Devolvemos los datos para el await
        }
    } catch (error) {
        console.error("❌ Error al leer Firebase:", error);
        return permisosGlobales; // Devolvemos lo que tengamos (así sea el caché)
    }
}

// 2. Generar la tabla de configuración (UI)
function renderizarMatrizPermisos() {
    console.log("Renderizando matriz con:", permisosGlobales);
    
    // Si por alguna razón está vacío, intentar recuperar del cache antes de rendirse
    if (!permisosGlobales || Object.keys(permisosGlobales).length === 0) {
        const cache = localStorage.getItem('permisos_cache');
        if (cache) {
            permisosGlobales = JSON.parse(cache);
        } else {
            console.warn("No hay permisos para renderizar la tabla");
            return;
        }
    }

    const roles = ['tecnico', 'supervisor', 'gerente', 'administrativo'];
    const seccionesMaestras = [
        'add', 'filter', 'planos', 'summary', 'nomina', 
        'supervisor', 'acumulado', 'total-nominas', 'carga-ffth', 
        'carga-cobre', 'users', 'precios', 'base', 'configuracion'
    ];
    
    const container = document.getElementById('body-permisos');
    if (!container) return;

    let html = '';

    seccionesMaestras.forEach(sec => {
        // Obtenemos los roles permitidos para esta sección (aseguramos que sea un array)
        const permsActuales = Array.isArray(permisosGlobales[sec]) ? permisosGlobales[sec] : [];
        
        html += `
            <tr>
                <td style="font-weight: bold; color: #3b82f6; padding: 10px;">${sec.toUpperCase()}</td>
                ${roles.map(rol => {
                    // Verificamos si el rol está incluido en los permisos de esta sección
                    const isChecked = permsActuales.includes(rol) ? 'checked' : '';
                    return `
                        <td style="text-align: center;">
                            <input type="checkbox" class="perm-check" 
                                   data-sec="${sec}" data-rol="${rol}" 
                                   ${isChecked}>
                        </td>`;
                }).join('')}
            </tr>`;
    });
    container.innerHTML = html;
}

// 3. Guardar en Firebase
async function guardarPermisosFirebase() {
    const checks = document.querySelectorAll('.perm-check');
    const nuevaConfig = { 'home': true };

    checks.forEach(check => {
        const sec = check.dataset.sec;
        const rol = check.dataset.rol.toLowerCase().trim(); // Limpieza de datos
        if (!nuevaConfig[sec]) nuevaConfig[sec] = [];
        if (check.checked) nuevaConfig[sec].push(rol);
    });

    try {
        await db.collection('configuracion').doc('permisos').set(nuevaConfig);
        
        // 🚩 ACTUALIZACIÓN TOTAL
        permisosGlobales = nuevaConfig; // Actualiza memoria
        localStorage.setItem('permisos_cache', JSON.stringify(nuevaConfig)); // Actualiza caché
        
        updateMenuByRole(); // Refresca el menú lateral
        alert("¡Permisos guardados correctamente!");
    } catch (error) {
        alert("Error al guardar: " + error);
    }
}

function updateDashboard() {
    console.log("Actualizando dashboard...");

    if (!currentUser) return;

    // Actualiza el menú lateral
    const roleElem = document.getElementById('user-role');
    const nameElem = document.getElementById('user-name');
    if (roleElem) roleElem.textContent = currentUser.role.toUpperCase();
    if (nameElem) nameElem.textContent = currentUser.name;
    
    // 🚩 ACTUALIZA LA TARJETA DEL DASHBOARD (Si existe)
    const cardRoleElem = document.getElementById('user-role');
    if (cardRoleElem) cardRoleElem.textContent = currentUser.role.toUpperCase();
    
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
        activityList.innerHTML = `
            <div style="text-align:center; padding:20px; color:#94a3b8;">
                <i class="fas fa-spinner fa-spin"></i> Cargando actividad...
            </div>`;
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

// ======================
// FUNCIONES DE FIREBASE - FOLIOS
// ======================
function loadFoliosFromFirebase() {
    console.log("Iniciando escucha de folios en tiempo real...");
    
    // 1. Configuramos el listener en la colección 'folios'
    // Mantenemos el orden por 'creado_en' desc
    db.collection('folios').orderBy('creado_en', 'desc').onSnapshot((snapshot) => {
        folios = []; // Limpiamos el array local para recibir la nueva actualización
        
        console.log("Actualización recibida de Firebase. Documentos:", snapshot.size);
        
        snapshot.forEach(doc => {
            const folioData = doc.data();
            
            // --- Mantenemos tu lógica de parseo de fecha ---
            let fecha = null;
            if (folioData.fecha) {
                if (folioData.fecha instanceof firebase.firestore.Timestamp) {
                    fecha = folioData.fecha;
                } else if (typeof folioData.fecha === 'string') {
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
            
            // --- Mantenemos tu objeto folio estandarizado ---
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

        console.log("Memoria sincronizada. Total folios:", folios.length);

        // 2. ACTUALIZACIÓN AUTOMÁTICA DE LA INTERFAZ
        // Cada vez que Firebase cambie, esto se ejecuta solo:
        updateStats();           // Actualiza tus contadores
        displayFFTHTable();     // Redibuja la tabla de Fibra
        displayCobreTable();    // Redibuja la tabla de Cobre
        loadRecentActivity();
        
        // Guardamos un backup local por si se pierde el internet
        localStorage.setItem('folios_backup', JSON.stringify(folios));

    }, (error) => {
        // Manejo de errores del listener
        console.error("Error en tiempo real (Folios):", error);
        
        // Fallback: Si falla la conexión, intentar cargar del backup
        const savedFolios = localStorage.getItem('folios_backup');
        if (savedFolios && folios.length === 0) {
            folios = JSON.parse(savedFolios);
            updateStats();
            displayFFTHTable();
            displayCobreTable();
        }
    });
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

async function deleteFolio(folioId) {
    console.log("Eliminando folio:", folioId);
    
    // Verificar permisos
    if (currentUser && currentUser.role === 'tecnico') {
        alert('No tienes permisos para eliminar folios.');
        return;
    }
    
    if (!confirm('¿Está seguro de eliminar este folio?')) {
        return;
    }
    
    try {
        // Obtener el botón y la fila
        const boton = event?.target;
        const fila = boton?.closest('tr');
        
        // Cambiar botón a "procesando"
        if (boton) {
            boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            boton.disabled = true;
        }
        
        // Eliminar de Firebase
        await db.collection('folios').doc(folioId).delete();
        
        // Eliminar localmente
        folios = folios.filter(f => f.id !== folioId);
        updateStats();
        
        // Remover fila del DOM
        if (fila && fila.parentNode) {
            fila.remove();
            
            // Actualizar contador manualmente
            const contador = document.querySelector('.results-info p strong');
            if (contador) {
                const tabla = document.getElementById('tabla-resultados-filtrados');
                if (tabla) {
                    const filasRestantes = tabla.querySelectorAll('tbody tr').length;
                    contador.textContent = filasRestantes;
                }
            }
        }
        
        // Mostrar mensaje simple
        //console.log('✅ Folio eliminado correctamente');
        
        // Podrías usar un alert simple:
        alert('✅ Folio eliminado correctamente');
        
        // O mostrar un mensaje en la consola
        // No usar loading, no redirigir
        
    } catch (error) {
        console.error("Error:", error);
        alert('Error al eliminar el folio');
        
        // Restaurar botón
        const boton = event?.target;
        if (boton) {
            boton.innerHTML = 'Eliminar';
            boton.disabled = false;
        }
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

// 1. FUNCIÓN DE LOGIN (Sin esperas ni animaciones de carga)
// FUNCIÓN DE LOGIN - LIMPIA
async function login(e) {
    e.preventDefault();
    console.log("=== INICIANDO LOGIN ===");
    
    const form = e.target;
    const usernameInput = form.usuario.value.trim();
    const password = form.password.value;
    
    const user = users.find(u => 
        u.usuario && u.usuario.trim().toLowerCase() === usernameInput.toLowerCase() && 
        u.password === password
    );
    
    if (user) {
        console.log("Login exitoso para:", user.name);

        // 1. Guardar sesión en memoria y localStorage
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));

        // 🚩 2. ACTUALIZACIÓN MANUAL INMEDIATA (Agrega esto aquí)
        // Buscamos los elementos por ID y les pasamos el valor de inmediato
        const nameElem = document.getElementById('user-name');
        const roleElem = document.getElementById('user-role');
        
        if (nameElem) nameElem.textContent = user.name;
        if (roleElem) roleElem.textContent = user.role.toUpperCase();

        // 3. ACTUALIZAR EL MENÚ (Para que solo vea lo que le toca según su rol)
        updateMenuByRole(); 

        // 4. ACTUALIZAR ULTIMOS MOVIMIENTOS EN DASHBOARD PRINCIPAL
        loadRecentActivity();
        
        // 5. ACTIVAR LA APP INMEDIATAMENTE
        await entrarAlSistema(user); 
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

// FUNCIÓN DE ENTRADA AL SISTEMA - LIMPIA
async function entrarAlSistema(user) {
    // 1. Mostrar la estructura de la App y ocultar Login
    document.getElementById('login-section').style.display = 'none';
    const appElement = document.getElementById('app');
    appElement.style.display = 'flex';
    appElement.style.flexDirection = 'column';


    // 2. ESPERAR PERMISOS (Bloqueo preventivo)
    try {
        await cargarPermisosFirebase(); 
        console.log("🚀 Permisos listos, procediendo a configurar menú...");
        updateMenuByRole(); // 🚩 Se ejecuta con datos confirmados
    } catch (e) {
        console.error("Fallo crítico en carga de permisos");
    }

    // 3. Datos del usuario
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-role').textContent = user.role.toUpperCase();

    // 4. Mostrar barras y contenido
    document.querySelector('.top-bar').style.display = 'flex';
    document.querySelector('.main-content').style.display = 'block';

    populateUserDropdowns();

    // 5. Cargar datos de Firebase (sin loadings molestos)
    await loadFoliosFromFirebase();

    // ACTIVAMOS LOS CANALES EN TIEMPO REAL
    loadFoliosFromFirebase(); 
    listenToPreciosChanges();
    updateDashboard();

    // 6. Mostrar Dashboard y Tablas
    showSection('home');

    displayFFTHTable();
    displayCobreTable();
    
    if (typeof verificarFolioPendienteAlLogin === 'function') {
        verificarFolioPendienteAlLogin();
    }
}

function limpiarPrevioLogin() {
    console.log("Limpiando estado previo al login...");
    
    // Limpiar cualquier loading residual
    const loadings = document.querySelectorAll('.loading-overlay');
    loadings.forEach(loading => {
        if (loading && loading.parentNode) {
            loading.parentNode.removeChild(loading);
        }
    });
    
    // Asegurar que la app esté completamente oculta
    const appElement = document.getElementById('app');
    if (appElement) {
        appElement.style.display = 'none';
        appElement.style.visibility = 'hidden';
        appElement.style.opacity = '0';
        appElement.classList.remove('active');
    }
    
    // Resetear scroll
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
}

function mostrarAppConAnimacion() {
    console.log("Mostrando app con animación...");
    
    const appElement = document.getElementById('app');
    if (appElement) {
        // Configurar estado inicial
        appElement.style.display = 'flex';
        appElement.style.visibility = 'visible';
        appElement.style.opacity = '0';
        appElement.style.transition = 'opacity 0.5s ease';
        
        // Pequeño delay para asegurar render
        setTimeout(() => {
            appElement.classList.add('active');
            appElement.style.opacity = '1';
            
            // Mostrar elementos principales después
            setTimeout(() => {
                mostrarElementosApp();
            }, 200);
        }, 100);
    }
}

function mostrarElementosApp() {
    console.log("Mostrando elementos de la app...");
    
    // Menú lateral
    const sideMenu = document.getElementById('side-menu');
    if (sideMenu) {
        sideMenu.style.display = 'block';
        sideMenu.style.visibility = 'visible';
        console.log("✅ Side menu mostrado");
    }
    
    // Top bar
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.style.display = 'flex';
        topBar.style.visibility = 'visible';
        topBar.style.opacity = '1';
        console.log("✅ Top bar mostrado");
    }
    
    // Botón hamburguesa
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.style.display = 'flex';
        menuToggle.style.visibility = 'visible';
        console.log("✅ Menu toggle mostrado");
    }
    
    // Contenido principal
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.display = 'block';
        mainContent.style.visibility = 'visible';
        mainContent.style.opacity = '1';
        console.log("✅ Main content mostrado");
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

    // --- Lógica de Técnico ---
    const tecnicoSelect = this.querySelector('select[name="tecnico"]');
    if (tecnicoSelect) {
        folio.tecnico = tecnicoSelect.disabled ? tecnicoSelect.value : (folio.tecnico || tecnicoSelect.value);
    }

    if (!folio.tecnico || folio.tecnico === '') {
        alert('Error: No se pudo determinar el técnico. Contacta al administrador.');
        return;
    }

    // --- Preparación de datos ---
    if (!folio.fecha) folio.fecha = new Date().toISOString();
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
    folio.alfanumerico = (folio.alfanumerico || '').trim();
    folio.comentarios = folio.comentarios || '';
    folio.cope = folio.cope || '';

    // Valores limpios para validar
    const folio_os_valor = (folio.folio_os || folio.folio || '').trim();
    const telefono_valor = (folio.telefono || '').trim();
    const alfanumerico_valor = folio.alfanumerico;
    const vDistrito = (folio.distrito || '').trim();

    // Bloquear botón antes de iniciar validaciones asíncronas
    const btnGuardar = this.querySelector('button[type="submit"]');
    const originalText = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando...';

    try {
        // ======================================================
        // 1. VALIDACIÓN DE FORMATO Y LONGITUD
        // ======================================================
        const regexSoloNumeros = /^[0-9]+$/;

        // Folio/OS (9 dígitos - SOLO NÚMEROS)
        if (folio_os_valor.length !== 9 || !regexSoloNumeros.test(folio_os_valor)) {
            throw new Error("El Folio/OS debe tener exactamente 9 dígitos y ser solo números.");
        }

        // Teléfono (10 dígitos - SOLO NÚMEROS)
        if (telefono_valor !== '0' && telefono_valor !== '') {
            if (telefono_valor.length !== 10 || !regexSoloNumeros.test(telefono_valor)) {
                throw new Error("El Teléfono debe tener exactamente 10 dígitos y ser solo números.");
            }
        }

        // Distrito (9 caracteres - NÚMEROS Y LETRAS)
        if (vDistrito.length !== 9) {
            throw new Error("El Distrito debe tener exactamente 9 caracteres.");
        }

        // Alfanumérico (12 caracteres - NÚMEROS Y LETRAS)
        if (alfanumerico_valor !== '' && alfanumerico_valor !== '0') {
            if (alfanumerico_valor.length !== 12) {
                throw new Error("El código Alfanumérico debe tener exactamente 12 caracteres.");
            }
        }

        // ======================================================
        // 2. VALIDACIÓN DE DUPLICADOS CONTRA FIREBASE
        // ======================================================
        
        // Validar Folio OS / Folio
        if (folio_os_valor !== '' && folio_os_valor !== '0') {
            const qFolioOS = await db.collection('folios').where('folio_os', '==', folio_os_valor).get();
            const qFolioSimple = await db.collection('folios').where('folio', '==', folio_os_valor).get();
            if (!qFolioOS.empty || !qFolioSimple.empty) {
                throw new Error(`El Folio/OS "${folio_os_valor}" ya existe en el sistema.`);
            }
        }

        // Validar Teléfono
        if (telefono_valor !== '' && telefono_valor !== '0' && telefono_valor !== '0000000000') {
            const qTel = await db.collection('folios').where('telefono', '==', telefono_valor).get();
            if (!qTel.empty) {
                throw new Error(`El teléfono "${telefono_valor}" ya está registrado.`);
            }
        }

        // Validar Alfanumérico
        if (alfanumerico_valor !== '' && alfanumerico_valor !== '0') {
            const qAlfa = await db.collection('folios').where('alfanumerico', '==', alfanumerico_valor).get();
            if (!qAlfa.empty) {
                throw new Error(`El código alfanumérico "${alfanumerico_valor}" ya fue utilizado.`);
            }
        }

        // ======================================================
        // 3. GUARDADO FINAL
        // ======================================================
        const folioId = await saveFolioToFirebase(folio);
        folio.id = folioId;
        
        if (typeof folios !== 'undefined') folios.push(folio);
        
        saveToStorage();
        alert('✅ Folio guardado correctamente');
        
        this.reset();
        
        // Reset de fecha a la hora actual local
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        const fechaInput = document.querySelector('input[name="fecha"]');
        if (fechaInput) fechaInput.value = localDateTime;
        
        if (typeof togglePendienteFields === 'function') togglePendienteFields(false);
        updateStats();

    } catch (error) {
        console.error("Error en validación o guardado:", error);
        alert('⚠️ ' + error.message);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = originalText;
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
    // Buscamos en ambos formularios (el de agregar y el de editar)
    const forms = ['folio-form', 'edit-folio-form'];
    
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (!form) return;

        // 1. Manejar campos NORMALES (Se ocultan si es pendiente)
        const camposNormales = form.querySelectorAll('.campo-normal');
        camposNormales.forEach(el => {
            const input = el.querySelector('input, select, textarea');
            if (input) {
                if (esPendiente) {
                    input.disabled = true;
                    input.required = false;
                    input.removeAttribute('required');
                    // IMPORTANTE: Limpiar valor para que no choque con validaciones
                    if(input.type !== 'select-one') input.value = ''; 
                } else {
                    input.disabled = false;
                    // Solo reponer required a los campos vitales
                    if (['folio_os', 'tecnico', 'tipo', 'telefono'].includes(input.name)) {
                        input.required = true;
                        input.setAttribute('required', 'required');
                    }
                }
            }
            el.style.display = esPendiente ? 'none' : 'block';
        });

        // 2. Manejar campos de PENDIENTE (Se muestran si es pendiente)
        const camposPendiente = form.querySelectorAll('.pendiente-campos');
        camposPendiente.forEach(el => {
            const input = el.querySelector('input, textarea');
            if (input) {
                if (esPendiente) {
                    input.disabled = false;
                    // En lugar de usar required de HTML5, lo manejaremos manual después
                    // pero para que no de error de foco, nos aseguramos que se vea
                    input.required = true;
                    input.setAttribute('required', 'required');
                } else {
                    input.disabled = true;
                    input.required = false;
                    input.removeAttribute('required');
                    input.value = '';
                }
            }
            el.style.display = esPendiente ? 'block' : 'none';
        });

        // 3. Limpiar clases de validación de Bootstrap/CSS
        form.classList.remove('was-validated');
    });
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

// ======================
// FILTROS Y ELIMINACIÓN - MODIFICADA CON 16 COLUMNAS
// ======================
function displayFilteredResults(data) {
    console.log("Ejecutando displayFilteredResults con", data.length, "registros");
    
    // Validar que data sea un array
    if (!Array.isArray(data)) {
        console.error("Error: data no es un array", data);
        data = [];
    }
    
    // Aplicar filtro de técnico si el usuario es técnico
    if (currentUser && currentUser.role === 'tecnico') {
        data = data.filter(f => f.tecnico === currentUser.name);
        console.log("Filtrado por técnico:", currentUser.name, "Resultados:", data.length);
    }
    
    const formData = new FormData(document.getElementById('filter-form'));
    const filtroTecnico = formData.get('filtro-tecnico');
    const fechaDesde = formData.get('fecha-desde');
    const fechaHasta = formData.get('fecha-hasta');
    const filtroFolio = formData.get('filtro-folio');
    
    console.log("Filtros aplicados:", { filtroTecnico, fechaDesde, fechaHasta, filtroFolio });
    
    // Aplicar filtros
    let filtered = [...data];
    
    if (filtroTecnico && filtroTecnico !== '') {
        filtered = filtered.filter(f => f.tecnico === filtroTecnico);
        console.log("Filtrado por técnico:", filtroTecnico, "Resultados:", filtered.length);
    }
    
    if (fechaDesde && fechaDesde !== '') {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            let fechaFolio;
            if (f.fecha instanceof firebase.firestore.Timestamp) {
                fechaFolio = f.fecha.toDate().toISOString();
            } else {
                fechaFolio = f.fecha;
            }
            return fechaFolio >= fechaDesde + 'T00:00:00';
        });
        console.log("Filtrado por fecha desde:", fechaDesde, "Resultados:", filtered.length);
    }
    
    if (fechaHasta && fechaHasta !== '') {
        filtered = filtered.filter(f => {
            if (!f.fecha) return false;
            let fechaFolio;
            if (f.fecha instanceof firebase.firestore.Timestamp) {
                fechaFolio = f.fecha.toDate().toISOString();
            } else {
                fechaFolio = f.fecha;
            }
            return fechaFolio <= fechaHasta + 'T23:59:59';
        });
        console.log("Filtrado por fecha hasta:", fechaHasta, "Resultados:", filtered.length);
    }
    
    if (filtroFolio && filtroFolio !== '') {
        filtered = filtered.filter(f => f.folio && f.folio.toString().includes(filtroFolio));
        console.log("Filtrado por folio:", filtroFolio, "Resultados:", filtered.length);
    }
    
    // Mostrar resultados
    const container = document.getElementById('filter-results');
    if (!container) {
        console.error("Contenedor filter-results no encontrado");
        return;
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No se encontraron resultados</h3>
                <p>Intenta con otros criterios de búsqueda</p>
                <button onclick="applyDefaultFilter()" class="btn-primary">
                    <i class="fas fa-redo"></i> Mostrar todos los folios
                </button>
            </div>
        `;
        return;
    }
    
    // Crear tabla con los 16 campos
    let html = `
        <div class="results-info">
            <div class="results-header">
                <p>Se encontraron <strong>${filtered.length}</strong> resultados</p>
                <div class="results-actions">
                    <button onclick="imprimirTablaResultados()" class="btn-primary">
                        <i class="fas fa-print"></i> Imprimir Tabla
                    </button>
                    <button onclick="exportarTablaExcel()" class="btn-success">
                        <i class="fas fa-file-excel"></i> Exportar a Excel
                    </button>
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <table id="tabla-resultados-filtrados" class="resultados-table">
                <thead>
                    <tr>
                        <th>TIPO</th>
                        <th>COPE</th>
                        <th>TELÉFONO</th>
                        <th>FOLIO</th>
                        <th>TAREA</th>
                        <th>DISTRITO</th>
                        <th>TÉCNICO</th>
                        <th>FECHA</th>
                        <th>PLANTILLA</th>
                        <th>ENCUESTA</th>
                        <th>INSTALACIÓN</th>
                        <th>METRAJE</th>
                        <th>ALFANUMERICO</th>
                        <th>VENTANAS</th>
                        <th>RADIALES</th>
                        <th>PENDIENTE</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    filtered.forEach(f => {
        // Formatear fecha
        let fechaStr = 'Sin fecha';
        if (f.fecha) {
            if (f.fecha instanceof firebase.firestore.Timestamp) {
                fechaStr = f.fecha.toDate().toLocaleDateString('es-MX');
            } else {
                fechaStr = new Date(f.fecha).toLocaleDateString('es-MX');
            }
        }

    // Guardar el técnico filtrado en un atributo de datos para fácil acceso
    const container = document.getElementById('filter-results');
    if (container) {
        if (filtroTecnico) {
            container.dataset.tecnicoFiltrado = filtroTecnico;
        }
        if (fechaDesde && fechaHasta) {
            container.dataset.fechaDesde = fechaDesde;
            container.dataset.fechaHasta = fechaHasta;
        }
    }
        
        // Determinar PENDIENTE
        const pendiente = f.pendiente === 'si' ? 'SÍ' : 'NO';
        
        // Obtener valores con defaults
        const tipo = f.tipo || 'N/A';
        const cope = f.cope || 'N/A';
        const telefono = f.telefono || 'N/A';
        const folio = f.folio || 'N/A';
        const tarea = f.tarea || 'N/A';
        const distrito = f.distrito || 'N/A';
        const tecnico = f.tecnico || 'N/A';
        const plantilla = f.plantilla || 'OK';
        const encuesta = f.encuesta || 'OK';
        const instalacion = f.instalacion || 'AEREA';
        const metraje = f.metraje ? `${f.metraje} m` : '0 m';
        const alfanumerico = f.alfanumerico || '';
        const ventanas = f.ventanas || '0';
        const radiales = f.radiales || '0';
        
        html += `
            <tr>
                <td>${tipo}</td>
                <td>${cope}</td>
                <td>${telefono}</td>
                <td>${folio}</td>
                <td>${tarea}</td>
                <td>${distrito}</td>
                <td>${tecnico}</td>
                <td>${fechaStr}</td>
                <td>${plantilla}</td>
                <td>${encuesta}</td>
                <td>${instalacion}</td>
                <td>${metraje}</td>
                <td>${alfanumerico}</td>
                <td>${ventanas}</td>
                <td>${radiales}</td>
                <td>${pendiente}</td>
                <td>
        `;
        
        if (currentUser && currentUser.role === 'tecnico') {
            html += `<button onclick="openEditModal('${f.id}')" class="btn-primary btn-small">Modificar</button>`;
        } else if (['gerente', 'administrativo', 'supervisor'].includes(currentUser?.role)) {
            html += `
                <button onclick="openEditModal('${f.id}')" class="btn-small btn-primary">Modificar</button>
                <button onclick="deleteFolio('${f.id}')" class="btn-small btn-danger">Eliminar</button>
            `;
        }
        html += '</td></tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ======================
// FUNCIÓN PARA IMPRIMIR TABLA EN FORMATO HORIZONTAL (CON TÉCNICO)
// ======================
function imprimirTablaResultados() {
    const tabla = document.getElementById('tabla-resultados-filtrados');
    if (!tabla) {
        alert('No hay tabla para imprimir');
        return;
    }
    
    const filas = tabla.querySelectorAll('tbody tr');
    if (filas.length === 0) {
        alert('No hay datos para imprimir');
        return;
    }
    
    // Obtener el técnico seleccionado del formulario de filtros
    const filtroTecnicoSelect = document.querySelector('select[name="filtro-tecnico"]');
    const tecnicoSeleccionado = filtroTecnicoSelect ? filtroTecnicoSelect.value : '';
    
    // Obtener rango de fechas del formulario
    const fechaDesde = document.querySelector('input[name="fecha-desde"]')?.value || '';
    const fechaHasta = document.querySelector('input[name="fecha-hasta"]')?.value || '';
    
    // Determinar el título según si hay técnico seleccionado o no
    let tituloReporte = 'REPORTE DE FOLIOS - TABLA COMPLETA';
    let subtituloTecnico = '';
    
    if (tecnicoSeleccionado) {
        tituloReporte = `REPORTE DE FOLIOS - ${tecnicoSeleccionado.toUpperCase()}`;
        subtituloTecnico = `TÉCNICO: ${tecnicoSeleccionado}`;
    }
    
    // Obtener encabezados (excluyendo la columna ACCIONES)
    const thElements = Array.from(tabla.querySelectorAll('thead th'));
    const encabezados = thElements.slice(0, 16).map(th => th.textContent.trim()); // Solo 16 columnas
    
    // Crear contenido para impresión horizontal
    let contenido = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${tituloReporte} - ${new Date().toLocaleDateString()}</title>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: landscape;
                    margin: 0.5cm;
                }
                @media print {
                    @page {
                        size: landscape;
                        margin: 0.5cm;
                    }
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Arial', 'Helvetica', sans-serif;
                    font-size: 8pt;
                    line-height: 1.2;
                    color: #000;
                    margin: 0;
                    padding: 10px;
                    background: white;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .contenedor-reporte {
                    width: 100%;
                    margin: 0 auto;
                }
                .encabezado-reporte {
                    text-align: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #2563eb;
                    page-break-after: avoid;
                }
                .encabezado-reporte h1 {
                    color: #2563eb;
                    margin: 0 0 5px 0;
                    font-size: 16pt;
                    text-transform: uppercase;
                }
                .encabezado-reporte .subtitulo-principal {
                    color: #334155;
                    font-size: 11pt;
                    font-weight: 600;
                    margin: 5px 0;
                }
                .encabezado-reporte .subtitulo-secundario {
                    color: #64748b;
                    font-size: 9pt;
                    margin: 2px 0;
                }
                .info-reporte {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 8px 12px;
                    background: #f8fafc;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    font-size: 9pt;
                    page-break-after: avoid;
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .info-item strong {
                    color: #334155;
                }
                .info-item span {
                    color: #2563eb;
                    font-weight: 600;
                }
                .badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 8pt;
                    font-weight: 600;
                    margin-left: 5px;
                }
                .badge-fibra {
                    background-color: rgba(37, 99, 235, 0.1);
                    color: #2563eb;
                    border: 1px solid rgba(37, 99, 235, 0.3);
                }
                .badge-cobre {
                    background-color: rgba(245, 158, 11, 0.1);
                    color: #f59e0b;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }
                .badge-pendiente {
                    background-color: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }
                .badge-tecnico {
                    background-color: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }
                
                /* ESTILOS DE LA TABLA PARA IMPRESIÓN */
                .tabla-impresion {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    font-size: 7pt !important;
                    page-break-inside: auto !important;
                }
                .tabla-impresion th {
                    background: linear-gradient(to bottom, #f8fafc, #e2e8f0) !important;
                    color: #334155 !important;
                    padding: 6px 4px !important;
                    text-align: left !important;
                    font-weight: 700 !important;
                    border: 1px solid #cbd5e1 !important;
                    border-bottom: 2px solid #2563eb !important;
                    text-transform: uppercase !important;
                    font-size: 7pt !important;
                    letter-spacing: 0.3px !important;
                    white-space: nowrap !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .tabla-impresion td {
                    padding: 5px 4px !important;
                    border: 1px solid #e2e8f0 !important;
                    vertical-align: middle !important;
                    color: #334155 !important;
                    font-size: 7pt !important;
                    line-height: 1.1 !important;
                    word-break: break-word !important;
                    max-width: 100px !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                }
                .tabla-impresion tr:nth-child(even) td {
                    background-color: #f8fafc !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* ESTILOS ESPECÍFICOS POR COLUMNA PARA IMPRESIÓN */
                .tabla-impresion td:nth-child(1) { /* TIPO */
                    font-weight: 600 !important;
                    max-width: 60px !important;
                }
                .tabla-impresion td:nth-child(1):contains("FIBRA") {
                    color: #2563eb !important;
                    background-color: rgba(37, 99, 235, 0.05) !important;
                }
                .tabla-impresion td:nth-child(1):contains("COBRE") {
                    color: #f59e0b !important;
                    background-color: rgba(245, 158, 11, 0.05) !important;
                }
                
                .tabla-impresion td:nth-child(2) { /* COPE */
                    max-width: 70px !important;
                }
                .tabla-impresion td:nth-child(3) { /* TELÉFONO */
                    max-width: 80px !important;
                    font-family: 'Courier New', monospace !important;
                }
                .tabla-impresion td:nth-child(4) { /* FOLIO */
                    max-width: 80px !important;
                    font-weight: 600 !important;
                    font-family: 'Courier New', monospace !important;
                }
                .tabla-impresion td:nth-child(5) { /* TAREA */
                    max-width: 70px !important;
                }
                .tabla-impresion td:nth-child(6) { /* DISTRITO */
                    max-width: 80px !important;
                }
                .tabla-impresion td:nth-child(7) { /* TÉCNICO */
                    max-width: 100px !important;
                    font-weight: 600 !important;
                }
                .tabla-impresion td:nth-child(8) { /* FECHA */
                    max-width: 70px !important;
                    color: #64748b !important;
                }
                .tabla-impresion td:nth-child(9), /* PLANTILLA */
                .tabla-impresion td:nth-child(10) { /* ENCUESTA */
                    max-width: 60px !important;
                    text-align: center !important;
                }
                .tabla-impresion td:nth-child(11) { /* INSTALACIÓN */
                    max-width: 70px !important;
                }
                .tabla-impresion td:nth-child(12) { /* METRAJE */
                    max-width: 60px !important;
                    text-align: center !important;
                    font-weight: 600 !important;
                    font-family: 'Courier New', monospace !important;
                }
                .tabla-impresion td:nth-child(13) { /* ALFANUMERICO */
                    max-width: 100px !important;
                    font-family: 'Courier New', monospace !important;
                }
                .tabla-impresion td:nth-child(14), /* VENTANAS */
                .tabla-impresion td:nth-child(15) { /* RADIALES */
                    max-width: 50px !important;
                    text-align: center !important;
                    font-weight: 600 !important;
                    font-family: 'Courier New', monospace !important;
                }
                .tabla-impresion td:nth-child(16) { /* PENDIENTE */
                    max-width: 50px !important;
                    text-align: center !important;
                    font-weight: 700 !important;
                    border-radius: 3px !important;
                }
                .tabla-impresion td:nth-child(16):contains("SÍ") {
                    color: #ef4444 !important;
                    background-color: rgba(239, 68, 68, 0.1) !important;
                    border: 1px solid rgba(239, 68, 68, 0.3) !important;
                }
                .tabla-impresion td:nth-child(16):contains("NO") {
                    color: #10b981 !important;
                    background-color: rgba(16, 185, 129, 0.1) !important;
                    border: 1px solid rgba(16, 185, 129, 0.3) !important;
                }
                
                /* CONTROL DE PAGINACIÓN */
                .tabla-impresion tr {
                    page-break-inside: avoid !important;
                    page-break-after: auto !important;
                }
                
                .pie-pagina {
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 1px dashed #94a3b8;
                    text-align: center;
                    font-size: 7pt;
                    color: #64748b;
                    page-break-before: avoid;
                }
                
                .contador-pagina {
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    font-size: 7pt;
                    color: #94a3b8;
                }
                
                @media print {
                    body {
                        padding: 5px !important;
                        font-size: 7pt !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .tabla-impresion {
                        font-size: 6pt !important;
                    }
                    .tabla-impresion th,
                    .tabla-impresion td {
                        padding: 4px 3px !important;
                        font-size: 6pt !important;
                    }
                    @page {
                        @bottom-right {
                            content: "Página " counter(page) " de " counter(pages);
                            font-size: 7pt;
                            color: #94a3b8;
                        }
                        @bottom-left {
                            content: "Impreso: ${new Date().toLocaleDateString('es-MX')}";
                            font-size: 7pt;
                            color: #94a3b8;
                        }
                    }
                }
            </style>
        </head>
        <body>
            <div class="contenedor-reporte">
                <div class="encabezado-reporte">
                    <h1>${tituloReporte}</h1>
    `;
    
    // Agregar subtítulos condicionales
    if (subtituloTecnico) {
        contenido += `<p class="subtitulo-principal">${subtituloTecnico}</p>`;
    }
    
    contenido += `
                    <p class="subtitulo-secundario">Sistema de Gestión de Instalaciones</p>
    `;
    
    // Agregar rango de fechas si está disponible
    if (fechaDesde && fechaHasta) {
        contenido += `<p class="subtitulo-secundario">Periodo: ${fechaDesde} al ${fechaHasta}</p>`;
    } else {
        contenido += `<p class="subtitulo-secundario">${new Date().toLocaleDateString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}</p>`;
    }
    
    contenido += `
                </div>
                
                <div class="info-reporte">
                    <div class="info-item">
                        <strong>Total registros:</strong>
                        <span>${filas.length}</span>
                        <span class="badge badge-fibra">FIBRA: ${Array.from(filas).filter(f => f.cells[0]?.textContent === 'FIBRA').length}</span>
                        <span class="badge badge-cobre">COBRE: ${Array.from(filas).filter(f => f.cells[0]?.textContent === 'COBRE').length}</span>
                    </div>
                    <div class="info-item">
                        <strong>Pendientes:</strong>
                        <span class="badge badge-pendiente">${Array.from(filas).filter(f => f.cells[15]?.textContent === 'SÍ').length}</span>
                    </div>
                    <div class="info-item">
    `;
    
    // Mostrar badge de técnico si hay uno seleccionado
    if (tecnicoSeleccionado) {
        contenido += `
                        <strong>Técnico:</strong>
                        <span class="badge badge-tecnico">${tecnicoSeleccionado}</span>
        `;
    } else {
        // Mostrar cantidad de técnicos únicos
        const tecnicosUnicos = new Set(Array.from(filas).map(f => f.cells[6]?.textContent));
        contenido += `
                        <strong>Técnicos:</strong>
                        <span class="badge">${tecnicosUnicos.size} diferentes</span>
        `;
    }
    
    contenido += `
                    </div>
                    <div class="info-item">
                        <strong>Generado:</strong>
                        <span>${new Date().toLocaleDateString('es-MX', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                        })}</span>
                    </div>
                </div>
                
                <div style="overflow-x: visible; margin-top: 10px;">
                    <table class="tabla-impresion">
                        <thead>
                            <tr>
    `;
    
    // Agregar encabezados
    encabezados.forEach((encabezado, index) => {
        // Ajustar ancho de columnas específicas
        let ancho = '';
        if (index === 0) ancho = ' style="min-width: 60px;"'; // TIPO
        else if (index === 3) ancho = ' style="min-width: 80px;"'; // FOLIO
        else if (index === 6) ancho = ' style="min-width: 100px;"'; // TÉCNICO
        else if (index === 12) ancho = ' style="min-width: 100px;"'; // ALFANUMERICO
        else if (index === 14 || index === 15) ancho = ' style="min-width: 50px;"'; // VENTANAS/RADIALES
        
        contenido += `<th${ancho}>${encabezado}</th>`;
    });
    
    contenido += `
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    // Agregar filas de datos
    filas.forEach((fila, indexFila) => {
        const celdas = Array.from(fila.querySelectorAll('td'));
        
        contenido += '<tr>';
        
        // Tomar solo las primeras 16 columnas (excluir ACCIONES)
        for (let i = 0; i < 16; i++) {
            if (celdas[i]) {
                let valor = celdas[i].textContent.trim();
                
                // Formatear valores específicos para impresión
                if (i === 12) { // METRAJE
                    valor = valor.replace(' m', '');
                }
                
                // Determinar clase específica para PENDIENTE
                let claseEspecial = '';
                if (i === 15 && valor === 'SÍ') {
                    claseEspecial = 'pendiente-si';
                } else if (i === 15 && valor === 'NO') {
                    claseEspecial = 'pendiente-no';
                }
                
                // Determinar clase para TIPO
                if (i === 0 && valor === 'FIBRA') {
                    claseEspecial = 'tipo-fibra';
                } else if (i === 0 && valor === 'COBRE') {
                    claseEspecial = 'tipo-cobre';
                }
                
                contenido += `<td class="${claseEspecial}">${valor}</td>`;
            } else {
                contenido += '<td></td>';
            }
        }
        
        contenido += '</tr>';
    });
    
    contenido += `
                        </tbody>
                    </table>
                </div>
                
                <div class="pie-pagina">
                    <p>
                        <strong>Resumen:</strong> 
                        ${filas.length} registros | 
                        ${new Set(Array.from(filas).map(f => f.cells[6]?.textContent)).size} técnicos |
    `;
    
    // Agregar información específica del técnico al pie de página
    if (tecnicoSeleccionado) {
        const foliosTecnico = Array.from(filas).filter(f => f.cells[6]?.textContent === tecnicoSeleccionado).length;
        const pendientesTecnico = Array.from(filas).filter(f => 
            f.cells[6]?.textContent === tecnicoSeleccionado && 
            f.cells[15]?.textContent === 'SÍ'
        ).length;
        
        contenido += ` Técnico: ${tecnicoSeleccionado} (${foliosTecnico} folios${pendientesTecnico > 0 ? `, ${pendientesTecnico} pendientes` : ''}) |`;
    }
    
    contenido += `
                        Impreso en formato horizontal
                    </p>
                    <p style="font-size: 6pt; margin-top: 5px;">
                        Documento generado automáticamente. Los datos mostrados son confidenciales.
                    </p>
                </div>
            </div>
            
            <script>
                // Asegurar que la tabla mantenga sus estilos al imprimir
                window.onload = function() {
                    // Forzar repintado para asegurar estilos de impresión
                    document.body.style.zoom = "100%";
                    
                    // Pequeño delay para asegurar que todo esté renderizado
                    setTimeout(function() {
                        // Configurar para imprimir en landscape
                        const style = document.createElement('style');
                        style.textContent = '@page { size: landscape; }';
                        document.head.appendChild(style);
                        
                        // Imprimir
                        window.print();
                        
                        // Cerrar ventana después de imprimir
                        window.onafterprint = function() {
                            setTimeout(function() {
                                window.close();
                            }, 500);
                        };
                    }, 300);
                };
                
                // Manejar el botón cancelar
                window.onbeforeunload = function() {
                    return "¿Estás seguro de que quieres cancelar la impresión?";
                };
            </script>
        </body>
        </html>
    `;
    
    // Abrir ventana de impresión
    const ventanaImpresion = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
    
    // Escribir el contenido
    ventanaImpresion.document.open();
    ventanaImpresion.document.write(contenido);
    ventanaImpresion.document.close();
    
    // Enfocar la ventana
    ventanaImpresion.focus();
}

// ======================
// VERSIÓN MEJORADA PARA OBTENER EL TÉCNICO DEL FORMULARIO
// ======================
function obtenerTecnicoFiltrado() {
    // Buscar el select de técnico en el formulario de filtros
    const selectTecnico = document.querySelector('select[name="filtro-tecnico"]');
    
    if (selectTecnico && selectTecnico.value) {
        return selectTecnico.value;
    }
    
    // Si no hay técnico seleccionado, verificar si hay un solo técnico en la tabla
    const tabla = document.getElementById('tabla-resultados-filtrados');
    if (tabla) {
        const filas = tabla.querySelectorAll('tbody tr');
        const tecnicos = new Set();
        
        filas.forEach(fila => {
            const tecnico = fila.cells[6]?.textContent;
            if (tecnico) {
                tecnicos.add(tecnico);
            }
        });
        
        // Si hay solo un técnico en la tabla, usarlo
        if (tecnicos.size === 1) {
            return Array.from(tecnicos)[0];
        }
    }
    
    return '';
}

// ======================
// FUNCIÓN PARA EXPORTAR A EXCEL (ACTUALIZADA)
// ======================
function exportarTablaExcel() {
    const tabla = document.getElementById('tabla-resultados-filtrados');
    if (!tabla) {
        alert('No hay tabla para exportar');
        return;
    }
    
    const filas = tabla.querySelectorAll('tbody tr');
    if (filas.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    // Obtener encabezados (excluyendo la columna ACCIONES)
    const thElements = Array.from(tabla.querySelectorAll('thead th'));
    const encabezados = thElements.slice(0, 16).map(th => th.textContent.trim()); // Solo 16 columnas
    
    // Crear contenido CSV
    let csvContent = "\uFEFF"; // BOM para UTF-8
    csvContent += encabezados.join(',') + '\n';
    
    filas.forEach(fila => {
        const celdas = Array.from(fila.querySelectorAll('td'));
        const filaDatos = [];
        
        // Tomar solo las primeras 16 columnas (excluir ACCIONES)
        for (let i = 0; i < 16; i++) {
            if (celdas[i]) {
                let texto = celdas[i].textContent.trim();
                
                // Limpiar y formatear valores
                if (i === 11) { // Columna METRAJE
                    texto = texto.replace(' m', '');
                }
                
                // Escapar comas y comillas
                if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
                    texto = '"' + texto.replace(/"/g, '""') + '"';
                }
                
                filaDatos.push(texto);
            } else {
                filaDatos.push('');
            }
        }
        
        csvContent += filaDatos.join(',') + '\n';
    });
    
    // Crear archivo y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fecha = new Date().toISOString().split('T')[0];
    const hora = new Date().toLocaleTimeString('es-MX', { hour12: false }).replace(/:/g, '-');
    
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Folios_${fecha}_${hora}.csv`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Archivo exportado exitosamente: ${link.download}`);
}

// ======================
// ESTILOS PARA LA NUEVA TABLA
// ======================
const estilosTablaActualizados = `
<style>
    .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .results-header p {
        margin: 0;
        font-size: 16px;
        color: var(--text-light);
    }
    
    .results-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .results-actions button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .results-actions button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .results-actions .btn-primary {
        background: linear-gradient(135deg, #1e3a8a, #2d4ba8);
        color: white;
    }
    
    .results-actions .btn-primary:hover {
        background: linear-gradient(135deg, #162b63, #1e3a8a);
    }
    
    .results-actions .btn-success {
        background: linear-gradient(135deg, #28a745, #34ce57);
        color: white;
    }
    
    .results-actions .btn-success:hover {
        background: linear-gradient(135deg, #1e7e34, #28a745);
    }
    
    .table-responsive {
        overflow-x: auto;
        max-width: 100%;
        margin: 20px 0;
        border: var(--dark-border);
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        background: background-color;
    }
    
    .resultados-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        min-width: 1500px; /* Para acomodar todas las columnas */
    }
    
    .resultados-table th {
        background: var(background-color);
        color: --text-light;
        padding: 14px 10px;
        text-align: left;
        font-weight: 600;
        border: 1px solid var(--dark-border);
        position: sticky;
        top: 0;
        white-space: nowrap;
    }
    
    .resultados-table td {
        padding: 12px 10px;
        border: 1px solid var(--dark-border);
        vertical-align: middle;
        background: var(background-color);
    }
    
    .resultados-table tr:nth-child(even) td {
        background-color: #1e293b;
    }
    
    .resultados-table tr:hover td {
        background-color: #5173aa;
    }
    
    .btn-small {
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 4px;
        margin: 2px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .btn-small.btn-primary {
        background-color: #1e3a8a;
        color: white;
    }
    
    .btn-small.btn-primary:hover {
        background-color: #162b63;
    }
    
    .btn-small.btn-danger {
        background-color: #dc3545;
        color: white;
    }
    
    .btn-small.btn-danger:hover {
        background-color: #c82333;
    }
    
    /* Estilos para columna PENDIENTE */
    .resultados-table td:nth-child(16) {
        font-weight: bold;
        text-align: center;
    }
    
    .resultados-table td:nth-child(16):contains("SÍ") {
        color: #e74c3c;
        background-color: rgba(231, 76, 60, 0.1);
    }
    
    .resultados-table td:nth-child(16):contains("NO") {
        color: #27ae60;
        background-color: rgba(39, 174, 96, 0.1);
    }
    
    /* Estilos para columnas numéricas */
    .resultados-table td:nth-child(12),
    .resultados-table td:nth-child(14),
    .resultados-table td:nth-child(15) {
        text-align: center;
        font-weight: 600;
    }
    
    @media (max-width: 1200px) {
        .results-header {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .results-actions {
            width: 100%;
            justify-content: flex-start;
        }
    }
    
    @media print {
        .results-actions,
        .resultados-table th:last-child,
        .resultados-table td:last-child {
            display: none !important;
        }
        
        .resultados-table {
            min-width: auto;
            width: 100%;
            font-size: 10pt;
        }
        
        .resultados-table th {
            background: #1e293b; !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
        }
    }
</style>
`;

// Agrega los estilos al documento
if (!document.querySelector('#estilos-tabla-actualizados')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'estilos-tabla-actualizados';
    styleElement.textContent = estilosTablaActualizados;
    document.head.appendChild(styleElement);
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

    // Bloqueamos el botón para evitar clics dobles
    const btnGuardar = this.querySelector('button[type="submit"]');
    if (btnGuardar) btnGuardar.disabled = true;

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

        // 1. Guardamos en Firebase
        await db.collection('folios').doc(folioEnEdicion.id).update(updateObj);

        // 2. Cerramos el modal ANTES del alert para una transición suave
        closeEditModal();
        
        alert('✅ Folio actualizado correctamente.');

        /* NOTA IMPORTANTE: 
           He eliminado la actualización manual de 'folios[idx]' y el 'dispatchEvent'.
           Como tienes onSnapshot activo, Firebase enviará los nuevos datos 
           automáticamente y tus tablas se refrescarán sin parpadeos.
        */

    } catch (error) {
        console.error('Error al actualizar folio:', error);
        alert('❌ Error al guardar los cambios.');
    } finally {
        if (btnGuardar) btnGuardar.disabled = false;
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

// Función para llenar el formulario con los precios actuales
function mostrarPreciosEnFormulario() {
    console.log("Cargando precios en el formulario...");
    const form = document.getElementById('precios-form');
    if (!form) {
        console.warn("No se encontró el formulario 'precios-form'");
        return;
    }

    // Recorremos el objeto global 'precios' para llenar los inputs
    if (typeof precios !== 'undefined') {
        Object.keys(precios).forEach(key => {
            const input = form.querySelector(`input[name="${key}"]`);
            if (input) {
                input.value = precios[key];
            }
        });
    } else {
        console.error("La variable global 'precios' no está definida.");
    }
}

document.getElementById('precios-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!currentUser || !['administrativo', 'gerente'].includes(currentUser.role)) {
        alert('No tienes permisos para modificar precios.');
        return;
    }

    const formData = new FormData(this);
    
    // 1. Actualizar el objeto local con los datos del formulario
    Object.keys(precios).forEach(key => {
        const value = formData.get(key);
        if (value) precios[key] = parseFloat(value);
    });

    try {
        // 2. RUTA CORRECTA: Colección 'config', Documento 'precios'
        await db.collection('config').doc('precios').set(precios);
        console.log("Sincronizado con Firebase en config/precios");
        
        // 3. Guardar también en localStorage como respaldo
        saveToStorage();
        
        alert('Precios actualizados y sincronizados en la nube correctamente.');
        
        // 4. Refrescar tablas para ver los cálculos nuevos
        if (typeof displayFFTHTable === 'function') displayFFTHTable();
        if (typeof displayCobreTable === 'function') displayCobreTable();
        
    } catch (error) {
        console.error("Error al guardar en Firebase:", error);
        alert("Error de conexión: Los precios se guardaron solo localmente.");
    }
});

// ======================
// GENERAR RECIBO PROFESIONAL PARA IMPRESIÓN TECNICO
// ======================
function generateNominaReceipt(tecnico, data, desde, hasta) {
    try {
        console.log("Generando recibo mejorado para:", tecnico);
        
        const receiptDiv = document.getElementById('nomina-receipt');
        if (!receiptDiv) {
            console.error("Elemento nomina-receipt no encontrado");
            return;
        }
        
        // Determinar puesto según nombre de usuario
        let puesto = determinarPuesto(tecnico);
        
        // URL del logo desde GitHub
        const logoUrl = 'https://raw.githubusercontent.com/infinity-system-cpu/rosteraccrued-dashboard/main/assets/logo.png';
        
        // Calcular totales iniciales
        let totalVentanas = 0;
        let totalRadiales = 0;
        let totalFolios = data.length;
        let totalCosto = 0;
        
        data.forEach((folio, index) => {
            totalVentanas += parseInt(folio.ventanas) || 0;
            totalRadiales += parseInt(folio.radiales) || 0;
            
            // Calcular costo
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
        });
        
        const costoVentanas = totalVentanas * 50;
        const costoRadiales = totalRadiales * 100;
        let totalBruto = totalCosto + costoVentanas + costoRadiales;
        
        // Obtener deducciones guardadas
        const keyDeducciones = `deducciones_tecnico_${tecnico}`;
        let deducciones = JSON.parse(localStorage.getItem(keyDeducciones)) || [];
        
        // Calcular total deducciones
        let totalDeducciones = 0;
        deducciones.forEach(d => {
            totalDeducciones += parseFloat(d.monto) || 0;
        });
        
        let netoAPagar = totalBruto - totalDeducciones;
        
        // Formatear fechas
        const [desdeYear, desdeMonth, desdeDay] = desde.split('-');
        const fechaDesde = `${desdeDay}/${desdeMonth}/${desdeYear}`;
        
        const [hastaYear, hastaMonth, hastaDay] = hasta.split('-');
        const fechaHasta = `${hastaDay}/${hastaMonth}/${hastaYear}`;
        
        const hoy = new Date();
        const fechaHoy = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
        
        // Crear HTML del recibo mejorado
        const html = `
        <div class="receipt-container no-print">
            <button onclick="printNomina()" class="btn-print">
                <i class="fas fa-print"></i> Imprimir Recibo
            </button>
            <button onclick="agregarDeduccionTecnico('${tecnico}')" class="btn-agregar">
                <i class="fas fa-plus-circle"></i> Agregar Deducción
            </button>
            <button onclick="actualizarTotalesTecnico('${tecnico}')" class="btn-actualizar">
                <i class="fas fa-calculator"></i> Actualizar Totales
            </button>
            <button onclick="agregarPercepcionTecnico()" class="btn-agregar">
                <i class="fas fa-plus-circle"></i> Agregar Percepción
            </button>
            <button onclick="agregarComentariosTecnico()" class="btn-agregar">
                <i class="fas fa-comment"></i> Agregar Comentarios
            </button>
            <button onclick="mostrarBusquedaNominas('tecnico')" class="btn-historial">
                <i class="fas fa-history"></i> Ver Historial
            </button>
            <button onclick="guardarCambiosTecnico('${tecnico}')" class="btn-guardar">
                <i class="fas fa-save"></i> Guardar Nómina
            </button>
        </div>
        
        <div id="recibo-impresion" class="recibo-profesional">
            <!-- ENCABEZADO CON LOGO -->
            <div class="recibo-header">
                <div class="logo-container">
                    <img src="${logoUrl}" alt="Logo Empresa" class="recibo-logo" 
                         onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiMxZTNhOGEiLz48dGV4dCB4PSIxMDAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxPR08gRU1QUkVTQTwvdGV4dD48L3N2Zz4='">
                </div>
                <div class="recibo-titulo">
                    <h1>RECIBO DE PAGO TÉCNICO</h1>
                    <p class="subtitulo">SERVICIOS TÉCNICOS DE INSTALACIÓN</p>
                </div>
                <div class="recibo-info">
                    <p><strong>Fecha:</strong> ${fechaHoy}</p>
                    <p><strong>Recibo No:</strong> TEC-${obtenerNumeroReciboTecnico()}</p>
                </div>
            </div>
            
            <!-- INFORMACIÓN DEL TÉCNICO -->
            <div class="recibo-seccion">
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Técnico:</strong>
                        <span>${tecnico}</span>
                    </div>
                    <div class="info-item">
                        <strong>Puesto:</strong>
                        <span>${puesto}</span>
                    </div>
                    <div class="info-item">
                        <strong>Periodo:</strong>
                        <span>${fechaDesde} al ${fechaHasta}</span>
                    </div>
                    <div class="info-item">
                        <strong>Folios:</strong>
                        <span>${totalFolios}</span>
                    </div>
                </div>
            </div>
            
            <!-- TABLA DE SERVICIOS EDITABLE -->
            <div class="recibo-seccion">
                <h2><i class="fas fa-clipboard-list"></i> DETALLE DE SERVICIOS</h2>
                <table class="recibo-table editable-table" id="tabla-servicios-tecnico">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Fecha</th>
                            <th>Folio/OS</th>
                            <th>Tipo</th>
                            <th>Instalación</th>
                            <th class="text-right">Costo</th>
                        </tr>
                    </thead>
                    <tbody id="cuerpo-servicios-tecnico">
                        ${data.map((folio, index) => {
                            // Calcular costo
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
                            
                            // Formatear fecha
                            let fechaStr = '';
                            if (folio.fecha) {
                                if (folio.fecha instanceof firebase.firestore.Timestamp) {
                                    const fecha = folio.fecha.toDate();
                                    fechaStr = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
                                }
                            }
                            
                            return `
                            <tr data-index="${index}" data-folio-id="${folio.id || ''}">
                                <td class="editable" contenteditable="true" data-field="numero">${index + 1}</td>
                                <td class="editable" contenteditable="true" data-field="fecha">${fechaStr}</td>
                                <td class="editable" contenteditable="true" data-field="folio">${folio.folio || ''}</td>
                                <td class="editable" contenteditable="true" data-field="tipo">${folio.tipo || 'FIBRA'}</td>
                                <td class="editable" contenteditable="true" data-field="instalacion">${folio.instalacion || 'AEREA'}</td>
                                <td class="editable text-right" contenteditable="true" data-field="costo" data-costo-base="${costo}">$${costo.toFixed(2)}</td>
                            </tr>`;
                        }).join('')}
                        
                        <!-- VENTANAS Y RADIALES -->
                        ${totalVentanas > 0 ? `
                        <tr class="extra-row" data-tipo="ventanas">
                            <td colspan="5" class="text-right"><strong>VENTANAS (${totalVentanas})</strong></td>
                            <td class="editable text-right" contenteditable="true" data-field="ventanas">$${costoVentanas.toFixed(2)}</td>
                        </tr>` : ''}
                        
                        ${totalRadiales > 0 ? `
                        <tr class="extra-row" data-tipo="radiales">
                            <td colspan="5" class="text-right"><strong>RADIALES (${totalRadiales})</strong></td>
                            <td class="editable text-right" contenteditable="true" data-field="radiales">$${costoRadiales.toFixed(2)}</td>
                        </tr>` : ''}
                        
                        <!-- SUBTOTAL -->
                        <tr class="subtotal-row">
                            <td colspan="5" class="text-right"><strong>SUBTOTAL</strong></td>
                            <td class="text-right" id="subtotal-tecnico">$${totalBruto.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- SECCIÓN DE DEDUCCIONES -->
            <div class="recibo-seccion">
                <h2><i class="fas fa-minus-circle"></i> DEDUCCIONES APLICADAS</h2>
                <div class="deducciones-container">
                    <table class="deducciones-table" id="tabla-deducciones-tecnico">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th>Descripción</th>
                                <th class="text-right">Monto</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-deducciones-tecnico">
                            ${deducciones.map((ded, index) => `
                            <tr data-index="${index}">
                                <td class="editable" contenteditable="true" data-field="concepto">${ded.concepto || 'Deducción'}</td>
                                <td class="editable" contenteditable="true" data-field="descripcion">${ded.descripcion || ''}</td>
                                <td class="editable text-right" contenteditable="true" data-field="monto">$${parseFloat(ded.monto || 0).toFixed(2)}</td>
                                <td class="text-center">
                                    <button onclick="eliminarDeduccionTecnico(${index}, '${tecnico}')" class="btn-eliminar-small">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            `).join('')}
                            
                            ${deducciones.length === 0 ? `
                            <tr id="sin-deducciones">
                                <td colspan="4" class="text-center">
                                    <em>No hay deducciones registradas. Haz clic en "Agregar Deducción"</em>
                                </td>
                            </tr>` : ''}
                        </tbody>
                        <tfoot>
                            <tr class="total-deducciones">
                                <td colspan="2" class="text-right"><strong>TOTAL DEDUCCIONES</strong></td>
                                <td class="text-right" id="total-deducciones-tecnico">$${totalDeducciones.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            <!-- TOTAL FINAL -->
            <div class="recibo-seccion total-final">
                <div class="total-container">
                    <div class="total-item">
                        <span>Total Bruto:</span>
                        <span id="display-total-bruto">$${totalBruto.toFixed(2)}</span>
                    </div>
                    <div class="total-item">
                        <span>Total Deducciones:</span>
                        <span id="display-total-deducciones" class="negativo">-$${totalDeducciones.toFixed(2)}</span>
                    </div>
                    <div class="total-item final">
                        <span>NETO A PAGAR:</span>
                        <span id="display-neto-pagar">$${netoAPagar.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <!-- FIRMAS -->
            <div class="recibo-seccion">
                <div class="firmas-container">
                    <div class="firma-item">
                        <div class="linea-firma"></div>
                        <p><strong>RECIBÍ CONFORME</strong></p>
                        <p class="firma-nombre">${tecnico}</p>
                        <p>${puesto}</p>
                    </div>
                    
                    <div class="firma-item">
                        <div class="linea-firma"></div>
                        <p><strong>AUTORIZÓ</strong></p>
                        <p class="firma-nombre">GERENCIA DE OPERACIONES</p>
                        <p>Autorización de Pago</p>
                    </div>
                </div>
            </div>
        </div>`;
        
        receiptDiv.innerHTML = html;
        
        // Configurar eventos de edición
        setTimeout(() => {
            configurarEventosEdicionTecnico(tecnico);
        }, 100);
        
    } catch (error) {
        console.error("Error al generar recibo:", error);
        alert("Error al generar el recibo: " + error.message);
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

// Función de fecha optimizada (usando Firebase si es posible)
function compararFechas(fecha1, fecha2) {
    const d1 = fecha1 instanceof firebase.firestore.Timestamp ? fecha1.toDate() : new Date(fecha1);
    const d2 = fecha2 instanceof firebase.firestore.Timestamp ? fecha2.toDate() : new Date(fecha2);
    return d2 <= d1;
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
// GENERAR RECIBO SUPERVISOR PROFESIONAL
// ======================
function generateSupervisorReceipt(supervisor, desde, hasta) {
    try {
        console.log("Generando recibo supervisor mejorado para:", supervisor);
        
        const receiptDiv = document.getElementById('supervisor-receipt');
        if (!receiptDiv) {
            console.error("Elemento supervisor-receipt no encontrado");
            return;
        }
        
        // Determinar puesto según nombre de usuario
        let puesto = determinarPuesto(supervisor);
        
        // URL del logo desde GitHub
        const logoUrl = 'https://raw.githubusercontent.com/infinity-system-cpu/rosteraccrued-dashboard/main/assets/logo.png';
        
        // Obtener datos
        const keyEditables = `editables_supervisor_${supervisor}`;
        let valoresEditables = JSON.parse(localStorage.getItem(keyEditables)) || [
            { dias: "LUNES", tipo: "EMPLEADO", costo: "500.00" },
            { dias: "MARTES", tipo: "EMPLEADO", costo: "500.00" },
            { dias: "MIERCOLES", tipo: "EMPLEADO", costo: "500.00" },
            { dias: "JUEVES", tipo: "EMPLEADO", costo: "500.00" },
            { dias: "VIERNES", tipo: "EMPLEADO", costo: "500.00" },
            { dias: "SABADO", tipo: "EMPLEADO", costo: "750.00" },
            { dias: "DOMINGO", tipo: "EMPLEADO", costo: "750.00" },
            { dias: "HORAS EXTRAS", tipo: "", costo: "" }
        ];
        
        // Obtener deducciones guardadas
        const keyDeducciones = `deducciones_supervisor_${supervisor}`;
        let deducciones = JSON.parse(localStorage.getItem(keyDeducciones)) || [];
        
        // Calcular totales
        let totalBruto = 0;
        valoresEditables.forEach(item => {
            if (item.costo) {
                const match = item.costo.toString().match(/[\d\.]+/);
                totalBruto += match ? parseFloat(match[0]) : 0;
            }
        });
        
        let totalDeducciones = 0;
        deducciones.forEach(d => {
            totalDeducciones += parseFloat(d.monto) || 0;
        });
        
        let netoAPagar = totalBruto - totalDeducciones;
        
        // Formatear fechas
        const [desdeYear, desdeMonth, desdeDay] = desde.split('-');
        const fechaDesde = `${desdeDay}/${desdeMonth}/${desdeYear}`;
        
        const [hastaYear, hastaMonth, hastaDay] = hasta.split('-');
        const fechaHasta = `${hastaDay}/${hastaMonth}/${hastaYear}`;
        
        const hoy = new Date();
        const fechaHoy = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
        
        // Crear HTML del recibo supervisor mejorado
        const html = `
        <div class="receipt-container no-print">
            <button onclick="printSupervisor()" class="btn-print">
                <i class="fas fa-print"></i> Imprimir Recibo
            </button>
            <button onclick="agregarDeduccionSupervisor('${supervisor}')" class="btn-agregar">
                <i class="fas fa-plus-circle"></i> Agregar Deducción
            </button>
            <button onclick="actualizarTotalesSupervisor('${supervisor}')" class="btn-actualizar">
                <i class="fas fa-calculator"></i> Actualizar Totales
            </button>
            <button onclick="agregarPercepcionSupervisor()" class="btn-agregar">
                <i class="fas fa-plus-circle"></i> Agregar Percepción
            </button>
            <button onclick="agregarComentariosSupervisor()" class="btn-agregar">
                <i class="fas fa-comment"></i> Agregar Comentarios
            </button>
            <button onclick="mostrarBusquedaNominas('supervisor')" class="btn-historial">
                <i class="fas fa-history"></i> Ver Historial
            </button>
            <button onclick="guardarCambiosSupervisor('${supervisor}')" class="btn-guardar">
                <i class="fas fa-save"></i> Guardar Nómina
            </button>
        </div>
        
        <div id="recibo-supervisor-impresion" class="recibo-profesional supervisor">
            <!-- ENCABEZADO CON LOGO -->
            <div class="recibo-header">
                <div class="logo-container">
                    <img src="${logoUrl}" alt="Logo Empresa" class="recibo-logo" 
                         onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiMxZTNhOGEiLz48dGV4dCB4PSIxMDAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxPR08gRU1QUkVTQTwvdGV4dD48L3N2Zz4='">
                </div>
                <div class="recibo-titulo">
                    <h1>RECIBO DE PAGO</h1>
                    <p class="subtitulo">SUPERVISIÓN Y COORDINACIÓN TÉCNICA</p>
                </div>
                <div class="recibo-info">
                    <p><strong>Fecha:</strong> ${fechaHoy}</p>
                    <p><strong>Recibo No:</strong> SUP-${obtenerNumeroReciboSupervisor()}</p>
                </div>
            </div>
            
            <!-- INFORMACIÓN DEL SUPERVISOR -->
            <div class="recibo-seccion">
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Nombre:</strong>
                        <span>${supervisor}</span>
                    </div>
                    <div class="info-item">
                        <strong>Puesto:</strong>
                        <span>${puesto}</span>
                    </div>
                    <div class="info-item">
                        <strong>Periodo:</strong>
                        <span>${fechaDesde} al ${fechaHasta}</span>
                    </div>
                    <div class="info-item">
                        <strong>Días Laborados:</strong>
                        <span id="dias-laborados">${valoresEditables.filter(d => d.costo && parseFloat(d.costo) > 0).length}</span>
                    </div>
                </div>
            </div>
            
            <!-- TABLA DE PERCEPCIONES EDITABLE -->
            <div class="recibo-seccion">
                <h2><i class="fas fa-money-bill-wave"></i> PERCEPCIONES SALARIALES</h2>
                <table class="recibo-table supervisor-table editable-table" id="tabla-percepciones-supervisor">
                    <thead>
                        <tr>
                            <th>Día</th>
                            <th>Tipo de Día</th>
                            <th>Concepto</th>
                            <th class="text-right">Cantidad</th>
                            <th class="text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody id="cuerpo-percepciones-supervisor">
                        ${valoresEditables.map((item, index) => {
                            const costoNum = item.costo ? (item.costo.toString().match(/[\d\.]+/) ? parseFloat(item.costo.toString().match(/[\d\.]+/)[0]) : 0) : 0;
                            
                            return `
                            <tr data-index="${index}">
                                <td class="editable" contenteditable="true" data-field="dia">${item.dias || ''}</td>
                                <td class="editable" contenteditable="true" data-field="tipo">${item.tipo || ''}</td>
                                <td class="editable" contenteditable="true" data-field="concepto">${item.dias || 'Salario'}</td>
                                <td class="editable text-right" contenteditable="true" data-field="cantidad">1</td>
                                <td class="editable text-right" contenteditable="true" data-field="monto" data-valor-base="${costoNum}">$${costoNum.toFixed(2)}</td>
                            </tr>`;
                        }).join('')}
                        
                        <!-- SUBTOTAL -->
                        <tr class="subtotal-row">
                            <td colspan="4" class="text-right"><strong>SUBTOTAL PERCEPCIONES</strong></td>
                            <td class="text-right" id="subtotal-supervisor">$${totalBruto.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- SECCIÓN DE DEDUCCIONES -->
            <div class="recibo-seccion">
                <h2><i class="fas fa-minus-circle"></i> DEDUCCIONES APLICADAS</h2>
                <div class="deducciones-container">
                    <table class="deducciones-table" id="tabla-deducciones-supervisor">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th>Descripción</th>
                                <th class="text-right">Monto</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-deducciones-supervisor">
                            ${deducciones.map((ded, index) => `
                            <tr data-index="${index}">
                                <td class="editable" contenteditable="true" data-field="concepto">${ded.concepto || 'Deducción'}</td>
                                <td class="editable" contenteditable="true" data-field="descripcion">${ded.descripcion || ''}</td>
                                <td class="editable text-right" contenteditable="true" data-field="monto">$${parseFloat(ded.monto || 0).toFixed(2)}</td>
                                <td class="text-center">
                                    <button onclick="eliminarDeduccionSupervisor(${index}, '${supervisor}')" class="btn-eliminar-small">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            `).join('')}
                            
                            ${deducciones.length === 0 ? `
                            <tr id="sin-deducciones-supervisor">
                                <td colspan="4" class="text-center">
                                    <em>No hay deducciones registradas. Haz clic en "Agregar Deducción"</em>
                                </td>
                            </tr>` : ''}
                        </tbody>
                        <tfoot>
                            <tr class="total-deducciones">
                                <td colspan="2" class="text-right"><strong>TOTAL DEDUCCIONES</strong></td>
                                <td class="text-right" id="total-deducciones-supervisor">$${totalDeducciones.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            <!-- TOTAL FINAL -->
            <div class="recibo-seccion total-final">
                <div class="total-container">
                    <div class="total-item">
                        <span>Total Bruto:</span>
                        <span id="display-total-bruto-supervisor">$${totalBruto.toFixed(2)}</span>
                    </div>
                    <div class="total-item">
                        <span>Total Deducciones:</span>
                        <span id="display-total-deducciones-supervisor" class="negativo">-$${totalDeducciones.toFixed(2)}</span>
                    </div>
                    <div class="total-item final">
                        <span>NETO A PAGAR:</span>
                        <span id="display-neto-pagar-supervisor">$${netoAPagar.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <!-- FIRMAS -->
            <div class="recibo-seccion">
                <div class="firmas-container supervisor-firmas">
                    <div class="firma-item">
                        
                        <p><strong>RECIBÍ CONFORME</strong></p>
                        <p class="firma-nombre">${supervisor}</p>
                        <p>${puesto}</p>
                    </div>
                    
                    <div class="firma-item">
                        
                        <p><strong>REVISÓ</strong></p>
                        <p class="firma-nombre">GERENCIA DE OPERACIONES</p>
                        <p>Autorización de Pago</p>
                    </div>
                </div>
            </div>
        </div>`;
        
        receiptDiv.innerHTML = html;
        
        // Configurar eventos de edición
        setTimeout(() => {
            configurarEventosEdicionSupervisor(supervisor);
        }, 100);
        
    } catch (error) {
        console.error("Error al generar recibo supervisor:", error);
        alert("Error al generar el recibo supervisor: " + error.message);
    }
}

// ======================
// AGREGAR ESTILOS PARA LOS NUEVOS BOTONES
// ======================
const estilosNominas = `
<style>
    .btn-agregar {
        background: linear-gradient(135deg, #10b981, #34d399);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
    }
    
    .btn-agregar:hover {
        background: linear-gradient(135deg, #0da271, #10b981);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
    }
    
    .btn-historial {
        background: linear-gradient(135deg, #8b5cf6, #a78bfa);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
    }
    
    .btn-historial:hover {
        background: linear-gradient(135deg, #7c3aed, #8b5cf6);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
    }
    
    .fila-percepcion, .fila-percepcion-supervisor {
        background-color: rgba(59, 130, 246, 0.05) !important;
        border-left: 3px solid #3b82f6 !important;
    }
    
    .comentario-item:focus {
        outline: 2px solid #3b82f6;
        background: white !important;
    }
    
    .editado {
        background-color: #fef3c7 !important;
    }
    
    .nominas-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
    }
    
    .nominas-table th {
        background: #1e3a8a;
        color: white;
        padding: 12px;
        text-align: left;
    }
    
    .nominas-table td {
        padding: 10px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .nominas-table tr:hover {
        background: #f3f4f6;
    }
    
    .modal-nomina-view {
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
</style>
`;

// Agregar estilos al documento
if (!document.querySelector('#estilos-nominas-mejoradas')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'estilos-nominas-mejoradas';
    styleElement.textContent = estilosNominas;
    document.head.appendChild(styleElement);
}

// ======================
// FUNCIONES AUXILIARES PARA AMBOS RECIBOS
// ======================

// Función para determinar puesto según nombre de usuario
function determinarPuesto(nombreUsuario) {
    const nombre = nombreUsuario.toLowerCase();
    
    if (nombre.includes('admin') || nombre.includes('administrativo')) {
        return 'Administrativo';
    } else if (nombre.includes('supervisor')) {
        return 'Supervisor de Campo';
    } else if (nombre.includes('gerente')) {
        return 'Gerente General';
    } else if (nombre.includes('tecnico')) {
        return 'Técnico Instalador';
    } else {
        // Buscar en usuarios registrados
        const usuario = users.find(u => u.name.toLowerCase() === nombre);
        if (usuario) {
            switch(usuario.role) {
                case 'administrativo': return 'Administrativo';
                case 'supervisor': return 'Supervisor de Campo';
                case 'gerente': return 'Gerente General';
                case 'tecnico': return 'Técnico Instalador';
                default: return 'Colaborador';
            }
        }
        return 'Colaborador';
    }
}

// ======================
// FUNCIONES PARA TÉCNICO
// ======================

function agregarDeduccionTecnico(tecnico) {
    const cuerpo = document.getElementById('cuerpo-deducciones-tecnico');
    const filaSinDeducciones = document.getElementById('sin-deducciones');
    
    if (filaSinDeducciones) {
        filaSinDeducciones.remove();
    }
    
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
        <td class="editable" contenteditable="true" data-field="concepto">Nueva Deducción</td>
        <td class="editable" contenteditable="true" data-field="descripcion">Descripción</td>
        <td class="editable text-right" contenteditable="true" data-field="monto">$0.00</td>
        <td class="text-center">
            <button onclick="eliminarDeduccionTecnico(${cuerpo.children.length}, '${tecnico}')" class="btn-eliminar-small">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    cuerpo.appendChild(nuevaFila);
    nuevaFila.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function eliminarDeduccionTecnico(index, tecnico) {
    const filas = document.querySelectorAll('#cuerpo-deducciones-tecnico tr');
    if (filas[index]) {
        filas[index].remove();
        actualizarTotalesTecnico(tecnico);
    }
}

function actualizarTotalesTecnico(tecnico) {
    try {
        // Calcular total de servicios
        let totalServicios = 0;
        const filasServicios = document.querySelectorAll('#cuerpo-servicios-tecnico tr');
        
        filasServicios.forEach(fila => {
            if (!fila.classList.contains('subtotal-row')) {
                const celdaCosto = fila.querySelector('td[data-field="costo"]');
                if (celdaCosto) {
                    const texto = celdaCosto.textContent.replace('$', '').replace(',', '').trim();
                    totalServicios += parseFloat(texto) || 0;
                }
            }
        });
        
        // Calcular total deducciones
        let totalDeducciones = 0;
        const filasDeducciones = document.querySelectorAll('#cuerpo-deducciones-tecnico tr');
        
        filasDeducciones.forEach(fila => {
            if (!fila.id && !fila.classList.contains('total-deducciones')) {
                const celdaMonto = fila.querySelector('td[data-field="monto"]');
                if (celdaMonto) {
                    const texto = celdaMonto.textContent.replace('$', '').replace(',', '').trim();
                    totalDeducciones += parseFloat(texto) || 0;
                }
            }
        });
        
        const netoAPagar = totalServicios - totalDeducciones;
        
        // Actualizar displays
        document.getElementById('subtotal-tecnico').textContent = `$${totalServicios.toFixed(2)}`;
        document.getElementById('total-deducciones-tecnico').textContent = `$${totalDeducciones.toFixed(2)}`;
        document.getElementById('display-total-bruto').textContent = `$${totalServicios.toFixed(2)}`;
        document.getElementById('display-total-deducciones').textContent = `-$${totalDeducciones.toFixed(2)}`;
        document.getElementById('display-neto-pagar').textContent = `$${netoAPagar.toFixed(2)}`;
        
    } catch (error) {
        console.error("Error actualizando totales técnico:", error);
    }
}

// ======================
// SISTEMA DE NÓMINAS EN FIREBASE
// ======================

// Guardar nómina de técnico en Firebase
async function guardarNominaTecnicoFirebase(tecnico, data, desde, hasta, percepciones, deducciones, comentarios, totales) {
    try {

        // Asegurar formato ISO para las fechas
        const fechaDesdeISO = desde ? new Date(desde).toISOString().split('T')[0] : '';
        const fechaHastaISO = hasta ? new Date(hasta).toISOString().split('T')[0] : '';

        const nominaData = {
            tipo: 'tecnico',
            tecnico: tecnico,
            fecha_desde: fechaDesdeISO, // Guardar en formato YYYY-MM-DD
            fecha_hasta: fechaHastaISO, // Guardar en formato YYYY-MM-DD
            fecha_creacion: firebase.firestore.FieldValue.serverTimestamp(),
            percepciones: percepciones || [],
            deducciones: deducciones || [],
            comentarios: comentarios || '',
            totales: totales || {},
            creado_por: currentUser ? currentUser.name : 'Sistema',
            usuario_id: currentUser ? currentUser.id : null
        };
        
        const docRef = await db.collection('nominas').add(nominaData);
        console.log("Nómina técnico guardada en Firebase con ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error guardando nómina técnico en Firebase:", error);
        throw error;
    }
}

// Guardar nómina de supervisor en Firebase
async function guardarNominaSupervisorFirebase(supervisor, data, desde, hasta, percepciones, deducciones, comentarios, totales) {
    try {
        const nominaData = {
            tipo: 'supervisor',
            supervisor: supervisor,
            fecha_desde: desde,
            fecha_hasta: hasta,
            fecha_creacion: firebase.firestore.FieldValue.serverTimestamp(),
            percepciones: percepciones || [],
            deducciones: deducciones || [],
            comentarios: comentarios || '',
            totales: totales || {},
            creado_por: currentUser ? currentUser.name : 'Sistema',
            usuario_id: currentUser ? currentUser.id : null
        };
        
        const docRef = await db.collection('nominas').add(nominaData);
        console.log("Nómina supervisor guardada en Firebase con ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error guardando nómina supervisor en Firebase:", error);
        throw error;
    }
}

// Buscar nóminas por criterios
async function buscarNominasFirebase(tipo, nombre, fechaDesde, fechaHasta) {
    try {
        console.log("🔥 BUSCANDO NÓMINAS EN FIREBASE");
        console.log("Parámetros de búsqueda:", {
            tipo: tipo,
            nombre: nombre,
            fechaDesde: fechaDesde,
            fechaHasta: fechaHasta
        });
        
        // Obtener TODAS las nóminas
        console.log("Obteniendo nóminas de Firebase...");
        const snapshot = await db.collection('nominas').get();
        console.log(`📊 Total documentos en colección 'nominas': ${snapshot.size}`);
        
        if (snapshot.empty) {
            console.log("📭 La colección 'nominas' está vacía");
            return [];
        }
        
        const todasNominas = [];
        snapshot.forEach((doc, index) => {
            const data = doc.data();
            todasNominas.push({
                id: doc.id,
                ...data
            });
            
            // Log de las primeras 3 nóminas para diagnóstico
            if (index < 3) {
                console.log(`📄 Documento ${index + 1}:`, {
                    id: doc.id,
                    tipo: data.tipo,
                    tecnico: data.tecnico,
                    supervisor: data.supervisor,
                    fecha_desde: data.fecha_desde,
                    fecha_hasta: data.fecha_hasta
                });
            }
        });
        
        console.log(`✅ Se obtuvieron ${todasNominas.length} nóminas`);
        
        // 1. Filtrar por tipo
        let nominasFiltradas = todasNominas.filter(n => {
            const tieneTipoCorrecto = n.tipo === tipo;
            if (!tieneTipoCorrecto) {
                console.log(`❌ Documento ${n.id} filtrado por tipo: ${n.tipo} !== ${tipo}`);
            }
            return tieneTipoCorrecto;
        });
        
        console.log(`📋 Nóminas después de filtrar por tipo '${tipo}': ${nominasFiltradas.length}`);
        
        // 2. Filtrar por nombre si se especifica
        if (nombre && nombre.trim() !== '') {
            nominasFiltradas = nominasFiltradas.filter(n => {
                let tieneNombreCorrecto = false;
                
                if (tipo === 'tecnico') {
                    tieneNombreCorrecto = n.tecnico === nombre;
                    if (!tieneNombreCorrecto) {
                        console.log(`❌ Documento ${n.id} filtrado por nombre técnico: "${n.tecnico}" !== "${nombre}"`);
                    }
                } else {
                    tieneNombreCorrecto = n.supervisor === nombre;
                    if (!tieneNombreCorrecto) {
                        console.log(`❌ Documento ${n.id} filtrado por nombre supervisor: "${n.supervisor}" !== "${nombre}"`);
                    }
                }
                
                return tieneNombreCorrecto;
            });
            
            console.log(`👤 Nóminas después de filtrar por nombre '${nombre}': ${nominasFiltradas.length}`);
        }
        
        // 3. Filtrar por fecha_desde (PERIODO)
        if (fechaDesde && fechaDesde.trim() !== '') {
            console.log(`🔍 Filtrando por fecha_desde >= ${fechaDesde}`);
            
            // Convertir fechaDesde a formato ISO para comparación
            const fechaDesdeISO = fechaToISO(fechaDesde);
            console.log(`Fecha desde en ISO: ${fechaDesdeISO}`);
            
            nominasFiltradas = nominasFiltradas.filter(n => {
                if (!n.fecha_desde) {
                    console.log(`⚠️ Documento ${n.id} no tiene fecha_desde`);
                    return false;
                }
                
                // Comparar strings en formato YYYY-MM-DD
                const pasaFiltro = n.fecha_desde >= fechaDesdeISO;
                
                if (!pasaFiltro) {
                    console.log(`❌ Documento ${n.id} filtrado por fecha_desde: ${n.fecha_desde} < ${fechaDesdeISO}`);
                }
                
                return pasaFiltro;
            });
            
            console.log(`📅 Nóminas después de filtrar por fecha_desde: ${nominasFiltradas.length}`);
        }
        
        // 4. Filtrar por fecha_hasta (PERIODO)
        if (fechaHasta && fechaHasta.trim() !== '') {
            console.log(`🔍 Filtrando por fecha_hasta <= ${fechaHasta}`);
            
            // Convertir fechaHasta a formato ISO para comparación
            const fechaHastaISO = fechaToISO(fechaHasta);
            console.log(`Fecha hasta en ISO: ${fechaHastaISO}`);
            
            nominasFiltradas = nominasFiltradas.filter(n => {
                if (!n.fecha_hasta) {
                    console.log(`⚠️ Documento ${n.id} no tiene fecha_hasta`);
                    return false;
                }
                
                // Comparar strings en formato YYYY-MM-DD
                const pasaFiltro = n.fecha_hasta <= fechaHastaISO;
                
                if (!pasaFiltro) {
                    console.log(`❌ Documento ${n.id} filtrado por fecha_hasta: ${n.fecha_hasta} > ${fechaHastaISO}`);
                }
                
                return pasaFiltro;
            });
            
            console.log(`📅 Nóminas después de filtrar por fecha_hasta: ${nominasFiltradas.length}`);
        }
        
        // 5. Ordenar por fecha_creacion (más reciente primero)
        console.log("📊 Ordenando nóminas por fecha de creación...");
        nominasFiltradas.sort((a, b) => {
            try {
                const fechaA = obtenerFechaCreacion(a);
                const fechaB = obtenerFechaCreacion(b);
                
                if (!fechaA || !fechaB) {
                    console.log("⚠️ Error obteniendo fechas para ordenar");
                    return 0;
                }
                
                return fechaB.getTime() - fechaA.getTime();
            } catch (error) {
                console.error("Error ordenando nóminas:", error);
                return 0;
            }
        });
        
        console.log("✅✅✅ BÚSQUEDA COMPLETADA");
        console.log(`🎯 Nóminas encontradas: ${nominasFiltradas.length}`);
        
        // Mostrar resumen de las nóminas encontradas
        if (nominasFiltradas.length > 0) {
            console.log("📋 Resumen de nóminas encontradas:");
            nominasFiltradas.forEach((n, index) => {
                console.log(`${index + 1}. ID: ${n.id.substring(0, 8)}..., Tipo: ${n.tipo}, ` +
                          `Nombre: ${tipo === 'tecnico' ? n.tecnico : n.supervisor}, ` +
                          `Período: ${n.fecha_desde || 'N/A'} al ${n.fecha_hasta || 'N/A'}`);
            });
        }
        
        return nominasFiltradas;
        
    } catch (error) {
        console.error("❌ ERROR CRÍTICO en buscarNominasFirebase:", error);
        console.error("Stack trace:", error.stack);
        return [];
    }
}

// Función auxiliar para parsear fecha
function parsearFecha(fechaStr) {
    if (!fechaStr) return null;
    
    // Si ya está en formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
        return new Date(fechaStr + 'T00:00:00');
    }
    
    // Si está en formato DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(fechaStr)) {
        const parts = fechaStr.split('-');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    
    // Intentar parsear como fecha normal
    return new Date(fechaStr);
}

// Cargar nómina específica
async function cargarNominaFirebase(nominaId) {
    try {
        const doc = await db.collection('nominas').doc(nominaId).get();
        
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error cargando nómina desde Firebase:", error);
        return null;
    }
}

// ======================
// FUNCIONES PARA AGREGAR ELEMENTOS EDITABLES
// ======================

// Agregar percepción en nómina técnico
function agregarPercepcionTecnico() {
    const cuerpo = document.getElementById('cuerpo-servicios-tecnico');
    if (!cuerpo) return;
    
    const nuevaFila = document.createElement('tr');
    nuevaFila.className = 'fila-percepcion';
    nuevaFila.innerHTML = `
        <td class="editable" contenteditable="true" data-field="numero"></td>
        <td class="editable" contenteditable="true" data-field="fecha"></td>
        <td class="editable" contenteditable="true" data-field="folio"></td>
        <td class="editable" contenteditable="true" data-field="tipo">FIBRA</td>
        <td class="editable" contenteditable="true" data-field="instalacion">AEREA</td>
        <td class="editable text-right" contenteditable="true" data-field="costo">$0.00</td>
    `;
    
    // Insertar antes de la fila de subtotal
    const subtotalRow = cuerpo.querySelector('.subtotal-row');
    if (subtotalRow) {
        cuerpo.insertBefore(nuevaFila, subtotalRow);
    } else {
        cuerpo.appendChild(nuevaFila);
    }
    
    // Configurar eventos
    const celdasEditables = nuevaFila.querySelectorAll('.editable');
    celdasEditables.forEach(celda => {
        celda.addEventListener('input', () => {
            celda.classList.add('editado');
            if (celda.hasAttribute('data-field') && celda.getAttribute('data-field') === 'costo') {
                setTimeout(() => {
                    actualizarTotalesTecnico(getCurrentTecnicoNomina());
                }, 500);
            }
        });
        
        celda.addEventListener('blur', () => {
            if (celda.hasAttribute('data-field') && celda.getAttribute('data-field') === 'costo') {
                const texto = celda.textContent.trim();
                if (texto && !texto.startsWith('$')) {
                    const numero = parseFloat(texto.replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(numero)) {
                        celda.textContent = `$${numero.toFixed(2)}`;
                    }
                }
            }
        });
    });
    
    // Añadir botón eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.innerHTML = '<i class="fas fa-trash"></i>';
    btnEliminar.className = 'btn-eliminar-small no-print';
    btnEliminar.style.cssText = 'margin-left: 5px; background: none; border: none; color: #ef4444; cursor: pointer;';
    btnEliminar.onclick = function() {
        if (confirm('¿Eliminar esta percepción?')) {
            nuevaFila.remove();
            actualizarTotalesTecnico(getCurrentTecnicoNomina());
        }
    };
    
    const celdaCosto = nuevaFila.querySelector('td[data-field="costo"]');
    if (celdaCosto) {
        celdaCosto.appendChild(btnEliminar);
    }
}

// Agregar comentarios en nómina técnico
function agregarComentariosTecnico() {
    const reciboImpresion = document.getElementById('recibo-impresion');
    if (!reciboImpresion) return;
    
    // Buscar si ya existe sección de comentarios
    let seccionComentarios = reciboImpresion.querySelector('.seccion-comentarios');
    
    if (!seccionComentarios) {
        // Crear nueva sección
        seccionComentarios = document.createElement('div');
        seccionComentarios.className = 'recibo-seccion seccion-comentarios';
        seccionComentarios.innerHTML = `
            <h2><i class="fas fa-comment"></i> COMENTARIOS ADICIONALES</h2>
            <div class="comentarios-container">
                <div class="comentario-item" contenteditable="true" style="min-height: 80px; padding: 15px; border: 1px dashed #cbd5e1; border-radius: 8px; margin: 10px 0; background: #f8fafc;">
                    Escribe aquí tus comentarios adicionales...
                </div>
                <button onclick="agregarNuevoComentarioTecnico()" class="btn-agregar-comentario no-print" style="margin-top: 10px; padding: 8px 15px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-plus"></i> Agregar otro comentario
                </button>
            </div>
        `;
        
        // Insertar antes de las firmas
        const firmasContainer = reciboImpresion.querySelector('.firmas-container');
        if (firmasContainer) {
            firmasContainer.parentNode.insertBefore(seccionComentarios, firmasContainer);
        } else {
            reciboImpresion.appendChild(seccionComentarios);
        }
    }
    
    // Enfocar el campo de comentarios
    const campoComentario = seccionComentarios.querySelector('.comentario-item');
    if (campoComentario) {
        campoComentario.focus();
    }
}

function agregarNuevoComentarioTecnico() {
    const seccionComentarios = document.querySelector('.seccion-comentarios .comentarios-container');
    if (!seccionComentarios) return;
    
    const nuevoComentario = document.createElement('div');
    nuevoComentario.className = 'comentario-item';
    nuevoComentario.contentEditable = true;
    nuevoComentario.style.cssText = 'min-height: 60px; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 8px; margin: 10px 0; background: #f8fafc;';
    nuevoComentario.textContent = 'Nuevo comentario...';
    
    // Botón eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.innerHTML = '<i class="fas fa-trash"></i>';
    btnEliminar.className = 'btn-eliminar-comentario no-print';
    btnEliminar.style.cssText = 'float: right; margin-left: 10px; background: none; border: none; color: #ef4444; cursor: pointer;';
    btnEliminar.onclick = function() {
        if (confirm('¿Eliminar este comentario?')) {
            nuevoComentario.remove();
        }
    };
    
    nuevoComentario.appendChild(btnEliminar);
    
    const contenedor = seccionComentarios.querySelector('.comentarios-container');
    contenedor.insertBefore(nuevoComentario, seccionComentarios.querySelector('.btn-agregar-comentario'));
    nuevoComentario.focus();
}

// Agregar percepción en nómina supervisor
function agregarPercepcionSupervisor() {
    const cuerpo = document.getElementById('cuerpo-percepciones-supervisor');
    if (!cuerpo) return;
    
    const nuevaFila = document.createElement('tr');
    nuevaFila.className = 'fila-percepcion-supervisor';
    nuevaFila.innerHTML = `
        <td class="editable" contenteditable="true" data-field="dia">Nuevo Día</td>
        <td class="editable" contenteditable="true" data-field="tipo">Tipo</td>
        <td class="editable" contenteditable="true" data-field="concepto">Concepto</td>
        <td class="editable text-right" contenteditable="true" data-field="cantidad">1</td>
        <td class="editable text-right" contenteditable="true" data-field="monto">$0.00</td>
    `;
    
    // Insertar antes de la fila de subtotal
    const subtotalRow = cuerpo.querySelector('.subtotal-row');
    if (subtotalRow) {
        cuerpo.insertBefore(nuevaFila, subtotalRow);
    } else {
        cuerpo.appendChild(nuevaFila);
    }
    
    // Configurar eventos
    const celdasEditables = nuevaFila.querySelectorAll('.editable');
    celdasEditables.forEach(celda => {
        celda.addEventListener('input', () => {
            celda.classList.add('editado');
            if (celda.hasAttribute('data-field') && celda.getAttribute('data-field') === 'monto') {
                setTimeout(() => {
                    actualizarTotalesSupervisor(getCurrentSupervisorNomina());
                }, 500);
            }
        });
        
        celda.addEventListener('blur', () => {
            if (celda.hasAttribute('data-field') && celda.getAttribute('data-field') === 'monto') {
                const texto = celda.textContent.trim();
                if (texto && !texto.startsWith('$')) {
                    const numero = parseFloat(texto.replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(numero)) {
                        celda.textContent = `$${numero.toFixed(2)}`;
                    }
                }
            }
        });
    });
    
    // Añadir botón eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.innerHTML = '<i class="fas fa-trash"></i>';
    btnEliminar.className = 'btn-eliminar-small no-print';
    btnEliminar.style.cssText = 'margin-left: 5px; background: none; border: none; color: #ef4444; cursor: pointer;';
    btnEliminar.onclick = function() {
        if (confirm('¿Eliminar esta percepción?')) {
            nuevaFila.remove();
            actualizarTotalesSupervisor(getCurrentSupervisorNomina());
        }
    };
    
    const celdaMonto = nuevaFila.querySelector('td[data-field="monto"]');
    if (celdaMonto) {
        celdaMonto.appendChild(btnEliminar);
    }
}

// Agregar comentarios en nómina supervisor
function agregarComentariosSupervisor() {
    const reciboImpresion = document.getElementById('recibo-supervisor-impresion');
    if (!reciboImpresion) return;
    
    // Buscar si ya existe sección de comentarios
    let seccionComentarios = reciboImpresion.querySelector('.seccion-comentarios');
    
    if (!seccionComentarios) {
        // Crear nueva sección
        seccionComentarios = document.createElement('div');
        seccionComentarios.className = 'recibo-seccion seccion-comentarios';
        seccionComentarios.innerHTML = `
            <h2><i class="fas fa-comment"></i> COMENTARIOS ADICIONALES</h2>
            <div class="comentarios-container">
                <div class="comentario-item" contenteditable="true" style="min-height: 80px; padding: 15px; border: 1px dashed #cbd5e1; border-radius: 8px; margin: 10px 0; background: #f8fafc;">
                    Escribe aquí tus comentarios adicionales...
                </div>
                <button onclick="agregarNuevoComentarioSupervisor()" class="btn-agregar-comentario no-print" style="margin-top: 10px; padding: 8px 15px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-plus"></i> Agregar otro comentario
                </button>
            </div>
        `;
        
        // Insertar antes de las firmas
        const firmasContainer = reciboImpresion.querySelector('.supervisor-firmas');
        if (firmasContainer) {
            firmasContainer.parentNode.insertBefore(seccionComentarios, firmasContainer);
        } else {
            reciboImpresion.appendChild(seccionComentarios);
        }
    }
    
    // Enfocar el campo de comentarios
    const campoComentario = seccionComentarios.querySelector('.comentario-item');
    if (campoComentario) {
        campoComentario.focus();
    }
}

function agregarNuevoComentarioSupervisor() {
    const seccionComentarios = document.querySelector('.seccion-comentarios .comentarios-container');
    if (!seccionComentarios) return;
    
    const nuevoComentario = document.createElement('div');
    nuevoComentario.className = 'comentario-item';
    nuevoComentario.contentEditable = true;
    nuevoComentario.style.cssText = 'min-height: 60px; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 8px; margin: 10px 0; background: #f8fafc;';
    nuevoComentario.textContent = 'Nuevo comentario...';
    
    // Botón eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.innerHTML = '<i class="fas fa-trash"></i>';
    btnEliminar.className = 'btn-eliminar-comentario no-print';
    btnEliminar.style.cssText = 'float: right; margin-left: 10px; background: none; border: none; color: #ef4444; cursor: pointer;';
    btnEliminar.onclick = function() {
        if (confirm('¿Eliminar este comentario?')) {
            nuevoComentario.remove();
        }
    };
    
    nuevoComentario.appendChild(btnEliminar);
    
    const contenedor = seccionComentarios.querySelector('.comentarios-container');
    contenedor.insertBefore(nuevoComentario, seccionComentarios.querySelector('.btn-agregar-comentario'));
    nuevoComentario.focus();
}

// ======================
// FUNCIONES PARA OBTENER DATOS ACTUALES
// ======================

function getCurrentTecnicoNomina() {
    const tecnicoElement = document.querySelector('#recibo-impresion .info-item span');
    return tecnicoElement ? tecnicoElement.textContent : '';
}

function getCurrentSupervisorNomina() {
    const supervisorElement = document.querySelector('#recibo-supervisor-impresion .info-item span');
    return supervisorElement ? supervisorElement.textContent : '';
}

// ======================
// FUNCIONES MEJORADAS PARA GUARDAR
// ======================

async function guardarCambiosTecnico(tecnico) {
    try {
        // Obtener datos de la nómina
        const desde = document.querySelector('#nomina-form input[name="nomina-desde"]')?.value;
        const hasta = document.querySelector('#nomina-form input[name="nomina-hasta"]')?.value;
        
        // Recolectar percepciones
        const percepciones = [];
        const filasServicios = document.querySelectorAll('#cuerpo-servicios-tecnico tr.fila-percepcion, #cuerpo-servicios-tecnico tr:not(.subtotal-row)');
        
        filasServicios.forEach((fila, index) => {
            if (!fila.classList.contains('subtotal-row')) {
                const percepcion = {
                    fecha: fila.querySelector('td[data-field="fecha"]')?.textContent || '',
                    folio: fila.querySelector('td[data-field="folio"]')?.textContent || '',
                    tipo: fila.querySelector('td[data-field="tipo"]')?.textContent || '',
                    instalacion: fila.querySelector('td[data-field="instalacion"]')?.textContent || '',
                    costo: fila.querySelector('td[data-field="costo"]')?.textContent.replace('$', '') || '0',
                    es_adicional: fila.classList.contains('fila-percepcion')
                };
                percepciones.push(percepcion);
            }
        });
        
        // Recolectar deducciones
        const deducciones = [];
        const filasDeducciones = document.querySelectorAll('#cuerpo-deducciones-tecnico tr');
        
        filasDeducciones.forEach(fila => {
            if (!fila.id && !fila.classList.contains('total-deducciones')) {
                const deduccion = {
                    concepto: fila.querySelector('td[data-field="concepto"]')?.textContent || '',
                    descripcion: fila.querySelector('td[data-field="descripcion"]')?.textContent || '',
                    monto: fila.querySelector('td[data-field="monto"]')?.textContent.replace('$', '') || '0'
                };
                deducciones.push(deduccion);
            }
        });
        
        // Recolectar comentarios
        const comentarios = [];
        const comentariosElements = document.querySelectorAll('.seccion-comentarios .comentario-item');
        comentariosElements.forEach(comentario => {
            const texto = comentario.textContent.replace('Escribe aquí tus comentarios adicionales...', '')
                                               .replace('Nuevo comentario...', '')
                                               .trim();
            if (texto) {
                comentarios.push(texto);
            }
        });
        
        // Calcular totales
        const totalBruto = parseFloat(document.getElementById('display-total-bruto')?.textContent.replace('$', '') || 0);
        const totalDeducciones = parseFloat(document.getElementById('display-total-deducciones')?.textContent.replace('-$', '') || 0);
        const netoAPagar = parseFloat(document.getElementById('display-neto-pagar')?.textContent.replace('$', '') || 0);
        
        const totales = {
            bruto: totalBruto,
            deducciones: totalDeducciones,
            neto: netoAPagar,
            fecha_calculo: new Date().toISOString()
        };
        
        // Guardar en Firebase
        const nominaId = await guardarNominaTecnicoFirebase(
            tecnico,
            {}, // datos de folios (si se necesita)
            desde,
            hasta,
            percepciones,
            deducciones,
            comentarios.join('\n\n'),
            totales
        );
        
        // Guardar también en localStorage como backup
        const nominaLocal = {
            id: nominaId,
            tipo: 'tecnico',
            tecnico: tecnico,
            fecha_desde: desde,
            fecha_hasta: hasta,
            percepciones: percepciones,
            deducciones: deducciones,
            comentarios: comentarios.join('\n\n'),
            totales: totales,
            fecha_creacion: new Date().toISOString()
        };
        
        localStorage.setItem(`nomina_tecnico_${tecnico}_${new Date().getTime()}`, JSON.stringify(nominaLocal));
        
        alert(`✅ Nómina guardada exitosamente\nID: ${nominaId}\nLa nómina ha sido guardada en la nube.`);
        
        return nominaId;
        
    } catch (error) {
        console.error("Error guardando nómina técnico:", error);
        alert('❌ Error al guardar la nómina: ' + error.message);
        return null;
    }
}

function configurarEventosEdicionTecnico(tecnico) {
    // Configurar eventos de edición en tiempo real
    const celdasEditables = document.querySelectorAll('.editable[contenteditable="true"]');
    
    celdasEditables.forEach(celda => {
        celda.addEventListener('input', () => {
            celda.classList.add('editado');
            
            // Si es una celda de monto, actualizar totales después de un breve delay
            if (celda.hasAttribute('data-field') && 
                (celda.getAttribute('data-field') === 'costo' || 
                 celda.getAttribute('data-field') === 'monto')) {
                setTimeout(() => {
                    actualizarTotalesTecnico(tecnico);
                }, 500);
            }
        });
        
        celda.addEventListener('blur', () => {
            // Formatear como moneda si es un campo de monto
            if (celda.hasAttribute('data-field') && 
                (celda.getAttribute('data-field') === 'costo' || 
                 celda.getAttribute('data-field') === 'monto')) {
                const texto = celda.textContent.trim();
                if (texto && !texto.startsWith('$')) {
                    const numero = parseFloat(texto.replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(numero)) {
                        celda.textContent = `$${numero.toFixed(2)}`;
                    }
                }
            }
        });
    });
}

// ======================
// FUNCIONES PARA SUPERVISOR
// ======================

function agregarDeduccionSupervisor(supervisor) {
    const cuerpo = document.getElementById('cuerpo-deducciones-supervisor');
    const filaSinDeducciones = document.getElementById('sin-deducciones-supervisor');
    
    if (filaSinDeducciones) {
        filaSinDeducciones.remove();
    }
    
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
        <td class="editable" contenteditable="true" data-field="concepto">Nueva Deducción</td>
        <td class="editable" contenteditable="true" data-field="descripcion">Descripción</td>
        <td class="editable text-right" contenteditable="true" data-field="monto">$0.00</td>
        <td class="text-center">
            <button onclick="eliminarDeduccionSupervisor(${cuerpo.children.length}, '${supervisor}')" class="btn-eliminar-small">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    cuerpo.appendChild(nuevaFila);
    nuevaFila.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function eliminarDeduccionSupervisor(index, supervisor) {
    const filas = document.querySelectorAll('#cuerpo-deducciones-supervisor tr');
    if (filas[index]) {
        filas[index].remove();
        actualizarTotalesSupervisor(supervisor);
    }
}

function actualizarTotalesSupervisor(supervisor) {
    try {
        // Calcular total percepciones
        let totalPercepciones = 0;
        const filasPercepciones = document.querySelectorAll('#cuerpo-percepciones-supervisor tr');
        
        filasPercepciones.forEach(fila => {
            if (!fila.classList.contains('subtotal-row')) {
                const celdaMonto = fila.querySelector('td[data-field="monto"]');
                if (celdaMonto) {
                    const texto = celdaMonto.textContent.replace('$', '').replace(',', '').trim();
                    totalPercepciones += parseFloat(texto) || 0;
                }
            }
        });
        
        // Calcular total deducciones
        let totalDeducciones = 0;
        const filasDeducciones = document.querySelectorAll('#cuerpo-deducciones-supervisor tr');
        
        filasDeducciones.forEach(fila => {
            if (!fila.id && !fila.classList.contains('total-deducciones')) {
                const celdaMonto = fila.querySelector('td[data-field="monto"]');
                if (celdaMonto) {
                    const texto = celdaMonto.textContent.replace('$', '').replace(',', '').trim();
                    totalDeducciones += parseFloat(texto) || 0;
                }
            }
        });
        
        // Actualizar días laborados
        const diasLaborados = Array.from(filasPercepciones).filter(fila => {
            if (!fila.classList.contains('subtotal-row')) {
                const celdaMonto = fila.querySelector('td[data-field="monto"]');
                if (celdaMonto) {
                    const texto = celdaMonto.textContent.replace('$', '').replace(',', '').trim();
                    return parseFloat(texto) > 0;
                }
            }
            return false;
        }).length;
        
        const netoAPagar = totalPercepciones - totalDeducciones;
        
        // Actualizar displays
        document.getElementById('subtotal-supervisor').textContent = `$${totalPercepciones.toFixed(2)}`;
        document.getElementById('total-deducciones-supervisor').textContent = `$${totalDeducciones.toFixed(2)}`;
        document.getElementById('dias-laborados').textContent = diasLaborados;
        document.getElementById('display-total-bruto-supervisor').textContent = `$${totalPercepciones.toFixed(2)}`;
        document.getElementById('display-total-deducciones-supervisor').textContent = `-$${totalDeducciones.toFixed(2)}`;
        document.getElementById('display-neto-pagar-supervisor').textContent = `$${netoAPagar.toFixed(2)}`;
        
    } catch (error) {
        console.error("Error actualizando totales supervisor:", error);
    }
}



async function guardarCambiosSupervisor(supervisor) {
    try {
        // Obtener datos de la nómina
        const desde = document.querySelector('#supervisor-form input[name="supervisor-desde"]')?.value;
        const hasta = document.querySelector('#supervisor-form input[name="supervisor-hasta"]')?.value;
        
        // Recolectar percepciones
        const percepciones = [];
        const filasPercepciones = document.querySelectorAll('#cuerpo-percepciones-supervisor tr.fila-percepcion-supervisor, #cuerpo-percepciones-supervisor tr:not(.subtotal-row)');
        
        filasPercepciones.forEach((fila, index) => {
            if (!fila.classList.contains('subtotal-row')) {
                const percepcion = {
                    dia: fila.querySelector('td[data-field="dia"]')?.textContent || '',
                    tipo: fila.querySelector('td[data-field="tipo"]')?.textContent || '',
                    concepto: fila.querySelector('td[data-field="concepto"]')?.textContent || '',
                    cantidad: fila.querySelector('td[data-field="cantidad"]')?.textContent || '1',
                    monto: fila.querySelector('td[data-field="monto"]')?.textContent.replace('$', '') || '0',
                    es_adicional: fila.classList.contains('fila-percepcion-supervisor')
                };
                percepciones.push(percepcion);
            }
        });
        
        // Recolectar deducciones
        const deducciones = [];
        const filasDeducciones = document.querySelectorAll('#cuerpo-deducciones-supervisor tr');
        
        filasDeducciones.forEach(fila => {
            if (!fila.id && !fila.classList.contains('total-deducciones')) {
                const deduccion = {
                    concepto: fila.querySelector('td[data-field="concepto"]')?.textContent || '',
                    descripcion: fila.querySelector('td[data-field="descripcion"]')?.textContent || '',
                    monto: fila.querySelector('td[data-field="monto"]')?.textContent.replace('$', '') || '0'
                };
                deducciones.push(deduccion);
            }
        });
        
        // Recolectar comentarios
        const comentarios = [];
        const comentariosElements = document.querySelectorAll('.seccion-comentarios .comentario-item');
        comentariosElements.forEach(comentario => {
            const texto = comentario.textContent.replace('Escribe aquí tus comentarios adicionales...', '')
                                               .replace('Nuevo comentario...', '')
                                               .trim();
            if (texto) {
                comentarios.push(texto);
            }
        });
        
        // Calcular totales
        const totalBruto = parseFloat(document.getElementById('display-total-bruto-supervisor')?.textContent.replace('$', '') || 0);
        const totalDeducciones = parseFloat(document.getElementById('display-total-deducciones-supervisor')?.textContent.replace('-$', '') || 0);
        const netoAPagar = parseFloat(document.getElementById('display-neto-pagar-supervisor')?.textContent.replace('$', '') || 0);
        
        const totales = {
            bruto: totalBruto,
            deducciones: totalDeducciones,
            neto: netoAPagar,
            fecha_calculo: new Date().toISOString()
        };
        
        // Guardar en Firebase
        const nominaId = await guardarNominaSupervisorFirebase(
            supervisor,
            {}, // datos adicionales
            desde,
            hasta,
            percepciones,
            deducciones,
            comentarios.join('\n\n'),
            totales
        );
        
        // Guardar también en localStorage como backup
        const nominaLocal = {
            id: nominaId,
            tipo: 'supervisor',
            supervisor: supervisor,
            fecha_desde: desde,
            fecha_hasta: hasta,
            percepciones: percepciones,
            deducciones: deducciones,
            comentarios: comentarios.join('\n\n'),
            totales: totales,
            fecha_creacion: new Date().toISOString()
        };
        
        localStorage.setItem(`nomina_supervisor_${supervisor}_${new Date().getTime()}`, JSON.stringify(nominaLocal));
        
        alert(`✅ Nómina guardada exitosamente\nID: ${nominaId}\nLa nómina ha sido guardada en la nube.`);
        
        return nominaId;
        
    } catch (error) {
        console.error("Error guardando nómina supervisor:", error);
        alert('❌ Error al guardar la nómina: ' + error.message);
        return null;
    }
}

function configurarEventosEdicionSupervisor(supervisor) {
    const celdasEditables = document.querySelectorAll('.editable[contenteditable="true"]');
    
    celdasEditables.forEach(celda => {
        celda.addEventListener('input', () => {
            celda.classList.add('editado');
            
            if (celda.hasAttribute('data-field') && 
                (celda.getAttribute('data-field') === 'monto')) {
                setTimeout(() => {
                    actualizarTotalesSupervisor(supervisor);
                }, 500);
            }
        });
        
        celda.addEventListener('blur', () => {
            if (celda.hasAttribute('data-field') && 
                (celda.getAttribute('data-field') === 'monto')) {
                const texto = celda.textContent.trim();
                if (texto && !texto.startsWith('$')) {
                    const numero = parseFloat(texto.replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(numero)) {
                        celda.textContent = `$${numero.toFixed(2)}`;
                    }
                }
            }
        });
    });
}

// ======================
// SECCIÓN PARA BUSCAR NÓMINAS ANTERIORES
// ======================

function mostrarBusquedaNominas(tipo) {
    console.log("🔍 Mostrando búsqueda de nóminas para tipo:", tipo);
    
    const sectionId = tipo === 'tecnico' ? 'busqueda-nominas-tecnico' : 'busqueda-nominas-supervisor';
    const titulo = tipo === 'tecnico' ? 'TÉCNICO' : 'SUPERVISOR';
    
    // Verificar si ya existe la sección
    let section = document.getElementById(sectionId);
    
    if (!section) {
        console.log("Creando nueva sección de búsqueda:", sectionId);
        
        // Crear nueva sección con diseño mejorado
        section = document.createElement('div');
        section.id = sectionId;
        section.className = 'content-section';
        section.innerHTML = `
            <div class="section-header" style="background: linear-gradient(135deg, #1e3a8a, #3730a3); padding: 25px; border-radius: 12px; margin-bottom: 25px; color: white;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <i class="fas fa-search" style="font-size: 28px; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;"></i>
                    <div>
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700;">🔍 Buscar Nóminas Anteriores</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 16px;">${titulo} - Historial de Pagos</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <span class="badge" style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 20px; font-size: 14px;">
                        <i class="fas fa-database"></i> Sistema de Gestión
                    </span>
                    <span class="badge" style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 20px; font-size: 14px;">
                        <i class="fas fa-history"></i> Consulta Histórica
                    </span>
                </div>
            </div>
            
            <div class="form-container" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 30px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
                    <i class="fas fa-filter" style="color: #1e3a8a; font-size: 20px;"></i>
                    <h3 style="margin: 0; color: #1e293b; font-size: 20px;">Filtros de Búsqueda</h3>
                </div>
                
                <form id="form-buscar-nominas-${tipo}" class="nomina-search-form">
                    <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 30px;">
                        <!-- Campo Nombre -->
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                                <i class="fas fa-user"></i> ${tipo === 'tecnico' ? 'Técnico' : 'Supervisor'}
                            </label>
                            <div class="select-wrapper">
                                <select name="nombre-${tipo}" id="select-${tipo}-busqueda" class="modern-select">
                                    <option value="">Todos los ${tipo === 'tecnico' ? 'técnicos' : 'supervisores'}</option>
                                </select>
                                <div class="select-arrow">
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            <p class="form-hint" style="margin-top: 5px; font-size: 13px; color: #6b7280;">
                                Selecciona un ${tipo === 'tecnico' ? 'técnico' : 'supervisor'} específico o deja vacío para ver todos
                            </p>
                        </div>
                        
                        <!-- Campo Fecha Desde -->
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                                <i class="fas fa-calendar-day"></i> Fecha Desde
                            </label>
                            <div class="date-input-wrapper">
                                <input type="date" name="fecha-desde" class="modern-date-input">
                                <div class="date-icon">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                            </div>
                            <p class="form-hint" style="margin-top: 5px; font-size: 13px; color: #6b7280;">
                                Fecha inicial del período a buscar
                            </p>
                        </div>
                        
                        <!-- Campo Fecha Hasta -->
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                                <i class="fas fa-calendar-check"></i> Fecha Hasta
                            </label>
                            <div class="date-input-wrapper">
                                <input type="date" name="fecha-hasta" class="modern-date-input">
                                <div class="date-icon">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                            </div>
                            <p class="form-hint" style="margin-top: 5px; font-size: 13px; color: #6b7280;">
                                Fecha final del período a buscar
                            </p>
                        </div>
                    </div>
                    
                    <!-- Botones de acción -->
                    <div class="form-actions" style="display: flex; gap: 15px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <button type="button" onclick="resetearBusqueda('${tipo}')" class="btn-reset" style="padding: 12px 25px; border: 1px solid #d1d5db; background: white; color: #4b5563; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s;">
                            <i class="fas fa-redo"></i> Limpiar Filtros
                        </button>
                        <button type="button" onclick="volverANomina('${tipo}')" class="btn-secondary" style="padding: 12px 25px; border: 1px solid #3b82f6; background: white; color: #3b82f6; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.3s;">
                            <i class="fas fa-arrow-left"></i> Volver
                        </button>
                        <button type="submit" class="btn-search" style="padding: 12px 30px; border: none; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 10px; transition: all 0.3s; font-size: 16px;">
                            <i class="fas fa-search"></i> Buscar Nóminas
                        </button>
                    </div>
                </form>
                
                <!-- Estadísticas rápidas -->
                <div id="quick-stats-${tipo}" class="quick-stats" style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 10px; border: 1px solid #bae6fd; display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #0369a1; font-size: 16px;">
                                <i class="fas fa-chart-line"></i> Resultados de Búsqueda
                            </h4>
                            <p id="stats-text-${tipo}" style="margin: 0; color: #0c4a6e; font-size: 14px;"></p>
                        </div>
                        <div id="stats-actions-${tipo}" style="display: flex; gap: 10px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Resultados de búsqueda -->
            <div id="resultados-busqueda-${tipo}" class="resultados-busqueda" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); min-height: 300px;">
                <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3 style="margin: 0 0 10px 0; color: #6b7280; font-weight: 400;">Consulta de Nóminas</h3>
                    <p style="margin: 0; font-size: 15px;">Utiliza los filtros para buscar nóminas anteriores</p>
                </div>
            </div>
            
            <!-- Panel de ayuda -->
            <div class="help-panel" style="margin-top: 30px; background: #f9fafb; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
                <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <i class="fas fa-info-circle" style="color: #3b82f6; font-size: 20px; margin-top: 2px;"></i>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">Ayuda para la búsqueda</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
                            <li>Deja los campos vacíos para ver <strong>todas las nóminas</strong></li>
                            <li>Puedes buscar por período específico usando las fechas</li>
                            <li>Las nóminas se ordenan por fecha de creación (más recientes primero)</li>
                            <li>Haz clic en <strong>"Ver"</strong> para revisar los detalles completos</li>
                            <li>Puedes <strong>reimprimir</strong> cualquier nómina desde la vista de detalles</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar al main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(section);
        }
    }
    
    // Llenar dropdown con nombres
    const select = document.getElementById(`select-${tipo}-busqueda`);
    if (select) {
        select.innerHTML = `<option value="">Todos los ${tipo === 'tecnico' ? 'técnicos' : 'supervisores'}</option>`;
        
        let personas = [];
        if (tipo === 'tecnico') {
            personas = users.filter(u => u.role === 'tecnico');
        } else {
            personas = users.filter(u => ['supervisor', 'gerente', 'administrativo'].includes(u.role));
        }
        
        personas.forEach(persona => {
            const option = document.createElement('option');
            option.value = persona.name;
            option.textContent = persona.name;
            
            // Resaltar usuario actual si coincide
            if (currentUser && currentUser.name === persona.name) {
                option.style.fontWeight = 'bold';
                option.textContent += ' (Actual)';
            }
            
            select.appendChild(option);
        });
        
        // Agregar efecto de búsqueda en el select
        if (personas.length > 5) {
            const searchDiv = document.createElement('div');
            searchDiv.className = 'select-search';
            searchDiv.innerHTML = `
                <input type="text" placeholder="Buscar ${tipo === 'tecnico' ? 'técnico' : 'supervisor'}..." 
                       style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; margin-top: 5px; font-size: 14px;">
            `;
            
            const searchInput = searchDiv.querySelector('input');
            searchInput.addEventListener('input', function() {
                const filter = this.value.toLowerCase();
                const options = select.querySelectorAll('option');
                
                options.forEach(option => {
                    const text = option.textContent.toLowerCase();
                    option.style.display = text.includes(filter) ? '' : 'none';
                });
            });
            
            select.parentNode.insertBefore(searchDiv, select.nextSibling);
        }
    }
    
    // Configurar valores por defecto en fechas (último mes)
    const fechaDesdeInput = document.querySelector(`#form-buscar-nominas-${tipo} input[name="fecha-desde"]`);
    const fechaHastaInput = document.querySelector(`#form-buscar-nominas-${tipo} input[name="fecha-hasta"]`);
    
    if (fechaDesdeInput && !fechaDesdeInput.value) {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        fechaDesdeInput.value = lastMonth.toISOString().split('T')[0];
    }
    
    if (fechaHastaInput && !fechaHastaInput.value) {
        const today = new Date();
        fechaHastaInput.value = today.toISOString().split('T')[0];
    }
    
    // Configurar evento del formulario
    const form = document.getElementById(`form-buscar-nominas-${tipo}`);
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            
            // Agregar animación de loading al botón
            const submitBtn = this.querySelector('.btn-search');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            submitBtn.disabled = true;
            
            console.log("Formulario enviado para tipo:", tipo);
            buscarNominas(tipo).finally(() => {
                // Restaurar botón
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        };
        
        // Agregar validación en tiempo real
        form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', function() {
                validarFormularioBusqueda(tipo);
            });
        });
    }
    
    // Mostrar la sección
    showSection(sectionId);
    
    // Enfocar el primer campo
    setTimeout(() => {
        const firstInput = document.querySelector(`#form-buscar-nominas-${tipo} select, #form-buscar-nominas-${tipo} input`);
        if (firstInput) firstInput.focus();
    }, 300);
}

// Función para resetear búsqueda
function resetearBusqueda(tipo) {
    const form = document.getElementById(`form-buscar-nominas-${tipo}`);
    if (form) {
        form.reset();
        
        // Restablecer valores por defecto
        const fechaDesdeInput = form.querySelector('input[name="fecha-desde"]');
        const fechaHastaInput = form.querySelector('input[name="fecha-hasta"]');
        
        if (fechaDesdeInput) {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            fechaDesdeInput.value = lastMonth.toISOString().split('T')[0];
        }
        
        if (fechaHastaInput) {
            const today = new Date();
            fechaHastaInput.value = today.toISOString().split('T')[0];
        }
        
        // Ocultar estadísticas
        const statsDiv = document.getElementById(`quick-stats-${tipo}`);
        if (statsDiv) statsDiv.style.display = 'none';
        
        // Limpiar resultados
        const resultadosDiv = document.getElementById(`resultados-busqueda-${tipo}`);
        if (resultadosDiv) {
            resultadosDiv.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
                    <i class="fas fa-filter" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3 style="margin: 0 0 10px 0; color: #6b7280; font-weight: 400;">Filtros reiniciados</h3>
                    <p style="margin: 0; font-size: 15px;">Usa los filtros para realizar una nueva búsqueda</p>
                </div>
            `;
        }
        
        // Mostrar mensaje de éxito
        mostrarNotificacion('Filtros reiniciados correctamente', 'success');
    }
}

// Función para validar formulario
function validarFormularioBusqueda(tipo) {
    const form = document.getElementById(`form-buscar-nominas-${tipo}`);
    if (!form) return true;
    
    let isValid = true;
    const fechaDesde = form.querySelector('input[name="fecha-desde"]');
    const fechaHasta = form.querySelector('input[name="fecha-hasta"]');
    
    // Remover errores anteriores
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));
    
    // Validar rango de fechas
    if (fechaDesde.value && fechaHasta.value) {
        const desde = new Date(fechaDesde.value);
        const hasta = new Date(fechaHasta.value);
        
        if (desde > hasta) {
            isValid = false;
            mostrarErrorCampo(fechaHasta, 'La fecha "Hasta" debe ser mayor o igual a la fecha "Desde"');
            mostrarErrorCampo(fechaDesde, '');
        }
    }
    
    // Actualizar estado del botón
    const submitBtn = form.querySelector('.btn-search');
    if (submitBtn) {
        submitBtn.style.opacity = isValid ? '1' : '0.6';
        submitBtn.title = isValid ? '' : 'Corrige los errores antes de buscar';
    }
    
    return isValid;
}

// Función para mostrar error en campo
function mostrarErrorCampo(campo, mensaje) {
    campo.classList.add('error-border');
    
    if (mensaje) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #dc2626; font-size: 13px; margin-top: 5px;';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
        campo.parentNode.appendChild(errorDiv);
    }
}

// Función para mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Remover notificaciones anteriores
    const notificacionesPrevias = document.querySelectorAll('.notificacion-flotante');
    notificacionesPrevias.forEach(n => {
        if (n.parentNode) n.parentNode.removeChild(n);
    });
    
    // Crear nueva notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-flotante ${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-contenido">
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
            <span>${mensaje}</span>
        </div>
    `;
    
    // Estilos inline para la notificación
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notificacion);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
    
    // Agregar CSS para animaciones si no existe
    if (!document.querySelector('#estilos-notificaciones')) {
        const estilos = document.createElement('style');
        estilos.id = 'estilos-notificaciones';
        estilos.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .notificacion-flotante {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
            }
            
            .notificacion-contenido {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notificacion-contenido i {
                font-size: 18px;
            }
        `;
        document.head.appendChild(estilos);
    }
}

// Función para volver
function volverANomina(tipo) {
    if (currentUser && currentUser.role === 'tecnico') {
        showSection('nomina');
    } else {
        showSection('supervisor');
    }
    
    mostrarNotificacion('Volviendo a la sección de nóminas', 'info');
}

async function buscarNominas(tipo) {
    try {
        console.log("🔍 Iniciando búsqueda de nóminas tipo:", tipo);
        
        // Validar formulario primero
        if (!validarFormularioBusqueda(tipo)) {
            mostrarNotificacion('Corrige los errores en el formulario antes de buscar', 'error');
            return;
        }
        
        const form = document.getElementById(`form-buscar-nominas-${tipo}`);
        if (!form) {
            console.error("Formulario no encontrado para tipo:", tipo);
            return;
        }
        
        const formData = new FormData(form);
        const nombre = formData.get(`nombre-${tipo}`);
        const fechaDesde = formData.get('fecha-desde');
        const fechaHasta = formData.get('fecha-hasta');
        
        // Mostrar loading con animación
        const resultadosDiv = document.getElementById(`resultados-busqueda-${tipo}`);
        if (!resultadosDiv) {
            console.error("Div de resultados no encontrado");
            return;
        }
        
        resultadosDiv.innerHTML = `
            <div class="loading-container" style="text-align: center; padding: 60px 20px;">
                <div class="spinner" style="width: 50px; height: 50px; border: 4px solid #e5e7eb; border-top: 4px solid #3b82f6; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
                <h3 style="margin: 0 0 10px 0; color: #4b5563;">Buscando nóminas...</h3>
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">Estamos consultando la base de datos</p>
                <div style="margin-top: 20px; font-size: 13px; color: #6b7280;">
                    <i class="fas fa-info-circle"></i> Criterios: 
                    ${nombre ? `${tipo === 'tecnico' ? 'Técnico' : 'Supervisor'}: ${nombre}` : 'Todos'} | 
                    ${fechaDesde ? `Desde: ${fechaDesde}` : ''} ${fechaHasta ? `Hasta: ${fechaHasta}` : ''}
                </div>
            </div>
        `;
        
        // Buscar en Firebase
        console.log("Llamando a buscarNominasFirebase...");
        const nominas = await buscarNominasFirebase(tipo, nombre, fechaDesde, fechaHasta);
        
        console.log("Nóminas encontradas:", nominas.length);
        
        if (nominas.length === 0) {
            resultadosDiv.innerHTML = `
                <div class="no-results-container" style="text-align: center; padding: 60px 20px;">
                    <div style="width: 80px; height: 80px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-search" style="font-size: 32px; color: #9ca3af;"></i>
                    </div>
                    <h3 style="margin: 0 0 10px 0; color: #4b5563; font-weight: 500;">No se encontraron nóminas</h3>
                    <p style="margin: 0 0 25px 0; color: #6b7280; max-width: 500px; margin: 0 auto 25px;">
                        No hay nóminas que coincidan con los criterios de búsqueda seleccionados.
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="resetearBusqueda('${tipo}')" class="btn-secondary" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #4b5563; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-redo"></i> Limpiar filtros
                        </button>
                        <button onclick="debugNominas()" class="btn-primary" style="padding: 10px 20px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-bug"></i> Depurar
                        </button>
                    </div>
                </div>
            `;
            
            // Ocultar estadísticas
            const statsDiv = document.getElementById(`quick-stats-${tipo}`);
            if (statsDiv) statsDiv.style.display = 'none';
            
            return;
        }
        
        // Mostrar estadísticas
        const statsDiv = document.getElementById(`quick-stats-${tipo}`);
        const statsText = document.getElementById(`stats-text-${tipo}`);
        const statsActions = document.getElementById(`stats-actions-${tipo}`);
        
        if (statsDiv && statsText && statsActions) {
            const totalNominas = nominas.length;
            const totalNeto = nominas.reduce((sum, n) => sum + (n.totales?.neto || 0), 0);
            
            statsText.innerHTML = `
                <strong>${totalNominas}</strong> nóminas encontradas | 
                Total neto: <strong style="color: #059669;">$${totalNeto.toFixed(2)}</strong> |
                Promedio: <strong>$${(totalNeto / totalNominas).toFixed(2)}</strong>
            `;
            
            statsActions.innerHTML = `
                <button onclick="exportarNominasExcel(${JSON.stringify(nominas).replace(/"/g, '&quot;')}, '${tipo}')" 
                        class="btn-excel" style="padding: 8px 15px; border: none; background: linear-gradient(135deg, #059669, #047857); color: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px;">
                    <i class="fas fa-file-excel"></i> Excel
                </button>
                <button onclick="imprimirResultadosBusqueda('${tipo}')" 
                        class="btn-print" style="padding: 8px 15px; border: 1px solid #d1d5db; background: white; color: #4b5563; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px;">
                    <i class="fas fa-print"></i> Imprimir
                </button>
            `;
            
            statsDiv.style.display = 'block';
        }
        
        // Mostrar resultados en tabla mejorada
        let html = `
            <div class="results-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
                <div>
                    <h3 style="margin: 0; color: #c8cbd0ff; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                        <span class="badge-count" style="background: #3b82f6; color: white; padding: 5px 12px; border-radius: 20px; font-size: 14px;">
                            ${nominas.length} nóminas
                        </span>
                        <span>Resultados de búsqueda</span>
                    </h3>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                        ${nombre ? `${tipo === 'tecnico' ? 'Técnico' : 'Supervisor'}: <strong>${nombre}</strong>` : 'Todos los registros'}
                        ${fechaDesde || fechaHasta ? ' | Período:' : ''}
                        ${fechaDesde ? ` <strong>${fechaDesde}</strong>` : ''}
                        ${fechaHasta ? ` a <strong>${fechaHasta}</strong>` : ''}
                    </p>
                </div>
                <div class="results-actions" style="display: flex; gap: 10px;">
                    <button onclick="exportarNominasExcel(${JSON.stringify(nominas).replace(/"/g, '&quot;')}, '${tipo}')" 
                            class="btn-excel" style="padding: 10px 20px; border: none; background: linear-gradient(135deg, #059669, #047857); color: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600;">
                        <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                    <button onclick="imprimirResultadosBusqueda('${tipo}')" 
                            class="btn-secondary" style="padding: 10px 20px; border: 1px solid #3b82f6; background: white; color: #3b82f6; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600;">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                </div>
            </div>
            
            <div class="table-responsive" style="overflow-x: auto;">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>${tipo === 'tecnico' ? 'Técnico' : 'Supervisor'}</th>
                            <th>Período</th>
                            <th>Fecha Creación</th>
                            <th>Total Neto</th>
                            <th style="width: 120px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        nominas.forEach((nomina, index) => {
            // Formatear datos
            const fechaCreacion = nomina.fecha_creacion ? 
                (nomina.fecha_creacion.toDate ? 
                    nomina.fecha_creacion.toDate().toLocaleDateString('es-MX') : 
                    new Date(nomina.fecha_creacion).toLocaleDateString('es-MX')) : 
                'N/A';
            
            const periodo = `${formatearFechaParaMostrar(nomina.fecha_desde)} - ${formatearFechaParaMostrar(nomina.fecha_hasta)}`;
            const nombrePersona = tipo === 'tecnico' ? nomina.tecnico : nomina.supervisor;
            const totalNeto = nomina.totales?.neto || 0;
            
            // Determinar color basado en monto
            let rowClass = '';
            if (totalNeto >= 1000) rowClass = 'high-amount';
            else if (totalNeto <= 100) rowClass = 'low-amount';
            
            html += `
                <tr class="${rowClass}" style="transition: background 0.2s;">
                    <td style="text-align: center; font-weight: 600; color: #6b7280;">${index + 1}</td>
                    <td>
                        <div style="font-weight: 600; color: #8e96a7ff;">${nombrePersona}</div>
                        <div style="font-size: 12px; color: #8e96a7ff; margin-top: 3px;">
                            <i class="fas fa-id-card"></i> ID: ${nomina.id.substring(0, 8)}...
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 500;">${periodo}</div>
                        <div style="font-size: 12px; color: #8e96a7ff; margin-top: 3px;">
                            <i class="far fa-calendar"></i> ${nomina.fecha_desde ? 'Inicio: ' + nomina.fecha_desde : ''}
                        </div>
                    </td>
                    <td>
                        <div>${fechaCreacion}</div>
                        <div style="font-size: 12px; color: #8e96a7ff; margin-top: 3px;">
                            <i class="far fa-clock"></i> ${nomina.creado_por || 'Sistema'}
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 700; color: #059669; font-size: 16px;">
                            $${totalNeto.toFixed(2)}
                        </div>
                        <div style="font-size: 12px; color: #8e96a7ff; margin-top: 3px;">
                            Bruto: $${(nomina.totales?.bruto || 0).toFixed(2)}
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons" style="display: flex; gap: 5px;">
                            <button onclick="verNomina('${nomina.id}', '${tipo}')" 
                                    class="btn-view" title="Ver detalles" style="padding: 8px 12px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 13px;">
                                <i class="fas fa-eye"></i> Ver
                            </button>
                            <button onclick="reimprimirNomina('${nomina.id}', '${tipo}')" 
                                    class="btn-print" title="Reimprimir" style="padding: 8px 12px; border: 1px solid #d1d5db; background: white; color: #4b5563; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 13px;">
                                <i class="fas fa-print"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            
            <!-- Resumen al pie -->
            <div class="table-footer" style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #6b7280;">
                <div>
                    <i class="fas fa-info-circle"></i> Mostrando ${nominas.length} nóminas
                </div>
                <div style="display: flex; gap: 15px;">
                    <div>Total Neto: <strong style="color: #059669;">$${nominas.reduce((sum, n) => sum + (n.totales?.neto || 0), 0).toFixed(2)}</strong></div>
                    <div>Promedio: <strong>$${(nominas.reduce((sum, n) => sum + (n.totales?.neto || 0), 0) / nominas.length).toFixed(2)}</strong></div>
                </div>
            </div>
        `;
        
        resultadosDiv.innerHTML = html;
        
        // Agregar estilos a la tabla
        agregarEstilosTablaModernos();
        
        // Mostrar notificación de éxito
        mostrarNotificacion(`Se encontraron ${nominas.length} nóminas`, 'success');
        
    } catch (error) {
        console.error("❌ Error en buscarNominas:", error);
        
        const resultadosDiv = document.getElementById(`resultados-busqueda-${tipo}`);
        if (resultadosDiv) {
            resultadosDiv.innerHTML = `
                <div class="error-container" style="text-align: center; padding: 60px 20px; background: #fef2f2; border-radius: 10px; border: 1px solid #fecaca;">
                    <div style="width: 80px; height: 80px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 32px; color: #dc2626;"></i>
                    </div>
                    <h3 style="margin: 0 0 10px 0; color: #7f1d1d; font-weight: 500;">Error en la búsqueda</h3>
                    <p style="margin: 0 0 20px 0; color: #991b1b; max-width: 500px; margin: 0 auto 20px;">
                        ${error.message || 'Ocurrió un error al buscar nóminas. Intenta nuevamente.'}
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="buscarNominas('${tipo}')" class="btn-primary" style="padding: 10px 20px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-redo"></i> Reintentar
                        </button>
                        <button onclick="resetearBusqueda('${tipo}')" class="btn-secondary" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; color: #4b5563; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            `;
        }
        
        mostrarNotificacion('Error al buscar nóminas', 'error');
    }
}

function exportarNominasExcel(nominas, tipo) {
    try {
        if (!nominas || nominas.length === 0) {
            mostrarNotificacion('No hay datos para exportar', 'warning');
            return;
        }
        
        // Crear contenido CSV
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        
        // Encabezados
        const headers = [
            '#',
            tipo === 'tecnico' ? 'Técnico' : 'Supervisor',
            'Fecha Desde',
            'Fecha Hasta',
            'Fecha Creación',
            'Total Bruto',
            'Total Deducciones',
            'Neto a Pagar',
            'ID Nómina',
            'Creado Por'
        ];
        
        csvContent += headers.join(',') + '\n';
        
        // Datos
        nominas.forEach((nomina, index) => {
            const row = [
                index + 1,
                tipo === 'tecnico' ? nomina.tecnico : nomina.supervisor,
                nomina.fecha_desde || '',
                nomina.fecha_hasta || '',
                nomina.fecha_creacion ? 
                    (nomina.fecha_creacion.toDate ? 
                        nomina.fecha_creacion.toDate().toLocaleDateString('es-MX') : 
                        new Date(nomina.fecha_creacion).toLocaleDateString('es-MX')) : 
                    '',
                nomina.totales?.bruto || 0,
                nomina.totales?.deducciones || 0,
                nomina.totales?.neto || 0,
                nomina.id,
                nomina.creado_por || 'Sistema'
            ];
            
            csvContent += row.map(field => `"${field}"`).join(',') + '\n';
        });
        
        // Crear y descargar archivo
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `nominas_${tipo}_${new Date().toISOString().split('T')[0]}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        mostrarNotificacion(`Exportados ${nominas.length} registros a Excel`, 'success');
        
    } catch (error) {
        console.error('Error exportando a Excel:', error);
        mostrarNotificacion('Error al exportar a Excel', 'error');
    }
}

// Agrega estos estilos al documento
function agregarEstilosBusquedaMejorada() {
    const estilos = `
    <style>
        /* Animaciones */
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Select moderno */
        .select-wrapper {
            position: relative;
        }
        
        .modern-select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 15px;
            background: white;
            color: #374151;
            appearance: none;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .modern-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .modern-select:hover {
            border-color: #9ca3af;
        }
        
        .select-arrow {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
            pointer-events: none;
        }
        
        /* Input de fecha moderno */
        .date-input-wrapper {
            position: relative;
        }
        
        .modern-date-input {
            width: 100%;
            padding: 12px 15px 12px 45px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 15px;
            background: white;
            color: #374151;
            transition: all 0.3s;
        }
        
        .modern-date-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .date-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
        }
        
        /* Botones mejorados */
        .btn-search {
            background: linear-gradient(135deg, #10b981, #059669) !important;
            transition: all 0.3s !important;
        }
        
        .btn-search:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
        }
        
        .btn-search:active {
            transform: translateY(0) !important;
        }
        
        .btn-secondary:hover {
            background: #f3f4f6 !important;
            transform: translateY(-1px) !important;
        }
        
        .btn-reset:hover {
            background: #f9fafb !important;
            transform: translateY(-1px) !important;
        }
        
        /* Tabla moderna */
        .modern-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 14px;
        }
        
        .modern-table thead {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        }
        
        .modern-table th {
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            position: sticky;
            top: 0;
            background: #f8fafc;
        }
        
        .modern-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: middle;
        }
        
        .modern-table tbody tr:hover {
            background: #f9fafb;
            transform: scale(1.002);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .modern-table tbody tr.high-amount {
            background: rgba(34, 197, 94, 0.05);
            border-left: 3px solid #10b981;
        }
        
        .modern-table tbody tr.low-amount {
            background: rgba(251, 191, 36, 0.05);
            border-left: 3px solid #f59e0b;
        }
        
        /* Botones de acción */
        .btn-view {
            transition: all 0.2s !important;
        }
        
        .btn-view:hover {
            background: #2563eb !important;
            transform: translateY(-1px) !important;
        }
        
        .btn-print:hover {
            background: #f3f4f6 !important;
            transform: translateY(-1px) !important;
        }
        
        /* Error states */
        .error-border {
            border-color: #dc2626 !important;
        }
        
        .error-border:focus {
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr !important;
            }
            
            .form-actions {
                flex-direction: column !important;
            }
            
            .results-header {
                flex-direction: column !important;
                gap: 15px !important;
                align-items: flex-start !important;
            }
            
            .results-actions {
                width: 100% !important;
                justify-content: flex-start !important;
            }
        }
        
        /* Scroll personalizado */
        .table-responsive::-webkit-scrollbar {
            height: 8px;
        }
        
        .table-responsive::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        .table-responsive::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }
        
        .table-responsive::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }
    </style>
    `;
    
    // Agregar estilos si no existen
    if (!document.getElementById('estilos-busqueda-mejorada')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'estilos-busqueda-mejorada';
        styleElement.innerHTML = estilos;
        document.head.appendChild(styleElement);
    }
}

// Función para agregar estilos a la tabla
function agregarEstilosTablaModernos() {
    const estilosTabla = `
    <style>
        .modern-table {
            min-width: 100%;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .modern-table thead tr {
            background: linear-gradient(135deg, #1e3a8a, #3730a3);
        }
        
        .modern-table thead th {
            color: white;
            font-weight: 600;
            padding: 16px 15px;
            border: none;
        }
        
        .modern-table tbody tr:nth-child(even) {
            background: #fafafa;
        }
        
        .modern-table tbody tr:last-child td {
            border-bottom: none;
        }
        
        .modern-table tbody td {
            padding: 14px 15px;
            color: #374151;
        }
        
        .action-buttons button {
            transition: all 0.2s;
        }
        
        .action-buttons button:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .badge-count {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
    </style>
    `;
    
    // Agregar estilos temporales
    const tempStyle = document.createElement('style');
    tempStyle.innerHTML = estilosTabla;
    document.head.appendChild(tempStyle);
}

// Función auxiliar para formatear fecha
function formatearFechaParaMostrar(fechaISO) {
    if (!fechaISO) return 'N/A';
    
    try {
        // Si es número (timestamp), convertirlo
        if (typeof fechaISO === 'number') {
            const fecha = new Date(fechaISO);
            return fecha.toLocaleDateString('es-MX');
        }
        
        // Si ya está en formato YYYY-MM-DD
        if (typeof fechaISO === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
            const [year, month, day] = fechaISO.split('-');
            return `${day}/${month}/${year}`;
        }
        
        // Si es un objeto Date
        if (fechaISO instanceof Date) {
            return fechaISO.toLocaleDateString('es-MX');
        }
        
        // Intentar parsear como string de fecha
        const fecha = new Date(fechaISO);
        if (!isNaN(fecha.getTime())) {
            return fecha.toLocaleDateString('es-MX');
        }
        
        // Si no se pudo parsear, devolver el valor original
        return String(fechaISO);
        
    } catch (error) {
        console.error("Error en formatearFechaParaMostrar:", error, "Valor:", fechaISO);
        return String(fechaISO || 'N/A');
    }
}

async function verNomina(nominaId, tipo) {
    try {
        const nomina = await cargarNominaFirebase(nominaId);
        
        if (!nomina) {
            alert('No se pudo cargar la nómina.');
            return;
        }
        
        // Crear ventana/modal para ver la nómina
        const modalId = `modal-ver-nomina-${nominaId}`;
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal-nomina-view';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
            `;
            
            const nombre = tipo === 'tecnico' ? nomina.tecnico : nomina.supervisor;
            
            modal.innerHTML = `
                <div style="background: #1e293b; width: 90%; max-width: 1000px; max-height: 90vh; overflow-y: auto; border-radius: 12px; padding: 30px; position: relative;">
                    <button onclick="document.getElementById('${modalId}').remove()" style="position: absolute; top: 15px; right: 20px; background: #334155 border: none; font-size: 24px; color: #666; cursor: pointer;">×</button>
                    
                    <h2 style="color: #989ba2ff; margin-bottom: 20px;">Nómina ${tipo === 'tecnico' ? 'Técnico' : 'Supervisor'}</h2>
                    
                    <div class="info-nomina" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; padding: 20px; background: #334155 border-radius: 10px; border-radius: 10px; border: 2px solid #566d8dff">
                        <div>
                            <strong>${tipo === 'tecnico' ? 'Técnico' : 'Supervisor'}:</strong><br>
                            <span style="font-size: 16px; font-weight: 600; color: #989ba2ff;">${nombre}</span>
                        </div>
                        <div>
                            <strong>Período:</strong><br>
                            <span>${nomina.fecha_desde} al ${nomina.fecha_hasta}</span>
                        </div>
                        <div>
                            <strong>Creada por:</strong><br>
                            <span>${nomina.creado_por}</span>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; border-radius: 10px; border: 2px solid #566d8dff"">
                        <!-- Percepciones -->
                        <div>
                            <h3 style="color: #989ba2ff; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #10b981;">Percepciones</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #334155;">
                                        <th style="padding: 10px; text-align: left;">Concepto</th>
                                        <th style="padding: 10px; text-align: right;">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${nomina.percepciones?.map(p => `
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #334155;">
                                                ${p.concepto || p.folio || p.dia || 'Percepción'}
                                                ${p.es_adicional ? ' <span style="color: #f59e0b; font-size: 0.8em;">(Adicional)</span>' : ''}
                                            </td>
                                            <td style="padding: 10px; border-bottom: 1px solid #334155; text-align: right; font-weight: 600;">
                                                $${parseFloat(p.costo || p.monto || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    `).join('') || '<tr><td colspan="2" style="padding: 10px; text-align: center; color: #94a3b8;">Sin percepciones</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Deducciones -->
                        <div>
                            <h3 style="color: #989ba2ff; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #ef4444;">Deducciones</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #334155;">
                                        <th style="padding: 10px; text-align: left;">Concepto</th>
                                        <th style="padding: 10px; text-align: right;">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${nomina.deducciones?.map(d => `
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #334155;">
                                                ${d.concepto || 'Deducción'}
                                                ${d.descripcion ? `<br><small style="color: #64748b;">${d.descripcion}</small>` : ''}
                                            </td>
                                            <td style="padding: 10px; border-bottom: 1px solid #334155; text-align: right; font-weight: 600; color: #ef4444;">
                                                -$${parseFloat(d.monto || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    `).join('') || '<tr><td colspan="2" style="padding: 10px; text-align: center; color: #94a3b8;">Sin deducciones</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Totales -->
                    <div style="margin: 25px 0; padding: 20px; background: linear-gradient(135deg, #334155, #334155); border-radius: 10px; border: 2px solid #566d8dff">
                        <h3 style="color: #989ba2ff; margin-bottom: 15px;">Totales</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                            <div>
                                <div style="font-size: 12px; color: #989ba2ff;">Total Bruto</div>
                                <div style="font-size: 20px; font-weight: 700; color: #989ba2ff;">$${nomina.totales?.bruto?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #989ba2ff;">Deducciones</div>
                                <div style="font-size: 20px; font-weight: 700; color: #dc2626;">-$${nomina.totales?.deducciones?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #989ba2ff;">Neto a Pagar</div>
                                <div style="font-size: 24px; font-weight: 700; color: #059669;">$${nomina.totales?.neto?.toFixed(2) || '0.00'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Comentarios -->
                    ${nomina.comentarios ? `
                        <div style="margin-top: 25px; padding: 20px; background: #334155; border-radius: 10px; border: 1px solid #fde68a;">
                            <h3 style="color: #92400e; margin-bottom: 10px;">Comentarios</h3>
                            <div style="white-space: pre-line; color: #78350f; line-height: 1.6;">${nomina.comentarios}</div>
                        </div>
                    ` : ''}
                    
                    <div style="margin-top: 30px; display: flex; justify-content: center; gap: 15px;">
                        <button onclick="reimprimirNomina('${nominaId}', '${tipo}')" class="btn-primary">
                            <i class="fas fa-print"></i> Reimprimir
                        </button>
                        <button onclick="document.getElementById('${modalId}').remove()" class="btn-secondary">
                            Cerrar
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
        
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error("Error viendo nómina:", error);
        alert('Error al cargar la nómina: ' + error.message);
    }
}

// ======================
// FUNCIONES PARA REIMPRIMIR NÓMINAS
// ======================

async function reimprimirNomina(nominaId, tipo) {
    try {
        console.log(`🖨️ Reimprimiendo nómina ${nominaId} (tipo: ${tipo})`);
        
        // Cargar la nómina desde Firebase
        const nomina = await cargarNominaFirebase(nominaId);
        if (!nomina) {
            alert('No se pudo cargar la nómina para reimpresión');
            return;
        }
        
        // Dependiendo del tipo, generar el recibo correspondiente
        if (tipo === 'tecnico') {
            await reimprimirNominaTecnico(nomina);
        } else if (tipo === 'supervisor') {
            await reimprimirNominaSupervisor(nomina);
        } else {
            alert('Tipo de nómina no válido');
        }
        
    } catch (error) {
        console.error('Error reimprimiendo nómina:', error);
        alert('Error al reimprimir la nómina: ' + error.message);
    }
}

async function reimprimirNominaTecnico(nomina) {
    try {
        console.log('Reimprimiendo nómina técnico:', nomina.tecnico);
        
        // 1. Crear elementos necesarios si no existen
        let receiptDiv = document.getElementById('nomina-receipt-reimpresion');
        if (!receiptDiv) {
            receiptDiv = document.createElement('div');
            receiptDiv.id = 'nomina-receipt-reimpresion';
            receiptDiv.style.display = 'none';
            document.body.appendChild(receiptDiv);
        }
        
        // 2. Generar HTML del recibo
        const puesto = determinarPuesto(nomina.tecnico);
        const logoUrl = 'https://raw.githubusercontent.com/infinity-system-cpu/rosteraccrued-dashboard/main/assets/logo.png';
        
        // Formatear fechas
        const fechaDesdeFormateada = formatearFechaParaMostrar(nomina.fecha_desde);
        const fechaHastaFormateada = formatearFechaParaMostrar(nomina.fecha_hasta);
        
        const hoy = new Date();
        const fechaHoy = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
        
        // Calcular totales
        const totalBruto = nomina.totales?.bruto || 0;
        const totalDeducciones = nomina.totales?.deducciones || 0;
        const netoAPagar = nomina.totales?.neto || 0;
        
        // 3. Generar HTML
        const html = `
        <div id="recibo-reimpresion-tecnico" class="recibo-profesional">
            <!-- ENCABEZADO CON LOGO -->
            <div class="recibo-header">
                <div class="logo-container">
                    <img src="${logoUrl}" alt="Logo Empresa" class="recibo-logo" 
                         onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiMxZTNhOGEiLz48dGV4dCB4PSIxMDAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxPR08gRU1QUkVTQTwvdGV4dD48L3N2Zz4='">
                </div>
                <div class="recibo-titulo">
                    <h1>RECIBO DE PAGO TÉCNICO (REIMPRESIÓN)</h1>
                    <p class="subtitulo">SERVICIOS TÉCNICOS DE INSTALACIÓN</p>
                </div>
                <div class="recibo-info">
                    <p><strong>Fecha:</strong> ${fechaHoy}</p>
                    <p><strong>Recibo No:</strong> ${nomina.id.substring(0, 8).toUpperCase()}</p>
                    <p><strong>Original:</strong> ${nomina.fecha_creacion ? 
                        (nomina.fecha_creacion.toDate ? 
                            nomina.fecha_creacion.toDate().toLocaleDateString('es-MX') : 
                            new Date(nomina.fecha_creacion).toLocaleDateString('es-MX')) : 
                        'N/A'}</p>
                </div>
            </div>
            
            <!-- INFORMACIÓN DEL TÉCNICO -->
            <div class="recibo-seccion">
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Técnico:</strong>
                        <span>${nomina.tecnico || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Puesto:</strong>
                        <span>${puesto}</span>
                    </div>
                    <div class="info-item">
                        <strong>Periodo:</strong>
                        <span>${fechaDesdeFormateada} al ${fechaHastaFormateada}</span>
                    </div>
                    <div class="info-item">
                        <strong>Nómina ID:</strong>
                        <span style="font-size: 10pt;">${nomina.id.substring(0, 12)}...</span>
                    </div>
                </div>
            </div>
            
            <!-- TABLA DE SERVICIOS -->
            <div class="recibo-seccion">
                <h2><i class="fas fa-clipboard-list"></i> DETALLE DE SERVICIOS</h2>
                <table class="recibo-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Concepto</th>
                            <th>Detalles</th>
                            <th class="text-right">Costo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${nomina.percepciones && nomina.percepciones.length > 0 ? 
                            nomina.percepciones.map((p, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>
                                        ${p.concepto || p.folio || 'Servicio'}
                                        ${p.tipo ? `<br><small>${p.tipo}</small>` : ''}
                                        ${p.instalacion ? `<br><small>${p.instalacion}</small>` : ''}
                                    </td>
                                    <td>
                                        ${p.fecha ? `<small>Fecha: ${p.fecha}</small><br>` : ''}
                                        ${p.descripcion || ''}
                                        ${p.es_adicional ? '<br><small style="color: #f59e0b;">(Adicional)</small>' : ''}
                                    </td>
                                    <td class="text-right">$${parseFloat(p.costo || p.monto || 0).toFixed(2)}</td>
                                </tr>
                            `).join('') : 
                            '<tr><td colspan="4" class="text-center">No hay servicios registrados</td></tr>'
                        }
                        
                        <!-- TOTAL PERCEPCIONES -->
                        <tr class="subtotal-row">
                            <td colspan="3" class="text-right"><strong>TOTAL SERVICIOS</strong></td>
                            <td class="text-right">$${totalBruto.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- SECCIÓN DE DEDUCCIONES -->
            ${nomina.deducciones && nomina.deducciones.length > 0 ? `
            <div class="recibo-seccion">
                <h2><i class="fas fa-minus-circle"></i> DEDUCCIONES APLICADAS</h2>
                <table class="deducciones-table">
                    <thead>
                        <tr>
                            <th>Concepto</th>
                            <th>Descripción</th>
                            <th class="text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${nomina.deducciones.map((d, index) => `
                            <tr>
                                <td>${d.concepto || 'Deducción'}</td>
                                <td>${d.descripcion || ''}</td>
                                <td class="text-right">-$${parseFloat(d.monto || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-deducciones">
                            <td colspan="2" class="text-right"><strong>TOTAL DEDUCCIONES</strong></td>
                            <td class="text-right">-$${totalDeducciones.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            ` : ''}
            
            <!-- TOTAL FINAL -->
            <div class="recibo-seccion total-final">
                <div class="total-container">
                    <div class="total-item">
                        <span>Total Bruto:</span>
                        <span>$${totalBruto.toFixed(2)}</span>
                    </div>
                    <div class="total-item">
                        <span>Total Deducciones:</span>
                        <span class="negativo">-$${totalDeducciones.toFixed(2)}</span>
                    </div>
                    <div class="total-item final">
                        <span>NETO A PAGAR:</span>
                        <span>$${netoAPagar.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <!-- COMENTARIOS -->
            ${nomina.comentarios ? `
            <div class="recibo-seccion">
                <h2><i class="fas fa-comment"></i> COMENTARIOS</h2>
                <div class="comentarios-container" style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <p style="white-space: pre-line; margin: 0;">${nomina.comentarios}</p>
                </div>
            </div>
            ` : ''}
            
            <!-- FIRMAS -->
            <div class="recibo-seccion">
                <div class="firmas-container">
                    <div class="firma-item">
                        <div class="linea-firma"></div>
                        <p><strong>RECIBÍ CONFORME</strong></p>
                        <p class="firma-nombre">${nomina.tecnico || 'N/A'}</p>
                        <p>${puesto}</p>
                    </div>
                    
                    <div class="firma-item">
                        <div class="linea-firma"></div>
                        <p><strong>AUTORIZÓ</strong></p>
                        <p class="firma-nombre">GERENCIA DE OPERACIONES</p>
                        <p>Autorización de Pago</p>
                    </div>
                    
                    <div class="firma-item">
                        <div class="linea-firma"></div>
                        <p><strong>REIMPRESIÓN</strong></p>
                        <p class="firma-nombre">${currentUser ? currentUser.name : 'SISTEMA'}</p>
                        <p>${new Date().toLocaleDateString('es-MX')}</p>
                    </div>
                </div>
            </div>
            
            <!-- FOOTER DE REIMPRESIÓN -->
            <div class="recibo-footer" style="margin-top: 30px; padding-top: 15px; border-top: 1px dashed #94a3b8; text-align: center; font-size: 9pt; color: #64748b;">
                <p>Documento reimpreso el ${hoy.toLocaleDateString('es-MX', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                <p>ID original: ${nomina.id} | Tipo: ${nomina.tipo} | Creado por: ${nomina.creado_por || 'Sistema'}</p>
            </div>
        </div>
        `;
        
        receiptDiv.innerHTML = html;
        
        // 4. Imprimir
        setTimeout(() => {
            imprimirReciboReimpresion('tecnico');
        }, 500);
        
    } catch (error) {
        console.error('Error reimprimiendo nómina técnico:', error);
        throw error;
    }
}

async function reimprimirNominaSupervisor(nomina) {
    try {
        console.log('Reimprimiendo nómina supervisor:', nomina.supervisor);
        
        // Similar a la función anterior pero para supervisor
        let receiptDiv = document.getElementById('nomina-receipt-reimpresion');
        if (!receiptDiv) {
            receiptDiv = document.createElement('div');
            receiptDiv.id = 'nomina-receipt-reimpresion';
            receiptDiv.style.display = 'none';
            document.body.appendChild(receiptDiv);
        }
        
        const puesto = determinarPuesto(nomina.supervisor);
        const logoUrl = 'https://raw.githubusercontent.com/infinity-system-cpu/rosteraccrued-dashboard/main/assets/logo.png';
        
        // Formatear fechas
        const fechaDesdeFormateada = formatearFechaParaMostrar(nomina.fecha_desde);
        const fechaHastaFormateada = formatearFechaParaMostrar(nomina.fecha_hasta);
        
        const hoy = new Date();
        const fechaHoy = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
        
        // Calcular totales
        const totalBruto = nomina.totales?.bruto || 0;
        const totalDeducciones = nomina.totales?.deducciones || 0;
        const netoAPagar = nomina.totales?.neto || 0;
        
        // Generar HTML para supervisor
        const html = `
        <div id="recibo-reimpresion-supervisor" class="recibo-profesional supervisor">
            <!-- ENCABEZADO CON LOGO -->
            <div class="recibo-header">
                <div class="logo-container">
                    <img src="${logoUrl}" alt="Logo Empresa" class="recibo-logo" 
                         onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiMxZTNhOGEiLz48dGV4dCB4PSIxMDAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxPR08gRU1QUkVTQTwvdGV4dD48L3N2Zz4='">
                </div>
                <div class="recibo-titulo">
                    <h1>RECIBO DE PAGO SUPERVISOR (REIMPRESIÓN)</h1>
                    <p class="subtitulo">SUPERVISIÓN Y COORDINACIÓN TÉCNICA</p>
                </div>
                <div class="recibo-info">
                    <p><strong>Fecha:</strong> ${fechaHoy}</p>
                    <p><strong>Recibo No:</strong> ${nomina.id.substring(0, 8).toUpperCase()}</p>
                    <p><strong>Original:</strong> ${nomina.fecha_creacion ? 
                        (nomina.fecha_creacion.toDate ? 
                            nomina.fecha_creacion.toDate().toLocaleDateString('es-MX') : 
                            new Date(nomina.fecha_creacion).toLocaleDateString('es-MX')) : 
                        'N/A'}</p>
                </div>
            </div>
            
            <!-- INFORMACIÓN DEL SUPERVISOR -->
            <div class="recibo-seccion">
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Supervisor:</strong>
                        <span>${nomina.supervisor || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Puesto:</strong>
                        <span>${puesto}</span>
                    </div>
                    <div class="info-item">
                        <strong>Periodo:</strong>
                        <span>${fechaDesdeFormateada} al ${fechaHastaFormateada}</span>
                    </div>
                    <div class="info-item">
                        <strong>Nómina ID:</strong>
                        <span style="font-size: 10pt;">${nomina.id.substring(0, 12)}...</span>
                    </div>
                </div>
            </div>
            
            <!-- TABLA DE PERCEPCIONES -->
            <div class="recibo-seccion">
                <h2><i class="fas fa-money-bill-wave"></i> PERCEPCIONES SALARIALES</h2>
                <table class="recibo-table supervisor-table">
                    <thead>
                        <tr>
                            <th>Día/Concepto</th>
                            <th>Detalles</th>
                            <th class="text-right">Cantidad</th>
                            <th class="text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${nomina.percepciones && nomina.percepciones.length > 0 ? 
                            nomina.percepciones.map((p, index) => `
                                <tr>
                                    <td>
                                        ${p.dia || p.concepto || 'Percepción'}
                                        ${p.tipo ? `<br><small>${p.tipo}</small>` : ''}
                                    </td>
                                    <td>${p.descripcion || ''}</td>
                                    <td class="text-right">${p.cantidad || 1}</td>
                                    <td class="text-right">$${parseFloat(p.monto || 0).toFixed(2)}</td>
                                </tr>
                            `).join('') : 
                            '<tr><td colspan="4" class="text-center">No hay percepciones registradas</td></tr>'
                        }
                        
                        <!-- TOTAL PERCEPCIONES -->
                        <tr class="subtotal-row">
                            <td colspan="3" class="text-right"><strong>TOTAL PERCEPCIONES</strong></td>
                            <td class="text-right">$${totalBruto.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- SECCIÓN DE DEDUCCIONES -->
            ${nomina.deducciones && nomina.deducciones.length > 0 ? `
            <div class="recibo-seccion">
                <h2><i class="fas fa-minus-circle"></i> DEDUCCIONES APLICADAS</h2>
                <table class="deducciones-table">
                    <thead>
                        <tr>
                            <th>Concepto</th>
                            <th>Descripción</th>
                            <th class="text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${nomina.deducciones.map((d, index) => `
                            <tr>
                                <td>${d.concepto || 'Deducción'}</td>
                                <td>${d.descripcion || ''}</td>
                                <td class="text-right">-$${parseFloat(d.monto || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-deducciones">
                            <td colspan="2" class="text-right"><strong>TOTAL DEDUCCIONES</strong></td>
                            <td class="text-right">-$${totalDeducciones.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            ` : ''}
            
            <!-- TOTAL FINAL -->
            <div class="recibo-seccion total-final">
                <div class="total-container">
                    <div class="total-item">
                        <span>Total Bruto:</span>
                        <span>$${totalBruto.toFixed(2)}</span>
                    </div>
                    <div class="total-item">
                        <span>Total Deducciones:</span>
                        <span class="negativo">-$${totalDeducciones.toFixed(2)}</span>
                    </div>
                    <div class="total-item final">
                        <span>NETO A PAGAR:</span>
                        <span>$${netoAPagar.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <!-- COMENTARIOS -->
            ${nomina.comentarios ? `
            <div class="recibo-seccion">
                <h2><i class="fas fa-comment"></i> COMENTARIOS</h2>
                <div class="comentarios-container" style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <p style="white-space: pre-line; margin: 0;">${nomina.comentarios}</p>
                </div>
            </div>
            ` : ''}
            
            <!-- FIRMAS -->
            <div class="recibo-seccion">
                <div class="firmas-container supervisor-firmas">
                    <div class="firma-item">
                        <div class="linea-firma"></div>
                        <p><strong>RECIBÍ CONFORME</strong></p>
                        <p class="firma-nombre">${nomina.supervisor || 'N/A'}</p>
                        <p>${puesto}</p>
                    </div>
                    
                    <div class="firma-item">
                        <div class="linea-firma"></div>
                        <p><strong>REVISÓ</strong></p>
                        <p class="firma-nombre">GERENCIA DE OPERACIONES</p>
                        <p>Autorización de Pago</p>
                    </div>
                    
                    <div class="firma-item">
                        <div class="linea-firma"></div>
                        <p><strong>REIMPRESIÓN</strong></p>
                        <p class="firma-nombre">${currentUser ? currentUser.name : 'SISTEMA'}</p>
                        <p>${new Date().toLocaleDateString('es-MX')}</p>
                    </div>
                </div>
            </div>
            
            <!-- FOOTER DE REIMPRESIÓN -->
            <div class="recibo-footer" style="margin-top: 30px; padding-top: 15px; border-top: 1px dashed #94a3b8; text-align: center; font-size: 9pt; color: #64748b;">
                <p>Documento reimpreso el ${hoy.toLocaleDateString('es-MX', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                <p>ID original: ${nomina.id} | Tipo: ${nomina.tipo} | Creado por: ${nomina.creado_por || 'Sistema'}</p>
            </div>
        </div>
        `;
        
        receiptDiv.innerHTML = html;
        
        // Imprimir
        setTimeout(() => {
            imprimirReciboReimpresion('supervisor');
        }, 500);
        
    } catch (error) {
        console.error('Error reimprimiendo nómina supervisor:', error);
        throw error;
    }
}

function imprimirReciboReimpresion(tipo) {
    try {
        const elementoId = tipo === 'tecnico' ? 
            'recibo-reimpresion-tecnico' : 
            'recibo-reimpresion-supervisor';
        
        const printContent = document.getElementById(elementoId);
        if (!printContent) {
            alert('No se encontró el recibo para imprimir');
            return;
        }
        
        // Clonar el contenido
        const printClone = printContent.cloneNode(true);
        
        // Remover botones y elementos no imprimibles
        const elementosNoImprimir = printClone.querySelectorAll(
            '.no-print, button, [onclick]'
        );
        elementosNoImprimir.forEach(el => el.remove());
        
        // Crear ventana de impresión
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        
        // Estilos para impresión
        const estilos = `
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                font-size: 11pt;
                line-height: 1.4;
                color: #000;
                background: white;
                margin: 20px;
            }
            
            .recibo-profesional {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            
            .recibo-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #1e3a8a;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            
            .recibo-logo {
                max-width: 120px;
                max-height: 50px;
            }
            
            .recibo-titulo h1 {
                color: #1e3a8a;
                font-size: 16pt;
                margin: 0 0 5px 0;
                text-align: center;
            }
            
            .recibo-titulo .subtitulo {
                color: #666;
                font-size: 10pt;
                margin: 0;
                text-align: center;
            }
            
            .recibo-info {
                font-size: 9pt;
                text-align: right;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                font-size: 10pt;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                font-size: 10pt;
            }
            
            th {
                background: #1e3a8a;
                color: white;
                padding: 8px;
                text-align: left;
                border: 1px solid #1a3173;
            }
            
            td {
                padding: 8px;
                border: 1px solid #ddd;
            }
            
            .text-right {
                text-align: right;
            }
            
            .subtotal-row {
                background: #f8f9fa;
                font-weight: bold;
            }
            
            .total-final {
                background: #f1f5f9;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border: 1px solid #cbd5e1;
            }
            
            .total-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .total-item.final {
                font-size: 12pt;
                font-weight: bold;
                color: #1e3a8a;
                border-top: 2px solid #1e3a8a;
                border-bottom: none;
                margin-top: 10px;
                padding-top: 15px;
            }
            
            .negativo {
                color: #dc2626;
            }
            
            .firmas-container {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-top: 30px;
                text-align: center;
            }
            
            .linea-firma {
                height: 1px;
                background: #333;
                margin: 30px auto 10px;
                width: 80%;
            }
            
            .firma-nombre {
                font-weight: bold;
                margin: 10px 0;
            }
            
            @media print {
                @page {
                    margin: 1cm;
                    size: letter;
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-size: 10pt;
                }
                
                .recibo-profesional {
                    border: none;
                    box-shadow: none;
                    padding: 0;
                }
                
                .no-print {
                    display: none !important;
                }
                
                @page {
                    @bottom-center {
                        content: "Reimpresión - Página " counter(page) " de " counter(pages);
                        font-size: 8pt;
                        color: #999;
                    }
                }
            }
        </style>
        `;
        
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reimpresión Nómina ${tipo === 'tecnico' ? 'Técnico' : 'Supervisor'}</title>
            <meta charset="UTF-8">
            ${estilos}
        </head>
        <body>
            ${printClone.outerHTML}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        
                        // Cerrar después de imprimir
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    }, 500);
                };
            </script>
        </body>
        </html>
        `);
        
        printWindow.document.close();
        
    } catch (error) {
        console.error('Error imprimiendo recibo reimpresión:', error);
        alert('Error al imprimir: ' + error.message);
    }
}

async function eliminarNomina(nominaId, tipo) {
    if (!confirm('¿Está seguro de eliminar esta nómina? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        await db.collection('nominas').doc(nominaId).delete();
        alert('✅ Nómina eliminada correctamente.');
        
        // Refrescar la búsqueda
        buscarNominas(tipo);
    } catch (error) {
        console.error("Error eliminando nómina:", error);
        alert('❌ Error al eliminar la nómina: ' + error.message);
    }
}

// ======================
// IMPRIMIR RECIBO TÉCNICO (FORMATO COMPLETO)
// ======================
function printNomina() {
    try {
        console.log("Preparando impresión con formato completo...");
        
        const printContent = document.getElementById('recibo-impresion');
        if (!printContent) {
            alert('No hay recibo para imprimir.');
            return;
        }
        
        // Incrementar número de recibo
        incrementarNumeroReciboTecnico();
        
        // Clonar el contenido PROFUNDAMENTE
        const printClone = printContent.cloneNode(true);
        
        // 1. LIMPIAR SOLO BOTONES Y ELEMENTOS DE EDICIÓN, NO LAS TABLAS
        const elementosNoImprimir = printClone.querySelectorAll(
            '.no-print, .btn-print, .btn-agregar, .btn-actualizar, ' +
            '.btn-guardar, .btn-eliminar-small, .receipt-container, ' +
            '[onclick], button'
        );
        
        elementosNoImprimir.forEach(el => {
            if (!el.classList.contains('recibo-table') && 
                !el.classList.contains('deducciones-table') &&
                !el.closest('table')) {
                el.remove();
            }
        });
        
        // 2. REMOVER ATRIBUTOS DE EDICIÓN PERO MANTENER EL CONTENIDO
        printClone.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.removeAttribute('contenteditable');
            el.classList.remove('editable');
            el.classList.add('print-only');
        });
        
        // 3. Asegurar que las tablas sean visibles
        const tables = printClone.querySelectorAll('table');
        tables.forEach(table => {
            table.style.display = 'table';
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
        });
        
        // 4. PREPARAR ESTILOS COMPLETOS
        const estilosCompletos = `
        <style>
            /* ESTILOS BASE DEL RECIBO */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', 'Helvetica', sans-serif;
                font-size: 12pt;
                line-height: 1.4;
                color: #000;
                background: white;
                margin: 0;
                padding: 20px;
                width: 100%;
            }
            
            /* CONTENEDOR PRINCIPAL */
            .recibo-profesional {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 25px;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            /* ENCABEZADO */
            .recibo-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 3px solid #1e3a8a;
                padding-bottom: 20px;
                margin-bottom: 25px;
                page-break-inside: avoid;
            }
            
            .logo-container {
                flex: 0 0 150px;
            }
            
            .recibo-logo {
                max-width: 150px;
                max-height: 70px;
                object-fit: contain;
            }
            
            .recibo-titulo {
                flex: 1;
                text-align: center;
            }
            
            .recibo-titulo h1 {
                color: #1e3a8a;
                font-size: 22pt;
                margin: 0 0 5px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .recibo-titulo .subtitulo {
                color: #666;
                font-size: 11pt;
                margin: 0;
            }
            
            .recibo-info {
                flex: 0 0 150px;
                text-align: right;
                font-size: 10pt;
            }
            
            /* INFORMACIÓN GRID */
            .info-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #dee2e6;
                margin-bottom: 25px;
                page-break-inside: avoid;
            }
            
            .info-item {
                display: flex;
                flex-direction: column;
            }
            
            .info-item strong {
                color: #495057;
                font-size: 10pt;
                margin-bottom: 5px;
            }
            
            .info-item span {
                color: #212529;
                font-size: 12pt;
                font-weight: 600;
            }
            
            /* TABLAS - IMPORTANTE: ASEGURAR QUE SE MUESTREN */
            table.recibo-table,
            table.deducciones-table {
                width: 100% !important;
                border-collapse: collapse !important;
                margin: 15px 0 25px 0 !important;
                font-size: 10pt !important;
                page-break-inside: avoid !important;
                display: table !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            .recibo-table thead {
                background: #1e3a8a !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .recibo-table th {
                padding: 12px 8px !important;
                text-align: left !important;
                font-weight: 600 !important;
                text-transform: uppercase !important;
                font-size: 10pt !important;
                border: 1px solid #1a3173 !important;
            }
            
            .recibo-table td {
                padding: 10px 8px !important;
                border: 1px solid #ddd !important;
                vertical-align: top !important;
            }
            
            .text-right {
                text-align: right !important;
            }
            
            .text-center {
                text-align: center !important;
            }
            
            .extra-row {
                background: #f1f3f9 !important;
                font-weight: 600 !important;
            }
            
            .subtotal-row {
                background: #f8f9fa !important;
                border-top: 2px solid #dee2e6 !important;
                font-weight: 600 !important;
            }
            
            .total-row {
                background: #1e3a8a !important;
                color: white !important;
                font-size: 11pt !important;
                font-weight: bold !important;
            }
            
            /* TABLA DEDUCCIONES */
            .deducciones-table {
                width: 100% !important;
                border-collapse: collapse !important;
                margin: 15px 0 !important;
                font-size: 10pt !important;
            }
            
            .deducciones-table th {
                background: #f8f9fa !important;
                padding: 12px 8px !important;
                text-align: left !important;
                border-bottom: 2px solid #dee2e6 !important;
                color: #495057 !important;
            }
            
            .deducciones-table td {
                padding: 10px 8px !important;
                border-bottom: 1px solid #e0e0e0 !important;
            }
            
            .deducciones-table .total-deducciones td {
                font-weight: bold !important;
                background: #f8f9fa !important;
                padding: 15px 8px !important;
                border-top: 2px solid #dee2e6 !important;
            }
            
            /* TOTALES */
            .total-final {
                background: #f8f9fa !important;
                padding: 20px !important;
                border-radius: 8px !important;
                border: 2px solid #dee2e6 !important;
                margin: 25px 0 !important;
                page-break-inside: avoid !important;
            }
            
            .total-container {
                max-width: 500px !important;
                margin: 0 auto !important;
            }
            
            .total-item {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 12px 0 !important;
                border-bottom: 1px solid #dee2e6 !important;
            }
            
            .total-item.final {
                font-size: 13pt !important;
                font-weight: bold !important;
                color: #1e3a8a !important;
                padding-top: 15px !important;
                margin-top: 10px !important;
                border-top: 3px solid #1e3a8a !important;
                border-bottom: none !important;
            }
            
            .negativo {
                color: #e74c3c !important;
            }
            
            /* FIRMAS */
            .firmas-container {
                display: grid !important;
                grid-template-columns: repeat(3, 1fr) !important;
                gap: 30px !important;
                margin-top: 40px !important;
                text-align: center !important;
                page-break-inside: avoid !important;
            }
            
            .firma-item {
                padding: 15px !important;
            }
            
            .linea-firma {
                height: 1px !important;
                background: #333 !important;
                margin: 40px auto 10px !important;
                width: 80% !important;
            }
            
            .firma-nombre {
                font-weight: bold !important;
                margin: 10px 0 !important;
                color: #1e3a8a !important;
            }
            
            /* ESTILOS DE IMPRESIÓN ESPECÍFICOS */
            @media print {
                @page {
                    margin: 1.5cm !important;
                    size: letter !important;
                }
                
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    font-size: 11pt !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .recibo-profesional {
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                    page-break-inside: avoid !important;
                    page-break-after: avoid !important;
                }
                
                /* ASEGURAR QUE LOS COLORES SE IMPRIMAN */
                .recibo-table thead {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    background: #1e3a8a !important;
                    color: white !important;
                }
                
                .recibo-table .total-row {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    background: #1e3a8a !important;
                    color: white !important;
                }
                
                /* EVITAR CORTES EN MEDIO */
                table {
                    page-break-inside: avoid !important;
                }
                
                tr {
                    page-break-inside: avoid !important;
                    page-break-after: auto !important;
                }
                
                /* LOGO EN ESCALA DE GRISES */
                .recibo-logo {
                    filter: grayscale(100%) !important;
                    max-height: 60px !important;
                }
                
                /* ENCABEZADO Y PIE DE PÁGINA */
                @page {
                    @top-center {
                        content: "RECIBO DE PAGO TÉCNICO" !important;
                        font-size: 12pt !important;
                        color: #666 !important;
                    }
                    @bottom-center {
                        content: "Página " counter(page) " de " counter(pages) !important;
                        font-size: 9pt !important;
                        color: #999 !important;
                    }
                }
            }
        </style>
        `;
        
        // 5. CREAR VENTANA DE IMPRESIÓN CON ESTILOS INLINE
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        
        // Obtener datos para el título
        const tecnicoName = printClone.querySelector('.info-item span')?.textContent || 'Técnico';
        
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Recibo de Pago - ${tecnicoName}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${estilosCompletos}
        </head>
        <body>
            <div class="recibo-profesional">
                ${printClone.innerHTML}
            </div>
            <script>
                // CARGAR IMÁGENES ANTES DE IMPRIMIR
                window.onload = function() {
                    // Esperar a que todas las imágenes se carguen
                    const images = document.querySelectorAll('img');
                    let loadedImages = 0;
                    const totalImages = images.length;
                    
                    if (totalImages === 0) {
                        imprimirDespuesDeCarga();
                        return;
                    }
                    
                    images.forEach(img => {
                        if (img.complete) {
                            loadedImages++;
                        } else {
                            img.onload = function() {
                                loadedImages++;
                                if (loadedImages === totalImages) {
                                    imprimirDespuesDeCarga();
                                }
                            };
                            img.onerror = function() {
                                loadedImages++;
                                if (loadedImages === totalImages) {
                                    imprimirDespuesDeCarga();
                                }
                            };
                        }
                    });
                    
                    // En caso de que todas ya estén cargadas
                    if (loadedImages === totalImages) {
                        imprimirDespuesDeCarga();
                    }
                    
                    // Timeout de seguridad
                    setTimeout(imprimirDespuesDeCarga, 3000);
                };
                
                function imprimirDespuesDeCarga() {
                    // Pequeño delay para asegurar renderizado
                    setTimeout(function() {
                        window.print();
                        
                        // Cerrar después de imprimir
                        setTimeout(function() {
                            if (!window.closed) {
                                window.close();
                            }
                        }, 1000);
                    }, 500);
                }
                
                // Manejar botón Cancelar
                window.addEventListener('afterprint', function() {
                    setTimeout(function() {
                        window.close();
                    }, 500);
                });
            </script>
        </body>
        </html>
        `);
        
        printWindow.document.close();
        
    } catch (error) {
        console.error("Error en impresión:", error);
        // Fallback simple
        alert("Abriendo vista previa de impresión...");
        window.print();
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

// ======================
// TOTAL GENERAL NÓMINAS - VERSIÓN MEJORADA
// ======================

function initializeTotalNominasSection() {
    console.log("Inicializando sección Total General Nóminas mejorada...");
    
    // Configurar fechas por defecto (último mes)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    document.getElementById('total-desde').value = lastMonth.toISOString().split('T')[0];
    document.getElementById('total-hasta').value = today.toISOString().split('T')[0];
    
    // Agregar evento al formulario
    const form = document.getElementById('total-nominas-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            calcularTotalNominas();
        });
    }
    
    // Inicializar tabla de gastos de oficina
    initializeGastosOficina();
    
    // Cargar datos guardados
    loadGastosOficina();
    
    // Aplicar estilos mejorados
    agregarEstilosTotalNominas();
}

function initializeGastosOficina() {
    const container = document.getElementById('gastos-oficina-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="section-card" style="background: var(background-color); border: 1px solid var(--dark-border); border-radius: 12px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 25px;">
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
                <div>
                    <h3 style="margin: 0; color: var(--text-light); font-size: 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-building" style="color: var(--text-light);"></i>
                        Gastos de Oficina
                    </h3>
                    <p style="margin: 5px 0 0 0; color: var(--text-light); font-size: 14px;">Gastos administrativos y operativos</p>
                </div>
                <button onclick="agregarGastoOficina()" class="btn-agregar-gasto" style="padding: 10px 20px; border: none; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600;">
                    <i class="fas fa-plus-circle"></i> Agregar Gasto
                </button>
            </div>
            
            <div class="gastos-table-container" style="overflow-x: auto;">
                <table id="tabla-gastos-oficina" class="modern-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>Concepto</th>
                            <th>Descripción</th>
                            <th style="width: 120px;">Fecha</th>
                            <th style="width: 150px;">Monto</th>
                            <th style="width: 100px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="cuerpo-gastos-oficina">
                        <!-- Los gastos se cargarán aquí -->
                    </tbody>
                    <tfoot id="total-gastos-oficina">
                        <!-- Total de gastos -->
                    </tfoot>
                </table>
            </div>
            
            <div class="gastos-info" style="margin-top: 20px; padding: 15px; background: var(--dark-card); border-radius: 8px; border: 1px solid #bae6fd;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-info-circle" style="color: #0369a1;"></i>
                    <div>
                        <p style="margin: 0; color: #1ea1eeff; font-size: 14px;">
                            Los gastos de oficina se deducen del total general. Agrega conceptos como: 
                            <strong>renta, servicios, internet, papelería, mantenimiento, etc.</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadGastosOficina() {
    const gastos = JSON.parse(localStorage.getItem('gastos_oficina')) || [];
    const cuerpo = document.getElementById('cuerpo-gastos-oficina');
    const totalFooter = document.getElementById('total-gastos-oficina');
    
    if (!cuerpo || !totalFooter) return;
    
    if (gastos.length === 0) {
        cuerpo.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-receipt" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                    <p style="margin: 0;">No hay gastos registrados</p>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">Haz clic en "Agregar Gasto" para comenzar</p>
                </td>
            </tr>
        `;
        totalFooter.innerHTML = '';
        return;
    }
    
    // Mostrar gastos
    let html = '';
    let totalGastos = 0;
    
    gastos.forEach((gasto, index) => {
        totalGastos += parseFloat(gasto.monto) || 0;
        
        html += `
            <tr id="gasto-${index}" style="transition: background 0.2s;">
                <td style="text-align: center; font-weight: 600; color: var(--text-light)">${index + 1}</td>
                <td>
                    <div style="font-weight: 600; color: var(--text-light);">${gasto.concepto || 'Sin concepto'}</div>
                </td>
                <td>
                    <div style="color: var(--text-light);">${gasto.descripcion || 'Sin descripción'}</div>
                </td>
                <td>
                    <div style="color: var(--text-light);">${gasto.fecha || 'No especificada'}</div>
                </td>
                <td>
                    <div style="font-weight: 700; color: #dc2626; text-align: right;">
                        $${parseFloat(gasto.monto || 0).toFixed(2)}
                    </div>
                </td>
                <td>
                    <div class="action-buttons" style="display: flex; gap: 5px;">
                        <button onclick="editarGastoOficina(${index})" 
                                class="btn-edit" title="Editar" style="padding: 6px 10px; border: 1px solid #d1d5db; background: white; color: #3b82f6; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarGastoOficina(${index})" 
                                class="btn-danger" title="Eliminar" style="padding: 6px 10px; border: none; background: #dc2626; color: white; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    cuerpo.innerHTML = html;
    
    // Mostrar total
    totalFooter.innerHTML = `
        <tr style="background: var(background-color);">
            <td colspan="4" style="text-align: right; padding: 15px; font-weight: 600; color: var(--text-light);">
                TOTAL GASTOS OFICINA:
            </td>
            <td style="text-align: right; padding: 15px; font-weight: 700; color: var(--text-light); font-size: 16px;">
                $${totalGastos.toFixed(2)}
            </td>
            <td></td>
        </tr>
    `;
}

function agregarGastoOficina() {
    const modalId = 'modal-agregar-gasto';
    let modal = document.getElementById(modalId);
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-gasto';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
            overflow-y: auto;
        `;
        
        modal.innerHTML = `
            <div style="
                background: #1e293b; 
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                border-radius: 12px; 
                overflow: hidden; 
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
            ">
                <!-- Header fijo -->
                <div style="
                    background: linear-gradient(135deg, #1e3a8a, #3730a3); 
                    padding: 20px; 
                    color: white;
                    flex-shrink: 0;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-plus-circle"></i>
                            Agregar Gasto de Oficina
                        </h3>
                        <button onclick="cerrarModalGasto()" style="
                            background: rgba(255,255,255,0.1); 
                            border: none; 
                            color: white; 
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                            cursor: pointer; 
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: background 0.3s;
                        ">
                            ×
                        </button>
                    </div>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 13px;">
                        Registra un nuevo gasto administrativo u operativo
                    </p>
                </div>
                
                <!-- Contenido scrollable -->
                <div style="
                    padding: 20px;
                    overflow-y: auto;
                    flex: 1;
                    max-height: calc(90vh - 130px);
                ">
                    <form id="form-agregar-gasto" onsubmit="guardarGastoOficina(event)">
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <!-- Concepto -->
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e2e8f0; font-size: 14px;">
                                    <i class="fas fa-tag"></i> Concepto *
                                </label>
                                <input type="text" name="concepto" required 
                                       placeholder="Ej: Renta, Internet, Papelería..."
                                       style="
                                           width: 100%; 
                                           padding: 10px 12px; 
                                           background: #0f172a;
                                           border: 1px solid #334155; 
                                           border-radius: 8px; 
                                           font-size: 14px; 
                                           color: #e2e8f0;
                                           transition: all 0.3s;
                                           box-sizing: border-box;
                                       "
                                       onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.1)';"
                                       onblur="this.style.borderColor='#334155'; this.style.boxShadow='none';">
                                <p style="margin-top: 4px; font-size: 12px; color: #94a3b8;">
                                    Nombre descriptivo del gasto
                                </p>
                            </div>
                            
                            <!-- Descripción -->
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e2e8f0; font-size: 14px;">
                                    <i class="fas fa-align-left"></i> Descripción
                                </label>
                                <textarea name="descripcion" rows="3"
                                          placeholder="Descripción detallada del gasto..."
                                          style="
                                              width: 100%; 
                                              padding: 10px 12px; 
                                              background: #0f172a;
                                              border: 1px solid #334155; 
                                              border-radius: 8px; 
                                              font-size: 14px; 
                                              color: #e2e8f0;
                                              resize: vertical; 
                                              min-height: 80px;
                                              max-height: 120px;
                                              box-sizing: border-box;
                                          "
                                          onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.1)';"
                                          onblur="this.style.borderColor='#334155'; this.style.boxShadow='none';"></textarea>
                            </div>
                            
                            <!-- Fecha -->
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e2e8f0; font-size: 14px;">
                                    <i class="fas fa-calendar-alt"></i> Fecha
                                </label>
                                <input type="date" name="fecha" 
                                       value="${new Date().toISOString().split('T')[0]}"
                                       style="
                                           width: 100%; 
                                           padding: 10px 12px; 
                                           background: #0f172a;
                                           border: 1px solid #334155; 
                                           border-radius: 8px; 
                                           font-size: 14px; 
                                           color: #e2e8f0;
                                           box-sizing: border-box;
                                       "
                                       onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.1)';"
                                       onblur="this.style.borderColor='#334155'; this.style.boxShadow='none';">
                            </div>
                            
                            <!-- Monto -->
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e2e8f0; font-size: 14px;">
                                    <i class="fas fa-money-bill-wave"></i> Monto *
                                </label>
                                <div style="position: relative;">
                                    <span style="
                                        position: absolute; 
                                        left: 12px; 
                                        top: 50%; 
                                        transform: translateY(-50%); 
                                        color: #94a3b8; 
                                        font-weight: 600;
                                        z-index: 1;
                                    ">$</span>
                                    <input type="number" name="monto" required step="0.01" min="0"
                                           placeholder="0.00"
                                           style="
                                               width: 100%; 
                                               padding: 10px 12px 10px 30px; 
                                               background: #0f172a;
                                               border: 1px solid #334155; 
                                               border-radius: 8px; 
                                               font-size: 14px; 
                                               color: #e2e8f0;
                                               box-sizing: border-box;
                                           "
                                           onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.1)';"
                                           onblur="this.style.borderColor='#334155'; this.style.boxShadow='none';">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <!-- Footer fijo -->
                <div style="
                    padding: 15px 20px; 
                    background: rgba(15, 23, 42, 0.8);
                    border-top: 1px solid #334155;
                    flex-shrink: 0;
                ">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button type="button" onclick="cerrarModalGasto()" 
                                style="
                                    flex: 1; 
                                    padding: 10px; 
                                    border: 1px solid #475569; 
                                    background: transparent; 
                                    color: #94a3b8; 
                                    border-radius: 8px; 
                                    cursor: pointer; 
                                    font-weight: 600;
                                    font-size: 14px;
                                    transition: all 0.3s;
                                "
                                onmouseover="this.style.backgroundColor='rgba(71, 85, 105, 0.2)';"
                                onmouseout="this.style.backgroundColor='transparent';">
                            Cancelar
                        </button>
                        <button type="submit" form="form-agregar-gasto"
                                style="
                                    flex: 1; 
                                    padding: 10px; 
                                    border: none; 
                                    background: linear-gradient(135deg, #10b981, #059669); 
                                    color: white; 
                                    border-radius: 8px; 
                                    cursor: pointer; 
                                    font-weight: 600;
                                    font-size: 14px;
                                    transition: all 0.3s;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 8px;
                                "
                                onmouseover="this.style.opacity='0.9'; this.style.transform='translateY(-1px)';"
                                onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)';">
                            <i class="fas fa-save"></i> Guardar Gasto
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Agregar evento para cerrar al hacer clic fuera
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModalGasto();
            }
        });
        
        // Agregar evento para tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                cerrarModalGasto();
            }
        });
    }
    
    // Mostrar modal con animación
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.backdropFilter = 'blur(4px)';
    }, 10);
    
    // Enfocar el primer campo
    setTimeout(() => {
        const firstInput = modal.querySelector('input[name="concepto"]');
        if (firstInput) {
            firstInput.focus();
            firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

function cerrarModalGasto() {
    const modal = document.getElementById('modal-agregar-gasto');
    if (modal) modal.style.display = 'none';
}

function guardarGastoOficina(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const nuevoGasto = {
        concepto: formData.get('concepto').trim(),
        descripcion: formData.get('descripcion').trim(),
        fecha: formData.get('fecha'),
        monto: parseFloat(formData.get('monto')).toFixed(2),
        fecha_creacion: new Date().toISOString(),
        creado_por: currentUser ? currentUser.name : 'Sistema'
    };
    
    // Obtener gastos existentes
    const gastos = JSON.parse(localStorage.getItem('gastos_oficina')) || [];
    gastos.push(nuevoGasto);
    
    // Guardar
    localStorage.setItem('gastos_oficina', JSON.stringify(gastos));
    
    // Cerrar modal y recargar
    cerrarModalGasto();
    loadGastosOficina();
    
    // Recalcular totales si ya se había calculado
    if (document.getElementById('total-nominas-form').checkValidity()) {
        calcularTotalNominas();
    }
    
    // Mostrar notificación
    mostrarNotificacion(`Gasto "${nuevoGasto.concepto}" agregado correctamente`, 'success');
}

function editarGastoOficina(index) {
    const gastos = JSON.parse(localStorage.getItem('gastos_oficina')) || [];
    if (!gastos[index]) return;
    
    const gasto = gastos[index];
    
    // Crear modal de edición similar al de agregar
    const modalId = 'modal-editar-gasto';
    let modal = document.getElementById(modalId);
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-gasto';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
        `;
        
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 25px; color: white;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-edit"></i>
                        Editar Gasto de Oficina
                    </h3>
                    <button onclick="cerrarModalEditarGasto()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0;">
                        ×
                    </button>
                </div>
                <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">Modifica los datos del gasto seleccionado</p>
            </div>
            
            <div style="padding: 30px;">
                <form id="form-editar-gasto" onsubmit="actualizarGastoOficina(event, ${index})">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                                <i class="fas fa-tag"></i> Concepto *
                            </label>
                            <input type="text" name="concepto" required 
                                   value="${gasto.concepto}"
                                   style="width: 100%; padding: 12px 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;">
                        </div>
                        
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                                <i class="fas fa-align-left"></i> Descripción
                            </label>
                            <textarea name="descripcion" rows="3"
                                      style="width: 100%; padding: 12px 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px; resize: vertical;">${gasto.descripcion || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                                <i class="fas fa-calendar-alt"></i> Fecha
                            </label>
                            <input type="date" name="fecha" 
                                   value="${gasto.fecha || new Date().toISOString().split('T')[0]}"
                                   style="width: 100%; padding: 12px 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;">
                        </div>
                        
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                                <i class="fas fa-money-bill-wave"></i> Monto *
                            </label>
                            <div style="position: relative;">
                                <span style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #6b7280; font-weight: 600;">$</span>
                                <input type="number" name="monto" required step="0.01" min="0"
                                       value="${gasto.monto}"
                                       style="width: 100%; padding: 12px 15px 12px 35px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px;">
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <button type="button" onclick="cerrarModalEditarGasto()" 
                                style="flex: 1; padding: 12px; border: 1px solid #d1d5db; background: white; color: #4b5563; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Cancelar
                        </button>
                        <button type="submit" 
                                style="flex: 1; padding: 12px; border: none; background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-save"></i> Actualizar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function cerrarModalEditarGasto() {
    const modal = document.getElementById('modal-editar-gasto');
    if (modal) modal.style.display = 'none';
}

function actualizarGastoOficina(e, index) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const gastos = JSON.parse(localStorage.getItem('gastos_oficina')) || [];
    
    if (gastos[index]) {
        gastos[index] = {
            ...gastos[index],
            concepto: formData.get('concepto').trim(),
            descripcion: formData.get('descripcion').trim(),
            fecha: formData.get('fecha'),
            monto: parseFloat(formData.get('monto')).toFixed(2),
            fecha_actualizacion: new Date().toISOString(),
            actualizado_por: currentUser ? currentUser.name : 'Sistema'
        };
        
        localStorage.setItem('gastos_oficina', JSON.stringify(gastos));
        cerrarModalEditarGasto();
        loadGastosOficina();
        
        // Recalcular totales si ya se había calculado
        if (document.getElementById('total-nominas-form').checkValidity()) {
            calcularTotalNominas();
        }
        
        mostrarNotificacion('Gasto actualizado correctamente', 'success');
    }
}

function eliminarGastoOficina(index) {
    if (!confirm('¿Está seguro de eliminar este gasto de oficina?')) {
        return;
    }
    
    const gastos = JSON.parse(localStorage.getItem('gastos_oficina')) || [];
    
    if (gastos[index]) {
        const concepto = gastos[index].concepto;
        gastos.splice(index, 1);
        
        localStorage.setItem('gastos_oficina', JSON.stringify(gastos));
        loadGastosOficina();
        
        // Recalcular totales si ya se había calculado
        if (document.getElementById('total-nominas-form').checkValidity()) {
            calcularTotalNominas();
        }
        
        mostrarNotificacion(`Gasto "${concepto}" eliminado correctamente`, 'success');
    }
}

function calcularTotalNominas() {
    try {
        if (!currentUser) {
            alert("Sesión expirada. Inicia sesión de nuevo.");
            return;
        }
        
        const form = document.getElementById('total-nominas-form');
        const formData = new FormData(form);
        const desde = formData.get('total-desde');
        const hasta = formData.get('total-hasta');
        
        console.log("Calculando total general del", desde, "al", hasta);
        
        // Filtrar por fechas
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
        
        console.log("Folios filtrados:", filtered.length);
        
        // Calcular totales por técnico
        const totalesPorTecnico = {};
        let totalGeneralBruto = 0;
        let totalVentanas = 0;
        let totalRadiales = 0;
        let totalFolios = filtered.length;
        
        filtered.forEach(folio => {
            const tecnico = folio.tecnico || 'Sin técnico';
            if (!totalesPorTecnico[tecnico]) {
                totalesPorTecnico[tecnico] = {
                    totalBruto: 0,
                    ventanas: 0,
                    radiales: 0,
                    folios: 0,
                    costosDetalle: []
                };
            }
            
            // Calcular costo del folio
            const instalacionesAnteriores = filtered.filter(f2 => 
                f2.tecnico === tecnico && 
                compararFechas(folio.fecha, f2.fecha)
            );
            
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
            
            totalesPorTecnico[tecnico].totalBruto += costo;
            totalesPorTecnico[tecnico].ventanas += parseInt(folio.ventanas) || 0;
            totalesPorTecnico[tecnico].radiales += parseInt(folio.radiales) || 0;
            totalesPorTecnico[tecnico].folios += 1;
            totalesPorTecnico[tecnico].costosDetalle.push({
                folio: folio.folio,
                tipo: folio.tipo,
                instalacion: folio.instalacion,
                costo: costo
            });
            
            totalGeneralBruto += costo;
            totalVentanas += parseInt(folio.ventanas) || 0;
            totalRadiales += parseInt(folio.radiales) || 0;
        });
        
        // Calcular extras
        const costoVentanas = totalVentanas * 50;
        const costoRadiales = totalRadiales * 100;
        totalGeneralBruto += costoVentanas + costoRadiales;
        
        // Obtener gastos de oficina
        const gastosOficina = JSON.parse(localStorage.getItem('gastos_oficina')) || [];
        const totalGastosOficina = gastosOficina.reduce((sum, gasto) => 
            sum + parseFloat(gasto.monto || 0), 0);
        
        // Calcular total neto
        const totalNeto = totalGeneralBruto + totalGastosOficina;
        
        // Generar reporte HTML mejorado
        generarReporteTotalNominas({
            desde: desde,
            hasta: hasta,
            totalesPorTecnico: totalesPorTecnico,
            totalGeneralBruto: totalGeneralBruto,
            totalVentanas: totalVentanas,
            totalRadiales: totalRadiales,
            costoVentanas: costoVentanas,
            costoRadiales: costoRadiales,
            totalFolios: totalFolios,
            totalGastosOficina: totalGastosOficina,
            totalNeto: totalNeto,
            gastosOficina: gastosOficina
        });
        
    } catch (error) {
        console.error("Error calculando total general:", error);
        alert("Error al calcular el total general: " + error.message);
    }
}

function generarReporteTotalNominas(datos) {
    const container = document.getElementById('total-nominas-results');
    if (!container) return;
    
    const { 
        desde, hasta, totalesPorTecnico, totalGeneralBruto, 
        totalVentanas, totalRadiales, costoVentanas, costoRadiales,
        totalFolios, totalGastosOficina, totalNeto, gastosOficina 
    } = datos;
    
    // Formatear fechas
    const fechaDesdeFormateada = desde ? new Date(desde).toLocaleDateString('es-MX') : 'N/A';
    const fechaHastaFormateada = hasta ? new Date(hasta).toLocaleDateString('es-MX') : 'N/A';
    
    let html = `
        <div class="reporte-total-container" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Encabezado del reporte -->
            <div style="background: linear-gradient(135deg, #1e3a8a, #3730a3); padding: 30px; color: white;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h2 style="margin: 0; font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 15px;">
                            <i class="fas fa-chart-pie"></i>
                            TOTAL GENERAL DE NÓMINAS
                        </h2>
                        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">
                            Período: ${fechaDesdeFormateada} al ${fechaHastaFormateada}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 32px; font-weight: 700; margin-bottom: 5px;">$${totalNeto.toFixed(2)}</div>
                        <div style="font-size: 14px; opacity: 0.9;">NETO A PAGAR</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px;">
                    <div class="stat-card" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 12px; opacity: 0.9;">TOTAL BRUTO</div>
                        <div style="font-size: 20px; font-weight: 600;">$${totalGeneralBruto.toFixed(2)}</div>
                    </div>
                    <div class="stat-card" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 12px; opacity: 0.9;">FOLIOS</div>
                        <div style="font-size: 20px; font-weight: 600;">${totalFolios}</div>
                    </div>
                    <div class="stat-card" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 12px; opacity: 0.9;">TÉCNICOS</div>
                        <div style="font-size: 20px; font-weight: 600;">${Object.keys(totalesPorTecnico).length}</div>
                    </div>
                    <div class="stat-card" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 12px; opacity: 0.9;">GASTOS OFICINA</div>
                        <div style="font-size: 20px; font-weight: 600; color: #cacacaff;">$${totalGastosOficina.toFixed(2)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Contenido del reporte -->
            <div style="padding: 30px;">
                <!-- Botones de acción -->
                <div style="display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
                    <button onclick="imprimirReporteTotal()" class="btn-imprimir" 
                            style="padding: 12px 25px; border: none; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 600;">
                        <i class="fas fa-print"></i> Imprimir Reporte
                    </button>
                    <button onclick="exportarReporteTotalExcel(${JSON.stringify(datos).replace(/"/g, '&quot;')})" 
                            style="padding: 12px 25px; border: 1px solid #10b981; background: white; color: #10b981; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 600;">
                        <i class="fas fa-file-excel"></i> Exportar a Excel
                    </button>
                    <button onclick="mostrarDetalleCalculo(${JSON.stringify(datos).replace(/"/g, '&quot;')})" 
                            style="padding: 12px 25px; border: 1px solid #f59e0b; background: white; color: #f59e0b; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-weight: 600;">
                        <i class="fas fa-calculator"></i> Ver Detalle de Cálculo
                    </button>
                </div>
                
                <!-- Tabla de totales por técnico -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: var(--text-light); margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-users"></i>
                        Totales por Técnico
                    </h3>
                    
                    <div style="overflow-x: auto;">
                        <table class="modern-table">
                            <thead>
                                <tr>
                                    <th style="width: 50px;">#</th>
                                    <th>Técnico</th>
                                    <th style="width: 100px;">Folios</th>
                                    <th style="width: 120px;">Ventanas</th>
                                    <th style="width: 120px;">Radiales</th>
                                    <th style="width: 150px;">Total Bruto</th>
                                    <th style="width: 100px;">%</th>
                                </tr>
                            </thead>
                            <tbody>
    `;
    
    // Ordenar técnicos por total (mayor a menor)
    const tecnicosOrdenados = Object.entries(totalesPorTecnico)
        .sort(([, a], [, b]) => b.totalBruto - a.totalBruto);
    
    tecnicosOrdenados.forEach(([tecnico, datos], index) => {
        const porcentaje = totalGeneralBruto > 0 ? 
            ((datos.totalBruto / totalGeneralBruto) * 100).toFixed(1) : 0;
        
        html += `
            <tr>
                <td style="text-align: center; font-weight: 600;">${index + 1}</td>
                <td>
                    <div style="font-weight: 600; color: #1f2937;">${tecnico}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 3px;">
                        Promedio: $${(datos.totalBruto / datos.folios || 0).toFixed(2)} por folio
                    </div>
                </td>
                <td style="text-align: center; font-weight: 600;">${datos.folios}</td>
                <td style="text-align: center; color: #f59e0b;">${datos.ventanas}</td>
                <td style="text-align: center; color: #8b5cf6;">${datos.radiales}</td>
                <td style="text-align: right; font-weight: 700; color: #059669;">
                    $${datos.totalBruto.toFixed(2)}
                </td>
                <td style="text-align: center;">
                    <div style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                        ${porcentaje}%
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                            </tbody>
                            <tfoot style="background: #f8fafc;">
                                <tr>
                                    <td colspan="2" style="text-align: right; padding: 15px; font-weight: 600;">TOTALES:</td>
                                    <td style="text-align: center; padding: 15px; font-weight: 700;">${totalFolios}</td>
                                    <td style="text-align: center; padding: 15px; font-weight: 700; color: #f59e0b;">${totalVentanas}</td>
                                    <td style="text-align: center; padding: 15px; font-weight: 700; color: #8b5cf6;">${totalRadiales}</td>
                                    <td style="text-align: right; padding: 15px; font-weight: 700; color: #059669; font-size: 18px;">
                                        $${totalGeneralBruto.toFixed(2)}
                                    </td>
                                    <td style="text-align: center; padding: 15px; font-weight: 700;">100%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                
                <!-- Resumen de cálculo -->
                <div style="background: #f0f9ff; border-radius: 10px; padding: 25px; margin-bottom: 30px; border: 1px solid #bae6fd;">
                    <h3 style="color: #0369a1; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-calculator"></i>
                        Resumen del Cálculo
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <div>
                            <h4 style="color: var(--text-light); margin: 0 0 15px 0; font-size: 16px;">Instalaciones</h4>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #515152ff;">
                                    <span>Total por instalaciones:</span>
                                    <span style="font-weight: 600;">$${(totalGeneralBruto - costoVentanas - costoRadiales).toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #515152ff;">
                                    <span>Ventanas (${totalVentanas} x $50):</span>
                                    <span style="font-weight: 600; color: #f59e0b;">$${costoVentanas.toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #515152ff;">
                                    <span>Radiales (${totalRadiales} x $100):</span>
                                    <span style="font-weight: 600; color: #8b5cf6;">$${costoRadiales.toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #515152ff;">
                                    <span style="font-weight: 700;">TOTAL BRUTO:</span>
                                    <span style="font-weight: 700; color: #059669;">$${totalGeneralBruto.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Otros Gastos</h4>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #515152ff;">
                                    <span>Gastos de oficina:</span>
                                    <span style="font-weight: 600; color: #393939ff;">$${totalGastosOficina.toFixed(2)}</span>
                                </div>
                                ${gastosOficina.length > 0 ? `
                                <div style="margin-top: 10px;">
                                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Desglose:</div>
                                    ${gastosOficina.slice(0, 3).map(gasto => `
                                        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #4b5563; padding: 4px 0;">
                                            <span>${gasto.concepto}:</span>
                                            <span>$${parseFloat(gasto.monto).toFixed(2)}</span>
                                        </div>
                                    `).join('')}
                                    ${gastosOficina.length > 3 ? `
                                        <div style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 5px;">
                                            +${gastosOficina.length - 3} gastos más
                                        </div>
                                    ` : ''}
                                </div>
                                ` : ''}
                                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #515152ff;">
                                    <span style="font-weight: 700;">TOTAL NETO:</span>
                                    <span style="font-weight: 700; color: #1e3a8a; font-size: 18px;">$${totalNeto.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Información adicional -->
                <div style="display: flex; gap: 20px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                            <i class="fas fa-calendar-check" style="color: #10b981;"></i>
                            <span>Período analizado: ${fechaDesdeFormateada} - ${fechaHastaFormateada}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-user" style="color: #3b82f6;"></i>
                            <span>Reporte generado por: ${currentUser ? currentUser.name : 'Sistema'}</span>
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                            <i class="fas fa-clock" style="color: #f59e0b;"></i>
                            <span>Fecha de generación: ${new Date().toLocaleDateString('es-MX')}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-database" style="color: #8b5cf6;"></i>
                            <span>Folios procesados: ${totalFolios}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Aplicar estilos adicionales
    agregarEstilosReporteTotal();
}

// ======================
// FUNCIÓN CORREGIDA PARA IMPRIMIR
// ======================

function imprimirReporteTotal() {
    try {
        console.log("🖨️ Preparando impresión del reporte total...");
        
        const reporteDiv = document.querySelector('.reporte-total-container');
        if (!reporteDiv) {
            alert('No hay reporte para imprimir');
            return;
        }
        
        // 1. Clonar el contenido completo
        const printClone = reporteDiv.cloneNode(true);
        
        // 2. Remover solo botones y elementos interactivos, NO todo el contenido
        const elementosNoImprimir = printClone.querySelectorAll(
            'button, .btn-imprimir, [onclick], .action-buttons'
        );
        
        elementosNoImprimir.forEach(el => {
            // Solo remover si es un botón, no toda la celda o fila
            if (el.tagName === 'BUTTON' || el.classList.contains('btn-imprimir')) {
                el.remove();
            }
        });
        
        // 3. Asegurar que las tablas sean visibles
        const tables = printClone.querySelectorAll('table');
        tables.forEach(table => {
            table.style.display = 'table';
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
        });
        
        // 4. Crear ventana de impresión
        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        
        // 5. Estilos optimizados para impresión
        const estilosImpresion = `
        <style>
            /* ESTILOS BASE PARA IMPRESIÓN */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                font-size: 11pt;
                line-height: 1.3;
                color: #000;
                background: white;
                margin: 0;
                padding: 20px;
                width: 100%;
            }
            
            /* CONTENEDOR PRINCIPAL */
            .reporte-total-container {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                background: white !important;
                border: none !important;
                box-shadow: none !important;
                page-break-inside: avoid !important;
            }
            
            /* ENCABEZADO */
            .reporte-total-container > div:first-child {
                background: #1e3a8a !important;
                color: white !important;
                padding: 25px !important;
                margin-bottom: 20px !important;
                page-break-after: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            h2 {
                color: white !important;
                font-size: 20pt !important;
                margin-bottom: 10px !important;
            }
            
            /* TABLAS - IMPORTANTE: ASEGURAR VISIBILIDAD */
            table {
                width: 100% !important;
                border-collapse: collapse !important;
                margin: 15px 0 25px 0 !important;
                font-size: 10pt !important;
                page-break-inside: avoid !important;
                display: table !important;
                visibility: visible !important;
            }
            
            table th {
                background: #f3f4f6 !important;
                color: #000 !important;
                padding: 10px 8px !important;
                border: 1px solid #d1d5db !important;
                font-weight: 600 !important;
                text-align: left !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            table td {
                padding: 8px !important;
                border: 1px solid #e5e7eb !important;
                vertical-align: top !important;
            }
            
            table tfoot {
                background: #f8fafc !important;
                font-weight: bold !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            /* RESALTAR TOTALES */
            .reporte-total-container td:last-child,
            .reporte-total-container tfoot td {
                font-weight: 700 !important;
            }
            
            /* PANEL DE RESUMEN */
            .reporte-total-container > div:nth-child(3) {
                background: #f8fafc !important;
                border: 1px solid #e5e7eb !important;
                padding: 20px !important;
                margin: 20px 0 !important;
                page-break-inside: avoid !important;
            }
            
            /* OCULTAR ELEMENTOS NO NECESARIOS */
            @media print {
                @page {
                    size: landscape;
                    margin: 1.5cm;
                }
                
                body {
                    padding: 0 !important;
                    margin: 0 !important;
                    font-size: 9pt !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* ASEGURAR QUE LOS COLORES SE IMPRIMAN */
                .reporte-total-container > div:first-child {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    background: #1e3a8a !important;
                    color: white !important;
                }
                
                table th {
                    -webkit-print-color-adjust: exact !important;
                    background: #f3f4f6 !important;
                }
                
                table tfoot {
                    -webkit-print-color-adjust: exact !important;
                    background: #f8fafc !important;
                }
                
                /* EVITAR CORTES EN MEDIO */
                table {
                    page-break-inside: avoid !important;
                }
                
                tr {
                    page-break-inside: avoid !important;
                }
                
                /* HEADER Y FOOTER DE PÁGINA */
                @page {
                    @top-center {
                        content: "REPORTE TOTAL GENERAL DE NÓMINAS";
                        font-size: 12pt;
                        color: #666;
                    }
                    @bottom-center {
                        content: "Página " counter(page) " de " counter(pages);
                        font-size: 9pt;
                        color: #999;
                    }
                }
                
                /* OCULTAR ELEMENTOS INTERACTIVOS */
                button, .no-print {
                    display: none !important;
                }
            }
            
            /* PARA VISTA PREVIA EN PANTALLA */
            @media screen {
                .reporte-total-container {
                    max-width: 1200px;
                }
            }
        </style>
        `;
        
        // 6. Crear documento HTML completo
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte Total General de Nóminas</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${estilosImpresion}
        </head>
        <body>
            ${printClone.outerHTML}
            <script>
                // FORZAR CARGA DE ESTILOS ANTES DE IMPRIMIR
                window.onload = function() {
                    // Pequeño delay para asegurar renderizado
                    setTimeout(function() {
                        // Configurar orientación landscape
                        const style = document.createElement('style');
                        style.textContent = '@page { size: landscape; }';
                        document.head.appendChild(style);
                        
                        // Imprimir
                        window.print();
                        
                        // Cerrar después de imprimir
                        window.onafterprint = function() {
                            setTimeout(function() {
                                window.close();
                            }, 500);
                        };
                    }, 1000);
                };
                
                // Manejar cancelación
                window.onbeforeunload = function() {
                    return "¿Estás seguro de que quieres cancelar la impresión?";
                };
            </script>
        </body>
        </html>
        `);
        
        printWindow.document.close();
        
        console.log("✅ Ventana de impresión abierta");
        
    } catch (error) {
        console.error("❌ Error en impresión:", error);
        
        // FALLBACK: Imprimir directamente
        alert("Abriendo vista previa de impresión...");
        window.print();
    }
}

// ======================
// FUNCIONES ADICIONALES
// ======================

function exportarReporteTotalExcel(datos) {
    try {
        // Crear contenido CSV
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        
        // Encabezados
        csvContent += "REPORTE TOTAL GENERAL DE NÓMINAS\n";
        csvContent += `Período: ${datos.desde} al ${datos.hasta}\n`;
        csvContent += `Fecha generación: ${new Date().toLocaleDateString('es-MX')}\n`;
        csvContent += `Generado por: ${currentUser ? currentUser.name : 'Sistema'}\n\n`;
        
        // Totales por técnico
        csvContent += "TOTALES POR TÉCNICO\n";
        csvContent += "Técnico,Folios,Ventanas,Radiales,Total Bruto,%\n";
        
        Object.entries(datos.totalesPorTecnico).forEach(([tecnico, info]) => {
            const porcentaje = datos.totalGeneralBruto > 0 ? 
                ((info.totalBruto / datos.totalGeneralBruto) * 100).toFixed(1) : 0;
            
            csvContent += `"${tecnico}",${info.folios},${info.ventanas},${info.radiales},${info.totalBruto.toFixed(2)},${porcentaje}%\n`;
        });
        
        csvContent += `"TOTALES",${datos.totalFolios},${datos.totalVentanas},${datos.totalRadiales},${datos.totalGeneralBruto.toFixed(2)},100%\n\n`;
        
        // Resumen
        csvContent += "RESUMEN DEL CÁLCULO\n";
        csvContent += "Concepto,Monto\n";
        csvContent += `Total por instalaciones,${(datos.totalGeneralBruto - datos.costoVentanas - datos.costoRadiales).toFixed(2)}\n`;
        csvContent += `Ventanas (${datos.totalVentanas} x $50),${datos.costoVentanas.toFixed(2)}\n`;
        csvContent += `Radiales (${datos.totalRadiales} x $100),${datos.costoRadiales.toFixed(2)}\n`;
        csvContent += `TOTAL BRUTO,${datos.totalGeneralBruto.toFixed(2)}\n`;
        csvContent += `Gastos de oficina,${datos.totalGastosOficina.toFixed(2)}\n`;
        csvContent += `TOTAL NETO,${datos.totalNeto.toFixed(2)}\n`;
        
        // Descargar
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `reporte_total_${datos.desde}_${datos.hasta}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        mostrarNotificacion('Reporte exportado a Excel', 'success');
        
    } catch (error) {
        console.error('Error exportando reporte:', error);
        mostrarNotificacion('Error al exportar', 'error');
    }
}

function mostrarDetalleCalculo(datos) {
    // Implementar modal con detalle del cálculo
    alert('Función de detalle de cálculo en desarrollo');
}

function agregarEstilosTotalNominas() {
    const estilos = `
    <style>
        /* Mejoras para la sección Total Nominas */
        #total-nominas .form-container {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            margin-bottom: 25px;
        }
        
        #total-nominas .section-header {
            background: linear-gradient(135deg, var(--dark-card);, var(--dark-card););
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            color: vas(--text);
        }
        
        #total-nominas .section-header h2 {
            margin: 0;
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        #total-nominas .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        #total-nominas .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--text);
        }
        
        #total-nominas input[type="date"],
        #total-nominas input[type="number"] {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #334155;;
            border-radius: 8px;
            font-size: 15px;
            transition: all 0.3s;
        }
        
        #total-nominas input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        #total-nominas .form-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        #total-nominas .btn-primary {
            padding: 12px 30px;
            border: none;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        #total-nominas .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
    </style>
    `;
    
    if (!document.getElementById('estilos-total-nominas')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'estilos-total-nominas';
        styleElement.innerHTML = estilos;
        document.head.appendChild(styleElement);
    }
}

function agregarEstilosReporteTotal() {
    const estilos = `
    <style>
        /* Estilos específicos para el reporte */
        .stat-card {
            transition: transform 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .modern-table {
            border: 1px solid #334155;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .modern-table thead {
            background: linear-gradient(135deg, #1e293b, #1e293b);
        }
        
        .modern-table tbody tr:nth-child(even) {
            background: #1e293b;
        }
        
        .modern-table tbody tr:hover {
            background: #1e293b;
        }
    </style>
    `;
    
    const tempStyle = document.createElement('style');
    tempStyle.innerHTML = estilos;
    document.head.appendChild(tempStyle);
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
    
    try {
        // Verificar que SheetJS esté cargado
        if (typeof XLSX === 'undefined') {
            alert('Error: La biblioteca SheetJS no está cargada. Usando CSV en su lugar.');
            exportToCSV(data, filename.replace('.xlsx', '.csv'));
            return;
        }
        
        // Crear hoja de trabajo
        const worksheet = XLSX.utils.json_to_sheet(data);
        
        // Ajustar el ancho de las columnas automáticamente
        const colWidths = [];
        const headers = Object.keys(data[0]);
        
        headers.forEach((header, index) => {
            let maxLength = header.length;
            
            data.forEach(row => {
                const cellValue = String(row[header] || '');
                if (cellValue.length > maxLength) {
                    maxLength = cellValue.length;
                }
            });
            
            // Ancho mínimo de 10, máximo de 50
            colWidths.push({ wch: Math.min(Math.max(maxLength + 2, 10), 50) });
        });
        
        worksheet['!cols'] = colWidths;
        
        // Crear libro de trabajo
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, type === 'ffth' ? 'FFTH' : 'COBRE');
        
        // Generar archivo XLSX
        XLSX.writeFile(workbook, filename);
        
        alert(`✅ Archivo ${filename} exportado exitosamente`);
        
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        alert('❌ Error al exportar. Intenta usar CSV en su lugar.');
        
        // Fallback a CSV
        exportToCSV(data, filename.replace('.xlsx', '.csv'));
    }
}

// Función de fallback para CSV
function exportToCSV(data, filename) {
    const headers = Object.keys(data[0]);
    
    // Crear encabezados CSV
    let csvContent = headers.map(h => {
        if (h.includes(',') || h.includes('"')) {
            return '"' + h.replace(/"/g, '""') + '"';
        }
        return h;
    }).join(',') + '\n';
    
    // Agregar filas de datos
    data.forEach(row => {
        const rowData = headers.map(h => {
            let value = row[h];
            
            if (value === null || value === undefined) {
                value = '';
            } else {
                value = String(value);
            }
            
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return '"' + value.replace(/"/g, '""') + '"';
            }
            
            return value;
        }).join(',');
        
        csvContent += rowData + '\n';
    });
    
    // BOM para UTF-8
    const BOM = '\uFEFF';
    csvContent = BOM + csvContent;
    
    // Descargar archivo
    const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Función para guardar como PDF (opcional)
function guardarReciboPDF() {
    alert("Función PDF en desarrollo. Por ahora, usa la opción 'Imprimir' y selecciona 'Guardar como PDF' en el diálogo de impresión.");
    
    // Para implementar PDF completo necesitarías una librería como jsPDF
    // Esta es una implementación básica:
    /*
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Aquí agregarías el contenido del recibo al PDF
    doc.text("RECIBO DE PAGO", 20, 20);
    // ... más contenido
    
    doc.save(`Recibo_${currentTecnicoNomina}_${Date.now()}.pdf`);
    */
}

// ======================
// IMPRIMIR RECIBO SUPERVISOR (FORMATO COMPLETO)
// ======================
function printSupervisor() {
    try {
        console.log("Preparando impresión supervisor...");
        
        const printContent = document.getElementById('recibo-supervisor-impresion');
        if (!printContent) {
            alert('No hay recibo de supervisor para imprimir.');
            return;
        }
        
        // Incrementar número de recibo supervisor
        incrementarNumeroReciboSupervisor();
        
        // Clonar el contenido
        const printClone = printContent.cloneNode(true);
        
        // 1. LIMPIAR SOLO BOTONES Y ELEMENTOS DE EDICIÓN
        const elementosNoImprimir = printClone.querySelectorAll(
            '.no-print, .btn-print, .btn-agregar, .btn-actualizar, ' +
            '.btn-guardar, .btn-eliminar-small, .receipt-container, ' +
            '[onclick], button'
        );
        
        elementosNoImprimir.forEach(el => {
            if (!el.classList.contains('recibo-table') && 
                !el.classList.contains('deducciones-table') &&
                !el.closest('table')) {
                el.remove();
            }
        });
        
        // 2. REMOVER ATRIBUTOS DE EDICIÓN PERO MANTENER EL CONTENIDO
        printClone.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.removeAttribute('contenteditable');
            el.classList.remove('editable');
            el.classList.add('print-only');
        });
        
        // 3. Asegurar que las tablas sean visibles
        const tables = printClone.querySelectorAll('table');
        tables.forEach(table => {
            table.style.display = 'table';
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
        });
        
        // 4. ESTILOS ESPECÍFICOS PARA SUPERVISOR
        const estilosSupervisor = `
        <style>
            /* ESTILOS BASE (IGUAL QUE TÉCNICO) */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', 'Helvetica', sans-serif;
                font-size: 12pt;
                line-height: 1.4;
                color: #000;
                background: white;
                margin: 0;
                padding: 20px;
                width: 100%;
            }
            
            .recibo-profesional {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 25px;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .recibo-profesional.supervisor {
                border: 2px solid #2c3e50;
            }
            
            /* ENCABEZADO SUPERVISOR */
            .recibo-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 3px solid #2c3e50;
                padding-bottom: 20px;
                margin-bottom: 25px;
            }
            
            .recibo-titulo h1 {
                color: #2c3e50 !important;
            }
            
            /* TABLAS SUPERVISOR */
            .supervisor-table thead {
                background: #2c3e50 !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .supervisor-table .total-row {
                background: #2c3e50 !important;
                color: white !important;
            }
            
            /* ESTILOS DE IMPRESIÓN */
            @media print {
                @page {
                    margin: 1.5cm !important;
                    size: letter !important;
                }
                
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    font-size: 11pt !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                .recibo-profesional {
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                
                /* COLORES SUPERVISOR */
                .supervisor-table thead {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    background: #2c3e50 !important;
                    color: white !important;
                }
                
                .supervisor-table .total-row {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    background: #2c3e50 !important;
                    color: white !important;
                }
                
                /* ENCABEZADO IMPRESIÓN SUPERVISOR */
                @page {
                    @top-center {
                        content: "RECIBO DE PAGO SUPERVISOR" !important;
                        font-size: 12pt !important;
                        color: #666 !important;
                    }
                    @bottom-center {
                        content: "Página " counter(page) " de " counter(pages) !important;
                        font-size: 9pt !important;
                        color: #999 !important;
                    }
                }
            }
        </style>
        `;
        
        // 5. COPIAR ESTILOS BASE DEL TÉCNICO
        const estilosBase = `
        <style>
            /* ESTILOS BASE COMPARTIDOS */
            .logo-container { flex: 0 0 150px; }
            .recibo-logo { max-width: 150px; max-height: 70px; object-fit: contain; }
            .recibo-titulo { flex: 1; text-align: center; }
            .recibo-titulo h1 { color: #2c3e50; font-size: 22pt; margin: 0 0 5px 0; text-transform: uppercase; }
            .recibo-titulo .subtitulo { color: #666; font-size: 11pt; margin: 0; }
            .recibo-info { flex: 0 0 150px; text-align: right; font-size: 10pt; }
            .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; margin-bottom: 25px; }
            .info-item { display: flex; flex-direction: column; }
            .info-item strong { color: #495057; font-size: 10pt; margin-bottom: 5px; }
            .info-item span { color: #212529; font-size: 12pt; font-weight: 600; }
            
            /* TABLAS - IMPORTANTE */
            table.recibo-table,
            table.deducciones-table,
            table.supervisor-table {
                width: 100% !important;
                border-collapse: collapse !important;
                margin: 15px 0 25px 0 !important;
                font-size: 10pt !important;
                display: table !important;
                visibility: visible !important;
                opacity: 1 !important;
                page-break-inside: avoid !important;
            }
            
            .recibo-table th, 
            .deducciones-table th,
            .supervisor-table th { 
                padding: 12px 8px !important;
                text-align: left !important;
                font-weight: 600 !important;
                text-transform: uppercase !important;
                font-size: 10pt !important;
            }
            
            .recibo-table td, 
            .deducciones-table td,
            .supervisor-table td { 
                padding: 10px 8px !important;
                border: 1px solid #ddd !important;
                vertical-align: top !important;
            }
            
            .text-right { text-align: right !important; }
            .subtotal-row { background: #f8f9fa; border-top: 2px solid #dee2e6; font-weight: 600; }
            .total-row { background: #2c3e50 !important; color: white !important; font-size: 11pt; font-weight: bold; }
            
            .deducciones-table th { background: #f8f9fa; border-bottom: 2px solid #dee2e6; color: #495057; }
            .deducciones-table td { border-bottom: 1px solid #e0e0e0; }
            .deducciones-table .total-deducciones td { font-weight: bold; background: #f8f9fa; padding: 15px 8px; border-top: 2px solid #dee2e6; }
            
            .total-final { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px solid #dee2e6; margin: 25px 0; }
            .total-container { max-width: 500px; margin: 0 auto; }
            .total-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #dee2e6; }
            .total-item.final { font-size: 13pt; font-weight: bold; color: #2c3e50; padding-top: 15px; margin-top: 10px; border-top: 3px solid #2c3e50; border-bottom: none; }
            .negativo { color: #e74c3c !important; }
            
            .firmas-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 40px; text-align: center; }
            .supervisor-firmas { grid-template-columns: repeat(2, 1fr) !important; }
            .firma-item { padding: 15px; }
            .linea-firma { height: 1px; background: #333; margin: 40px auto 10px; width: 80%; }
            .firma-nombre { font-weight: bold; margin: 10px 0; color: #2c3e50; }
            
            @media print {
                @page { margin: 1.5cm; size: letter; }
                body { margin: 0 !important; padding: 0 !important; font-size: 11pt !important; }
                .recibo-profesional { max-width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
                .recibo-logo { filter: grayscale(100%) !important; max-height: 60px !important; }
                table { page-break-inside: avoid !important; }
                tr { page-break-inside: avoid !important; }
            }
        </style>
        `;
        
        // 6. CREAR VENTANA DE IMPRESIÓN
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        const supervisorName = printClone.querySelector('.info-item span')?.textContent || 'Supervisor';
        
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Recibo Supervisor - ${supervisorName}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${estilosBase}
            ${estilosSupervisor}
        </head>
        <body>
            <div class="recibo-profesional supervisor">
                ${printClone.innerHTML}
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    }, 800);
                };
            </script>
        </body>
        </html>
        `);
        
        printWindow.document.close();
        
    } catch (error) {
        console.error("Error imprimiendo supervisor:", error);
        alert("Abriendo vista previa...");
        window.print();
    }
}

// Función para obtener número consecutivo de recibo técnico
function obtenerNumeroReciboTecnico() {
    let numero = localStorage.getItem('numero_recibo_tecnico');
    if (!numero) {
        numero = '1';
        localStorage.setItem('numero_recibo_tecnico', numero);
    }
    return numero.padStart(6, '0');
}

// Función para incrementar número de recibo técnico
function incrementarNumeroReciboTecnico() {
    let numero = localStorage.getItem('numero_recibo_tecnico');
    if (!numero) {
        numero = '0';
    }
    numero = parseInt(numero) + 1;
    localStorage.setItem('numero_recibo_tecnico', numero.toString());
    return numero;
}

// Función para obtener número consecutivo de recibo supervisor
function obtenerNumeroReciboSupervisor() {
    let numero = localStorage.getItem('numero_recibo_supervisor');
    if (!numero) {
        numero = '1';
        localStorage.setItem('numero_recibo_supervisor', numero);
    }
    return numero.padStart(6, '0');
}

// Función para incrementar número de recibo supervisor
function incrementarNumeroReciboSupervisor() {
    let numero = localStorage.getItem('numero_recibo_supervisor');
    if (!numero) {
        numero = '0';
    }
    numero = parseInt(numero) + 1;
    localStorage.setItem('numero_recibo_supervisor', numero.toString());
    return numero;
}

// Función para PDF supervisor
function guardarReciboSupervisorPDF() {
    alert("Para guardar como PDF:\n1. Haz clic en 'Imprimir Recibo Supervisor'\n2. En el diálogo de impresión, selecciona 'Guardar como PDF'\n3. Elige la ubicación y guarda");
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

// ======================
// FUNCIÓN PARA IMPRIMIR TABLA ACUMULADO EN FORMATO VERTICAL (TABLA COMPLETA)
// ======================
function printAcumulado() {
    console.log("Ejecutando printAcumulado - Tabla completa vertical...");
    
    const acumuladoTable = document.getElementById('acumulado-table');
    if (!acumuladoTable) {
        console.error("Elemento #acumulado-table no encontrado");
        alert('No hay tabla de acumulado para imprimir.');
        return;
    }
    
    const tabla = acumuladoTable.querySelector('table');
    if (!tabla) {
        console.error("Tabla dentro de #acumulado-table no encontrada");
        alert('No hay datos en la tabla de acumulado.');
        return;
    }
    
    console.log("Tabla encontrada, preparando impresión vertical...");
    
    // Obtener fechas del formulario de acumulado
    const fechaDesde = document.querySelector('input[name="acumulado-desde"]')?.value || '';
    const fechaHasta = document.querySelector('input[name="acumulado-hasta"]')?.value || '';
    
    // Clonar la tabla para modificar sin afectar el original
    const tablaClone = tabla.cloneNode(true);
    
    // Remover cualquier botón que exista en la tabla
    tablaClone.querySelectorAll('button').forEach(btn => btn.remove());
    
    // Obtener estadísticas
    const totalFilas = tabla.querySelectorAll('tbody tr').length;
    const tecnicos = Array.from(tabla.querySelectorAll('thead th[colspan="1"]')).map(th => th.textContent.trim());
    
    // Crear contenido para impresión vertical
    let contenido = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte Acumulado de Folios</title>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: portrait;
                    margin: 1cm;
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Arial', sans-serif;
                    font-size: 10pt;
                    line-height: 1.4;
                    color: #000;
                    margin: 0;
                    padding: 15px;
                    background: white;
                }
                .contenedor-reporte {
                    max-width: 100%;
                    margin: 0 auto;
                }
                .encabezado-reporte {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #1e3a8a;
                    page-break-after: avoid;
                }
                .encabezado-reporte h1 {
                    color: #1e3a8a;
                    margin: 0 0 10px 0;
                    font-size: 20pt;
                    text-transform: uppercase;
                }
                .info-reporte {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    border: 1px solid #dee2e6;
                    page-break-after: avoid;
                }
                .info-item {
                    text-align: center;
                }
                .info-item strong {
                    display: block;
                    color: #495057;
                    font-size: 9pt;
                    margin-bottom: 5px;
                }
                .info-item span {
                    color: #1e3a8a;
                    font-size: 12pt;
                    font-weight: 600;
                }
                
                /* ESTILOS PARA LA TABLA DE ACUMULADO EN VERTICAL */
                .tabla-acumulado-vertical {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin: 20px 0 !important;
                    font-size: 9pt !important;
                    page-break-inside: auto !important;
                }
                .tabla-acumulado-vertical th {
                    background: linear-gradient(to bottom, #f1f5f9, #e0e6f0) !important;
                    color: #1e3a8a !important;
                    padding: 10px 6px !important;
                    text-align: center !important;
                    font-weight: 700 !important;
                    border: 1px solid #c8d1e0 !important;
                    border-bottom: 2px solid #1e3a8a !important;
                    vertical-align: middle !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .tabla-acumulado-vertical th[rowspan="2"] {
                    background: #1e3a8a !important;
                    color: white !important;
                    font-size: 10pt !important;
                }
                .tabla-acumulado-vertical th[colspan] {
                    background: #2c3e50 !important;
                    color: white !important;
                    font-size: 10pt !important;
                    padding: 12px 6px !important;
                }
                .tabla-acumulado-vertical td {
                    padding: 8px 6px !important;
                    border: 1px solid #dee2e6 !important;
                    text-align: center !important;
                    vertical-align: middle !important;
                    font-size: 9pt !important;
                }
                .tabla-acumulado-vertical td:first-child {
                    font-weight: 600 !important;
                    color: #1e40af !important;
                    background-color: #f0f9ff !important;
                }
                .tabla-acumulado-vertical tr:nth-child(even) {
                    background-color: #f8fafc !important;
                }
                .tabla-acumulado-vertical tr:hover {
                    background-color: #e9ecef !important;
                }
                
                /* Estilos para folios asignados */
                .folio-asignado {
                    font-weight: 600 !important;
                    color: #10b981 !important;
                    background-color: rgba(16, 185, 129, 0.1) !important;
                }
                .sin-folio {
                    color: #94a3b8 !important;
                    font-style: italic !important;
                }
                
                /* Resaltar totales */
                .fila-total {
                    font-weight: bold !important;
                    background: #e3f2fd !important;
                    border-top: 2px solid #1e3a8a !important;
                    border-bottom: 2px solid #1e3a8a !important;
                }
                .fila-total td {
                    font-weight: bold !important;
                    background: #e3f2fd !important;
                    color: #1e3a8a !important;
                }
                
                /* Ajustes para columnas específicas */
                .columna-numero {
                    width: 50px !important;
                }
                .columna-tecnico {
                    min-width: 120px !important;
                }
                .columna-newbe {
                    background: #fff7ed !important;
                    color: #f59e0b !important;
                }
                
                .pie-pagina {
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 2px dashed #adb5bd;
                    text-align: center;
                    font-size: 9pt;
                    color: #6c757d;
                    page-break-before: avoid;
                }
                
                @media print {
                    @page {
                        size: portrait;
                        margin: 1cm;
                    }
                    body {
                        margin: 0 !important;
                        padding: 10px !important;
                        font-size: 9pt !important;
                        width: 100% !important;
                    }
                    .contenedor-reporte {
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .tabla-acumulado-vertical {
                        font-size: 8pt !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .tabla-acumulado-vertical th,
                    .tabla-acumulado-vertical td {
                        padding: 6px 4px !important;
                        font-size: 8pt !important;
                        max-width: none !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Forzar que la tabla no se rompa entre páginas */
                    .tabla-acumulado-vertical {
                        page-break-inside: auto !important;
                    }
                    .tabla-acumulado-vertical tr {
                        page-break-inside: avoid !important;
                        page-break-after: auto !important;
                    }
                    @page {
                        @bottom-center {
                            content: "Página " counter(page) " de " counter(pages);
                            font-size: 8pt;
                            color: #94a3b8;
                        }
                    }
                }
                
                /* Para tablas muy anchas */
                @media screen and (max-width: 1200px) {
                    .tabla-acumulado-vertical {
                        font-size: 8pt !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="contenedor-reporte">
                <div class="encabezado-reporte">
                    <h1>ACUMULADO DE FOLIOS POR TÉCNICO</h1>
    `;
    
    // Agregar subtítulos
    if (fechaDesde && fechaHasta) {
        contenido += `<p style="color: #475569; font-size: 11pt; margin: 5px 0;">
                        <strong>Período:</strong> ${fechaDesde} al ${fechaHasta}
                    </p>`;
    }
    
    contenido += `
                    <p style="color: #64748b; font-size: 10pt; margin: 5px 0;">
                        <strong>Generado:</strong> ${new Date().toLocaleDateString('es-MX', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                    <p style="color: #64748b; font-size: 9pt; margin: 5px 0;">
                        Formato: Tabla completa vertical
                    </p>
                </div>
                
                <div class="info-reporte">
                    <div class="info-item">
                        <strong>Total de Filas</strong>
                        <span>${totalFilas}</span>
                    </div>
                    <div class="info-item">
                        <strong>Técnicos</strong>
                        <span>${tecnicos.length}</span>
                    </div>
                    <div class="info-item">
                        <strong>NEWBE</strong>
                        <span>1 columna</span>
                    </div>
                    <div class="info-item">
                        <strong>Estado</strong>
                        <span>Completo</span>
                    </div>
                </div>
                
                <!-- TABLA COMPLETA -->
                <div style="width: 100%; overflow-x: visible;">
                    <table class="tabla-acumulado-vertical">
    `;
    
    // Copiar el contenido completo de la tabla clonada
    contenido += tablaClone.innerHTML;
    
    contenido += `
                    </table>
                </div>
                
                <!-- RESUMEN -->
                <div style="margin-top: 25px; padding: 20px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 10px; border: 2px solid #1e3a8a;">
                    <h3 style="color: #1e3a8a; margin: 0 0 15px 0; text-align: center; font-size: 12pt;">
                        📊 RESUMEN ESTADÍSTICO
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div style="padding: 12px; background: white; border-radius: 8px;">
                            <h4 style="color: #334155; margin: 0 0 8px 0; font-size: 10pt;">Distribución General</h4>
                            <div style="font-size: 9pt; color: #475569;">
                                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e2e8f0;">
                                    <span>Filas procesadas:</span>
                                    <strong>${totalFilas}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e2e8f0;">
                                    <span>Técnicos activos:</span>
                                    <strong>${tecnicos.length}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                                    <span>NEWBE:</span>
                                    <strong>Incluido</strong>
                                </div>
                            </div>
                        </div>
                        
                        <div style="padding: 12px; background: white; border-radius: 8px;">
                            <h4 style="color: #334155; margin: 0 0 8px 0; font-size: 10pt;">Información Técnica</h4>
                            <div style="font-size: 9pt; color: #475569;">
                                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e2e8f0;">
                                    <span>Formato:</span>
                                    <strong>Vertical</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e2e8f0;">
                                    <span>Fecha gen.:</span>
                                    <strong>${new Date().toLocaleDateString()}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                                    <span>Hora gen.:</span>
                                    <strong>${new Date().toLocaleTimeString()}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Lista de técnicos -->
                    <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 8px;">
                        <h4 style="color: #334155; margin: 0 0 10px 0; font-size: 10pt;">👥 Técnicos en Reporte</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
    `;
    
    // Mostrar lista de técnicos
    tecnicos.forEach((tecnico, index) => {
        contenido += `
            <span style="padding: 4px 10px; background: #f1f5f9; border-radius: 15px; font-size: 8pt; color: #1e40af; border: 1px solid #cbd5e1;">
                ${index + 1}. ${tecnico}
            </span>
        `;
    });
    
    contenido += `
                        </div>
                    </div>
                </div>
                
                <div class="pie-pagina">
                    <p style="font-weight: 600; color: #334155; margin-bottom: 8px;">
                        📄 DOCUMENTO OFICIAL - SISTEMA DE ACUMULADO DE FOLIOS
                    </p>
                    <p style="margin: 5px 0; font-size: 8pt; color: #64748b;">
                        Este documento ha sido generado automáticamente y contiene información confidencial.
                    </p>
                    <p style="margin: 5px 0; font-size: 8pt; color: #64748b;">
                        Fecha y hora de emisión: ${new Date().toLocaleString('es-MX')}
                    </p>
                </div>
            </div>
            
            <script>
                // Configuración para impresión
                window.onload = function() {
                    console.log("Reporte de acumulado cargado, configurando impresión...");
                    
                    // Forzar tamaño portrait
                    const stylePortrait = document.createElement('style');
                    stylePortrait.textContent = \`
                        @page {
                            size: portrait;
                            margin: 1cm;
                        }
                        body {
                            width: 100% !important;
                            max-width: 100% !important;
                        }
                        table {
                            width: 100% !important;
                            max-width: 100% !important;
                        }
                    \`;
                    document.head.appendChild(stylePortrait);
                    
                    // Pequeño delay para que todo se renderice
                    setTimeout(function() {
                        console.log("Iniciando impresión...");
                        window.print();
                        
                        // Cerrar después de imprimir
                        setTimeout(function() {
                            if (!window.closed) {
                                window.close();
                            }
                        }, 1000);
                    }, 500);
                };
                
                // Manejar cancelación de impresión
                window.addEventListener('afterprint', function() {
                    setTimeout(function() {
                        if (!window.closed) {
                            window.close();
                        }
                    }, 500);
                });
            </script>
        </body>
        </html>
    `;
    
    // Abrir ventana de impresión
    console.log("Abriendo ventana de impresión...");
    const ventanaImpresion = window.open('', '_blank', 'width=1000,height=1200,scrollbars=yes');
    
    if (!ventanaImpresion) {
        alert('Por favor permite ventanas emergentes para imprimir.');
        return;
    }
    
    // Escribir el contenido
    ventanaImpresion.document.open();
    ventanaImpresion.document.write(contenido);
    ventanaImpresion.document.close();
    
    console.log("Ventana de impresión preparada");
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
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
            overflow-y: auto;
        `;
        
        modal.innerHTML = `
            <div style="
                background: #1e293b; 
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                border-radius: 12px; 
                overflow: hidden; 
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
            ">
                <!-- Header fijo -->
                <div style="
                    background: linear-gradient(135deg, #dc2626, #b91c1c); 
                    padding: 20px; 
                    color: white;
                    flex-shrink: 0;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-clock"></i>
                            Folio Pendiente de Liquidar
                        </h3>
                        <button onclick="cerrarModalFolioPendiente()" style="
                            background: rgba(255,255,255,0.1); 
                            border: none; 
                            color: white; 
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                            cursor: pointer; 
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: background 0.3s;
                        ">
                            ×
                        </button>
                    </div>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 13px;">
                        Registra un folio pendiente para liquidación posterior
                    </p>
                </div>
                
                <!-- Contenido scrollable -->
                <div style="
                    padding: 20px;
                    overflow-y: auto;
                    flex: 1;
                    max-height: calc(90vh - 130px);
                ">
                    <form id="form-folio-pendiente">
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <!-- Tipo -->
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e2e8f0; font-size: 14px;">
                                    <i class="fas fa-network-wired"></i> Tipo *
                                </label>
                                <select id="fp-tipo" required 
                                        style="
                                            width: 100%; 
                                            padding: 10px 12px; 
                                            background: #0f172a;
                                            border: 1px solid #334155; 
                                            border-radius: 8px; 
                                            font-size: 14px; 
                                            color: #e2e8f0;
                                            box-sizing: border-box;
                                            appearance: none;
                                            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                                            background-repeat: no-repeat;
                                            background-position: right 12px center;
                                            background-size: 16px;
                                            padding-right: 40px;
                                            cursor: pointer;
                                        "
                                        onfocus="this.style.borderColor='#dc2626'; this.style.boxShadow='0 0 0 2px rgba(220, 38, 38, 0.1)';"
                                        onblur="this.style.borderColor='#334155'; this.style.boxShadow='none';">
                                    <option value="">Seleccionar tipo</option>
                                    <option value="FIBRA" selected>FIBRA</option>
                                    <option value="COBRE">COBRE</option>
                                </select>
                            </div>
                            
                            <!-- Cope -->
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e2e8f0; font-size: 14px;">
                                    <i class="fas fa-building"></i> Cope *
                                </label>
                                <select id="fp-cope" required 
                                        style="
                                            width: 100%; 
                                            padding: 10px 12px; 
                                            background: #0f172a;
                                            border: 1px solid #334155; 
                                            border-radius: 8px; 
                                            font-size: 14px; 
                                            color: #e2e8f0;
                                            box-sizing: border-box;
                                            appearance: none;
                                            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                                            background-repeat: no-repeat;
                                            background-position: right 12px center;
                                            background-size: 16px;
                                            padding-right: 40px;
                                            cursor: pointer;
                                        "
                                        onfocus="this.style.borderColor='#dc2626'; this.style.boxShadow='0 0 0 2px rgba(220, 38, 38, 0.1)';"
                                        onblur="this.style.borderColor='#334155'; this.style.boxShadow='none';">
                                    <option value="">Seleccionar cope</option>
                                    <option value="TROJES" selected>TROJES</option>
                                    <option value="AGU">AGU</option>
                                </select>
                            </div>
                            
                            <!-- Fecha y Hora -->
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e2e8f0; font-size: 14px;">
                                    <i class="fas fa-calendar-alt"></i> Fecha y Hora *
                                </label>
                                <input type="datetime-local" id="fp-fecha" required 
                                       style="
                                           width: 100%; 
                                           padding: 10px 12px; 
                                           background: #0f172a;
                                           border: 1px solid #334155; 
                                           border-radius: 8px; 
                                           font-size: 14px; 
                                           color: #e2e8f0;
                                           box-sizing: border-box;
                                       "
                                       onfocus="this.style.borderColor='#dc2626'; this.style.boxShadow='0 0 0 2px rgba(220, 38, 38, 0.1)';"
                                       onblur="this.style.borderColor='#334155'; this.style.boxShadow='none';">
                                <p style="margin-top: 4px; font-size: 12px; color: #94a3b8;">
                                    Fecha y hora del servicio pendiente
                                </p>
                            </div>
                            
                            <!-- Teléfono pendiente -->
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e2e8f0; font-size: 14px;">
                                    <i class="fas fa-phone"></i> Teléfono pendiente *
                                </label>
                                <input type="text" id="fp-telefono" maxlength="10" pattern="\\d{10}" required
                                       placeholder="10 dígitos (ej: 5512345678)"
                                       style="
                                           width: 100%; 
                                           padding: 10px 12px; 
                                           background: #0f172a;
                                           border: 1px solid #334155; 
                                           border-radius: 8px; 
                                           font-size: 14px; 
                                           color: #e2e8f0;
                                           box-sizing: border-box;
                                       "
                                       onfocus="this.style.borderColor='#dc2626'; this.style.boxShadow='0 0 0 2px rgba(220, 38, 38, 0.1)';"
                                       onblur="this.style.borderColor='#334155'; this.style.boxShadow='none';">
                                <p style="margin-top: 4px; font-size: 12px; color: #94a3b8;">
                                    10 dígitos sin espacios ni guiones
                                </p>
                            </div>
                            
                            <!-- Comentarios pendiente -->
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #e2e8f0; font-size: 14px;">
                                    <i class="fas fa-comment"></i> Comentarios pendiente
                                </label>
                                <textarea id="fp-comentarios" rows="3"
                                          placeholder="Describe la razón del pendiente, ubicación, o cualquier detalle relevante..."
                                          style="
                                              width: 100%; 
                                              padding: 10px 12px; 
                                              background: #0f172a;
                                              border: 1px solid #334155; 
                                              border-radius: 8px; 
                                              font-size: 14px; 
                                              color: #e2e8f0;
                                              resize: vertical; 
                                              min-height: 80px;
                                              max-height: 120px;
                                              box-sizing: border-box;
                                          "
                                          onfocus="this.style.borderColor='#dc2626'; this.style.boxShadow='0 0 0 2px rgba(220, 38, 38, 0.1)';"
                                          onblur="this.style.borderColor='#334155'; this.style.boxShadow='none';"></textarea>
                                <p style="margin-top: 4px; font-size: 12px; color: #94a3b8;">
                                    Opcional. Descripción detallada del pendiente
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
                
                <!-- Footer fijo -->
                <div style="
                    padding: 15px 20px; 
                    background: rgba(15, 23, 42, 0.8);
                    border-top: 1px solid #334155;
                    flex-shrink: 0;
                ">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button type="button" onclick="cerrarModalFolioPendiente()" 
                                style="
                                    flex: 1; 
                                    padding: 10px; 
                                    border: 1px solid #475569; 
                                    background: transparent; 
                                    color: #94a3b8; 
                                    border-radius: 8px; 
                                    cursor: pointer; 
                                    font-weight: 600;
                                    font-size: 14px;
                                    transition: all 0.3s;
                                "
                                onmouseover="this.style.backgroundColor='rgba(71, 85, 105, 0.2)';"
                                onmouseout="this.style.backgroundColor='transparent';">
                            Cancelar
                        </button>
                        <button type="button" onclick="guardarFolioPendienteIndependiente()"
                                style="
                                    flex: 1; 
                                    padding: 10px; 
                                    border: none; 
                                    background: linear-gradient(135deg, #dc2626, #b91c1c); 
                                    color: white; 
                                    border-radius: 8px; 
                                    cursor: pointer; 
                                    font-weight: 600;
                                    font-size: 14px;
                                    transition: all 0.3s;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 8px;
                                "
                                onmouseover="this.style.opacity='0.9'; this.style.transform='translateY(-1px)';"
                                onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)';">
                            <i class="fas fa-save"></i> Guardar Folio Pendiente
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Agregar evento para cerrar al hacer clic fuera
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModalFolioPendiente();
            }
        });
        
        // Agregar evento para tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                cerrarModalFolioPendiente();
            }
        });
    }
    
    // Establecer fecha y hora actual
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('fp-fecha').value = local;
    
    // Mostrar modal con animación
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.backdropFilter = 'blur(4px)';
    }, 10);
    
    // Enfocar el primer campo
    setTimeout(() => {
        const firstInput = document.getElementById('fp-tipo');
        if (firstInput) {
            firstInput.focus();
            firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
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
    
    console.log("📋 Datos del formulario de nómina:", { tecnico, desde, hasta });
    
    // Asegurar que las fechas estén en formato YYYY-MM-DD
    let desdeISO = '';
    let hastaISO = '';
    
    if (desde) {
        const fecha = new Date(desde);
        desdeISO = fecha.toISOString().split('T')[0];
    }
    
    if (hasta) {
        const fecha = new Date(hasta);
        hastaISO = fecha.toISOString().split('T')[0];
    }
    
    console.log("Fechas en formato ISO:", { desdeISO, hastaISO });
    
    // Filtrar folios por fechas (usando fecha de los folios, no de creación)
    const filtered = folios.filter(f => {
        if (!f.fecha) return false;
        
        let fechaFolio;
        if (f.fecha instanceof firebase.firestore.Timestamp) {
            fechaFolio = f.fecha.toDate().toISOString().split('T')[0];
        } else {
            fechaFolio = new Date(f.fecha).toISOString().split('T')[0];
        }
        
        const pasaDesde = !desdeISO || fechaFolio >= desdeISO;
        const pasaHasta = !hastaISO || fechaFolio <= hastaISO;
        
        return f.tecnico === tecnico && pasaDesde && pasaHasta;
    });
    
    console.log(`Folios encontrados para ${tecnico}: ${filtered.length}`);
    
    currentTecnicoNomina = tecnico;
    currentDesdeNomina = desdeISO;
    currentHastaNomina = hastaISO;
    
    generateNominaReceipt(tecnico, filtered, desdeISO, hastaISO);
});
}

// Agrega estas funciones de utilidad al inicio de tu script
function fechaToISO(fechaStr) {
    if (!fechaStr) return '';
    
    try {
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) {
            // Intentar formato DD/MM/YYYY
            const parts = fechaStr.split('/');
            if (parts.length === 3) {
                const fechaFormateada = new Date(parts[2], parts[1] - 1, parts[0]);
                return fechaFormateada.toISOString().split('T')[0];
            }
            return fechaStr;
        }
        return fecha.toISOString().split('T')[0];
    } catch (e) {
        console.error("Error convirtiendo fecha a ISO:", fechaStr, e);
        return fechaStr;
    }
}

function fechaToLocal(fechaISO) {
    if (!fechaISO) return '';
    
    try {
        const fecha = new Date(fechaISO + 'T00:00:00');
        if (isNaN(fecha.getTime())) {
            // Si ya está en formato local
            return fechaISO;
        }
        return fecha.toLocaleDateString('es-MX');
    } catch (e) {
        console.error("Error convirtiendo fecha a local:", fechaISO, e);
        return fechaISO;
    }
}


// ======================
// EVENT LISTENER PARA NÓMINA SUPERVISOR
// ======================

/// Event listener para el formulario supervisor
document.getElementById('supervisor-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const supervisor = formData.get('supervisor-nombre');
    const desde = formData.get('supervisor-desde');
    const hasta = formData.get('supervisor-hasta');
    
    if (!supervisor || !desde || !hasta) {
        alert('Por favor completa todos los campos del supervisor.');
        return;
    }
    
    // Mostrar indicador de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'supervisor-loading';
    loadingDiv.className = 'active';
    loadingDiv.innerHTML = `
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
        <p class="mt-3">Generando recibo del supervisor...</p>
    `;
    
    this.parentNode.appendChild(loadingDiv);
    
    // Generar recibo después de un pequeño delay para animación
    setTimeout(() => {
        generateSupervisorReceipt(supervisor, desde, hasta);
        
        // Ocultar loading
        loadingDiv.remove();
        
        // Scroll al recibo generado
        document.getElementById('supervisor-receipt').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 500);
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
// FUNCIÓN CENTRALIZADA PARA ENTRAR AL SISTEMA
// ======================

// CORRECCIÓN: Función entrarAlSistema sin el error de referencia
async function entrarAlSistema(user) {
    console.log("Configurando interfaz para:", user.name);
    
    // 1. Guardar sesión
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    // 2. Cambiar visibilidad básica
    const loginSection = document.getElementById('login-section');
    const appElement = document.getElementById('app');
    if (loginSection) loginSection.style.display = 'none';
    if (appElement) {
        appElement.style.display = 'flex';
        appElement.style.flexDirection = 'column';
    }

    // --- 🚩 PASO NUEVO 2.1: CARGAR PERMISOS ANTES DE SEGUIR ---
    // Esto garantiza que permisosGlobales ya tenga datos antes de dibujar el menú
    if (typeof cargarPermisosFirebase === 'function') {
        console.log("Esperando permisos de seguridad...");
        await cargarPermisosFirebase(); 
    }

    // 3. Mostrar barras y contenido
    const topBar = document.querySelector('.top-bar');
    const mainContent = document.querySelector('.main-content');
    if (topBar) topBar.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'block';

    // 4. Actualizar nombre de usuario
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = user.name;
    
    // 5. Aplicar roles (Ahora sí tendrá los datos de Firebase listos)
    if (typeof updateMenuByRole === 'function') {
        updateMenuByRole();
    }
    
    if (typeof populateUserDropdowns === 'function') populateUserDropdowns();
    
    // 6. Cargar folios de Firebase    
    try {
        await loadFoliosFromFirebase();
        console.log("Datos de folios cargados");
    } catch (error) {
        console.error("Error cargando folios:", error);
    }

    // 7. Mostrar Dashboard
    if (typeof showSection === 'function') showSection('home');
    
    // 8. Dibujar tablas y otros
    setTimeout(() => {
        if (typeof displayFFTHTable === 'function') displayFFTHTable();
        if (typeof displayCobreTable === 'function') displayCobreTable();
        if (typeof actualizarEstadisticasDashboard === 'function') {
            actualizarEstadisticasDashboard();
        }
        if (typeof verificarFolioPendienteAlLogin === 'function') {
            verificarFolioPendienteAlLogin();
        }
    }, 500);
} 

// Agrega esta función al final de tu script.js para que el Dashboard tenga datos
function actualizarEstadisticasDashboard() {
    console.log("Actualizando estadísticas...");
    
    // Ejemplo de cómo podrías contar folios si tienes elementos con estos IDs en tu HTML
    const totalFolios = folios.length;
    const pendientes = folios.filter(f => f.estado === 'pendiente').length;

    // Si tienes elementos en el HTML para mostrar esto, úsalos:
    const elTotal = document.getElementById('stats-total-folios');
    const elPendientes = document.getElementById('stats-pendientes');

    if (elTotal) elTotal.textContent = totalFolios;
    if (elPendientes) elPendientes.textContent = pendientes;
}

// ======================
// INICIALIZACIÓN
// ======================

// ÚNICA INICIALIZACIÓN AL FINAL DEL ARCHIVO
document.addEventListener('DOMContentLoaded', async () => {
    console.log("=== SISTEMA INICIADO ===");

    // Configurar eventos
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', login);
    document.addEventListener('click', closeMenuOnClickOutside);

    try {
        // Cargar usuarios para permitir el login
        await loadUsersFromFirebase();
        
        // Verificar si ya hay sesión
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            await entrarAlSistema(JSON.parse(savedUser));
        } else {
            document.getElementById('login-section').style.display = 'flex';
            document.getElementById('app').style.display = 'none';
        }
    } catch (error) {
        console.error("Error en arranque:", error);
    }

    const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

// 1. Revisar si el usuario ya tenía una preferencia guardada
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    body.classList.add('light-mode');
    icon.classList.replace('fa-moon', 'fa-sun');
}

// 2. Escuchar el clic en el botón
themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    
    // Cambiar el icono y guardar preferencia
    if (body.classList.contains('light-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    }
});

});
