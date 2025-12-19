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
    { nombre: "CQL0014FO.jpg", tipo: "imagen", url: "planos/CQL0014FO /CQL0014FO.jpg" },
    { nombre: "CQL0014FO_1.jpg", tipo: "imagen", url: "planos/CQL0014FO /CQL0014FO_1.jpg" },
    { nombre: "DCT0024 1.PDF", tipo: "pdf", url: "planos/DCT0024 1.PDF" },
    { nombre: "DCT0024 2.PDF", tipo: "pdf", url: "planos/DCT0024 2.PDF" },
    { nombre: "FLV0010FO.PDF", tipo: "pdf", url: "planos/FLV0010FO.PDF" },
    { nombre: "FLV0013FO-Model.pdf", tipo: "pdf", url: "planos/FLV0013FO-Model.pdf" },
    { nombre: "FLV0015FO.jpg", tipo: "imagen", url: "planos/FLV0015FO /FLV0015FO.jpg" },
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
    { nombre: "LGT0017FO.jpg", tipo: "imagen", url: "planos/LGT0017FO /LGT0017FO.jpg" },
    { nombre: "LGT0017FO.pdf", tipo: "pdf", url: "planos/LGT0017FO.pdf" },
    { nombre: "LGT0017FO_1.jpg", tipo: "imagen", url: "planos/LGT0017FO /LGT0017FO_1.jpg" },
    { nombre: "LGT0017FO_2.jpg", tipo: "imagen", url: "planos/LGT0017FO /LGT0017FO_2.jpg" },
    { nombre: "LGT0017FO_3.jpg", tipo: "imagen", url: "planos/LGT0017FO /LGT0017FO_3.jpg" },
    { nombre: "LGT0017FO_4.jpg", tipo: "imagen", url: "planos/LGT0017FO /LGT0017FO_4.jpg" },
    { nombre: "LGT0017FO_5.jpg", tipo: "imagen", url: "planos/LGT0017FO /LGT0017FO_5.jpg" },
    { nombre: "LGT0017FO_6.jpg", tipo: "imagen", url: "planos/LGT0017FO /LGT0017FO_6.jpg" },
    { nombre: "LGT0017FO_7.jpg", tipo: "imagen", url: "planos/LGT0017FO /LGT0017FO_7.jpg" },
    { nombre: "LGT0017FO_8.jpg", tipo: "imagen", url: "planos/LGT0017FO /LGT0017FO_8.jpg" },
    { nombre: "LGT0017FO_9.jpg", tipo: "imagen", url: "planos/LGT0017FO /LGT0017FO_9.jpg" },
    { nombre: "LGT0018FO.jpg", tipo: "imagen", url: "planos/LGT0018FO /LGT0018FO.jpg" },
    { nombre: "LGT0018FO_1.jpg", tipo: "imagen", url: "planos/LGT0018FO /LGT0018FO_1.jpg" },
    { nombre: "LGT0018FO_2.jpg", tipo: "imagen", url: "planos/LGT0018FO /LGT0018FO_2.jpg" },
    { nombre: "LGT0018FO_3.jpg", tipo: "imagen", url: "planos/LGT0018FO /LGT0018FO_3.jpg" },
    { nombre: "LGT0019FO.pdf", tipo: "pdf", url: "planos/LGT0019FO.pdf" },
    { nombre: "LGT0020FO PLANIM.pdf", tipo: "pdf", url: "planos/LGT0020FO PLANIM.pdf" },
    { nombre: "PBU0005FO SEC BB FTTH ADIC 2021 PLANIM.pdf", tipo: "pdf", url: "planos/PBU0005FO SEC BB FTTH ADIC 2021 PLANIM.pdf" },
    { nombre: "QEE0006FO.jpg", tipo: "imagen", url: "planos/QEE0006FO/QEE0006FO.jpg" },
    { nombre: "QEE0012FO LOS FRESNOS SEC BB FTTH ADIC 2021.pdf", tipo: "pdf", url: "planos/QEE0012FO LOS FRESNOS SEC BB FTTH ADIC 2021.pdf" },
    { nombre: "QEE0016FO CONST.pdf", tipo: "pdf", url: "planos/QEE0016FO CONST.pdf" },
    { nombre: "QEE0019FO.jpg", tipo: "imagen", url: "planos/QEE0019FO /QEE0019FO.jpg" },
    { nombre: "QEE0020FO.jpg", tipo: "imagen", url: "planos/QEE0020FO /QEE0020FO.jpg" },
    { nombre: "QEE0020FO_1.jpg", tipo: "imagen", url: "planos/QEE0020FO /QEE0020FO_1.jpg" },
    { nombre: "QEE0022FO.jpg", tipo: "imagen", url: "planos/QEE0022FO /QEE0022FO.jpg" },
    { nombre: "QEE0022FO_1.jpg", tipo: "imagen", url: "planos/QEE0022FO /QEE0022FO_1.jpg" },
    { nombre: "QEE0022FO_2.jpg", tipo: "imagen", url: "planos/QEE0022FO /QEE0022FO_2.jpg" },
    { nombre: "QEE0022FO_3.jpg", tipo: "imagen", url: "planos/QEE0022FO /QEE0022FO_3.jpg" },
    { nombre: "QEE0022FO_4.jpg", tipo: "imagen", url: "planos/QEE0022FO /QEE0022FO_4.jpg" },
    { nombre: "QEE0022FO_5.jpg", tipo: "imagen", url: "planos/QEE0022FO /QEE0022FO_5.jpg" },
    { nombre: "QEE0024 RINCON I PLANIM Y DIAGRAMA ND.pdf", tipo: "pdf", url: "planos/QEE0024 RINCON I PLANIM Y DIAGRAMA ND.pdf" },
    { nombre: "QEE0025FOD1-FOD4 N24 2021 PLANIM.pdf", tipo: "pdf", url: "planos/QEE0025FOD1-FOD4 N24 2021 PLANIM.pdf" },
    { nombre: "QEE0026FO PLANIMETRIA.pdf", tipo: "pdf", url: "planos/QEE0026FO PLANIMETRIA.pdf" },
    { nombre: "QEE0027-planimetría.pdf", tipo: "pdf", url: "planos/QEE0027-planimetría.pdf" },
    { nombre: "QEE0028FO CONST.pdf", tipo: "pdf", url: "planos/QEE0028FO CONST.pdf" },
    { nombre: "QEE0030-2021.pdf", tipo: "pdf", url: "planos/QEE0030-2021.pdf" },
    { nombre: "QEE0030-2024 CONST .pdf", tipo: "pdf", url: "planos/QEE0030-2024 CONST .pdf" },
    { nombre: "QEE0031 PLANIMETRIA  PUNTA DORADA FTTH.pdf", tipo: "pdf", url: "planos/QEE0031 PLANIMETRIA  PUNTA DORADA FTTH.pdf" },
    { nombre: "QEE0033 CONS H2.pdf", tipo: "pdf", url: "planos/QEE0033 CONS H2.pdf" },
    { nombre: "QEE0034FO_1.jpg", tipo: "imagen", url: "planos/QEE0034FO /QEE0034FO_1.jpg" },
    { nombre: "QEE0034FO .jpg", tipo: "imagen", url: "planos/QEE0034FO /QEE0034FO .jpg" },
    { nombre: "RRA0035FO.jpg", tipo: "imagen", url: "planos/RRA0035FO /RRA0035FO.jpg" },
    { nombre: "RRA0050 ND SF VALTICA.pdf", tipo: "pdf", url: "planos/RRA0050 ND SF VALTICA.pdf" },
    { nombre: "RZP0003FO SEC BB FTTH ADIC 2021 PLANIM.pdf", tipo: "pdf", url: "planos/RZP0003FO SEC BB FTTH ADIC 2021 PLANIM.pdf" },
    { nombre: "RZP0003FO.jpg", tipo: "imagen", url: "planos/RZP0003FO /RZP0003FO.jpg" },
    { nombre: "RZP0003FO_1.jpg", tipo: "imagen", url: "planos/RZP0003FO /RZP0003FO_1.jpg" },
    { nombre: "RZP0005 PLANIMETRIA.pdf", tipo: "pdf", url: "planos/RZP0005 PLANIMETRIA.pdf" },
    { nombre: "RZP0005FO DIRAGRAMA.pdf", tipo: "pdf", url: "planos/RZP0005FO DIRAGRAMA.pdf" },
    { nombre: "RZP0012FO CONTS 1.pdf", tipo: "pdf", url: "planos/RZP0012FO CONTS 1.pdf" },
    { nombre: "RZP0012FO.jpg", tipo: "imagen", url: "planos/RZP0012FO /RZP0012FO.jpg" },
    { nombre: "RZP0012FO_1.jpg", tipo: "imagen", url: "planos/RZP0012FO /RZP0012FO_1.jpg" },
    { nombre: "RZP0012FO_2.jpg", tipo: "imagen", url: "planos/RZP0012FO /RZP0012FO_2.jpg" },
    { nombre: "RZP0012FO_3.jpg", tipo: "imagen", url: "planos/RZP0012FO /RZP0012FO_3.jpg" },
    { nombre: "RZP0012FO_4.jpg", tipo: "imagen", url: "planos/RZP0012FO /RZP0012FO_4.jpg" },
    { nombre: "RZP0014FO.pdf", tipo: "pdf", url: "planos/RZP0014FO.pdf" },
    { nombre: "RZP0016 CONST SIGC.pdf", tipo: "pdf", url: "planos/RZP0016 CONST SIGC.pdf" },
    { nombre: "RZP0017FO.pdf", tipo: "pdf", url: "planos/RZP0017FO.pdf" },
    { nombre: "RZP0017FO_1.pdf", tipo: "pdf", url: "planos/RZP0017FO_1.pdf" },
    { nombre: "RZP0019FO PLANO PDF.pdf", tipo: "pdf", url: "planos/RZP0019FO PLANO PDF.pdf" },
    { nombre: "RZP0020 pLA.pdf", tipo: "pdf", url: "planos/RZP0020 pLA.pdf" },
    { nombre: "RZP0020FO.pdf", tipo: "pdf", url: "planos/RZP0020FO.pdf" },
    { nombre: "RZP0025FTTH CONST.pdf", tipo: "pdf", url: "planos/RZP0025FTTH CONST.pdf" },
    { nombre: "RZP0032-2021 CONSTRUCCION.pdf", tipo: "pdf", url: "planos/RZP0032-2021 CONSTRUCCION.pdf" },
    { nombre: "RZP0034 C2412A0102DI.pdf", tipo: "pdf", url: "planos/RZP0034 C2412A0102DI.pdf" },
    { nombre: "SFF0004FO.jpg", tipo: "imagen", url: "planos/SFF0004FO /SFF0004FO.jpg" },
    { nombre: "SFF0004FO_1.jpg", tipo: "imagen", url: "planos/SFF0004FO /SFF0004FO_1.jpg" },
    { nombre: "SFF0004FO_2.jpg", tipo: "imagen", url: "planos/SFF0004FO /SFF0004FO_2.jpg" },
    { nombre: "SFF0007FO N24 H1.pdf", tipo: "pdf", url: "planos/SFF0007FO N24 H1.pdf" },
    { nombre: "SFF0007FO N24 H2.pdf", tipo: "pdf", url: "planos/SFF0007FO N24 H2.pdf" },
    { nombre: "SFF0007FO.jpg", tipo: "imagen", url: "planos/SFF0007FO /SFF0007FO.jpg" },
    { nombre: "SFF0007FO.pdf", tipo: "pdf", url: "planos/SFF0007FO.pdf" },
    { nombre: "SFF0007FO_1.jpg", tipo: "imagen", url: "planos/SFF0007FO /SFF0007FO_1.jpg" },
    { nombre: "SFF0007FO_2.jpg", tipo: "imagen", url: "planos/SFF0007FO /SFF0007FO_2.jpg" },
    { nombre: "SFF0007FO_3.jpg", tipo: "imagen", url: "planos/SFF0007FO /SFF0007FO_3.jpg" },
    { nombre: "SFS0006FO  RECORRIDOS-Model.pdf", tipo: "pdf", url: "planos/SFS0006FO  RECORRIDOS-Model.pdf" },
    { nombre: "TERRALTA 1 CANAL SUB POSTE.pdf", tipo: "pdf", url: "planos/TERRALTA 1 CANAL SUB POSTE.pdf" },
    { nombre: "TERRALTA Plano Esquematico.pdf", tipo: "pdf", url: "planos/TERRALTA Plano Esquematico.pdf" },
    { nombre: "TERRALTA Plano PPAL.pdf", tipo: "pdf", url: "planos/TERRALTA Plano PPAL.pdf" },
    { nombre: "TJS0032FO.jpg", tipo: "imagen", url: "planos/TJS0032FO /TJS0032FO.jpg" },
    { nombre: "TJS0032FO_1.jpg", tipo: "imagen", url: "planos/TJS0032FO /TJS0032FO_1.jpg" },
    { nombre: "TJS0033FO.jpg", tipo: "imagen", url: "planos/TJS0033FO /TJS0033FO.jpg" },
    { nombre: "TJS0033FO_1.jpg", tipo: "imagen", url: "planos/TJS0033FO /TJS0033FO_1.jpg" },
    { nombre: "TJS0036-CONST 1 (1).pdf", tipo: "pdf", url: "planos/TJS0036-CONST 1 (1).pdf" },
    { nombre: "TJS0036FO.pdf", tipo: "pdf", url: "planos/TJS0036FO.pdf" },
    { nombre: "TJS0037FO.jpg", tipo: "imagen", url: "planos/TJS0037FO /TJS0037FO.jpg" },
    { nombre: "TJS0037FO_1.jpg", tipo: "imagen", url: "planos/TJS0037FO /TJS0037FO_1.jpg" },
    { nombre: "TJS0037FO_2.jpg", tipo: "imagen", url: "planos/TJS0037FO /TJS0037FO_2.jpg" },
    { nombre: "TJS0038_250609_132936.pdf", tipo: "pdf", url: "planos/TJS0038_250609_132936.pdf" },
    { nombre: "TJS0038FO.pdf", tipo: "pdf", url: "planos/TJS0038FO.pdf" },
    { nombre: "TJS0038FO_1.jpg", tipo: "imagen", url: "planos/TJS0038FO /TJS0038FO_1.jpg" },
    { nombre: "TJS0038FO_2.jpg", tipo: "imagen", url: "planos/TJS0038FO /TJS0038FO_2.jpg" },
    { nombre: "TJS0038FO_3.jpg", tipo: "imagen", url: "planos/TJS0038FO /TJS0038FO_3.jpg" },
    { nombre: "TJS0038FO .jpg", tipo: "imagen", url: "planos/TJS0038FO /TJS0038FO .jpg" },
    { nombre: "TJS38_250609_133002.pdf", tipo: "pdf", url: "planos/TJS38_250609_133002.pdf" },
    { nombre: "TSD0003FO.jpg", tipo: "imagen", url: "planos/TSD0003FO /TSD0003FO.jpg" },
    { nombre: "TSD0003FO_1.jpg", tipo: "imagen", url: "planos/TSD0003FO /TSD0003FO_1.jpg" },
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
    { nombre: "VID0101FO.jpg", tipo: "imagen", url: "planos/VID0101FO /VID0101FO.jpg" },
    { nombre: "VID0101FO_1.jpg", tipo: "imagen", url: "planos/VID0101FO /VID0101FO_1.jpg" },
    { nombre: "VII0037-CONSTRUCCIÓN.pdf", tipo: "pdf", url: "planos/VII0037-CONSTRUCCIÓN.pdf" },
    { nombre: "VII0051FFTH CONST 04 ENE 18 JPG.pdf", tipo: "pdf", url: "planos/VII0051FFTH CONST 04 ENE 18 JPG.pdf" },
    { nombre: "VII0051FFTH DIAG 04 ENE 18 JPG.pdf", tipo: "pdf", url: "planos/VII0051FFTH DIAG 04 ENE 18 JPG.pdf" },
    { nombre: "VII0070FO_.jpg", tipo: "imagen", url: "planos/VII0070FO /VII0070FO_.jpg" },
    { nombre: "VII0070FO_1.jpg", tipo: "imagen", url: "planos/VII0070FO /VII0070FO_1.jpg" },
    { nombre: "VII0070FO_2.jpg", tipo: "imagen", url: "planos/VII0070FO /VII0070FO_2.jpg" },
    { nombre: "VII0075FO SF NUEVA STACIA-Model.pdf", tipo: "pdf", url: "planos/VII0075FO SF NUEVA STACIA-Model.pdf" },
    { nombre: "VII0077FO IDATA SHEL FOA1 RED SEC FTTH PLANO PDF.pdf", tipo: "pdf", url: "planos/VII0077FO IDATA SHEL FOA1 RED SEC FTTH PLANO PDF.pdf" },
    { nombre: "VRI0001FO.jpg", tipo: "imagen", url: "planos/VRI0001FO /VRI0001FO.jpg" },
    { nombre: "VRI0001FO_1.jpg", tipo: "imagen", url: "planos/VRI0001FO /VRI0001FO_1.jpg" },
    { nombre: "VRI0004 FTTH ZONA VERDE BOSQUE SERENO.pdf", tipo: "pdf", url: "planos/VRI0004 FTTH ZONA VERDE BOSQUE SERENO.pdf" },
    { nombre: "VRI0005FO planimetria2.pdf", tipo: "pdf", url: "planos/VRI0005FO planimetria2.pdf" }
];


const archivosTecnicos = [
    { nombre: "Manual_Técnico_Instalación.pdf", tipo: "pdf", url: "documentos/Manual_Técnico_Instalación.pdf", tamaño: "8.2 MB", fecha: "2025-01-10" },
    { nombre: "Especificaciones_Técnicas.docx", tipo: "doc", url: "documentos/Especificaciones_Técnicas.docx", tamaño: "1.5 MB", fecha: "2025-01-08" },
    { nombre: "Protocolos_Seguridad.pdf", tipo: "pdf", url: "documentos/Protocolos_Seguridad.pdf", tamaño: "3.4 MB", fecha: "2025-01-05" },
    { nombre: "Checklist_Instalación.xlsx", tipo: "xls", url: "documentos/Checklist_Instalación.xlsx", tamaño: "0.8 MB", fecha: "2025-01-03" }
];

const archivosDocumentos = [
    { nombre: "Contrato_Servicio.pdf", tipo: "pdf", url: "documentos/Contrato_Servicio.pdf", tamaño: "2.1 MB", fecha: "2025-01-12" },
    { nombre: "Políticas_Empresa.docx", tipo: "doc", url: "documentos/Políticas_Empresa.docx", tamaño: "1.8 MB", fecha: "2025-01-10" },
    { nombre: "Formatos_Reporte.zip", tipo: "zip", url: "documentos/Formatos_Reporte.zip", tamaño: "5.3 MB", fecha: "2025-01-08" },
    { nombre: "Plantilla_Informes.docx", tipo: "doc", url: "documentos/Plantilla_Informes.docx", tamaño: "1.2 MB", fecha: "2025-01-05" }
];

function cargarArchivosCarpeta(carpeta) {
    console.log("Cargando archivos de carpeta:", carpeta);
    
    const listaArchivos = document.getElementById('lista-archivos');
    const previewContainer = document.getElementById('preview-container');
    const btnDescargar = document.getElementById('btn-descargar');
    const btnAbrir = document.getElementById('btn-abrir');
    
    // Limpiar selección anterior
    archivoSeleccionado = null;
    
    // Determinar qué archivos cargar según la carpeta seleccionada
    switch(carpeta) {
        case 'planos':
            archivosCargados = archivosPlanos;
            break;
        case 'archivos':
            archivosCargados = archivosTecnicos;
            break;
        case 'documentos':
            archivosCargados = archivosDocumentos;
            break;
        default:
            archivosCargados = [];
    }
    
    if (archivosCargados.length === 0) {
        listaArchivos.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <p class="text-muted">No hay archivos en esta carpeta</p>
            </div>
        `;
        
        previewContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-file-alt fa-4x text-light mb-3"></i>
                <p class="text-light">Selecciona un archivo para previsualizarlo</p>
            </div>
        `;
        
        btnDescargar.disabled = true;
        btnAbrir.disabled = true;
        
        // Limpiar información del archivo
        document.getElementById('file-info-content').innerHTML = `
            <p class="text-muted">No hay archivo seleccionado</p>
        `;
        
        return;
    }
    
    // Mostrar lista de archivos con diseño premium
    let html = '<div class="file-list">';
    archivosCargados.forEach((archivo, index) => {
        const icono = obtenerIconoArchivo(archivo.tipo);
        html += `
            <div class="file-item" onclick="seleccionarArchivo(${index})">
                <div class="file-icon">${icono}</div>
                <div class="file-info">
                    <div class="file-name">${archivo.nombre}</div>
                    <div class="file-details">
                        <span class="file-size">${archivo.tamaño}</span>
                        <span class="file-date">${formatearFecha(archivo.fecha)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    listaArchivos.innerHTML = html;
    
    // Resetear preview
    previewContainer.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-eye fa-4x text-light mb-3"></i>
            <p class="text-light">Selecciona un archivo para previsualizarlo</p>
        </div>
    `;
    
    // Deshabilitar botones
    btnDescargar.disabled = true;
    btnAbrir.disabled = true;
    
    // Aplicar filtro si hay búsqueda activa
    const busqueda = document.getElementById('buscar-archivo').value;
    if (busqueda) {
        filtrarArchivos();
    }
    
    console.log(`${archivosCargados.length} archivos cargados`);
}

function obtenerIconoArchivo(tipo) {
    const iconos = {
        'pdf': '<i class="fas fa-file-pdf text-danger"></i>',
        'imagen': '<i class="fas fa-image text-success"></i>',
        'doc': '<i class="fas fa-file-word text-primary"></i>',
        'xls': '<i class="fas fa-file-excel text-success"></i>',
        'zip': '<i class="fas fa-file-archive text-warning"></i>',
        'dwg': '<i class="fas fa-drafting-compass text-info"></i>'
    };
    
    return iconos[tipo] || '<i class="fas fa-file text-secondary"></i>';
}

function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function seleccionarArchivo(index) {
    if (index < 0 || index >= archivosCargados.length) {
        console.error("Índice de archivo inválido:", index);
        return;
    }
    
    archivoSeleccionado = archivosCargados[index];
    
    // Remover selección anterior
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Agregar selección actual
    const fileItems = document.querySelectorAll('.file-item');
    if (fileItems[index]) {
        fileItems[index].classList.add('selected');
    }
    
    // Habilitar botones
    document.getElementById('btn-descargar').disabled = false;
    document.getElementById('btn-abrir').disabled = false;
    
    // Mostrar información del archivo
    mostrarInfoArchivo(archivoSeleccionado);
    
    // Mostrar vista previa
    mostrarPreview(archivoSeleccionado);
    
    console.log("Archivo seleccionado:", archivoSeleccionado.nombre);

    // Si es admin, agregar botón de eliminar
    if (verificarPermisosAdmin()) {
        const previewContainer = document.getElementById('preview-container');
        const existingDeleteBtn = previewContainer.querySelector('.btn-eliminar-admin');
        
        if (!existingDeleteBtn) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm btn-eliminar-admin';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Eliminar archivo';
            deleteBtn.style.marginTop = '1rem';
            deleteBtn.onclick = function() {
                const carpeta = document.getElementById('carpeta-select').value;
                eliminarArchivoDeGitHub(archivoSeleccionado, carpeta);
            };
            
            const previewFooter = previewContainer.querySelector('.preview-footer');
            if (previewFooter) {
                previewFooter.appendChild(deleteBtn);
            }
        }
    }
}

function mostrarInfoArchivo(archivo) {
    const infoContent = document.getElementById('file-info-content');
    
    const html = `
        <div class="file-info-grid">
            <div class="info-item">
                <span class="info-label"><i class="fas fa-file"></i> Nombre:</span>
                <span class="info-value">${archivo.nombre}</span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-weight"></i> Tamaño:</span>
                <span class="info-value">${archivo.tamaño}</span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-file-alt"></i> Tipo:</span>
                <span class="info-value">${archivo.tipo.toUpperCase()}</span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-calendar"></i> Fecha:</span>
                <span class="info-value">${formatearFecha(archivo.fecha)}</span>
            </div>
            <div class="info-item">
                <span class="info-label"><i class="fas fa-folder"></i> Carpeta:</span>
                <span class="info-value">${document.getElementById('carpeta-select').value}</span>
            </div>
        </div>
    `;
    
    infoContent.innerHTML = html;
}

function mostrarPreview(archivo) {
    const previewContainer = document.getElementById('preview-container');
    
    let contenido = '';
    
    switch(archivo.tipo) {
        case 'pdf':
            contenido = `
                <div class="preview-header">
                    <h5><i class="fas fa-file-pdf text-danger"></i> ${archivo.nombre}</h5>
                    <p class="text-muted">Visualización de PDF</p>
                </div>
                <div class="preview-content">
                    <iframe 
                        src="${archivo.url}" 
                        width="100%" 
                        height="450px" 
                        style="border: 1px solid var(--dark-border); border-radius: var(--radius);"
                        title="Vista previa de ${archivo.nombre}"
                    ></iframe>
                </div>
                <div class="preview-footer">
                    <small class="text-muted">Si no puedes ver el PDF, descárgalo para abrirlo en tu dispositivo.</small>
                </div>
            `;
            break;
            
        case 'imagen':
            contenido = `
                <div class="preview-header">
                    <h5><i class="fas fa-image text-success"></i> ${archivo.nombre}</h5>
                    <p class="text-muted">Visualización de imagen</p>
                </div>
                <div class="preview-content text-center">
                    <img 
                        src="${archivo.url}" 
                        alt="${archivo.nombre}" 
                        class="img-fluid rounded"
                        style="max-height: 450px; max-width: 100%;"
                        onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"300\" viewBox=\"0 0 400 300\"><rect width=\"400\" height=\"300\" fill=\"%23f8f9fa\"/><text x=\"50%\" y=\"50%\" font-family=\"Arial\" font-size=\"16\" fill=\"%236c757d\" text-anchor=\"middle\" dy=\".3em\">Imagen no disponible</text></svg>'"
                    >
                </div>
                <div class="preview-footer">
                    <small class="text-muted">Haz clic derecho en la imagen para guardarla.</small>
                </div>
            `;
            break;
            
        case 'doc':
        case 'xls':
        case 'zip':
        case 'dwg':
            contenido = `
                <div class="preview-header">
                    <h5>${obtenerIconoArchivo(archivo.tipo)} ${archivo.nombre}</h5>
                    <p class="text-muted">Archivo ${archivo.tipo.toUpperCase()}</p>
                </div>
                <div class="preview-content text-center py-5">
                    <div class="preview-placeholder">
                        <div class="placeholder-icon">
                            ${obtenerIconoArchivo(archivo.tipo)}
                        </div>
                        <h5 class="mt-3">Vista previa no disponible</h5>
                        <p class="text-muted">Este tipo de archivo requiere un software específico para visualizarlo.</p>
                        <div class="mt-4">
                            <button onclick="descargarArchivoActual()" class="btn btn-primary">
                                <i class="fas fa-download"></i> Descargar archivo
                            </button>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        default:
            contenido = `
                <div class="preview-header">
                    <h5><i class="fas fa-file"></i> ${archivo.nombre}</h5>
                    <p class="text-muted">Tipo de archivo no reconocido</p>
                </div>
                <div class="preview-content text-center py-5">
                    <div class="preview-placeholder">
                        <i class="fas fa-question-circle fa-4x text-muted mb-3"></i>
                        <h5>Formato no compatible</h5>
                        <p class="text-muted">No podemos mostrar una vista previa de este tipo de archivo.</p>
                    </div>
                </div>
            `;
    }
    
    previewContainer.innerHTML = contenido;
}

function filtrarArchivos() {
    const busqueda = document.getElementById('buscar-archivo').value.toLowerCase().trim();
    const fileItems = document.querySelectorAll('.file-item');
    let resultados = 0;
    
    fileItems.forEach(item => {
        const fileName = item.querySelector('.file-name').textContent.toLowerCase();
        
        if (busqueda === '' || fileName.includes(busqueda)) {
            item.style.display = 'flex';
            resultados++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Mostrar mensaje si no hay resultados
    const listaArchivos = document.getElementById('lista-archivos');
    if (resultados === 0 && busqueda !== '') {
        const noResults = document.createElement('div');
        noResults.className = 'text-center py-4';
        noResults.innerHTML = `
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <p class="text-muted">No se encontraron archivos con: "${busqueda}"</p>
            <button onclick="limpiarBusqueda()" class="btn btn-secondary btn-sm mt-2">
                <i class="fas fa-times"></i> Limpiar búsqueda
            </button>
        `;
        
        // Reemplazar solo si no existe ya el mensaje
        if (!listaArchivos.querySelector('.text-center')) {
            listaArchivos.innerHTML = '';
            listaArchivos.appendChild(noResults);
        }
    }
    
    console.log("Búsqueda:", busqueda, "- Resultados:", resultados);
}

function limpiarBusqueda() {
    const inputBusqueda = document.getElementById('buscar-archivo');
    inputBusqueda.value = '';
    filtrarArchivos();
    
    // Recargar la lista de archivos
    const carpetaSelect = document.getElementById('carpeta-select');
    if (carpetaSelect.value) {
        cargarArchivosCarpeta(carpetaSelect.value);
    }
}

function descargarArchivoActual() {
    if (!archivoSeleccionado) {
        alert('⚠️ No hay archivo seleccionado');
        return;
    }
    
    console.log("Descargando archivo:", archivoSeleccionado.nombre);
    
    try {
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = archivoSeleccionado.url;
        link.download = archivoSeleccionado.nombre;
        link.target = '_blank';
        
        // Agregar al documento y simular clic
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Mostrar notificación de éxito
        mostrarNotificacion(`✅ Descargando: ${archivoSeleccionado.nombre}`, 'success');
        
    } catch (error) {
        console.error("Error al descargar archivo:", error);
        mostrarNotificacion(`❌ Error al descargar el archivo: ${error.message}`, 'error');
    }
}

function abrirArchivoNuevaPestana() {
    if (!archivoSeleccionado) {
        alert('⚠️ No hay archivo seleccionado');
        return;
    }
    
    console.log("Abriendo archivo en nueva pestaña:", archivoSeleccionado.nombre);
    
    try {
        window.open(archivoSeleccionado.url, '_blank', 'noopener,noreferrer');
        mostrarNotificacion(`🔗 Abriendo archivo en nueva pestaña`, 'info');
    } catch (error) {
        console.error("Error al abrir archivo:", error);
        mostrarNotificacion(`❌ Error al abrir el archivo: ${error.message}`, 'error');
    }
}

function actualizarListaArchivos() {
    const carpetaSelect = document.getElementById('carpeta-select');
    const carpeta = carpetaSelect.value;
    
    if (!carpeta) {
        mostrarNotificacion('📁 Selecciona una carpeta primero', 'warning');
        return;
    }
    
    // Mostrar indicador de carga
    const listaArchivos = document.getElementById('lista-archivos');
    listaArchivos.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted">Actualizando lista de archivos...</p>
        </div>
    `;
    
    // Simular carga
    setTimeout(() => {
        cargarArchivosCarpeta(carpeta);
        mostrarNotificacion(`🔄 Lista de archivos actualizada (${archivosCargados.length} archivos)`, 'success');
    }, 500);
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo} alert-dismissible fade show`;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    notificacion.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Agregar al documento
    document.body.appendChild(notificacion);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.classList.remove('show');
            setTimeout(() => {
                if (notificacion.parentNode) {
                    document.body.removeChild(notificacion);
                }
            }, 300);
        }
    }, 5000);
}

// Función para cambiar el tema en el visualizador de planos
function actualizarTemaPlanos() {
    const esTemaOscuro = document.body.classList.contains('light-theme') ? false : true;
    
    // Actualizar estilos según el tema
    const previewContainer = document.getElementById('preview-container');
    if (previewContainer) {
        previewContainer.style.backgroundColor = esTemaOscuro ? 'var(--dark)' : 'white';
        previewContainer.style.color = esTemaOscuro ? 'var(--text)' : '#333';
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log("Visualizador de Planos inicializado");
    
    // Configurar eventos
    const carpetaSelect = document.getElementById('carpeta-select');
    const inputBusqueda = document.getElementById('buscar-archivo');
    const btnActualizar = document.querySelector('.planos-actions button[onclick*="actualizarListaArchivos"]');
    
    if (carpetaSelect) {
        carpetaSelect.addEventListener('change', function() {
            cargarArchivosCarpeta(this.value);
        });
        
        // Cargar planos por defecto
        setTimeout(() => {
            carpetaSelect.value = 'planos';
            cargarArchivosCarpeta('planos');
        }, 500);
    }
    
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', filtrarArchivos);
        inputBusqueda.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                filtrarArchivos();
            }
        });
    }
    
    if (btnActualizar) {
        btnActualizar.onclick = actualizarListaArchivos;
    }
    
    // Observar cambios en el tema
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                actualizarTemaPlanos();
            }
        });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // Inicializar tema
    actualizarTemaPlanos();
});

// Agrega esta función en planos.js
function verificarPermisosAdmin() {
    try {
        if (!currentUser) return false;
        
        const esAdministrador = currentUser.role === 'administrativo';
        const btnSubirArchivo = document.getElementById('btn-subir-archivo');
        
        if (btnSubirArchivo) {
            if (esAdministrador) {
                btnSubirArchivo.style.display = 'inline-flex';
                console.log("Usuario Administrador detectado - Mostrando opción de subida");
            } else {
                btnSubirArchivo.style.display = 'none';
            }
        }
        
        return esAdministrador;
    } catch (error) {
        console.error("Error verificando permisos:", error);
        return false;
    }
}

// Llama a esta función después del login
function mostrarOpcionesAdmin() {
    if (document.getElementById('planos').classList.contains('active')) {
        verificarPermisosAdmin();
    }
}

    // planos.js - Funciones para subir archivos a GitHub

let archivoParaSubir = null;

function mostrarModalSubirArchivo() {
    if (!verificarPermisosAdmin()) {
        mostrarNotificacion('🚫 Solo los administradores pueden subir archivos', 'error');
        return;
    }
    
    const modal = document.getElementById('modal-subir-archivo');
    modal.style.display = 'flex';
    
    // Resetear formulario
    document.getElementById('form-subir-archivo').reset();
    document.getElementById('mensaje-subida').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    
    // Configurar evento para el input de archivo
    document.getElementById('input-archivo').addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            archivoParaSubir = this.files[0];
            
            // Auto-completar nombre si está vacío
            const nombreInput = document.getElementById('nombre-archivo');
            if (!nombreInput.value) {
                const nombreOriginal = archivoParaSubir.name;
                // Limpiar nombre (remover caracteres especiales)
                const nombreLimpio = nombreOriginal.replace(/[^a-zA-Z0-9._-]/g, '_');
                nombreInput.value = nombreLimpio;
            }
            
            // Validar tamaño
            const maxSize = 25 * 1024 * 1024; // 25MB
            if (archivoParaSubir.size > maxSize) {
                mostrarNotificacion('❌ El archivo es demasiado grande (Máx. 25MB)', 'error');
                this.value = '';
                archivoParaSubir = null;
            }
        }
    });
}

function cerrarModalSubirArchivo() {
    document.getElementById('modal-subir-archivo').style.display = 'none';
    archivoParaSubir = null;
}

let githubConfig = null;

async function cargarConfiguracionGitHub() {
    if (!currentUser || currentUser.role !== 'administrativo') {
        return null;
    }

    try {
        githubConfig = await getGitHubConfig();
        
        if (!githubConfig) {
            console.warn("Configuración de GitHub no encontrada");
            return null;
        }

        console.log("Configuración GitHub cargada:", githubConfig);
        return githubConfig;
    } catch (error) {
        console.error("Error cargando configuración:", error);
        return null;
    }
}

async function subirArchivoAGitHub() {
    // Verificar que haya configuración
    if (!githubConfig) {
        githubConfig = await cargarConfiguracionGitHub();
        if (!githubConfig) {
            mostrarNotificacion('❌ Configuración de GitHub no disponible', 'error');
            return false;
        }
    }
    
    const carpetaDestino = document.getElementById('carpeta-destino').value;
    const nombreArchivo = document.getElementById('nombre-archivo').value || archivoParaSubir.name;
    const descripcion = document.getElementById('descripcion-archivo').value || `Archivo subido por ${currentUser.name}`;
    
    if (!carpetaDestino) {
        mostrarNotificacion('❌ Selecciona una carpeta destino', 'error');
        return false;
    }
    
    // Mostrar progreso
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    progressText.textContent = 'Preparando archivo...';
    
    try {
        // 1. Leer archivo como base64
        const reader = new FileReader();
        
        const base64Data = await new Promise((resolve, reject) => {
            reader.onload = () => {
                // Extraer solo la parte base64 (remover data URL prefix)
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(archivoParaSubir);
        });
        
        // 2. Crear ruta completa en GitHub
        const rutaCompleta = `${GITHUB_CONFIG.PATHS[carpetaDestino]}${nombreArchivo}`;
        
        // 3. Configurar la petición a GitHub API
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents${rutaCompleta}`;
        
        // Verificar si el archivo ya existe
        progressBar.style.width = '25%';
        progressBar.textContent = '25%';
        progressText.textContent = 'Verificando si el archivo existe...';
        
        let sha = null;
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                sha = data.sha; // SHA del archivo existente (para actualizar)
            }
        } catch (error) {
            // El archivo no existe, continuar con subida nueva
            console.log("Archivo no existe, se creará uno nuevo");
        }
        
        // 4. Crear/Actualizar archivo en GitHub
        progressBar.style.width = '50%';
        progressBar.textContent = '50%';
        progressText.textContent = 'Subiendo archivo a GitHub...';
        
        const payload = {
            message: descripcion,
            content: base64Data,
            branch: GITHUB_CONFIG.BRANCH
        };
        
        // Si el archivo existe, agregar SHA para actualizar
        if (sha) {
            payload.sha = sha;
        }
        
        const uploadResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.message || 'Error al subir el archivo');
        }
        
        // 5. Actualizar progreso y mostrar éxito
        progressBar.style.width = '100%';
        progressBar.textContent = '100%';
        progressText.textContent = '¡Archivo subido exitosamente!';
        
        const responseData = await uploadResponse.json();
        
        // Mostrar mensaje de éxito
        const mensajeElement = document.getElementById('mensaje-subida');
        mensajeElement.className = 'alert alert-success';
        mensajeElement.innerHTML = `
            <h5><i class="fas fa-check-circle"></i> ¡Archivo subido exitosamente!</h5>
            <p><strong>Archivo:</strong> ${nombreArchivo}</p>
            <p><strong>Carpeta:</strong> ${carpetaDestino}</p>
            <p><strong>URL:</strong> <a href="${responseData.content.download_url}" target="_blank">${responseData.content.download_url}</a></p>
            <p class="mb-0"><small>SHA: ${responseData.content.sha.substring(0, 8)}...</small></p>
        `;
        mensajeElement.style.display = 'block';
        
        // Notificación
        mostrarNotificacion(`✅ Archivo "${nombreArchivo}" subido exitosamente a GitHub`, 'success');
        
        // Recargar lista de archivos después de 2 segundos
        setTimeout(() => {
            cargarArchivosCarpeta(carpetaDestino);
        }, 2000);
        
        return true;
        
    } catch (error) {
        console.error("Error subiendo archivo a GitHub:", error);
        
        // Mostrar error
        progressBar.style.width = '100%';
        progressBar.textContent = '100%';
        progressBar.className = 'progress-bar bg-danger';
        progressText.textContent = 'Error en la subida';
        
        const mensajeElement = document.getElementById('mensaje-subida');
        mensajeElement.className = 'alert alert-danger';
        mensajeElement.innerHTML = `
            <h5><i class="fas fa-exclamation-circle"></i> Error al subir archivo</h5>
            <p><strong>Error:</strong> ${error.message}</p>
            <p class="mb-0">Verifica que el token de GitHub sea válido y tenga los permisos necesarios.</p>
        `;
        mensajeElement.style.display = 'block';
        
        mostrarNotificacion(`❌ Error al subir archivo: ${error.message}`, 'error');
        
        return false;
    }
}

// Configurar evento del formulario
document.addEventListener('DOMContentLoaded', function() {
    const formSubirArchivo = document.getElementById('form-subir-archivo');
    if (formSubirArchivo) {
        formSubirArchivo.addEventListener('submit', async function(e) {
            e.preventDefault();
            await subirArchivoAGitHub();
        });
    }
});

// Función para eliminar archivos de GitHub (solo administradores)
async function eliminarArchivoDeGitHub(archivo, carpeta) {
    if (!verificarPermisosAdmin()) {
        mostrarNotificacion('🚫 Solo los administradores pueden eliminar archivos', 'error');
        return false;
    }
    
    if (!confirm(`¿Estás seguro de eliminar el archivo "${archivo.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        return false;
    }
    
    try {
        // Obtener SHA del archivo
        const rutaCompleta = `${GITHUB_CONFIG.PATHS[carpeta]}${archivo.nombre}`;
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents${rutaCompleta}`;
        
        // Primero obtener información del archivo para obtener su SHA
        const infoResponse = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!infoResponse.ok) {
            throw new Error('No se pudo obtener información del archivo');
        }
        
        const fileInfo = await infoResponse.json();
        
        // Eliminar el archivo
        const deleteResponse = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Eliminado por ${currentUser.name}`,
                sha: fileInfo.sha,
                branch: GITHUB_CONFIG.BRANCH
            })
        });
        
        if (deleteResponse.ok) {
            mostrarNotificacion(`🗑️ Archivo "${archivo.nombre}" eliminado exitosamente`, 'success');
            
            // Actualizar lista
            setTimeout(() => {
                cargarArchivosCarpeta(carpeta);
            }, 1000);
            
            return true;
        } else {
            throw new Error('Error al eliminar el archivo');
        }
        
    } catch (error) {
        console.error("Error eliminando archivo:", error);
        mostrarNotificacion(`❌ Error al eliminar archivo: ${error.message}`, 'error');
        return false;
    }
}

// En tu script.js principal, agrega esto
function inicializarPlanos() {
    console.log("Inicializando módulo de planos...");
    
    // Verificar permisos de admin
    verificarPermisosAdmin();
    
    // Configurar eventos
    const modalSubir = document.getElementById('modal-subir-archivo');
    if (modalSubir) {
        // Cerrar modal al hacer clic fuera
        modalSubir.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModalSubirArchivo();
            }
        });
        
        // Cerrar con ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalSubir.style.display === 'flex') {
                cerrarModalSubirArchivo();
            }
        });
    }
    
    console.log("Módulo de planos inicializado");
}

// Llamar después de cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(inicializarPlanos, 1000);
});

// Exportar funciones para uso global (si es necesario)
window.cargarArchivosCarpeta = cargarArchivosCarpeta;
window.seleccionarArchivo = seleccionarArchivo;
window.descargarArchivoActual = descargarArchivoActual;
window.abrirArchivoNuevaPestana = abrirArchivoNuevaPestana;
window.filtrarArchivos = filtrarArchivos;
window.actualizarListaArchivos = actualizarListaArchivos;
window.limpiarBusqueda = limpiarBusqueda;