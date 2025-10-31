// planos.js - Visualizador de Planos Corregido

let archivosCargados = [];
let archivoSeleccionado = null;

// Lista de archivos de ejemplo
const archivosPlanos = [
    { nombre: "AGU0194FO.pdf", tipo: "pdf", url: "planos/AGU0194FO.pdf" },
    { nombre: "AGU0194FO_1.pdf", tipo: "pdf", url: "planos/AGU0194FO_1.pdf" },
    { nombre: "AGU0218FO PLANO CONST.pdf", tipo: "pdf", url: "planos/AGU0218FO PLANO CONST.pdf" },
    { nombre: "CQL0008FO PLANIMETRIA (1).PDF", tipo: "pdf", url: "planos/CQL0008FO PLANIMETRIA (1).PDF" },
    { nombre: "CQL0009FO DIAGRAMA.pdf", tipo: "pdf", url: "planos/CQL0009FO DIAGRAMA.pdf" },
    { nombre: "CQL0009FO PLANIMETRIA SEC.pdf", tipo: "pdf", url: "planos/CQL0009FO PLANIMETRIA SEC.pdf" },
    { nombre: "CQL0010FO.jpg", tipo: "imagen", url: "planos/CQL0010FO/CQL0010FO.jpg" },
    { nombre: "CQL0010FO_1.jpg", tipo: "imagen", url: "planos/CQL0010FO/CQL0010FO_1.jpg" },
    { nombre: "CQL0013FO FTTH 2022 PLANO.pdf", tipo: "pdf", url: "planos/CQL0013FO FTTH 2022 PLANO.pdf" },
    { nombre: "CQL0014FO.jpg", tipo: "imagen", url: "planos/CQL0014FO/CQL0014FO.jpg" },
    { nombre: "CQL0014FO_1.jpg", tipo: "imagen", url: "planos/CQL0014FO/CQL0014FO_1.jpg" },
    { nombre: "DCT0024 1.PDF", tipo: "pdf", url: "planos/DCT0024 1.PDF" },
    { nombre: "DCT0024 2.PDF", tipo: "pdf", url: "planos/DCT0024 2.PDF" },
    { nombre: "FLV0010FO.PDF", tipo: "pdf", url: "planos/FLV0010FO.PDF" },
    { nombre: "FLV0013FO-Model.pdf", tipo: "pdf", url: "planos/FLV0013FO-Model.pdf" },
    { nombre: "FLV0015FO.jpg", tipo: "imagen", url: "planos/FLV0015FO/FLV0015FO.jpg" },
    { nombre: "FRW0002 SEC PLANIMETRIA.PDF", tipo: "pdf", url: "planos/FRW0002 SEC PLANIMETRIA.PDF" },
    { nombre: "FSC0001FO BB FTTH SATURADO 2021 PLANIM Y DIAGRAMA.pdf", tipo: "pdf", url: "planos/FSC0001FO BB FTTH SATURADO 2021 PLANIM Y DIAGRAMA.pdf" },
    { nombre: "HHL0004FO TERM.pdf", tipo: "pdf", url: "planos/HHL0004FO TERM.pdf" },
    { nombre: "HHL0004FO.pdf", tipo: "pdf", url: "planos/HHL0004FO.pdf" },
    { nombre: "IIY0006 FTTH RED SEC LIQ.pdf", tipo: "pdf", url: "planos/IIY0006 FTTH RED SEC LIQ.pdf" },
    { nombre: "IIY0021_FTTH_PLANIMETRIA_2012_LIQ.pdf", tipo: "pdf", url: "planos/IIY0021_FTTH_PLANIMETRIA_2012_LIQ.pdf" },
    { nombre: "IIY0024 FTTH CHEDRAUI COLOSIO8.pdf", tipo: "pdf", url: "planos/IIY0024 FTTH CHEDRAUI COLOSIO8.pdf" },
    { nombre: "IIY0024 WALMART FTTH IDATA VIPS9.pdf", tipo: "pdf", url: "planos/IIY0024 WALMART FTTH IDATA VIPS9.pdf" },
    { nombre: "IIY0024FO Walmart Homeera__0024C2301C0101DI.pdf", tipo: "pdf", url: "planos/IIY0024FO Walmart Homeera__0024C2301C0101DI.pdf" },
    { nombre: "IIY0027FO.pdf", tipo: "pdf", url: "planos/IIY0027FO.pdf" },
    { nombre: "IIY0037 EMPLAMES 2022 H2.pdf", tipo: "pdf", url: "planos/IIY0037 EMPLAMES 2022 H2.pdf" },
    { nombre: "JMA0041 FTTH RED SEC LIQ22.pdf", tipo: "pdf", url: "planos/JMA0041 FTTH RED SEC LIQ22.pdf" },
    { nombre: "JMA0043FO.pdf", tipo: "pdf", url: "planos/JMA0043FO.pdf" },
    { nombre: "LEC0001FO_1.pdf", tipo: "pdf", url: "planos/LEC0001FO_1.pdf" },
    { nombre: "LEC0001FO_2.pdf", tipo: "pdf", url: "planos/LEC0001FO_2.pdf" },
    { nombre: "LEC0002FO CONST.pdf", tipo: "pdf", url: "planos/LEC0002FO CONST.pdf" },
    { nombre: "LGT0017FO.jpg", tipo: "imagen", url: "planos/LGT0017FO/LGT0017FO.jpg" },
    { nombre: "LGT0017FO.pdf", tipo: "pdf", url: "planos/LGT0017FO.pdf" },
    { nombre: "LGT0017FO_1.jpg", tipo: "imagen", url: "planos/LGT0017FO/LGT0017FO_1.jpg" },
    { nombre: "LGT0017FO_2.jpg", tipo: "imagen", url: "planos/LGT0017FO/LGT0017FO_2.jpg" },
    { nombre: "LGT0017FO_3.jpg", tipo: "imagen", url: "planos/LGT0017FO/LGT0017FO_3.jpg" },
    { nombre: "LGT0017FO_4.jpg", tipo: "imagen", url: "planos/LGT0017FO/LGT0017FO_4.jpg" },
    { nombre: "LGT0017FO_5.jpg", tipo: "imagen", url: "planos/LGT0017FO/LGT0017FO_5.jpg" },
    { nombre: "LGT0017FO_6.jpg", tipo: "imagen", url: "planos/LGT0017FO/LGT0017FO_6.jpg" },
    { nombre: "LGT0017FO_7.jpg", tipo: "imagen", url: "planos/LGT0017FO/LGT0017FO_7.jpg" },
    { nombre: "LGT0017FO_8.jpg", tipo: "imagen", url: "planos/LGT0017FO/LGT0017FO_8.jpg" },
    { nombre: "LGT0017FO_9.jpg", tipo: "imagen", url: "planos/LGT0017FO/LGT0017FO_9.jpg" },
    { nombre: "LGT0018FO.jpg", tipo: "imagen", url: "planos/LGT0018FO/LGT0018FO.jpg" },
    { nombre: "LGT0018FO_1.jpg", tipo: "imagen", url: "planos/LGT0018FO/LGT0018FO_1.jpg" },
    { nombre: "LGT0018FO_2.jpg", tipo: "imagen", url: "planos/LGT0018FO/LGT0018FO_2.jpg" },
    { nombre: "LGT0018FO_3.jpg", tipo: "imagen", url: "planos/LGT0018FO/LGT0018FO_3.jpg" },
    { nombre: "LGT0019FO.pdf", tipo: "pdf", url: "planos/LGT0019FO.pdf" },
    { nombre: "LGT0020FO PLANIM.pdf", tipo: "pdf", url: "planos/LGT0020FO PLANIM.pdf" },
    { nombre: "PBU0005FO SEC BB FTTH ADIC 2021 PLANIM.pdf", tipo: "pdf", url: "planos/PBU0005FO SEC BB FTTH ADIC 2021 PLANIM.pdf" },
    { nombre: "QEE0006FO.jpg", tipo: "imagen", url: "planos/QEE0006FO/QEE0006FO.jpg" },
    { nombre: "QEE0012FO LOS FRESNOS SEC BB FTTH ADIC 2021.pdf", tipo: "pdf", url: "planos/QEE0012FO LOS FRESNOS SEC BB FTTH ADIC 2021.pdf" },
    { nombre: "QEE0016FO CONST.pdf", tipo: "pdf", url: "planos/QEE0016FO CONST.pdf" },
    { nombre: "QEE0019FO.jpg", tipo: "imagen", url: "planos/QEE0019FO/QEE0019FO.jpg" },
    { nombre: "QEE0020FO.jpg", tipo: "imagen", url: "planos/QEE0020FO/QEE0020FO.jpg" },
    { nombre: "QEE0020FO_1.jpg", tipo: "imagen", url: "planos/QEE0020FO/QEE0020FO_1.jpg" },
    { nombre: "QEE0022FO.jpg", tipo: "imagen", url: "planos/QEE0022FO/QEE0022FO.jpg" },
    { nombre: "QEE0022FO_1.jpg", tipo: "imagen", url: "planos/QEE0022FO/QEE0022FO_1.jpg" },
    { nombre: "QEE0022FO_2.jpg", tipo: "imagen", url: "planos/QEE0022FO/QEE0022FO_2.jpg" },
    { nombre: "QEE0022FO_3.jpg", tipo: "imagen", url: "planos/QEE0022FO/QEE0022FO_3.jpg" },
    { nombre: "QEE0022FO_4.jpg", tipo: "imagen", url: "planos/QEE0022FO/QEE0022FO_4.jpg" },
    { nombre: "QEE0022FO_5.jpg", tipo: "imagen", url: "planos/QEE0022FO/QEE0022FO_5.jpg" },
    { nombre: "QEE0024 RINCON I PLANIM Y DIAGRAMA ND.pdf", tipo: "pdf", url: "planos/QEE0024 RINCON I PLANIM Y DIAGRAMA ND.pdf" },
    { nombre: "QEE0025FOD1-FOD4 N24 2021 PLANIM.pdf", tipo: "pdf", url: "planos/QEE0025FOD1-FOD4 N24 2021 PLANIM.pdf" },
    { nombre: "QEE0026FO PLANIMETRIA.pdf", tipo: "pdf", url: "planos/QEE0026FO PLANIMETRIA.pdf" },
    { nombre: "QEE0027-planimetría.pdf", tipo: "pdf", url: "planos/QEE0027-planimetría.pdf" },
    { nombre: "QEE0028FO CONST.pdf", tipo: "pdf", url: "planos/QEE0028FO CONST.pdf" },
    { nombre: "QEE0030-2021.pdf", tipo: "pdf", url: "planos/QEE0030-2021.pdf" },
    { nombre: "QEE0030-2024 CONST .pdf", tipo: "pdf", url: "planos/QEE0030-2024 CONST .pdf" },
    { nombre: "QEE0031 PLANIMETRIA  PUNTA DORADA FTTH.pdf", tipo: "pdf", url: "planos/QEE0031 PLANIMETRIA  PUNTA DORADA FTTH.pdf" },
    { nombre: "QEE0033 CONS H2.pdf", tipo: "pdf", url: "planos/QEE0033 CONS H2.pdf" },
    { nombre: "QEE0034FO_1.jpg", tipo: "imagen", url: "planos/QEE0034FO/QEE0034FO_1.jpg" },
    { nombre: "QEE0034FO .jpg", tipo: "imagen", url: "planos/QEE0034FO/QEE0034FO .jpg" },
    { nombre: "RRA0035FO.jpg", tipo: "imagen", url: "planos/RRA0035FO/RRA0035FO.jpg" },
    { nombre: "RRA0050 ND SF VALTICA.pdf", tipo: "pdf", url: "planos/RRA0050 ND SF VALTICA.pdf" },
    { nombre: "RZP0003FO SEC BB FTTH ADIC 2021 PLANIM.pdf", tipo: "pdf", url: "planos/RZP0003FO SEC BB FTTH ADIC 2021 PLANIM.pdf" },
    { nombre: "RZP0003FO.jpg", tipo: "imagen", url: "planos/RZP0003FO/RZP0003FO.jpg" },
    { nombre: "RZP0003FO_1.jpg", tipo: "imagen", url: "planos/RZP0003FO/RZP0003FO_1.jpg" },
    { nombre: "RZP0005 PLANIMETRIA.pdf", tipo: "pdf", url: "planos/RZP0005 PLANIMETRIA.pdf" },
    { nombre: "RZP0005FO DIRAGRAMA.pdf", tipo: "pdf", url: "planos/RZP0005FO DIRAGRAMA.pdf" },
    { nombre: "RZP0012FO CONTS 1.pdf", tipo: "pdf", url: "planos/RZP0012FO CONTS 1.pdf" },
    { nombre: "RZP0012FO.jpg", tipo: "imagen", url: "planos/RZP0012FO/RZP0012FO.jpg" },
    { nombre: "RZP0012FO_1.jpg", tipo: "imagen", url: "planos/RZP0012FO/RZP0012FO_1.jpg" },
    { nombre: "RZP0012FO_2.jpg", tipo: "imagen", url: "planos/RZP0012FO/RZP0012FO_2.jpg" },
    { nombre: "RZP0012FO_3.jpg", tipo: "imagen", url: "planos/RZP0012FO/RZP0012FO_3.jpg" },
    { nombre: "RZP0012FO_4.jpg", tipo: "imagen", url: "planos/RZP0012FO/RZP0012FO_4.jpg" },
    { nombre: "RZP0014FO.pdf", tipo: "pdf", url: "planos/RZP0014FO.pdf" },
    { nombre: "RZP0016 CONST SIGC.pdf", tipo: "pdf", url: "planos/RZP0016 CONST SIGC.pdf" },
    { nombre: "RZP0017FO.pdf", tipo: "pdf", url: "planos/RZP0017FO.pdf" },
    { nombre: "RZP0017FO_1.pdf", tipo: "pdf", url: "planos/RZP0017FO_1.pdf" },
    { nombre: "RZP0019FO PLANO PDF.pdf", tipo: "pdf", url: "planos/RZP0019FO PLANO PDF.pdf" },
    { nombre: "RZP0020 pLA.pdf", tipo: "pdf", url: "planos/RZP0020 pLA.pdf" },
    { nombre: "RZP0020FO.pdf", tipo: "pdf", url: "planos/RZP0020FO.pdf" },
    { nombre: "RZP0032-2021 CONSTRUCCION.pdf", tipo: "pdf", url: "planos/RZP0032-2021 CONSTRUCCION.pdf" },
    { nombre: "SFF0004FO.jpg", tipo: "imagen", url: "planos/SFF0004FO/SFF0004FO.jpg" },
    { nombre: "SFF0004FO_1.jpg", tipo: "imagen", url: "planos/SFF0004FO/SFF0004FO_1.jpg" },
    { nombre: "SFF0004FO_2.jpg", tipo: "imagen", url: "planos/SFF0004FO/SFF0004FO_2.jpg" },
    { nombre: "SFF0007FO N24 H1.pdf", tipo: "pdf", url: "planos/SFF0007FO N24 H1.pdf" },
    { nombre: "SFF0007FO N24 H2.pdf", tipo: "pdf", url: "planos/SFF0007FO N24 H2.pdf" },
    { nombre: "SFF0007FO.jpg", tipo: "imagen", url: "planos/SFF0007FO/SFF0007FO.jpg" },
    { nombre: "SFF0007FO.pdf", tipo: "pdf", url: "planos/SFF0007FO.pdf" },
    { nombre: "SFF0007FO_1.jpg", tipo: "imagen", url: "planos/SFF0007FO/SFF0007FO_1.jpg" },
    { nombre: "SFF0007FO_2.jpg", tipo: "imagen", url: "planos/SFF0007FO/SFF0007FO_2.jpg" },
    { nombre: "SFF0007FO_3.jpg", tipo: "imagen", url: "planos/SFF0007FO/SFF0007FO_3.jpg" },
    { nombre: "SFS0006FO  RECORRIDOS-Model.pdf", tipo: "pdf", url: "planos/SFS0006FO  RECORRIDOS-Model.pdf" },
    { nombre: "TJS0032FO.jpg", tipo: "imagen", url: "planos/TJS0032FO/TJS0032FO.jpg" },
    { nombre: "TJS0032FO_1.jpg", tipo: "imagen", url: "planos/TJS0032FO/TJS0032FO_1.jpg" },
    { nombre: "TJS0033FO.jpg", tipo: "imagen", url: "planos/TJS0033FO/TJS0033FO.jpg" },
    { nombre: "TJS0033FO_1.jpg", tipo: "imagen", url: "planos/TJS0033FO/TJS0033FO_1.jpg" },
    { nombre: "TJS0036-CONST 1 (1).pdf", tipo: "pdf", url: "planos/TJS0036-CONST 1 (1).pdf" },
    { nombre: "TJS0036FO.pdf", tipo: "pdf", url: "planos/TJS0036FO.pdf" },
    { nombre: "TJS0037FO.jpg", tipo: "imagen", url: "planos/TJS0037FO/TJS0037FO.jpg" },
    { nombre: "TJS0037FO_1.jpg", tipo: "imagen", url: "planos/TJS0037FO/TJS0037FO_1.jpg" },
    { nombre: "TJS0037FO_2.jpg", tipo: "imagen", url: "planos/TJS0037FO/TJS0037FO_2.jpg" },
    { nombre: "TJS0038_250609_132936.pdf", tipo: "pdf", url: "planos/TJS0038_250609_132936.pdf" },
    { nombre: "TJS0038FO.pdf", tipo: "pdf", url: "planos/TJS0038FO.pdf" },
    { nombre: "TJS0038FO_1.jpg", tipo: "imagen", url: "planos/TJS0038FO/TJS0038FO_1.jpg" },
    { nombre: "TJS0038FO_2.jpg", tipo: "imagen", url: "planos/TJS0038FO/TJS0038FO_2.jpg" },
    { nombre: "TJS0038FO_3.jpg", tipo: "imagen", url: "planos/TJS0038FO/TJS0038FO_3.jpg" },
    { nombre: "TJS0038FO .jpg", tipo: "imagen", url: "planos/TJS0038FO/TJS0038FO .jpg" },
    { nombre: "TJS38_250609_133002.pdf", tipo: "pdf", url: "planos/TJS38_250609_133002.pdf" },
    { nombre: "TSD0003FO.jpg", tipo: "imagen", url: "planos/TSD0003FO/TSD0003FO.jpg" },
    { nombre: "TSD0003FO_1.jpg", tipo: "imagen", url: "planos/TSD0003FO/TSD0003FO_1.jpg" },
    { nombre: "TSD0004 DWG-Modelo (1).pdf", tipo: "pdf", url: "planos/TSD0004 DWG-Modelo (1).pdf" },
    { nombre: "TSD0004 DWG-Modelo.pdf", tipo: "pdf", url: "planos/TSD0004 DWG-Modelo.pdf" },
    { nombre: "TSD0004FO.jpg", tipo: "imagen", url: "planos/TSD0004FO/TSD0004FO.jpg" },
    { nombre: "TSD0004FO_1.jpg", tipo: "imagen", url: "planos/TSD0004FO/TSD0004FO_1.jpg" },
    { nombre: "UDP0004FO C2112A0102DI.pdf", tipo: "pdf", url: "planos/UDP0004FO C2112A0102DI.pdf" },
    { nombre: "UDP0005_PLANIMETRIA_HOJA1_2015_LIQ.pdf", tipo: "pdf", url: "planos/UDP0005_PLANIMETRIA_HOJA1_2015_LIQ.pdf" },
    { nombre: "UDP0005_PLANIMETRIA_HOJA2_2015_LIQ.pdf", tipo: "pdf", url: "planos/UDP0005_PLANIMETRIA_HOJA2_2015_LIQ.pdf" },
    { nombre: "UDP0005_PLANIMETRIA_HOJA2_2015_LIQ_1.pdf", tipo: "pdf", url: "planos/UDP0005_PLANIMETRIA_HOJA2_2015_LIQ_1.pdf" },
    { nombre: "UDP0005FO.pdf", tipo: "pdf", url: "planos/UDP0005FO.pdf" },
    { nombre: "UTO0016 Planimetría FTTH.pdf", tipo: "pdf", url: "planos/UTO0016 Planimetría FTTH.pdf" },
    { nombre: "UTO0016 Planimetría FTTH_1.pdf", tipo: "pdf", url: "planos/UTO0016 Planimetría FTTH_1.pdf" },
    { nombre: "UTO0017FO CONST_051314.pdf", tipo: "pdf", url: "planos/UTO0017FO CONST_051314.pdf" },
    { nombre: "UTO0021FO_C_ND CLAUSTRO.pdf", tipo: "pdf", url: "planos/UTO0021FO_C_ND CLAUSTRO.pdf" },
    { nombre: "UVD0012FO BB FTTH 2022 PLANIM Y DIAGRAMA.pdf", tipo: "pdf", url: "planos/UVD0012FO BB FTTH 2022 PLANIM Y DIAGRAMA.pdf" },
    { nombre: "UVD0017 TORRE PLAZA BOSQUES COMPLETO FTTH RED SEC.pdf", tipo: "pdf", url: "planos/UVD0017 TORRE PLAZA BOSQUES COMPLETO FTTH RED SEC.pdf" },
    { nombre: "UVD0037FO.pdf", tipo: "pdf", url: "planos/UVD0037FO.pdf" },
    { nombre: "VID0101FO.jpg", tipo: "imagen", url: "planos/VID0101FO/VID0101FO.jpg" },
    { nombre: "VID0101FO_1.jpg", tipo: "imagen", url: "planos/VID0101FO/VID0101FO_1.jpg" },
    { nombre: "VII0037-CONSTRUCCIÓN.pdf", tipo: "pdf", url: "planos/VII0037-CONSTRUCCIÓN.pdf" },
    { nombre: "VII0051FFTH CONST 04 ENE 18 JPG.pdf", tipo: "pdf", url: "planos/VII0051FFTH CONST 04 ENE 18 JPG.pdf" },
    { nombre: "VII0051FFTH DIAG 04 ENE 18 JPG.pdf", tipo: "pdf", url: "planos/VII0051FFTH DIAG 04 ENE 18 JPG.pdf" },
    { nombre: "VII0070FO_.jpg", tipo: "imagen", url: "planos/VII0070FO/VII0070FO_.jpg" },
    { nombre: "VII0070FO_1.jpg", tipo: "imagen", url: "planos/VII0070FO/VII0070FO_1.jpg" },
    { nombre: "VII0070FO_2.jpg", tipo: "imagen", url: "planos/VII0070FO/VII0070FO_2.jpg" },
    { nombre: "VII0075FO SF NUEVA STACIA-Model.pdf", tipo: "pdf", url: "planos/VII0075FO SF NUEVA STACIA-Model.pdf" },
    { nombre: "VII0077FO IDATA SHEL FOA1 RED SEC FTTH PLANO PDF.pdf", tipo: "pdf", url: "planos/VII0077FO IDATA SHEL FOA1 RED SEC FTTH PLANO PDF.pdf" },
    { nombre: "VRI0001FO.jpg", tipo: "imagen", url: "planos/VRI0001FO/VRI0001FO.jpg" },
    { nombre: "VRI0001FO_1.jpg", tipo: "imagen", url: "planos/VRI0001FO/VRI0001FO_1.jpg" },
    { nombre: "VRI0004 FTTH ZONA VERDE BOSQUE SERENO.pdf", tipo: "pdf", url: "planos/VRI0004 FTTH ZONA VERDE BOSQUE SERENO.pdf" },
    { nombre: "VRI0005FO planimetria2.pdf", tipo: "pdf", url: "planos/VRI0005FO planimetria2.pdf" }
];


function cargarArchivosCarpeta(carpeta) {
    const listaArchivos = document.getElementById('lista-archivos');
    const previewContainer = document.getElementById('preview-container');
    const btnDescargar = document.getElementById('btn-descargar');
    const btnAbrir = document.getElementById('btn-abrir');
    
    if (carpeta === 'planos') {
        archivosCargados = archivosPlanos;
        
        if (archivosCargados.length === 0) {
            listaArchivos.innerHTML = '<p>No hay archivos en esta carpeta.</p>';
            previewContainer.innerHTML = '<p>No hay archivos para previsualizar.</p>';
            btnDescargar.disabled = true;
            btnAbrir.disabled = true;
            return;
        }
        
        let html = '<div class="file-list-container">';
        archivosCargados.forEach((archivo, index) => {
            const icono = obtenerIconoArchivo(archivo.tipo);
            html += `
                <div class="file-item" onclick="seleccionarArchivo(${index})">
                    <div class="file-icon">${icono}</div>
                    <div class="file-name">${archivo.nombre}</div>
                </div>
            `;
        });
        html += '</div>';
        
        listaArchivos.innerHTML = html;
        previewContainer.innerHTML = '<p>Selecciona un archivo para previsualizarlo</p>';
        btnDescargar.disabled = true;
        btnAbrir.disabled = true;
    } else {
        listaArchivos.innerHTML = '<p>Selecciona una carpeta para ver los archivos</p>';
        previewContainer.innerHTML = '<p>Selecciona un archivo para previsualizarlo</p>';
        btnDescargar.disabled = true;
        btnAbrir.disabled = true;
    }
}

function obtenerIconoArchivo(tipo) {
    const iconos = {
        'pdf': '📄',
        'imagen': '🖼️',
        'dwg': '📐',
        'doc': '📝',
        'xls': '📊',
        'default': '📁'
    };
    return iconos[tipo] || iconos.default;
}

function seleccionarArchivo(index) {
    archivoSeleccionado = archivosCargados[index];
    
    // Remover selección anterior
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Agregar selección actual
    document.querySelectorAll('.file-item')[index].classList.add('selected');
    
    // Habilitar botones
    document.getElementById('btn-descargar').disabled = false;
    document.getElementById('btn-abrir').disabled = false;
    
    // Mostrar preview
    mostrarPreview(archivoSeleccionado);
}

function mostrarPreview(archivo) {
    const previewContainer = document.getElementById('preview-container');
    
    let previewHTML = `
        <div class="preview-header">
            <h4>${archivo.nombre}</h4>
            <div class="file-info">
                <span>Tipo: ${archivo.tipo.toUpperCase()}</span>
            </div>
        </div>
    `;
    
    if (archivo.tipo === 'pdf') {
        previewHTML += `
            <div class="preview-content">
                <iframe src="${archivo.url}" width="100%" height="500px"></iframe>
            </div>
        `;
    } else if (archivo.tipo === 'imagen') {
        previewHTML += `
            <div class="preview-content">
                <img src="${archivo.url}" alt="${archivo.nombre}" style="max-width: 100%; max-height: 500px;">
            </div>
        `;
    } else {
        previewHTML += `
            <div class="preview-content">
                <div class="no-preview">
                    <p>🔍 Vista previa no disponible para archivos .${archivo.tipo}</p>
                    <p>Puedes descargar el archivo para verlo.</p>
                </div>
            </div>
        `;
    }
    
    previewContainer.innerHTML = previewHTML;
}

function descargarArchivoActual() {
    if (!archivoSeleccionado) return;
    
    const link = document.createElement('a');
    link.href = archivoSeleccionado.url;
    link.download = archivoSeleccionado.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function abrirArchivoNuevaPestana() {
    if (!archivoSeleccionado) return;
    window.open(archivoSeleccionado.url, '_blank');
}

function filtrarArchivos() {
    const busqueda = document.getElementById('buscar-archivo').value.toLowerCase();
    const fileItems = document.querySelectorAll('.file-item');
    
    fileItems.forEach(item => {
        const fileName = item.querySelector('.file-name').textContent.toLowerCase();
        if (fileName.includes(busqueda)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar fecha por defecto en filtros si existen
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('#ffth-desde, #ffth-hasta, #cobre-desde, #cobre-hasta').forEach(input => {
        if (input && !input.value) {
            input.value = today;
        }
    });
});