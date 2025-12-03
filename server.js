/**
 * @file server.js
 * @description Servidor Express per proporcionar dades geogràfiques i de països al frontend.
 * Fa fetch a PositionStack i REST Countries, processa les dades i les retorna com a JSON.
 */

import express from "express";
import dotenv from "dotenv";

dotenv.config();

// Comprovació de la clau d'API
if (!process.env.API_KEY) throw new Error("No s'ha definit API_KEY");

const app = express();

// Serveix fitxers estàtics des de la carpeta 'public'
app.use(express.static("public"));

/**
 * Endpoint per obtenir dades dels països a partir de coordenades
 * @route GET /api/countries
 * @returns {Promise<Array>} Array d'objectes amb informació de cada país
 */
app.get("/api/countries", (req, res) => {

    // Array de coordenades per les quals obtindrem informació
    const array = [
        [52.508, 13.381],
        [19.037, 72.873],
        [-33.933, 18.474]
    ];

    // Map de cada coordenada a una promesa que retorna dades geogràfiques + país
    const promises = array.map(pos =>
        // Fetch a PositionStack
        fetch(`https://api.positionstack.com/v1/reverse?access_key=${process.env.API_KEY}&query=${pos[0]},${pos[1]}`)
        .then(r => r.json())
        .then(data => {
            if (!data.data || data.data.length === 0) return undefined;

            // Seleccionem la posició més propera
            const aprox = data.data.reduce((prev, curr) => curr.distance < prev.distance ? curr : prev);

            // Formategem dades geogràfiques bàsiques
            return {
                oName: aprox.name,
                locality: aprox.locality,
                countryInfo: [aprox.country, aprox.country_code],
                region: aprox.region,
                postalCode: aprox.postal_code,
                latitude: aprox.latitude,
                longitude: aprox.longitude
            };
        })
        // Fetch a REST Countries per obtenir dades del país
        .then(summary => {
            if (!summary) return undefined;

            const iso3to2 = {
                DEU: 'DE',
                ESP: 'ES',
                FRA: 'FR',
                ITA: 'IT',
                USA: 'US',
                GBR: 'GB',
                ZAF: 'ZA',
                IND: 'IN'
            };
            const countryCode2 = iso3to2[summary.countryInfo[1]] || '';

            return fetch(`https://restcountries.com/v3.1/alpha/${countryCode2}`)
            .then(r => r.json())
            .then(data => {
                const country = data[0];
                if (!country) return undefined;

                // Formategem dades completes del país
                return {
                    name: country.name.common || '',
                    officialName: country.name.official || '',
                    capital: country.capital ? country.capital[0] : '',
                    region: country.region || '',
                    subRegion: country.subregion || '',
                    population: country.population || 0,
                    languages: country.languages || {},
                    currencies: country.currencies || {},
                    flagEmoji: country.flag || '',
                    flagURL: country.flags.png || '',
                    mapURL: country.maps?.googleMaps || '',
                    borders: country.borders || [],
                    timezones: country.timezones || []
                };
            });
        })
        .catch(err => {
            console.error("Error fetching country:", err);
            return undefined;
        })
    );

    // Esperem totes les promeses i enviem els resultats al frontend
    return Promise.all(promises)
    .then(results => {
        res.json(results);
    });
});

// Inicialitzem el servidor
app.listen(3000, () => console.log("Servidor iniciat en http://localhost:3000"));


// RESPOSTA PREGUNTA FINAL:
/*
* Si recàrregues la pàgina, apareixen els resultats en el mateix ordre?, expliqueu el perquè.

Sí, els resultats apareixen sempre en el mateix ordre que l'array original de coordenades.
Això és perquè Promise.all retorna un array amb els valors resolts en el mateix ordre en què es van passar les promeses, 
encara que algunes promeses es resolguin més ràpid que altres. 

Si no s'utilitzés Promise.all i simplement s'afegissin els resultats al DOM dins de cada .then(), 
l'ordre podria variar depenent de quan es resolguin les promeses, ja que cada fetch és asíncron i pot finalitzar en un ordre diferent. 

Per tant, Promise.all garanteix consistència en l’ordre final dels resultats, fent que sigui predictible mostrar-los a la pàgina.
*/