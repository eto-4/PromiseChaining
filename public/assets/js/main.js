/**
 * @file main.js
 * @description Fitxer principal del frontend per obtenir i mostrar dades dels països.
 * Fa fetch a l'endpoint `/api/countries` del backend i renderitza una taula amb la informació.
 */

/**
 * Elements del DOM
 */
const countryData = document.getElementById('countryData'); // Contenidor de la taula amb dades
const loading = document.getElementById('loadingData');    // Missatge de càrrega

// Mostra l'indicador de càrrega mentre arriben les dades
loading.style.display = 'block';

/**
 * Fetch a l'endpoint del backend que retorna les dades dels països
 * 
 * @returns {Promise<void>} Renderitza la taula amb la informació obtinguda.
 */
fetch("/api/countries")
.then(res => res.json()) // Converteix la resposta a JSON
.then(finalArray => {

    // Crea la taula principal
    const table = document.createElement('table');

    // Capçalera de la taula
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Bandera</th>
            <th>Datos</th>
        </tr>
    `;
    table.appendChild(thead);

    // Cos de la taula
    const tbody = document.createElement('tbody');

    // Recorrem cada país del array rebut
    finalArray.forEach(country => {
        if (!country) return; // Ignora entrades undefined

        const tr = document.createElement('tr');

        // -----------------------------
        // Primer td: bandera del país
        // -----------------------------
        const tdFlag = document.createElement('td');
        const img = document.createElement('img');
        img.src = country.flagURL || '';        // URL de la bandera
        img.alt = country.flagEmoji || 'Flag';  // Emoji de la bandera com a alt
        img.style.width = '50px';
        tdFlag.appendChild(img);

        // -----------------------------
        // Segon td: llista de dades
        // -----------------------------
        const tdData = document.createElement('td');
        const ul = document.createElement('ul');

        // Afegim informació rellevant en llistes
        ul.innerHTML = `
            <li>Nom: ${country.name || ''}</li>
            <li>Capital: ${country.capital || ''}</li>
            <li>Població: ${country.population || 0}</li>
            <li>Monedes: ${country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : ''}</li>
            <li>Idiomes: ${country.languages ? Object.values(country.languages).join(', ') : ''}</li>
            <li>Fronteres: ${country.borders.length ? country.borders.join(', ') : 'No hay fronteras'}</li>
            <li>Zones horàries: ${country.timezones.join(', ')}</li>
        `;

        tdData.appendChild(ul);

        // Afegim els td al tr i després al tbody
        tr.appendChild(tdFlag);
        tr.appendChild(tdData);
        tbody.appendChild(tr);
    });

    // Afegim tbody a la taula i la taula al contenidor principal
    table.appendChild(tbody);
    countryData.appendChild(table);

    // Amaguem l'indicador de càrrega
    loading.style.display = 'none';
})
.catch(err => {
    // Mostra errors a la consola i amaga l'indicador de càrrega
    console.error("Error al obtener los datos:", err);
    loading.style.display = 'none';
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