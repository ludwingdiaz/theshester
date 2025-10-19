// ====================================================================
// FUNCIONES DE UTILIDAD (Dejamos igual)
// ====================================================================

function getRoleEmoji(role) {
    const roles = {
        "leader": "👑",
        "coLeader": "🛡️",
        "elder": "✨",
        "member": "⚔️"
    };
    return roles[role] || "👤";
}

function translateRole(role) {
    const roles = {
        "leader": "Líder",
        "coLeader": "Colíder",
        "elder": "Veterano",
        "member": "Miembro"
    };
    return roles[role] || "Desconocido";
}

function formatLastSeen(isoString) {
    // Lógica de formateo de fecha
    const year = isoString.substring(0, 4);
    const month = isoString.substring(4, 6);
    const day = isoString.substring(6, 8);
    const time = isoString.substring(9, 15);

    const formattedIso = `${year}-${month}-${day}T${time}Z`;
    const date = new Date(formattedIso);

    if (isNaN(date)) {
        return "Fecha Desconocida";
    }

    const options = { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    };

    return date.toLocaleString('es-ES', options); 
}

// ====================================================================
// FUNCIÓN PRINCIPAL: Muestra la tarjeta de detalle del jugador (CORREGIDA)
// ====================================================================

async function showPlayerDetails(memberJsonEncoded) {
    
    // 1. Decodificar y Parsear el JSON del miembro del clan
    const memberJson = decodeURIComponent(memberJsonEncoded);
    const member = JSON.parse(memberJson); 
    const playerTag = member.tag.substring(1); // Tag sin el '#'

    // Mostrar mensaje de carga y el modal
    document.getElementById('detail-card-container').innerHTML = `<p class="loading-message">Cargando detalles y ciclo de cofres...</p>`;
    document.getElementById('member-detail-modal').style.display = 'flex';

 let nextChestName = 'Cargando...';
    let realTrophies = member.trophies;

    try {
        const apiUrl = `/api/player/${playerTag}`; // Llama a tu servidor Node.js (Proxy)
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // 🛑 AHORA ESPERAMOS nextChestName del proxy
        if (data.nextChestName) { 
            nextChestName = data.nextChestName;
        } else {
            nextChestName = 'Cofres no disponibles (Jugador Inactivo)';
        }

        // Extraer trofeos reales
        if (data.bestSeasonTrophies) {
            realTrophies = data.bestSeasonTrophies;
        }

    } catch (error) {
        console.error("Error al obtener el perfil del jugador:", error);
        nextChestName = 'Error de conexión o datos'; // Mensaje final de error
        realTrophies = member.trophies; // Mantiene el valor base de 10000 en caso de fallo
    }


    // 3. Generar el HTML con la información final
    const lastSeenFormatted = formatLastSeen(member.lastSeen);
    const roleEmoji = getRoleEmoji(member.role);
    const translatedRole = translateRole(member.role);
    
    const cardHTML = `
        <div class="player-card">
            <h2 class="card-title">${roleEmoji} ${member.name}</h2>
            <p class="card-tag">Tag: <strong>${member.tag}</strong></p>
            <hr>

            <p>🛡️ Rol: <strong>${translatedRole}</strong></p>
            <p>⭐ Nivel EXP: <strong>${member.expLevel}</strong></p>
            <hr>

            <p>🏆 Trofeos: <strong>${realTrophies}</strong></p>
            <p>🏟️ Arena: <strong>${member.arena.name}</strong></p>
            <hr>
            
            <p>🎁 Próximo Cofre: <strong>${nextChestName}</strong></p>
            <hr>

            <p>⬆️ Cartas Donadas: <strong>${member.donations}</strong></p>
            <p>⬇️ Cartas Recibidas: <strong>${member.donationsReceived}</strong></p>
            <hr>

            <p class="last-seen">⏱️ Última conexión: ${lastSeenFormatted}</p>
            
            <button onclick="hidePlayerDetails()">Cerrar</button> 
        </div>
    `;

    // 4. Inyectar el HTML final y mostrar el modal
    document.getElementById('detail-card-container').innerHTML = cardHTML;
    document.getElementById('member-detail-modal').style.display = 'flex'; 
}

// ====================================================================
// FUNCIÓN DE CIERRE DEL MODAL (Mantenemos igual)
// ====================================================================

function hidePlayerDetails() {
    document.getElementById('member-detail-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('member-detail-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}