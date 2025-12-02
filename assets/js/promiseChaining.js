import dotenv from 'dotenv';
dotenv.config();

// Comprovació que existeix la clau d'API
if (!process.env.API_KEY) throw new Error("No s'ha pogut accedir a la API_KEY");

/**
 * Exercici1
 * Funció per obtenir informació geogràfica aproximada a partir de coordenades.
 * Utilitza l'API PositionStack per a fer reverse geocoding.
 * 
 * @param {number} lat - Latitud de la posició.
 * @param {number} lng - Longitud de la posició.
 * @returns {Promise<Object|undefined>} Retorna un objecte amb informació localitzada,
 * o undefined si hi ha algun error.
 */
export function whereAmI(lat, lng) {
    return fetch(
        `https://api.positionstack.com/v1/reverse?access_key=${process.env.API_KEY}&query=${lat},${lng}`.trim().replace(/\s*\n\s*/g, '')
    )
    // Convertir resposta a JSON
    .then(res => res.json())
    .then(data => {
        // Comprovació que hi hagi resultats
        if (!data.data || data.data.length === 0) throw new Error("No s'han trobat resultats.");

        // Selecciona la posició més propera comparant lat/lng
        const aprox = data.data.reduce((prev, curr) => {
            return curr.distance < prev.distance ? curr : prev;
        });

        // Retorna un objecte amb la informació rellevant
        return {
            'oName': aprox.name, 
            'locality': aprox.locality, 
            'countryInfo': [aprox.country, aprox.country_code],
            'region': aprox.region,
            'postalCode': aprox.postal_code,
            'latitude': aprox.latitude, 
            'longitude': aprox.longitude
        };
    })
    // Passa les dades a la funció locationGeneralData
    .then(summary => locationGeneralData(summary))
    .catch(err => {
        console.error(`Hi ha hagut un problema buscant la teva localització: ${err}`);
        return;
    });
}

/**
 * Exercici2
 * Funció per obtenir informació detallada d'un país a partir del seu codi ISO3.
 * Utilitza l'API REST Countries.
 * 
 * @param {Object} obj - Objecte amb informació bàsica de la localització.
 * @returns {Promise<Object|undefined>} Retorna un objecte amb informació del país,
 * o undefined si hi ha algun error.
 */
export function locationGeneralData(obj) {
    console.log(obj);

    // Comprovació que l'objecte rebut no sigui buit
    if (!obj) throw new Error("L'objecte rebut està buit");

    // Mapa de codis ISO3 a ISO2 (necessari per REST Countries)
    const iso3to2 = {
        DEU: 'DE',
        ESP: 'ES',
        FRA: 'FR',
        ITA: 'IT',
        USA: 'US',
        GBR: 'GB',
    };
    const countryCode2 = iso3to2[obj.countryInfo[1]] || '';

    return fetch(`https://restcountries.com/v3.1/alpha/${countryCode2}`)
    .then(res => {
        if (!res.ok) throw new Error(`REST Countries API error: ${res.status}`);
        return res.json();
    })
    .then(data => {
        const country = data[0];
        if (!country) throw new Error("No s'ha trobat cap país");

        // Retorna objecte amb dades detallades del país
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
        };
    })
    .catch(err => {
        console.error(`Hi ha hagut un problema generant les dades: ${err}`);
        return;
    });
}

// ------------------------------
// Exemple d'ús
const lat = 52.508;
const lng = 13.381;

whereAmI(lat, lng)
.then(finalData => {
    console.log('Resultat final complet:', JSON.stringify(finalData, null, 2));
});

// Pregunta: 
// 'Si recàrregues la pàgina, apareixen els resultats en el mateix ordre?, expliqueu el perquè.'
// Resposta:
