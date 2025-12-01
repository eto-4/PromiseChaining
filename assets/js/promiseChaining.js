// Fitxer configuració General
import dotenv from 'dotenv';
dotenv.config();

// Exercici1
// Funció per obtenir dades
export function whereAmI(lat, lng) {
    return fetch(
        `https://api.positionstack.com/v1/reverse
        ?access_key=${process.env.API_KEY}
        &query=${lat},${lng}
        `.trim().replace(/\s*\n\s*/g, '')
    )
    // Formatar les dades
    .then(res => {
        // console.log(res);
        return res.json();
    })
    .then(data => {

        // console.log(data);
        const aprox = data.data.reduce((prev, curr) => {
            return curr.distance < prev.distance ? curr : prev;
        })

        // console.log(`Esteu a: ${aprox.name}, ${aprox.locality}, ${aprox.country}, ${aprox.latitude}, ${aprox.longitude}`);
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
    .then(summary => {
        return locationGeneralData(summary);
    })
    .catch(err => {
        console.error(`Hi ha hagut un problema buscant la teva localització: ${err}`);
        return;
    })
}

// whereAmI(52.508, 13.381)
// .then(res => {
//     console.log(res);
// })
// .catch(err => {
//     console.error("Error:" + err);
// });

// ------------------------------
/**
 * TEST
{
  oName: 'Abgeordnetenhaus von Berlin',
  locality: 'Berlin',
  countryInfo: [ 'Germany', 'DEU' ],
  region: 'Berlin',
  postalCode: '10117',
  latitude: 52.507925,
  longitude: 13.381481
}
 
 * */ 
// -------------------------------


export function locationGeneralData(obj) {
    console.log(obj);

    const iso3to2 = {
      DEU: 'DE',
      ESP: 'ES',
      FRA: 'FR',
      ITA: 'IT',
      USA: 'US',
      GBR: 'GB',
    };
    const countryCode2 = iso3to2[obj.countryInfo[1]] || '';

    return fetch(
        `https://api.positionstack.com/v1/forward
        ?access_key=${process.env.API_KEY}
        &query=${obj.oName || obj.postalCode}
        &country=${countryCode2}
        &region=${obj.region}
        &country_module=1
        &timezone_module=1
        `.trim().replace(/\s*\n\s*/g, '')
    )
    .then(res => {
        return res.json();
    })
    .then(data => {
        return data;
    })
    .catch(err => {
        console.error(`Hi ha hagut un problema generant les dades: ${err}`);
        return;
    })
}

const lat = 52.508;
const lng = 13.381;

whereAmI(lat, lng)
.then(finalData => {
    console.log('Resultado final completo:', JSON.stringify(finalData, null, 2));
});

// Pregunta: 
// 'Si recàrregues la pàgina, apareixen els resultats en el mateix ordre?, expliqueu el perquè.'
// Resposata: