/**
 * @file PromiseChainingTests.js
 * @description Mòdul per obtenir informació geogràfica i dades completes de països a partir de coordenades.
 * Conté funcions separades per fer reverse geocoding i obtenir informació del país.
 */

import dotenv from 'dotenv';
dotenv.config();

// Comprovació de la clau d'API
if (!process.env.API_KEY) throw new Error("No s'ha pogut accedir a la API_KEY");

/**
 * Mapa de codis ISO3 a ISO2 necessari per consultar REST Countries
 */
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

/**
 * Obtén informació geogràfica aproximada a partir de coordenades
 * 
 * @param {number} lat - Latitud de la posició
 * @param {number} lng - Longitud de la posició
 * @returns {Promise<Object|undefined>} Objecte amb informació geogràfica o undefined en cas d'error
 */
export function whereAmI(lat, lng) {
    return fetch(
        `https://api.positionstack.com/v1/reverse?access_key=${process.env.API_KEY}&query=${lat},${lng}`.trim()
    )
    .then(res => res.json())
    .then(data => {
        if (!data.data || data.data.length === 0) throw new Error("No s'han trobat resultats.");

        // Seleccionem la posició més propera comparant distàncies
        const aprox = data.data.reduce((prev, curr) => curr.distance < prev.distance ? curr : prev);

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
    .catch(err => {
        console.error("Error en whereAmI:", err);
        return undefined;
    });
}

/**
 * Obtén informació detallada d'un país a partir de l'objecte geogràfic
 * 
 * @param {Object} obj - Objecte amb informació geogràfica (retornat per whereAmI)
 * @returns {Promise<Object|undefined>} Objecte amb dades completes del país o undefined si falla
 */
export function locationGeneralData(obj) {
    if (!obj) return Promise.resolve(undefined);

    const countryCode2 = iso3to2[obj.countryInfo[1]] || '';

    return fetch(`https://restcountries.com/v3.1/alpha/${countryCode2}`)
    .then(res => {
        if (!res.ok) throw new Error(`REST Countries API error: ${res.status}`);
        return res.json();
    })
    .then(data => {
        const country = data[0];
        if (!country) throw new Error("No s'ha trobat cap país");

        // Formatem dades rellevants del país
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
    })
    .catch(err => {
        console.error("Error en locationGeneralData:", err);
        return undefined;
    });
}

/**
 * Funció principal que retorna dades completes de tots els països a partir de coordenades
 * 
 * @returns {Promise<Array>} Array amb dades completes dels països, eliminant entrades fallides
 */
const coordsArray = [
    [52.508, 13.381],
    [19.037, 72.873],
    [-33.933, 18.474]
];

export function main() {
    // Mapejem cada coordenada a la promesa combinada
    const promises = coordsArray.map(pos =>
        whereAmI(pos[0], pos[1])
        .then(geo => locationGeneralData(geo)) // Encadenem la crida a la segona funció
    );

    return Promise.all(promises)
        .then(arrayData => arrayData.filter(d => d !== undefined)) // Eliminem resultats fallits
        .catch(err => {
            console.error("Error en main:", err);
            return [];
        });
}

main()
.then(finalArray => {
    console.log("Resultats complets:", finalArray);
})
.catch(err => {
    console.error("Error al provar main():", err);
});


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