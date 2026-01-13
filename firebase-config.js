// firebase-config.js
// Configuración de Firebase - Reemplaza con tus credenciales
const firebaseConfig = {
        apiKey: "AIzaSyADGcJsPVIdb3fdEdBZkjP4YXOSSWXZ95Q",
        authDomain: "nomina-app-434de.firebaseapp.com",
        projectId: "nomina-app-434de",
        storageBucket: "nomina-app-434de.firebasestorage.app",
        messagingSenderId: "820106636077",
        appId: "1:820106636077:web:a3f84116db197fab6c41a4"
};

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase configurado correctamente");
} catch (error) {
    console.error("Error inicializando Firebase:", error);
}

// Inicializar servicios
const db = firebase.firestore();
const storage = firebase.storage();

// Configuración de Firestore para desarrollo
db.settings({
    timestampsInSnapshots: true
});

// firebase-config.js - Agregar esta función
async function getGitHubConfig() {
    try {
        const configDoc = await db.collection('config').doc('github').get();
        if (configDoc.exists) {
            return configDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Error obteniendo configuración GitHub:", error);
        return null;
    }
}

// Agregar al objeto global
window.getGitHubConfig = getGitHubConfig;