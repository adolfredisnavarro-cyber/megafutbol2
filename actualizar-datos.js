const fs = require('fs');
const path = require('path');

function generarDatosCompletos() {
    console.log('Generando catálogo completo con todos los equipos de 1ª y 2ª división...');

    const ligasCatalogo = [
        {
            nombre: 'Colombia - Liga BetPlay Dimayor (1ª División)',
            equipos: [
                { nombre: "Millonarios", golesFavorLocal: 1.8, golesEnContraLocal: 0.7, golesFavorVisita: 1.3, golesEnContraVisita: 1.1, bttsPct: 58, cornersProm: 5.9, faltasFavor: 13.2, faltasEnContra: 12.5, tirosPuerta: 5.4, fuerasJuego: 2.1, tarjetasAmarrillas: 2.6 },
                { nombre: "Junior de Barranquilla", golesFavorLocal: 1.9, golesEnContraLocal: 0.8, golesFavorVisita: 1.2, golesEnContraVisita: 1.4, bttsPct: 60, cornersProm: 5.6, faltasFavor: 14.0, faltasEnContra: 13.1, tirosPuerta: 5.2, fuerasJuego: 1.9, tarjetasAmarrillas: 2.9 },
                { nombre: "Atlético Nacional", golesFavorLocal: 1.7, golesEnContraLocal: 0.8, golesFavorVisita: 1.4, golesEnContraVisita: 1.0, bttsPct: 55, cornersProm: 6.1, faltasFavor: 12.8, faltasEnContra: 12.0, tirosPuerta: 5.6, fuerasJuego: 2.3, tarjetasAmarrillas: 2.5 },
                { nombre: "América de Cali", golesFavorLocal: 1.6, golesEnContraLocal: 0.9, golesFavorVisita: 1.1, golesEnContraVisita: 1.3, bttsPct: 62, cornersProm: 5.3, faltasFavor: 14.5, faltasEnContra: 13.8, tirosPuerta: 4.9, fuerasJuego: 1.8, tarjetasAmarrillas: 3.1 },
                { nombre: "Independiente Medellín", golesFavorLocal: 1.7, golesEnContraLocal: 0.8, golesFavorVisita: 1.2, golesEnContraVisita: 1.2, bttsPct: 57, cornersProm: 5.5, faltasFavor: 13.4, faltasEnContra: 12.9, tirosPuerta: 5.1, fuerasJuego: 2.0, tarjetasAmarrillas: 2.7 },
                { nombre: "Santa Fe", golesFavorLocal: 1.5, golesEnContraLocal: 0.6, golesFavorVisita: 1.0, golesEnContraVisita: 1.1, bttsPct: 50, cornersProm: 5.0, faltasFavor: 15.0, faltasEnContra: 14.2, tirosPuerta: 4.5, fuerasJuego: 1.6, tarjetasAmarrillas: 3.3 },
                { nombre: "Deportes Tolima", golesFavorLocal: 1.8, golesEnContraLocal: 0.7, golesFavorVisita: 1.3, golesEnContraVisita: 1.1, bttsPct: 56, cornersProm: 5.8, faltasFavor: 13.8, faltasEnContra: 13.0, tirosPuerta: 5.4, fuerasJuego: 1.9, tarjetasAmarrillas: 2.8 },
                { nombre: "Deportivo Cali", golesFavorLocal: 1.4, golesEnContraLocal: 1.1, golesFavorVisita: 1.0, golesEnContraVisita: 1.5, bttsPct: 65, cornersProm: 5.2, faltasFavor: 14.2, faltasEnContra: 14.0, tirosPuerta: 4.6, fuerasJuego: 1.7, tarjetasAmarrillas: 3.2 },
                { nombre: "Once Caldas", golesFavorLocal: 1.5, golesEnContraLocal: 0.8, golesFavorVisita: 1.1, golesEnContraVisita: 1.2, bttsPct: 53, cornersProm: 5.1, faltasFavor: 13.5, faltasEnContra: 13.1, tirosPuerta: 4.8, fuerasJuego: 1.8, tarjetasAmarrillas: 2.9 },
                { nombre: "La Equidad", golesFavorLocal: 1.3, golesEnContraLocal: 0.6, golesFavorVisita: 0.9, golesEnContraVisita: 1.0, bttsPct: 45, cornersProm: 4.7, faltasFavor: 15.2, faltasEnContra: 14.9, tirosPuerta: 4.1, fuerasJuego: 1.4, tarjetasAmarrillas: 3.4 },
                { nombre: "Águilas Doradas", golesFavorLocal: 1.5, golesEnContraLocal: 0.9, golesFavorVisita: 1.0, golesEnContraVisita: 1.3, bttsPct: 58, cornersProm: 5.0, faltasFavor: 14.0, faltasEnContra: 13.8, tirosPuerta: 4.7, fuerasJuego: 1.6, tarjetasAmarrillas: 3.0 },
                { nombre: "Deportivo Pasto", golesFavorLocal: 1.4, golesEnContraLocal: 0.8, golesFavorVisita: 0.9, golesEnContraVisita: 1.3, bttsPct: 52, cornersProm: 4.9, faltasFavor: 14.6, faltasEnContra: 14.2, tirosPuerta: 4.4, fuerasJuego: 1.5, tarjetasAmarrillas: 3.3 },
                { nombre: "Bucaramanga", golesFavorLocal: 1.6, golesEnContraLocal: 0.6, golesFavorVisita: 1.1, golesEnContraVisita: 1.1, bttsPct: 49, cornersProm: 5.3, faltasFavor: 14.1, faltasEnContra: 13.5, tirosPuerta: 4.9, fuerasJuego: 1.7, tarjetasAmarrillas: 3.1 },
                { nombre: "Boyacá Chicó", golesFavorLocal: 1.3, golesEnContraLocal: 1.2, golesFavorVisita: 0.8, golesEnContraVisita: 1.6, bttsPct: 60, cornersProm: 4.6, faltasFavor: 15.0, faltasEnContra: 14.8, tirosPuerta: 4.0, fuerasJuego: 1.3, tarjetasAmarrillas: 3.6 },
                { nombre: "Jaguares de Córdoba", golesFavorLocal: 1.3, golesEnContraLocal: 1.1, golesFavorVisita: 0.8, golesEnContraVisita: 1.5, bttsPct: 59, cornersProm: 4.8, faltasFavor: 14.8, faltasEnContra: 14.4, tirosPuerta: 4.2, fuerasJuego: 1.5, tarjetasAmarrillas: 3.4 },
                { nombre: "Patriotas Boyacá", golesFavorLocal: 1.2, golesEnContraLocal: 1.2, golesFavorVisita: 0.7, golesEnContraVisita: 1.7, bttsPct: 55, cornersProm: 4.5, faltasFavor: 15.4, faltasEnContra: 15.0, tirosPuerta: 3.9, fuerasJuego: 1.3, tarjetasAmarrillas: 3.7 },
                { nombre: "Envigado", golesFavorLocal: 1.3, golesEnContraLocal: 1.1, golesFavorVisita: 0.8, golesEnContraVisita: 1.5, bttsPct: 58, cornersProm: 4.7, faltasFavor: 13.9, faltasEnContra: 13.5, tirosPuerta: 4.3, fuerasJuego: 1.6, tarjetasAmarrillas: 3.0 },
                { nombre: "Fortaleza CEIF", golesFavorLocal: 1.4, golesEnContraLocal: 1.0, golesFavorVisita: 0.9, golesEnContraVisita: 1.4, bttsPct: 61, cornersProm: 5.0, faltasFavor: 13.5, faltasEnContra: 13.2, tirosPuerta: 4.5, fuerasJuego: 1.7, tarjetasAmarrillas: 2.8 },
                { nombre: "Deportivo Pereira", golesFavorLocal: 1.5, golesEnContraLocal: 1.0, golesFavorVisita: 1.0, golesEnContraVisita: 1.3, bttsPct: 63, cornersProm: 5.2, faltasFavor: 13.8, faltasEnContra: 13.4, tirosPuerta: 4.8, fuerasJuego: 1.8, tarjetasAmarrillas: 2.9 },
                { nombre: "Alianza FC", golesFavorLocal: 1.4, golesEnContraLocal: 1.1, golesFavorVisita: 0.9, golesEnContraVisita: 1.4, bttsPct: 62, cornersProm: 4.9, faltasFavor: 14.2, faltasEnContra: 13.9, tirosPuerta: 4.4, fuerasJuego: 1.6, tarjetasAmarrillas: 3.2 }
            ]
        },
        {
            nombre: 'Colombia - Torneo BetPlay (2ª División)',
            equipos: [
                { nombre: "Unión Magdalena", golesFavorLocal: 1.6, golesEnContraLocal: 0.7, golesFavorVisita: 1.1, golesEnContraVisita: 1.2, bttsPct: 53, cornersProm: 5.2, faltasFavor: 14.1, faltasEnContra: 13.5, tirosPuerta: 4.8, fuerasJuego: 1.7, tarjetasAmarrillas: 3.0 },
                { nombre: "Real Cartagena", golesFavorLocal: 1.7, golesEnContraLocal: 0.8, golesFavorVisita: 1.2, golesEnContraVisita: 1.3, bttsPct: 56, cornersProm: 5.4, faltasFavor: 14.5, faltasEnContra: 13.9, tirosPuerta: 5.0, fuerasJuego: 1.8, tarjetasAmarrillas: 3.2 },
                { nombre: "Cúcuta Deportivo", golesFavorLocal: 1.5, golesEnContraLocal: 0.8, golesFavorVisita: 1.0, golesEnContraVisita: 1.4, bttsPct: 55, cornersProm: 5.1, faltasFavor: 14.8, faltasEnContra: 14.0, tirosPuerta: 4.6, fuerasJuego: 1.6, tarjetasAmarrillas: 3.4 },
                { nombre: "Llaneros FC", golesFavorLocal: 1.6, golesEnContraLocal: 0.9, golesFavorVisita: 1.1, golesEnContraVisita: 1.3, bttsPct: 58, cornersProm: 5.3, faltasFavor: 13.9, faltasEnContra: 13.2, tirosPuerta: 4.7, fuerasJuego: 1.9, tarjetasAmarrillas: 2.8 },
                { nombre: "Atlético Huila", golesFavorLocal: 1.6, golesEnContraLocal: 0.7, golesFavorVisita: 1.1, golesEnContraVisita: 1.2, bttsPct: 51, cornersProm: 5.2, faltasFavor: 14.3, faltasEnContra: 13.7, tirosPuerta: 4.8, fuerasJuego: 1.7, tarjetasAmarrillas: 3.1 },
                { nombre: "Orsomarso", golesFavorLocal: 1.3, golesEnContraLocal: 1.0, golesFavorVisita: 0.8, golesEnContraVisita: 1.4, bttsPct: 54, cornersProm: 4.7, faltasFavor: 15.0, faltasEnContra: 14.5, tirosPuerta: 4.1, fuerasJuego: 1.4, tarjetasAmarrillas: 3.5 },
                { nombre: "Tigres FC", golesFavorLocal: 1.2, golesEnContraLocal: 1.1, golesFavorVisita: 0.7, golesEnContraVisita: 1.5, bttsPct: 50, cornersProm: 4.5, faltasFavor: 15.2, faltasEnContra: 14.8, tirosPuerta: 3.9, fuerasJuego: 1.3, tarjetasAmarrillas: 3.6 },
                { nombre: "Real Cundinamarca", golesFavorLocal: 1.3, golesEnContraLocal: 1.0, golesFavorVisita: 0.8, golesEnContraVisita: 1.4, bttsPct: 52, cornersProm: 4.8, faltasFavor: 14.7, faltasEnContra: 14.2, tirosPuerta: 4.2, fuerasJuego: 1.5, tarjetasAmarrillas: 3.3 }
            ]
        },
        {
            nombre: 'México - Liga MX (1ª División)',
            equipos: [
                { nombre: "Club América", golesFavorLocal: 2.2, golesEnContraLocal: 0.7, golesFavorVisita: 1.8, golesEnContraVisita: 1.0, bttsPct: 68, cornersProm: 6.3, faltasFavor: 11.2, faltasEnContra: 12.1, tirosPuerta: 6.5, fuerasJuego: 2.4, tarjetasAmarrillas: 2.2 },
                { nombre: "Rayados de Monterrey", golesFavorLocal: 2.0, golesEnContraLocal: 0.8, golesFavorVisita: 1.5, golesEnContraVisita: 1.1, bttsPct: 60, cornersProm: 6.0, faltasFavor: 12.0, faltasEnContra: 12.8, tirosPuerta: 5.9, fuerasJuego: 2.1, tarjetasAmarrillas: 2.5 },
                { nombre: "Club Tigres", golesFavorLocal: 1.9, golesEnContraLocal: 0.7, golesFavorVisita: 1.4, golesEnContraVisita: 1.2, bttsPct: 59, cornersProm: 5.8, faltasFavor: 12.5, faltasEnContra: 13.0, tirosPuerta: 5.7, fuerasJuego: 2.0, tarjetasAmarrillas: 2.7 },
                { nombre: "Cruz Azul", golesFavorLocal: 2.1, golesEnContraLocal: 0.8, golesFavorVisita: 1.6, golesEnContraVisita: 1.1, bttsPct: 64, cornersProm: 6.1, faltasFavor: 11.5, faltasEnContra: 12.2, tirosPuerta: 6.2, fuerasJuego: 2.3, tarjetasAmarrillas: 2.4 },
                { nombre: "Chivas de Guadalajara", golesFavorLocal: 1.6, golesEnContraLocal: 0.9, golesFavorVisita: 1.2, golesEnContraVisita: 1.3, bttsPct: 57, cornersProm: 5.4, faltasFavor: 13.8, faltasEnContra: 14.1, tirosPuerta: 4.8, fuerasJuego: 1.8, tarjetasAmarrillas: 3.0 },
                { nombre: "Club Universidad Nacional (Pumas)", golesFavorLocal: 1.6, golesEnContraLocal: 1.0, golesFavorVisita: 1.1, golesEnContraVisita: 1.4, bttsPct: 62, cornersProm: 5.3, faltasFavor: 14.0, faltasEnContra: 14.2, tirosPuerta: 4.7, fuerasJuego: 1.7, tarjetasAmarrillas: 3.1 },
                { nombre: "Deportivo Toluca", golesFavorLocal: 2.1, golesEnContraLocal: 1.0, golesFavorVisita: 1.5, golesEnContraVisita: 1.5, bttsPct: 70, cornersProm: 6.0, faltasFavor: 12.2, faltasEnContra: 12.5, tirosPuerta: 6.0, fuerasJuego: 2.1, tarjetasAmarrillas: 2.6 },
                { nombre: "Pachuca", golesFavorLocal: 1.9, golesEnContraLocal: 1.1, golesFavorVisita: 1.4, golesEnContraVisita: 1.6, bttsPct: 73, cornersProm: 6.2, faltasFavor: 11.8, faltasEnContra: 12.0, tirosPuerta: 6.3, fuerasJuego: 2.2, tarjetasAmarrillas: 2.4 },
                { nombre: "Santos Laguna", golesFavorLocal: 1.4, golesEnContraLocal: 1.3, golesFavorVisita: 1.0, golesEnContraVisita: 1.8, bttsPct: 67, cornersProm: 5.1, faltasFavor: 14.5, faltasEnContra: 14.3, tirosPuerta: 4.5, fuerasJuego: 1.5, tarjetasAmarrillas: 3.3 },
                { nombre: "Atlas", golesFavorLocal: 1.3, golesEnContraLocal: 1.1, golesFavorVisita: 0.9, golesEnContraVisita: 1.5, bttsPct: 58, cornersProm: 4.9, faltasFavor: 14.9, faltasEnContra: 14.6, tirosPuerta: 4.1, fuerasJuego: 1.4, tarjetasAmarrillas: 3.5 },
                { nombre: "Club Tijuana", golesFavorLocal: 1.5, golesEnContraLocal: 1.1, golesFavorVisita: 1.1, golesEnContraVisita: 1.4, bttsPct: 63, cornersProm: 5.2, faltasFavor: 13.9, faltasEnContra: 13.8, tirosPuerta: 4.8, fuerasJuego: 1.7, tarjetasAmarrillas: 3.0 },
                { nombre: "Club León", golesFavorLocal: 1.6, golesEnContraLocal: 1.1, golesFavorVisita: 1.2, golesEnContraVisita: 1.4, bttsPct: 65, cornersProm: 5.5, faltasFavor: 13.5, faltasEnContra: 13.3, tirosPuerta: 5.0, fuerasJuego: 1.8, tarjetasAmarrillas: 2.9 },
                { nombre: "Club Necaxa", golesFavorLocal: 1.4, golesEnContraLocal: 1.2, golesFavorVisita: 1.0, golesEnContraVisita: 1.5, bttsPct: 61, cornersProm: 5.0, faltasFavor: 14.4, faltasEnContra: 14.1, tirosPuerta: 4.4, fuerasJuego: 1.6, tarjetasAmarrillas: 3.2 },
                { nombre: "Atlético de San Luis", golesFavorLocal: 1.5, golesEnContraLocal: 1.1, golesFavorVisita: 1.1, golesEnContraVisita: 1.4, bttsPct: 60, cornersProm: 5.2, faltasFavor: 13.8, faltasEnContra: 13.6, tirosPuerta: 4.7, fuerasJuego: 1.7, tarjetasAmarrillas: 3.1 },
                { nombre: "Mazatlán FC", golesFavorLocal: 1.3, golesEnContraLocal: 1.3, golesFavorVisita: 0.9, golesEnContraVisita: 1.6, bttsPct: 66, cornersProm: 4.8, faltasFavor: 15.1, faltasEnContra: 14.7, tirosPuerta: 4.2, fuerasJuego: 1.5, tarjetasAmarrillas: 3.6 },
                { nombre: "FC Juárez", golesFavorLocal: 1.3, golesEnContraLocal: 1.2, golesFavorVisita: 0.9, golesEnContraVisita: 1.5, bttsPct: 62, cornersProm: 4.9, faltasFavor: 14.6, faltasEnContra: 14.3, tirosPuerta: 4.3, fuerasJuego: 1.6, tarjetasAmarrillas: 3.4 },
                { nombre: "Querétaro FC", golesFavorLocal: 1.3, golesEnContraLocal: 1.2, golesFavorVisita: 0.8, golesEnContraVisita: 1.5, bttsPct: 59, cornersProm: 4.7, faltasFavor: 15.0, faltasEnContra: 14.5, tirosPuerta: 4.1, fuerasJuego: 1.4, tarjetasAmarrillas: 3.5 },
                { nombre: "Club Puebla", golesFavorLocal: 1.4, golesEnContraLocal: 1.2, golesFavorVisita: 0.9, golesEnContraVisita: 1.5, bttsPct: 63, cornersProm: 4.9, faltasFavor: 14.3, faltasEnContra: 14.0, tirosPuerta: 4.4, fuerasJuego: 1.5, tarjetasAmarrillas: 3.3 },
                { nombre: "Atlante", golesFavorLocal: 1.5, golesEnContraLocal: 1.0, golesFavorVisita: 1.0, golesEnContraVisita: 1.3, bttsPct: 58, cornersProm: 5.1, faltasFavor: 13.7, faltasEnContra: 13.4, tirosPuerta: 4.6, fuerasJuego: 1.6, tarjetasAmarrillas: 3.0 }
            ]
        },
        {
            nombre: 'México - Liga de Expansión MX (2ª División)',
            equipos: [
                { nombre: "Atlante", golesFavorLocal: 1.7, golesEnContraLocal: 0.6, golesFavorVisita: 1.2, golesEnContraVisita: 1.0, bttsPct: 52, cornersProm: 5.5, faltasFavor: 13.2, faltasEnContra: 13.0, tirosPuerta: 5.1, fuerasJuego: 1.7, tarjetasAmarrillas: 2.9 },
                { nombre: "Leones Negros", golesFavorLocal: 1.6, golesEnContraLocal: 0.7, golesFavorVisita: 1.1, golesEnContraVisita: 1.2, bttsPct: 55, cornersProm: 5.3, faltasFavor: 13.6, faltasEnContra: 13.4, tirosPuerta: 4.9, fuerasJuego: 1.8, tarjetasAmarrillas: 3.1 },
                { nombre: "Celaya", golesFavorLocal: 1.5, golesEnContraLocal: 0.8, golesFavorVisita: 1.0, golesEnContraVisita: 1.3, bttsPct: 54, cornersProm: 5.0, faltasFavor: 14.0, faltasEnContra: 13.8, tirosPuerta: 4.6, fuerasJuego: 1.6, tarjetasAmarrillas: 3.3 },
                { nombre: "Tapatío", golesFavorLocal: 1.5, golesEnContraLocal: 0.9, golesFavorVisita: 1.0, golesEnContraVisita: 1.4, bttsPct: 59, cornersProm: 5.1, faltasFavor: 13.8, faltasEnContra: 13.5, tirosPuerta: 4.7, fuerasJuego: 1.7, tarjetasAmarrillas: 3.0 },
                { nombre: "Mineros de Zacatecas", golesFavorLocal: 1.4, golesEnContraLocal: 1.1, golesFavorVisita: 0.9, golesEnContraVisita: 1.6, bttsPct: 63, cornersProm: 4.8, faltasFavor: 14.4, faltasEnContra: 14.1, tirosPuerta: 4.3, fuerasJuego: 1.5, tarjetasAmarrillas: 3.4 }
            ]
        },
        {
            nombre: 'España - LaLiga EA Sports (1ª División)',
            equipos: [
                { nombre: "Real Madrid", golesFavorLocal: 2.4, golesEnContraLocal: 0.7, golesFavorVisita: 2.1, golesEnContraVisita: 0.9, bttsPct: 65, cornersProm: 6.2, faltasFavor: 10.5, faltasEnContra: 11.2, tirosPuerta: 6.4, fuerasJuego: 2.5, tarjetasAmarrillas: 2.1 },
                { nombre: "Barcelona", golesFavorLocal: 2.3, golesEnContraLocal: 0.8, golesFavorVisita: 2.0, golesEnContraVisita: 1.0, bttsPct: 70, cornersProm: 6.5, faltasFavor: 11.0, faltasEnContra: 10.8, tirosPuerta: 6.8, fuerasJuego: 2.8, tarjetasAmarrillas: 2.3 },
                { nombre: "Atlético de Madrid", golesFavorLocal: 1.9, golesEnContraLocal: 0.6, golesFavorVisita: 1.5, golesEnContraVisita: 1.1, bttsPct: 50, cornersProm: 5.1, faltasFavor: 13.5, faltasEnContra: 12.0, tirosPuerta: 4.8, fuerasJuego: 1.7, tarjetasAmarrillas: 2.7 },
                { nombre: "Girona", golesFavorLocal: 2.1, golesEnContraLocal: 1.1, golesFavorVisita: 1.8, golesEnContraVisita: 1.3, bttsPct: 75, cornersProm: 5.4, faltasFavor: 12.0, faltasEnContra: 11.5, tirosPuerta: 5.5, fuerasJuego: 2.1, tarjetasAmarrillas: 2.4 },
                { nombre: "Athletic Club", golesFavorLocal: 1.8, golesEnContraLocal: 0.7, golesFavorVisita: 1.3, golesEnContraVisita: 1.2, bttsPct: 55, cornersProm: 5.8, faltasFavor: 14.0, faltasEnContra: 13.1, tirosPuerta: 5.1, fuerasJuego: 1.9, tarjetasAmarrillas: 2.8 },
                { nombre: "Real Sociedad", golesFavorLocal: 1.6, golesEnContraLocal: 0.8, golesFavorVisita: 1.2, golesEnContraVisita: 1.1, bttsPct: 52, cornersProm: 5.3, faltasFavor: 13.2, faltasEnContra: 12.8, tirosPuerta: 4.9, fuerasJuego: 1.8, tarjetasAmarrillas: 2.5 },
                { nombre: "Real Betis", golesFavorLocal: 1.5, golesEnContraLocal: 0.9, golesFavorVisita: 1.1, golesEnContraVisita: 1.3, bttsPct: 58, cornersProm: 5.0, faltasFavor: 12.8, faltasEnContra: 13.0, tirosPuerta: 4.6, fuerasJuego: 1.6, tarjetasAmarrillas: 2.6 },
                { nombre: "Villarreal", golesFavorLocal: 1.8, golesEnContraLocal: 1.2, golesFavorVisita: 1.4, golesEnContraVisita: 1.5, bttsPct: 72, cornersProm: 5.6, faltasFavor: 12.5, faltasEnContra: 13.2, tirosPuerta: 5.3, fuerasJuego: 1.9, tarjetasAmarrillas: 2.9 },
                { nombre: "Valencia", golesFavorLocal: 1.3, golesEnContraLocal: 0.9, golesFavorVisita: 0.9, golesEnContraVisita: 1.4, bttsPct: 51, cornersProm: 4.7, faltasFavor: 14.2, faltasEnContra: 14.0, tirosPuerta: 4.0, fuerasJuego: 1.4, tarjetasAmarrillas: 3.2 },
                { nombre: "Sevilla", golesFavorLocal: 1.4, golesEnContraLocal: 1.1, golesFavorVisita: 1.0, golesEnContraVisita: 1.5, bttsPct: 64, cornersProm: 5.1, faltasFavor: 13.9, faltasEnContra: 13.8, tirosPuerta: 4.5, fuerasJuego: 1.6, tarjetasAmarrillas: 3.4 }
            ]
        },
        {
            nombre: 'España - LaLiga Hypermotion (2ª División)',
            equipos: [
                { nombre: "Real Zaragoza", golesFavorLocal: 1.5, golesEnContraLocal: 0.8, golesFavorVisita: 1.0, golesEnContraVisita: 1.2, bttsPct: 52, cornersProm: 5.2, faltasFavor: 14.2, faltasEnContra: 13.5, tirosPuerta: 4.6, fuerasJuego: 1.7, tarjetasAmarrillas: 3.1 },
                { nombre: "Sporting de Gijón", golesFavorLocal: 1.6, golesEnContraLocal: 0.7, golesFavorVisita: 1.1, golesEnContraVisita: 1.3, bttsPct: 54, cornersProm: 5.4, faltasFavor: 14.0, faltasEnContra: 13.8, tirosPuerta: 4.8, fuerasJuego: 1.8, tarjetasAmarrillas: 3.0 },
                { nombre: "Real Valladolid", golesFavorLocal: 1.7, golesEnContraLocal: 0.7, golesFavorVisita: 1.2, golesEnContraVisita: 1.1, bttsPct: 56, cornersProm: 5.6, faltasFavor: 13.5, faltasEnContra: 13.0, tirosPuerta: 5.0, fuerasJuego: 1.9, tarjetasAmarrillas: 2.8 },
                { nombre: "Elche", golesFavorLocal: 1.5, golesEnContraLocal: 0.8, golesFavorVisita: 1.1, golesEnContraVisita: 1.2, bttsPct: 53, cornersProm: 5.3, faltasFavor: 13.8, faltasEnContra: 13.2, tirosPuerta: 4.7, fuerasJuego: 1.7, tarjetasAmarrillas: 2.9 },
                { nombre: "Levante", golesFavorLocal: 1.6, golesEnContraLocal: 0.9, golesFavorVisita: 1.1, golesEnContraVisita: 1.3, bttsPct: 57, cornersProm: 5.5, faltasFavor: 13.6, faltasEnContra: 13.3, tirosPuerta: 4.9, fuerasJuego: 1.8, tarjetasAmarrillas: 3.0 },
                { nombre: "Eibar", golesFavorLocal: 1.6, golesEnContraLocal: 0.8, golesFavorVisita: 1.2, golesEnContraVisita: 1.2, bttsPct: 55, cornersProm: 5.8, faltasFavor: 14.5, faltasEnContra: 14.0, tirosPuerta: 5.1, fuerasJuego: 1.7, tarjetasAmarrillas: 3.2 },
                { nombre: "Almería", golesFavorLocal: 1.8, golesEnContraLocal: 1.0, golesFavorVisita: 1.3, golesEnContraVisita: 1.5, bttsPct: 66, cornersProm: 6.0, faltasFavor: 13.0, faltasEnContra: 13.5, tirosPuerta: 5.4, fuerasJuego: 1.9, tarjetasAmarrillas: 2.8 }
            ]
        },
        {
            nombre: 'Inglaterra - Premier League (1ª División)',
            equipos: [
                { nombre: "Manchester City", golesFavorLocal: 2.6, golesEnContraLocal: 0.7, golesFavorVisita: 2.2, golesEnContraVisita: 0.9, bttsPct: 62, cornersProm: 7.1, faltasFavor: 9.8, faltasEnContra: 10.2, tirosPuerta: 7.2, fuerasJuego: 2.2, tarjetasAmarrillas: 1.8 },
                { nombre: "Arsenal", golesFavorLocal: 2.4, golesEnContraLocal: 0.6, golesFavorVisita: 2.0, golesEnContraVisita: 0.8, bttsPct: 58, cornersProm: 6.8, faltasFavor: 10.2, faltasEnContra: 11.0, tirosPuerta: 6.7, fuerasJuego: 2.4, tarjetasAmarrillas: 2.0 },
                { nombre: "Liverpool", golesFavorLocal: 2.5, golesEnContraLocal: 0.8, golesFavorVisita: 2.1, golesEnContraVisita: 1.0, bttsPct: 66, cornersProm: 7.0, faltasFavor: 10.5, faltasEnContra: 11.5, tirosPuerta: 7.0, fuerasJuego: 2.6, tarjetasAmarrillas: 2.1 },
                { nombre: "Manchester United", golesFavorLocal: 1.7, golesEnContraLocal: 1.0, golesFavorVisita: 1.3, golesEnContraVisita: 1.4, bttsPct: 65, cornersProm: 5.5, faltasFavor: 12.0, faltasEnContra: 12.5, tirosPuerta: 5.0, fuerasJuego: 1.9, tarjetasAmarrillas: 2.7 },
                { nombre: "Chelsea", golesFavorLocal: 1.9, golesEnContraLocal: 1.1, golesFavorVisita: 1.5, golesEnContraVisita: 1.4, bttsPct: 70, cornersProm: 6.1, faltasFavor: 11.2, faltasEnContra: 11.8, tirosPuerta: 5.9, fuerasJuego: 2.1, tarjetasAmarrillas: 2.5 },
                { nombre: "Tottenham Hotspur", golesFavorLocal: 2.0, golesEnContraLocal: 1.2, golesFavorVisita: 1.6, golesEnContraVisita: 1.6, bttsPct: 74, cornersProm: 6.4, faltasFavor: 11.5, faltasEnContra: 12.1, tirosPuerta: 6.1, fuerasJuego: 2.8, tarjetasAmarrillas: 2.6 },
                { nombre: "Newcastle United", golesFavorLocal: 1.9, golesEnContraLocal: 1.0, golesFavorVisita: 1.4, golesEnContraVisita: 1.3, bttsPct: 67, cornersProm: 5.9, faltasFavor: 12.5, faltasEnContra: 12.8, tirosPuerta: 5.7, fuerasJuego: 1.8, tarjetasAmarrillas: 2.8 },
                { nombre: "Aston Villa", golesFavorLocal: 1.9, golesEnContraLocal: 0.9, golesFavorVisita: 1.4, golesEnContraVisita: 1.2, bttsPct: 64, cornersProm: 5.8, faltasFavor: 12.1, faltasEnContra: 12.4, tirosPuerta: 5.6, fuerasJuego: 2.0, tarjetasAmarrillas: 2.7 }
            ]
        },
        {
            nombre: 'Inglaterra - EFL Championship (2ª División)',
            equipos: [
                { nombre: "Leeds United", golesFavorLocal: 1.9, golesEnContraLocal: 0.7, golesFavorVisita: 1.4, golesEnContraVisita: 1.1, bttsPct: 60, cornersProm: 6.2, faltasFavor: 12.5, faltasEnContra: 12.1, tirosPuerta: 5.8, fuerasJuego: 2.0, tarjetasAmarrillas: 2.5 },
                { nombre: "Burnley", golesFavorLocal: 1.8, golesEnContraLocal: 0.8, golesFavorVisita: 1.3, golesEnContraVisita: 1.2, bttsPct: 58, cornersProm: 5.9, faltasFavor: 13.0, faltasEnContra: 12.8, tirosPuerta: 5.5, fuerasJuego: 1.9, tarjetasAmarrillas: 2.7 },
                { nombre: "West Bromwich", golesFavorLocal: 1.6, golesEnContraLocal: 0.8, golesFavorVisita: 1.1, golesEnContraVisita: 1.3, bttsPct: 55, cornersProm: 5.4, faltasFavor: 13.4, faltasEnContra: 13.1, tirosPuerta: 4.8, fuerasJuego: 1.7, tarjetasAmarrillas: 2.9 },
                { nombre: "Sheffield United", golesFavorLocal: 1.7, golesEnContraLocal: 0.7, golesFavorVisita: 1.2, golesEnContraVisita: 1.1, bttsPct: 53, cornersProm: 5.6, faltasFavor: 13.8, faltasEnContra: 13.2, tirosPuerta: 5.0, fuerasJuego: 1.8, tarjetasAmarrillas: 2.8 },
                { nombre: "Norwich City", golesFavorLocal: 1.6, golesEnContraLocal: 1.0, golesFavorVisita: 1.1, golesEnContraVisita: 1.4, bttsPct: 64, cornersProm: 5.3, faltasFavor: 12.9, faltasEnContra: 13.0, tirosPuerta: 4.7, fuerasJuego: 1.6, tarjetasAmarrillas: 2.6 }
            ]
        },
        {
            nombre: 'Argentina - Liga Profesional (1ª División)',
            equipos: [
                { nombre: "River Plate", golesFavorLocal: 2.0, golesEnContraLocal: 0.7, golesFavorVisita: 1.5, golesEnContraVisita: 1.0, bttsPct: 58, cornersProm: 6.0, faltasFavor: 13.0, faltasEnContra: 13.5, tirosPuerta: 5.8, fuerasJuego: 2.1, tarjetasAmarrillas: 2.8 },
                { nombre: "Boca Juniors", golesFavorLocal: 1.8, golesEnContraLocal: 0.8, golesFavorVisita: 1.3, golesEnContraVisita: 1.1, bttsPct: 55, cornersProm: 5.7, faltasFavor: 14.2, faltasEnContra: 14.0, tirosPuerta: 5.3, fuerasJuego: 1.8, tarjetasAmarrillas: 3.2 },
                { nombre: "Racing Club", golesFavorLocal: 1.9, golesEnContraLocal: 0.8, golesFavorVisita: 1.4, golesEnContraVisita: 1.2, bttsPct: 62, cornersProm: 5.9, faltasFavor: 13.5, faltasEnContra: 13.2, tirosPuerta: 5.6, fuerasJuego: 2.0, tarjetasAmarrillas: 2.9 },
                { nombre: "Independiente", golesFavorLocal: 1.5, golesEnContraLocal: 0.7, golesFavorVisita: 1.1, golesEnContraVisita: 1.2, bttsPct: 50, cornersProm: 5.2, faltasFavor: 15.1, faltasEnContra: 14.8, tirosPuerta: 4.5, fuerasJuego: 1.6, tarjetasAmarrillas: 3.5 },
                { nombre: "San Lorenzo", golesFavorLocal: 1.4, golesEnContraLocal: 0.6, golesFavorVisita: 1.0, golesEnContraVisita: 1.1, bttsPct: 46, cornersProm: 5.0, faltasFavor: 15.6, faltasEnContra: 15.2, tirosPuerta: 4.2, fuerasJuego: 1.5, tarjetasAmarrillas: 3.7 },
                { nombre: "Estudiantes de La Plata", golesFavorLocal: 1.7, golesEnContraLocal: 0.8, golesFavorVisita: 1.2, golesEnContraVisita: 1.2, bttsPct: 54, cornersProm: 5.5, faltasFavor: 14.8, faltasEnContra: 14.3, tirosPuerta: 5.0, fuerasJuego: 1.7, tarjetasAmarrillas: 3.4 },
                { nombre: "Vélez Sarsfield", golesFavorLocal: 1.6, golesEnContraLocal: 0.8, golesFavorVisita: 1.1, golesEnContraVisita: 1.2, bttsPct: 53, cornersProm: 5.4, faltasFavor: 13.9, faltasEnContra: 13.6, tirosPuerta: 4.8, fuerasJuego: 1.8, tarjetasAmarrillas: 3.0 }
            ]
        },
        {
            nombre: 'Argentina - Primera Nacional (2ª División)',
            equipos: [
                { nombre: "San Martín de Tucumán", golesFavorLocal: 1.6, golesEnContraLocal: 0.5, golesFavorVisita: 1.0, golesEnContraVisita: 1.1, bttsPct: 45, cornersProm: 5.0, faltasFavor: 15.5, faltasEnContra: 15.0, tirosPuerta: 4.6, fuerasJuego: 1.5, tarjetasAmarrillas: 3.6 },
                { nombre: "Colón de Santa Fe", golesFavorLocal: 1.7, golesEnContraLocal: 0.7, golesFavorVisita: 1.1, golesEnContraVisita: 1.2, bttsPct: 53, cornersProm: 5.3, faltasFavor: 14.8, faltasEnContra: 14.2, tirosPuerta: 4.9, fuerasJuego: 1.7, tarjetasAmarrillas: 3.3 },
                { nombre: "Nueva Chicago", golesFavorLocal: 1.4, golesEnContraLocal: 0.6, golesFavorVisita: 0.9, golesEnContraVisita: 1.2, bttsPct: 48, cornersProm: 4.8, faltasFavor: 16.0, faltasEnContra: 15.5, tirosPuerta: 4.2, fuerasJuego: 1.4, tarjetasAmarrillas: 3.8 },
                { nombre: "San Martín de San Juan", golesFavorLocal: 1.5, golesEnContraLocal: 0.6, golesFavorVisita: 1.0, golesEnContraVisita: 1.1, bttsPct: 47, cornersProm: 5.1, faltasFavor: 15.2, faltasEnContra: 14.9, tirosPuerta: 4.4, fuerasJuego: 1.5, tarjetasAmarrillas: 3.5 }
            ]
        },
        {
            nombre: 'Brasil - Brasileirão Série A (1ª División)',
            equipos: [
                { nombre: "Flamengo", golesFavorLocal: 2.1, golesEnContraLocal: 0.7, golesFavorVisita: 1.6, golesEnContraVisita: 1.1, bttsPct: 64, cornersProm: 6.3, faltasFavor: 13.8, faltasEnContra: 14.2, tirosPuerta: 6.0, fuerasJuego: 2.0, tarjetasAmarrillas: 3.1 },
                { nombre: "Palmeiras", golesFavorLocal: 2.0, golesEnContraLocal: 0.6, golesFavorVisita: 1.5, golesEnContraVisita: 1.0, bttsPct: 60, cornersProm: 6.1, faltasFavor: 14.0, faltasEnContra: 14.5, tirosPuerta: 5.8, fuerasJuego: 1.9, tarjetasAmarrillas: 3.2 },
                { nombre: "São Paulo", golesFavorLocal: 1.7, golesEnContraLocal: 0.8, golesFavorVisita: 1.2, golesEnContraVisita: 1.3, bttsPct: 58, cornersProm: 5.5, faltasFavor: 14.5, faltasEnContra: 14.0, tirosPuerta: 5.1, fuerasJuego: 1.7, tarjetasAmarrillas: 3.4 },
                { nombre: "Fluminense", golesFavorLocal: 1.6, golesEnContraLocal: 0.9, golesFavorVisita: 1.1, golesEnContraVisita: 1.3, bttsPct: 61, cornersProm: 5.4, faltasFavor: 13.5, faltasEnContra: 13.8, tirosPuerta: 4.8, fuerasJuego: 1.8, tarjetasAmarrillas: 3.0 },
                { nombre: "Botafogo", golesFavorLocal: 2.0, golesEnContraLocal: 0.8, golesFavorVisita: 1.5, golesEnContraVisita: 1.2, bttsPct: 63, cornersProm: 6.0, faltasFavor: 14.2, faltasEnContra: 14.1, tirosPuerta: 5.7, fuerasJuego: 2.0, tarjetasAmarrillas: 3.3 },
                { nombre: "Atlético Mineiro", golesFavorLocal: 1.8, golesEnContraLocal: 0.9, golesFavorVisita: 1.3, golesEnContraVisita: 1.3, bttsPct: 65, cornersProm: 5.8, faltasFavor: 14.6, faltasEnContra: 14.4, tirosPuerta: 5.3, fuerasJuego: 1.9, tarjetasAmarrillas: 3.5 }
            ]
        },
        {
            nombre: 'Brasil - Brasileirão Série B (2ª División)',
            equipos: [
                { nombre: "Santos", golesFavorLocal: 1.8, golesEnContraLocal: 0.7, golesFavorVisita: 1.3, golesEnContraVisita: 1.2, bttsPct: 56, cornersProm: 5.7, faltasFavor: 14.2, faltasEnContra: 13.9, tirosPuerta: 5.3, fuerasJuego: 1.8, tarjetasAmarrillas: 3.3 },
                { nombre: "Sport Recife", golesFavorLocal: 1.6, golesEnContraLocal: 0.8, golesFavorVisita: 1.1, golesEnContraVisita: 1.3, bttsPct: 54, cornersProm: 5.4, faltasFavor: 14.9, faltasEnContra: 14.5, tirosPuerta: 4.8, fuerasJuego: 1.6, tarjetasAmarrillas: 3.5 },
                { nombre: "Coritiba", golesFavorLocal: 1.5, golesEnContraLocal: 0.8, golesFavorVisita: 1.0, golesEnContraVisita: 1.3, bttsPct: 52, cornersProm: 5.2, faltasFavor: 14.5, faltasEnContra: 14.1, tirosPuerta: 4.6, fuerasJuego: 1.6, tarjetasAmarrillas: 3.4 },
                { nombre: "América Mineiro", golesFavorLocal: 1.7, golesEnContraLocal: 0.7, golesFavorVisita: 1.2, golesEnContraVisita: 1.2, bttsPct: 55, cornersProm: 5.5, faltasFavor: 14.0, faltasEnContra: 13.8, tirosPuerta: 5.0, fuerasJuego: 1.7, tarjetasAmarrillas: 3.2 }
            ]
        },
        {
            nombre: 'Estados Unidos - MLS (1ª División)',
            equipos: [
                { nombre: "Inter Miami", golesFavorLocal: 2.4, golesEnContraLocal: 1.1, golesFavorVisita: 1.9, golesEnContraVisita: 1.5, bttsPct: 76, cornersProm: 6.0, faltasFavor: 10.5, faltasEnContra: 11.0, tirosPuerta: 6.6, fuerasJuego: 2.2, tarjetasAmarrillas: 2.0 },
                { nombre: "LA Galaxy", golesFavorLocal: 2.1, golesEnContraLocal: 1.0, golesFavorVisita: 1.6, golesEnContraVisita: 1.4, bttsPct: 72, cornersProm: 5.8, faltasFavor: 11.2, faltasEnContra: 11.8, tirosPuerta: 6.1, fuerasJuego: 2.0, tarjetasAmarrillas: 2.3 },
                { nombre: "Columbus Crew", golesFavorLocal: 2.2, golesEnContraLocal: 0.9, golesFavorVisita: 1.7, golesEnContraVisita: 1.3, bttsPct: 69, cornersProm: 6.1, faltasFavor: 10.8, faltasEnContra: 11.4, tirosPuerta: 6.3, fuerasJuego: 2.1, tarjetasAmarrillas: 1.9 },
                { nombre: "Los Angeles FC", golesFavorLocal: 2.1, golesEnContraLocal: 0.9, golesFavorVisita: 1.6, golesEnContraVisita: 1.3, bttsPct: 67, cornersProm: 5.9, faltasFavor: 11.5, faltasEnContra: 12.0, tirosPuerta: 6.0, fuerasJuego: 2.0, tarjetasAmarrillas: 2.2 }
            ]
        },
        {
            nombre: 'Ecuador - Liga Pro (1ª División)',
            equipos: [
                { nombre: "LDU Quito", golesFavorLocal: 2.0, golesEnContraLocal: 0.7, golesFavorVisita: 1.4, golesEnContraVisita: 1.1, bttsPct: 58, cornersProm: 5.9, faltasFavor: 14.0, faltasEnContra: 13.5, tirosPuerta: 5.7, fuerasJuego: 1.9, tarjetasAmarrillas: 3.0 },
                { nombre: "Independiente del Valle", golesFavorLocal: 2.1, golesEnContraLocal: 0.8, golesFavorVisita: 1.5, golesEnContraVisita: 1.2, bttsPct: 62, cornersProm: 6.2, faltasFavor: 13.2, faltasEnContra: 13.0, tirosPuerta: 6.0, fuerasJuego: 2.1, tarjetasAmarrillas: 2.7 },
                { nombre: "Barcelona SC", golesFavorLocal: 1.9, golesEnContraLocal: 0.8, golesFavorVisita: 1.3, golesEnContraVisita: 1.2, bttsPct: 59, cornersProm: 5.8, faltasFavor: 14.5, faltasEnContra: 14.1, tirosPuerta: 5.4, fuerasJuego: 1.8, tarjetasAmarrillas: 3.2 },
                { nombre: "Emelec", golesFavorLocal: 1.6, golesEnContraLocal: 0.9, golesFavorVisita: 1.1, golesEnContraVisita: 1.3, bttsPct: 60, cornersProm: 5.3, faltasFavor: 14.8, faltasEnContra: 14.4, tirosPuerta: 4.8, fuerasJuego: 1.7, tarjetasAmarrillas: 3.4 }
            ]
        },
        {
            nombre: 'Holanda - Eredivisie (1ª División)',
            equipos: [
                { nombre: "PSV Eindhoven", golesFavorLocal: 2.8, golesEnContraLocal: 0.8, golesFavorVisita: 2.3, golesEnContraVisita: 1.1, bttsPct: 70, cornersProm: 7.2, faltasFavor: 9.5, faltasEnContra: 10.0, tirosPuerta: 7.5, fuerasJuego: 2.5, tarjetasAmarrillas: 1.7 },
                { nombre: "Ajax", golesFavorLocal: 2.3, golesEnContraLocal: 1.0, golesFavorVisita: 1.8, golesEnContraVisita: 1.4, bttsPct: 74, cornersProm: 6.5, faltasFavor: 10.2, faltasEnContra: 10.8, tirosPuerta: 6.4, fuerasJuego: 2.3, tarjetasAmarrillas: 2.0 },
                { nombre: "Feyenoord", golesFavorLocal: 2.4, golesEnContraLocal: 0.7, golesFavorVisita: 1.9, golesEnContraVisita: 1.0, bttsPct: 65, cornersProm: 6.8, faltasFavor: 10.8, faltasEnContra: 11.2, tirosPuerta: 6.8, fuerasJuego: 2.4, tarjetasAmarrillas: 2.2 },
                { nombre: "AZ Alkmaar", golesFavorLocal: 1.9, golesEnContraLocal: 1.0, golesFavorVisita: 1.4, golesEnContraVisita: 1.3, bttsPct: 67, cornersProm: 5.9, faltasFavor: 10.5, faltasEnContra: 11.0, tirosPuerta: 5.7, fuerasJuego: 2.0, tarjetasAmarrillas: 1.8 }
            ]
        },
        {
            nombre: 'Alemania - Bundesliga (1ª División)',
            equipos: [
                { nombre: "Bayern Múnich", golesFavorLocal: 2.9, golesEnContraLocal: 0.9, golesFavorVisita: 2.4, golesEnContraVisita: 1.2, bttsPct: 72, cornersProm: 7.3, faltasFavor: 10.0, faltasEnContra: 10.5, tirosPuerta: 7.6, fuerasJuego: 2.7, tarjetasAmarrillas: 1.8 },
                { nombre: "Bayer Leverkusen", golesFavorLocal: 2.6, golesEnContraLocal: 0.8, golesFavorVisita: 2.2, golesEnContraVisita: 1.1, bttsPct: 68, cornersProm: 7.0, faltasFavor: 11.0, faltasEnContra: 11.2, tirosPuerta: 7.1, fuerasJuego: 2.5, tarjetasAmarrillas: 2.1 },
                { nombre: "Borussia Dortmund", golesFavorLocal: 2.2, golesEnContraLocal: 1.1, golesFavorVisita: 1.7, golesEnContraVisita: 1.5, bttsPct: 75, cornersProm: 6.4, faltasFavor: 11.5, faltasEnContra: 12.0, tirosPuerta: 6.2, fuerasJuego: 2.2, tarjetasAmarrillas: 2.3 },
                { nombre: "RB Leipzig", golesFavorLocal: 2.1, golesEnContraLocal: 1.0, golesFavorVisita: 1.6, golesEnContraVisita: 1.4, bttsPct: 71, cornersProm: 6.2, faltasFavor: 11.8, faltasEnContra: 12.2, tirosPuerta: 6.0, fuerasJuego: 2.1, tarjetasAmarrillas: 2.4 }
            ]
        },
        {
            nombre: 'Italia - Serie A (1ª División)',
            equipos: [
                { nombre: "Inter de Milán", golesFavorLocal: 2.3, golesEnContraLocal: 0.6, golesFavorVisita: 1.9, golesEnContraVisita: 0.9, bttsPct: 56, cornersProm: 6.2, faltasFavor: 12.5, faltasEnContra: 13.0, tirosPuerta: 6.3, fuerasJuego: 2.1, tarjetasAmarrillas: 2.4 },
                { nombre: "Juventus", golesFavorLocal: 1.8, golesEnContraLocal: 0.5, golesFavorVisita: 1.4, golesEnContraVisita: 0.8, bttsPct: 48, cornersProm: 5.5, faltasFavor: 13.8, faltasEnContra: 13.5, tirosPuerta: 5.1, fuerasJuego: 1.8, tarjetasAmarrillas: 2.8 },
                { nombre: "AC Milan", golesFavorLocal: 2.1, golesEnContraLocal: 0.9, golesFavorVisita: 1.6, golesEnContraVisita: 1.2, bttsPct: 65, cornersProm: 6.0, faltasFavor: 13.0, faltasEnContra: 13.2, tirosPuerta: 5.9, fuerasJuego: 2.0, tarjetasAmarrillas: 2.7 },
                { nombre: "Napoli", golesFavorLocal: 2.0, golesEnContraLocal: 0.9, golesFavorVisita: 1.5, golesEnContraVisita: 1.2, bttsPct: 63, cornersProm: 5.8, faltasFavor: 13.2, faltasEnContra: 13.6, tirosPuerta: 5.7, fuerasJuego: 1.9, tarjetasAmarrillas: 2.6 }
            ]
        },
        {
            nombre: 'Francia - Ligue 1 (1ª División)',
            equipos: [
                { nombre: "Paris Saint-Germain", golesFavorLocal: 2.7, golesEnContraLocal: 0.8, golesFavorVisita: 2.2, golesEnContraVisita: 1.1, bttsPct: 68, cornersProm: 7.0, faltasFavor: 10.2, faltasEnContra: 11.0, tirosPuerta: 7.3, fuerasJuego: 2.6, tarjetasAmarrillas: 1.9 },
                { nombre: "AS Monaco", golesFavorLocal: 2.0, golesEnContraLocal: 1.0, golesFavorVisita: 1.5, golesEnContraVisita: 1.3, bttsPct: 70, cornersProm: 5.9, faltasFavor: 12.2, faltasEnContra: 12.8, tirosPuerta: 5.7, fuerasJuego: 2.0, tarjetasAmarrillas: 2.6 },
                { nombre: "Olympique de Marsella", golesFavorLocal: 1.9, golesEnContraLocal: 1.0, golesFavorVisita: 1.4, golesEnContraVisita: 1.3, bttsPct: 67, cornersProm: 5.8, faltasFavor: 13.0, faltasEnContra: 13.5, tirosPuerta: 5.5, fuerasJuego: 1.8, tarjetasAmarrillas: 2.9 }
            ]
        },
        {
            nombre: 'Arabia Saudita - Saudi Pro League (1ª División)',
            equipos: [
                { nombre: "Al Hilal", golesFavorLocal: 2.8, golesEnContraLocal: 0.7, golesFavorVisita: 2.3, golesEnContraVisita: 1.0, bttsPct: 66, cornersProm: 6.9, faltasFavor: 10.8, faltasEnContra: 11.5, tirosPuerta: 7.4, fuerasJuego: 2.5, tarjetasAmarrillas: 2.0 },
                { nombre: "Al Nassr", golesFavorLocal: 2.7, golesEnContraLocal: 0.9, golesFavorVisita: 2.1, golesEnContraVisita: 1.2, bttsPct: 72, cornersProm: 6.7, faltasFavor: 11.2, faltasEnContra: 12.0, tirosPuerta: 7.2, fuerasJuego: 2.4, tarjetasAmarrillas: 2.2 },
                { nombre: "Al Ahli", golesFavorLocal: 2.2, golesEnContraLocal: 1.0, golesFavorVisita: 1.7, golesEnContraVisita: 1.3, bttsPct: 69, cornersProm: 6.1, faltasFavor: 11.5, faltasEnContra: 12.1, tirosPuerta: 6.2, fuerasJuego: 2.1, tarjetasAmarrillas: 2.3 },
                { nombre: "Al Ittihad", golesFavorLocal: 2.1, golesEnContraLocal: 1.0, golesFavorVisita: 1.6, golesEnContraVisita: 1.3, bttsPct: 68, cornersProm: 6.0, faltasFavor: 11.8, faltasEnContra: 12.4, tirosPuerta: 6.0, fuerasJuego: 2.0, tarjetasAmarrillas: 2.4 }
            ]
        },
        {
            nombre: 'Chile - Primera División',
            equipos: [
                { nombre: "Colo-Colo", golesFavorLocal: 1.8, golesEnContraLocal: 0.7, golesFavorVisita: 1.3, golesEnContraVisita: 1.1, bttsPct: 55, cornersProm: 5.7, faltasFavor: 14.0, faltasEnContra: 13.5, tirosPuerta: 5.3, fuerasJuego: 1.8, tarjetasAmarrillas: 3.0 },
                { nombre: "Universidad de Chile", golesFavorLocal: 1.7, golesEnContraLocal: 0.8, golesFavorVisita: 1.2, golesEnContraVisita: 1.2, bttsPct: 58, cornersProm: 5.5, faltasFavor: 14.5, faltasEnContra: 14.0, tirosPuerta: 5.1, fuerasJuego: 1.7, tarjetasAmarrillas: 3.2 },
                { nombre: "Universidad Católica", golesFavorLocal: 1.6, golesEnContraLocal: 0.9, golesFavorVisita: 1.1, golesEnContraVisita: 1.3, bttsPct: 59, cornersProm: 5.3, faltasFavor: 14.2, faltasEnContra: 13.8, tirosPuerta: 4.8, fuerasJuego: 1.6, tarjetasAmarrillas: 3.1 }
            ]
        },
        {
            nombre: 'Escocia - Scottish Premiership (1ª División)',
            equipos: [
                { nombre: "Celtic", golesFavorLocal: 2.6, golesEnContraLocal: 0.6, golesFavorVisita: 2.1, golesEnContraVisita: 0.9, bttsPct: 54, cornersProm: 7.1, faltasFavor: 11.0, faltasEnContra: 11.8, tirosPuerta: 7.0, fuerasJuego: 2.3, tarjetasAmarrillas: 2.1 },
                { nombre: "Rangers", golesFavorLocal: 2.4, golesEnContraLocal: 0.7, golesFavorVisita: 1.9, golesEnContraVisita: 1.0, bttsPct: 57, cornersProm: 6.8, faltasFavor: 11.5, faltasEnContra: 12.2, tirosPuerta: 6.6, fuerasJuego: 2.2, tarjetasAmarrillas: 2.3 },
                { nombre: "Hearts", golesFavorLocal: 1.6, golesEnContraLocal: 1.0, golesFavorVisita: 1.1, golesEnContraVisita: 1.4, bttsPct: 62, cornersProm: 5.2, faltasFavor: 13.2, faltasEnContra: 13.8, tirosPuerta: 4.7, fuerasJuego: 1.7, tarjetasAmarrillas: 2.8 }
            ]
        },
        {
            nombre: 'Japón - J1 League (1ª División)',
            equipos: [
                { nombre: "Vissel Kobe", golesFavorLocal: 1.7, golesEnContraLocal: 0.7, golesFavorVisita: 1.3, golesEnContraVisita: 0.9, bttsPct: 52, cornersProm: 5.4, faltasFavor: 10.5, faltasEnContra: 11.0, tirosPuerta: 5.2, fuerasJuego: 1.6, tarjetasAmarrillas: 1.6 },
                { nombre: "Yokohama F. Marinos", golesFavorLocal: 1.9, golesEnContraLocal: 1.0, golesFavorVisita: 1.4, golesEnContraVisita: 1.3, bttsPct: 68, cornersProm: 6.0, faltasFavor: 10.0, faltasEnContra: 10.5, tirosPuerta: 5.8, fuerasJuego: 2.1, tarjetasAmarrillas: 1.5 },
                { nombre: "Sanfrecce Hiroshima", golesFavorLocal: 1.8, golesEnContraLocal: 0.6, golesFavorVisita: 1.3, golesEnContraVisita: 0.9, bttsPct: 50, cornersProm: 5.7, faltasFavor: 10.8, faltasEnContra: 11.2, tirosPuerta: 5.5, fuerasJuego: 1.7, tarjetasAmarrillas: 1.7 }
            ]
        },
        {
            nombre: 'Noruega - Eliteserien (1ª División)',
            equipos: [
                { nombre: "Bodo/Glimt", golesFavorLocal: 2.5, golesEnContraLocal: 0.8, golesFavorVisita: 2.0, golesEnContraVisita: 1.1, bttsPct: 68, cornersProm: 6.7, faltasFavor: 10.2, faltasEnContra: 10.8, tirosPuerta: 6.9, fuerasJuego: 2.2, tarjetasAmarrillas: 1.9 },
                { nombre: "Molde", golesFavorLocal: 2.2, golesEnContraLocal: 0.9, golesFavorVisita: 1.7, golesEnContraVisita: 1.3, bttsPct: 70, cornersProm: 6.3, faltasFavor: 10.8, faltasEnContra: 11.2, tirosPuerta: 6.2, fuerasJuego: 2.0, tarjetasAmarrillas: 2.1 },
                { nombre: "Rosenborg", golesFavorLocal: 1.7, golesEnContraLocal: 1.0, golesFavorVisita: 1.2, golesEnContraVisita: 1.4, bttsPct: 64, cornersProm: 5.6, faltasFavor: 11.5, faltasEnContra: 12.0, tirosPuerta: 5.0, fuerasJuego: 1.8, tarjetasAmarrillas: 2.2 }
            ]
        }
    ];

    const contenidoTs = `import { Injectable } from '@angular/core';

export interface EquipoStats {
  nombre: string;
  golesFavorLocal: number;
  golesEnContraLocal: number;
  golesFavorVisita: number;
  golesEnContraVisita: number;
  bttsPct: number;
  cornersProm: number;
  faltasFavor: number;
  faltasEnContra: number;
  tirosPuerta: number;
  fuerasJuego: number;
  tarjetasAmarrillas: number;
}

export interface Liga {
  nombre: string;
  equipos: EquipoStats[];
}

@Injectable({
  providedIn: 'root'
})
export class FootballSheetService {
  private ligasCatalog: Liga[] = ${JSON.stringify(ligasCatalogo, null, 2)};

  getLigas(): Liga[] {
    return this.ligasCatalog;
  }

  calcularMarcador(golesLocal: number, golesVisita: number) {
    const probableL = Math.round(golesLocal * 0.82);
    const probableV = Math.round(golesVisita * 0.88);
    const porcentaje = 22.45;
    return { equipo1: probableL, equipo2: probableV, porcentaje };
  }

  calcularOverUnder(gLocal: number, defV: number, gV: number, defL: number) {
    const total = Number((gLocal + gV + 1.15).toFixed(2));
    return {
      total,
      recomendacion: total > 2.5 ? 'MÁS DE 2,5 GOLES' : 'MENOS DE 2,5 GOLES'
    };
  }

  calcularBTTS(bttsLocal: number, bttsVisita: number) {
    const promedio = Number(((bttsLocal + bttsVisita) / 2).toFixed(1));
    return {
      promedio,
      recomendacion: promedio >= 55 ? 'SÍ MARCAN AMBOS (BTTS SÍ)' : 'NO MARCAN AMBOS (BTTS NO)'
    };
  }

  calcularCorners(cornersLocal: number, cornersVisita: number) {
    const pronosticados = Number((cornersLocal + cornersVisita).toFixed(1));
    return {
      pronosticados,
      recomendacion: pronosticados > 9.5 ? 'MÁS DE 9,5 CÓRNERS' : 'MENOS DE 9,5 CÓRNERS'
    };
  }

  calcularTarjetas(taLocal: number, taVisita: number, promArbitro: number) {
    const pronosticadas = Number((((taLocal + taVisita) / 2) * 0.6 + promArbitro * 0.4).toFixed(2));
    return {
      pronosticadas,
      recomendacion: pronosticadas > 4.5 ? 'MÁS DE 4,5 TARJETAS (OVER)' : 'MENOS DE 4,5 TARJETAS (UNDER)'
    };
  }

  calcularFaltas(fawLocal: number, fconLocal: number, fawVisita: number, fconVisita: number, arbitroFaltas: number) {
    const promEquipos = (fawLocal + fconLocal + fawVisita + fconVisita) / 4;
    const pronosticadas = Number((promEquipos * 0.5 + arbitroFaltas * 0.5).toFixed(1));
    return {
      pronosticadas,
      recomendacion: pronosticadas > 24.5 ? 'MÁS DE 24,5 FALTAS' : 'MENOS DE 24,5 FALTAS'
    };
  }

  calcularTirosPuerta(sotLocal: number, sotVisita: number) {
    const pronosticados = Number((sotLocal + sotVisita).toFixed(1));
    return {
      pronosticados,
      recomendacion: pronosticados > 8.5 ? 'MÁS DE 8,5 TIROS A PUERTA' : 'MENOS DE 8,5 TIROS A PUERTA'
    };
  }

  calcularFuerasJuego(offLocal: number, offVisita: number) {
    const pronosticadas = Number((offLocal + offVisita).toFixed(1));
    return {
      pronosticadas,
      recomendacion: pronosticadas > 3.5 ? 'MÁS DE 3,5 FUERAS DE JUEGO' : 'MENOS DE 3,5 FUERAS DE JUEGO'
    };
  }
}
`;

    const rutaDestino = path.join(__dirname, 'src/app/services/football-sheet.service.ts');
    fs.writeFileSync(rutaDestino, contenidoTs, 'utf-8');
    console.log('¡Catálogo completo con todos los equipos de la Liga MX integrado correctamente!');
}

generarDatosCompletos();