const fetch = require('node-fetch').default; 

// 1. Configuración: Usa tu token JWT aquí
const CLASH_ROYALE_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjFhODg5MDU4LTFlMDctNGFlOC05MWE3LTMzNmZhN2Q2OTEyMSIsImlhdCI6MTc2MDgzNTgyMSwic3ViIjoiZGV2ZWxvcGVyL2NhZTUwMDg2LWE2ZGUtOWFhZC0zNWQ2LTM4MmRiNmQwMzQ4YyIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIxOC4xNTYuMTU4LjUzIiwiMTguMTU2LjQyLjIwMCIsIjUyLjU5LjEwMy41NCJdLCJ0eXBlIjoiY2xpZW50In1dfQ.od6PqJSMahGpY2bl-zOX45s90XEsZtJTBaznC-us1uYFWX1vP9hIxysRlxnw1E10rNcTFW3sflwrBB4QG9JUlg';
const BASE_URL = 'https://api.clashroyale.com/v1';

/**
 * Función genérica para hacer peticiones autenticadas a la API de CR.
 */
async function fetchClashRoyale(endpoint) {
    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${CLASH_ROYALE_TOKEN}`,
                'Accept': 'application/json'
            }
        });
        
        // 🛑 LOG DE DEBUG: Muestra el estado que recibes antes del bloqueo
        console.log(`[ClashRoyaleAPI] Response Status for ${endpoint}: ${response.status}`);


        // 1. Manejo de error 403 (IP no autorizada)
        if (response.status === 403) {
            throw new Error("Acceso denegado (403). Revisa la IP en la Lista Blanca.");
        }
        
        // 2. Leer el cuerpo de la respuesta, usando .catch para evitar bloqueo si el cuerpo está vacío
        const data = await response.json().catch(error => {
             // Si falla al parsear JSON, puede ser un error sin cuerpo. Lo tratamos como vacío.
             console.warn(`[ClashRoyaleAPI] Failed to parse JSON body for ${endpoint}.`);
             return { reason: 'No body or invalid JSON' }; 
        });

        // 3. Manejo de otros errores (404, 500, etc.)
        if (!response.ok) {
            throw new Error(`API Error ${response.status}: ${data.reason || data.message || 'Unknown'}`);
        }

        // 4. Devolver la data (que ya ha sido leída)
        return data;

    } catch (error) {
        console.error("Error en fetchClashRoyale:", error.message);
        throw error; // Re-lanza el error para que la ruta lo maneje
    }
}

async function getClanMembers(clanTag) {
    const tagWithHash = clanTag.startsWith('#') ? clanTag : `#${clanTag}`;
    const finalTagForUrl = encodeURIComponent(tagWithHash); 
    return fetchClashRoyale(`/clans/${finalTagForUrl}`); 
}

async function getPlayerDetails(playerTag) {
    const tagWithHash = playerTag.startsWith('#') ? playerTag : `#${playerTag}`;
    const finalTagForUrl = encodeURIComponent(tagWithHash); 
    return fetchClashRoyale(`/players/${finalTagForUrl}`); 
}

module.exports = {
    fetchClashRoyale,
    getClanMembers,
    getPlayerDetails
};