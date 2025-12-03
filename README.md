# Nota sobre PromiseChaining

El fitxer `PromiseChaining.js` i els seus tests estan destinats només a **testeig** i a comprovar que les dades es mostren correctament.

Si no es veuen resultats, pot ser degut a **problemes temporals de l'API** o al **limit de peticions mensuals**.  
Si utilitzes la teva pròpia API key, hauria de funcionar correctament.  

Els fitxers **finals** que s'han d'utilitzar per a la funcionalitat real del projecte són:  
- `server.js` → gestiona les peticions reals a les APIs i exposa l'endpoint `/api/countries`.
- `main.js` → s'encarrega de formatar i mostrar les dades a la pàgina web.