// backend/routes/clashroyale.js

const express = require('express');
const router = express.Router();
// Importa las funciones que acabas de crear
const { getClanMembers,getPlayerDetails } = require('../middleware/clashRoyaleApi'); 

/**
 * Ruta: GET /api/clashroyale/clan/:clanTag
 * Propósito: Devuelve la lista de miembros de un clan.
 */
// backend/routes/clashroyale.js

// ... (Código previo) ...

router.get('/clan/:clanTag', async (req, res) => {
    const { clanTag } = req.params;

    if (!clanTag || !clanTag.startsWith('#')) {
        return res.status(400).json({ message: "Se requiere un clanTag válido (debe empezar con #)." });
    }

    try {
        const clanData = await getClanMembers(clanTag);
        
        // ✅ CORRECCIÓN CLAVE: La propiedad es 'members', no 'memberList'
res.json({ members: clanData.memberList, name: clanData.name });
    } catch (error) {
        // Manejo de errores (ej: clan no encontrado)
        const status = error.message.includes('404') ? 404 : 500;
        res.status(status).json({ message: error.message || "Error al obtener datos del clan." });
    }
});

// backend/routes/clashroyale.js (Solo la ruta /player/:tag)

// ... (inicio de la ruta) ...

// backend/routes/clashroyale.js (Ruta /player/:tag)

router.get('/player/:tag', async (req, res) => {
    
    const playerTag = req.params.tag; 

    try {
        // Llama a la función del middleware para obtener los datos de la API
        const playerData = await getPlayerDetails(playerTag); 
        
        // --- EXTRACCIÓN DEL COFRE (NEXT CHEST) ---
        let nextChest = null;
        // La API omite 'upcomingChests' si el jugador está inactivo, por eso verificamos su existencia.
        if (playerData.upcomingChests && playerData.upcomingChests.length > 0) {
            nextChest = playerData.upcomingChests[0].name;
        }
        
        // --- LÓGICA MÁXIMA PARA TROFEOS (BEST SEASON TROPHIES / PB) ---
        // Inicializamos a 0 para buscar el valor más alto en todos los campos posibles.
        let maxTrophies = 0; 
        
        // Lista de campos donde se puede encontrar el Récord Personal, priorizados por probabilidad.
        const fieldsToCheck = [
            // 1. Récord antiguo/histórico (más probable que tenga 13345)
            playerData.legacyTrophyRoadHighScore, 
            // 2. Récord Personal estándar según la documentación
            playerData.bestTrophies, 
            // 3. Récord de la mejor temporada de Liga
            playerData.bestPathOfLegendSeasonResult && playerData.bestPathOfLegendSeasonResult.trophies,
            // 4. Trofeos actuales (pueden ser el PB si acaba de jugar)
            playerData.trophies, 
            // 5. El campo que a menudo devuelve 10000 (máx. de la antigua ruta)
            playerData.maxTrophies
        ];
        
        // Iteramos para encontrar el valor máximo
        fieldsToCheck.forEach(value => {
            if (value && typeof value === 'number' && value > maxTrophies) {
                maxTrophies = value;
            }
        });
        
        // Si todo falla y solo se encuentra un valor, usamos el trofeo actual
        if (maxTrophies === 0 && playerData.trophies) {
             maxTrophies = playerData.trophies;
        }

        // --- RESPUESTA FINAL ---
        const responseData = { 
            nextChestName: nextChest, 
            bestSeasonTrophies: maxTrophies, 
        };
        
        // Usamos res.end para garantizar que la respuesta se envíe inmediatamente, mejorando la estabilidad.
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(responseData));

    } catch (error) {
        // Manejo de errores de red o API (404, 403, etc.)
        const status = error.message.includes('404') ? 404 : 500;
        console.error(`Error al procesar el jugador ${playerTag}:`, error.message);
        return res.status(status).json({ message: error.message || 'Error al obtener el perfil del jugador.' });
    }
});

module.exports = router;
