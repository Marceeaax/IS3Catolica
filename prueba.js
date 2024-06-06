const namer = require('color-namer');

function hexToColorName(hex) {
  const result = namer(hex);

  // Imprime los resultados de diferentes paletas
  console.log('NTC:', result.ntc[0].name);
  console.log('Pantone:', result.pantone[0].name);
  //console.log('RAL:', result.ral[0].name);
  console.log('HTML:', result.html[0].name);

  // Puedes elegir una paleta específica o una lógica para determinar cuál usar
  return result.ntc[0].name; // Aquí se usa la primera coincidencia de NTC
}

// Ejemplo de uso
const hexValue = '#FF0001';
const colorName = hexToColorName(hexValue);
console.log(`El nombre del color para ${hexValue} es ${colorName}.`);
