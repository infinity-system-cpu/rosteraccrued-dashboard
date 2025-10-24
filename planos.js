// planos.js - Funcionalidad para el visor de planos

let archivosActuales = [];
let archivoSeleccionado = null;
let urlArchivoActual = '';

// Función para cargar archivos de una carpeta
async function cargarArchivosCarpeta(carpetaPath) {
    if (!carpetaPath) {
        document.getElementById('lista-archivos').innerHTML = '<p>Selecciona una carpeta para ver los archivos</p>';
        document.getElementById('preview-container').innerHTML = '<p>Selecciona un archivo para previsualizarlo</p>';
        resetBotones();
        return;
    }

    const listaArchivos = document.getElementById('lista-archivos');
    listaArchivos.innerHTML = '<div class="loading"></div> Cargando archivos...';

    try {
        // En un entorno real con Firebase Storage, usarías:
        // const storageRef = storage.ref(carpetaPath);
        // const result = await storageRef.listAll();
        
        // Simulación para GitHub Pages - lista estática de archivos
        archivosActuales = await simularListaArchivos(carpetaPath);
        
        if (archivosActuales.length === 0) {
            listaArchivos.innerHTML = `
                <div class="empty-folder">
                    <div class="icon">📁</div>
                    <p>No se encontraron archivos en esta carpeta</p>
                </div>
            `;
            return;
        }

        mostrarListaArchivos(archivosActuales);
        
    } catch (error) {
        console.error('Error cargando archivos:', error);
        listaArchivos.innerHTML = '<p class="error">Error al cargar los archivos: ' + error.message + '</p>';
    }
}

// Simular lista de archivos para GitHub Pages
async function simularListaArchivos(carpeta) {
    // Esta es una simulación - en producción se conectaría a Firebase Storage
    const archivosSimulados = {
        'planos': [
            { name: 'plano-general.pdf', size: '2.4 MB', type: 'pdf' },
            { name: 'esquema-electrico.jpg', size: '1.1 MB', type: 'image' },
            { name: 'distribucion-plantas.pdf', size: '3.2 MB', type: 'pdf' },
            { name: 'ubicacion-terreno.png', size: '800 KB', type: 'image' },
            { name: 'memoria-calculo.pdf', size: '1.8 MB', type: 'pdf' }
        ],
        'planos/proyecto1': [
            { name: 'proyecto1-arquitectura.pdf', size: '4.1 MB', type: 'pdf' },
            { name: 'proyecto1-estructura.jpg', size: '2.3 MB', type: 'image' },
            { name: 'proyecto1-instalaciones.pdf', size: '3.7 MB', type: 'pdf' }
        ],
        'planos/proyecto2': [
            { name: 'proyecto2-planta-baja.pdf', size: '2.9 MB', type: 'pdf' },
            { name: 'proyecto2-fachada.jpg', size: '1.5 MB', type: 'image' },
            { name: 'proyecto2-cortes.pdf', size: '3.4 MB', type: 'pdf' }
        ]
    };

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(archivosSimulados[carpeta] || []);
        }, 1000);
    });
}

// Mostrar lista de archivos en el panel
function mostrarListaArchivos(archivos) {
    const listaArchivos = document.getElementById('lista-archivos');
    
    if (archivos.length === 0) {
        listaArchivos.innerHTML = '<p>No hay archivos en esta carpeta</p>';
        return;
    }

    let html = '';
    archivos.forEach((archivo, index) => {
        const icono = obtenerIconoArchivo(archivo.name);
        const tipo = obtenerTipoArchivo(archivo.name);
        const badgeClass = `file-type-badge ${tipo}`;
        
        html += `
            <div class="file-item" onclick="seleccionarArchivo(${index})" data-name="${archivo.name.toLowerCase()}">
                <span class="file-icon">${icono}</span>
                <span class="file-name">${archivo.name}</span>
                <span class="file-size">${archivo.size}</span>
                <span class="${badgeClass}">${tipo.toUpperCase()}</span>
            </div>
        `;
    });

    listaArchivos.innerHTML = html;
}

// Seleccionar archivo para previsualización
async function seleccionarArchivo(index) {
    const archivo = archivosActuales[index];
    if (!archivo) return;

    // Remover selección anterior
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });

    // Agregar selección actual
    const items = document.querySelectorAll('.file-item');
    if (items[index]) {
        items[index].classList.add('active');
    }

    archivoSeleccionado = archivo;
    
    // Mostrar loading
    const preview = document.getElementById('preview-container');
    preview.innerHTML = '<div class="loading"></div> Cargando previsualización...';

    try {
        // En Firebase Storage, usarías:
        // urlArchivoActual = await storage.ref(archivo.fullPath).getDownloadURL();
        
        // Simulación para demo
        urlArchivoActual = `planos/${archivo.name}`; // Ruta relativa para GitHub Pages
        
        await mostrarPrevisualizacion(archivo, urlArchivoActual);
        habilitarBotones();
        
    } catch (error) {
        console.error('Error cargando archivo:', error);
        preview.innerHTML = `
            <div class="error">
                <p>Error al cargar el archivo: ${error.message}</p>
                <p>El archivo podría no estar disponible en este momento.</p>
            </div>
        `;
    }
}

// Mostrar previsualización del archivo
async function mostrarPrevisualizacion(archivo, url) {
    const preview = document.getElementById('preview-container');
    const extension = archivo.name.split('.').pop().toLowerCase();
    
    let contenido = '';
    
    if (['pdf'].includes(extension)) {
        contenido = `
            <embed class="pdf-viewer" src="${url}" type="application/pdf">
            <div class="preview-info">
                <h4>${archivo.name}</h4>
                <p><strong>Tamaño:</strong> ${archivo.size}</p>
                <p><strong>Tipo:</strong> Documento PDF</p>
            </div>
        `;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
        contenido = `
            <img src="${url}" alt="${archivo.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='">
            <div class="preview-info">
                <h4>${archivo.name}</h4>
                <p><strong>Tamaño:</strong> ${archivo.size}</p>
                <p><strong>Tipo:</strong> Imagen ${extension.toUpperCase()}</p>
            </div>
        `;
    } else {
        contenido = `
            <div class="empty-folder">
                <div class="icon">📄</div>
                <h4>${archivo.name}</h4>
                <p><strong>Tamaño:</strong> ${archivo.size}</p>
                <p><strong>Tipo:</strong> Archivo ${extension.toUpperCase()}</p>
                <p>Vista previa no disponible para este tipo de archivo</p>
            </div>
        `;
    }
    
    preview.innerHTML = contenido;
}

// Filtrar archivos por nombre
function filtrarArchivos() {
    const busqueda = document.getElementById('buscar-archivo').value.toLowerCase();
    const items = document.querySelectorAll('.file-item');
    
    items.forEach(item => {
        const nombre = item.getAttribute('data-name') || '';
        if (nombre.includes(busqueda)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Descargar archivo actual
function descargarArchivoActual() {
    if (!archivoSeleccionado || !urlArchivoActual) {
        alert('No hay archivo seleccionado para descargar');
        return;
    }
    
    const link = document.createElement('a');
    link.href = urlArchivoActual;
    link.download = archivoSeleccionado.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Abrir archivo en nueva pestaña
function abrirArchivoNuevaPestana() {
    if (!archivoSeleccionado || !urlArchivoActual) {
        alert('No hay archivo seleccionado');
        return;
    }
    
    window.open(urlArchivoActual, '_blank');
}

// Utilidades
function obtenerIconoArchivo(nombre) {
    const extension = nombre.split('.').pop().toLowerCase();
    const iconos = {
        'pdf': '📕',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'bmp': '🖼️',
        'doc': '📄',
        'docx': '📄',
        'xls': '📊',
        'xlsx': '📊'
    };
    return iconos[extension] || '📄';
}

function obtenerTipoArchivo(nombre) {
    const extension = nombre.split('.').pop().toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) return 'image';
    return 'other';
}

function habilitarBotones() {
    document.getElementById('btn-descargar').disabled = false;
    document.getElementById('btn-abrir').disabled = false;
}

function resetBotones() {
    document.getElementById('btn-descargar').disabled = true;
    document.getElementById('btn-abrir').disabled = true;
    archivoSeleccionado = null;
    urlArchivoActual = '';
}

// Inicialización cuando se carga la sección de planos
document.addEventListener('DOMContentLoaded', function() {
    // Configurar evento para mostrar/ocultar sección de planos
    const originalShowSection = window.showSection;
    window.showSection = function(sectionId) {
        originalShowSection(sectionId);
        
        if (sectionId === 'planos') {
            // Reiniciar el visor cuando se entra a la sección
            document.getElementById('carpeta-select').value = '';
            document.getElementById('lista-archivos').innerHTML = '<p>Selecciona una carpeta para ver los archivos</p>';
            document.getElementById('preview-container').innerHTML = '<p>Selecciona un archivo para previsualizarlo</p>';
            resetBotones();
        }
    };
});