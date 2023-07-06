document.addEventListener('DOMContentLoaded', function() {
  const compareButton = document.getElementById('compareButton');
  const fileInput1 = document.getElementById('fileInput1');
  const fileInput2 = document.getElementById('fileInput2');

  fileInput1.addEventListener('change', handleFileInputChange);
  fileInput2.addEventListener('change', handleFileInputChange);
  compareButton.addEventListener('click', compararClick);
});

function handleFileInputChange(event) {
  const fileInput1 = document.getElementById('fileInput1');
  const fileInput2 = document.getElementById('fileInput2');
  const compareButton = document.getElementById('compareButton');

  if (fileInput1.files.length > 0 && fileInput2.files.length > 0) {
    compareButton.disabled = false;
  } else {
    compareButton.disabled = true;
  }
}

function compararClick() {
  const fileInput1 = document.getElementById('fileInput1');
  const fileInput2 = document.getElementById('fileInput2');

  const archivo1 = fileInput1.files[0];
  const archivo2 = fileInput2.files[0];

  compararArchivosExcel(archivo1, archivo2);
}

function compararArchivosExcel(archivo1, archivo2) {
  const reader1 = new FileReader();
  const reader2 = new FileReader();

  reader1.onload = function(e) {
    const data1 = new Uint8Array(e.target.result);
    const workbook1 = XLSX.read(data1, { type: 'array' });

    reader2.onload = function(e) {
      const data2 = new Uint8Array(e.target.result);
      const workbook2 = XLSX.read(data2, { type: 'array' });

      const sheetNames1 = workbook1.SheetNames;
      const sheetNames2 = workbook2.SheetNames;

      sheetNames1.forEach((sheetName, index) => {
        const worksheet1 = workbook1.Sheets[sheetName];
        const worksheet2 = workbook2.Sheets[sheetNames2[index]];

        const data1 = XLSX.utils.sheet_to_json(worksheet1, { header: 1 });
        const data2 = XLSX.utils.sheet_to_json(worksheet2, { header: 1 });

        const areEqual = compararContenido(data1, data2);

        if (areEqual) {
          console.log(`No se encontraron diferencias en la hoja "${sheetName}".`);
        } else {
          console.log(`Diferencias encontradas en la hoja "${sheetName}":`);
          console.log(`Datos en archivo1 que no están en archivo2:`, JSON.stringify(obtenerDiferencias(data1, data2)));
          console.log(`Datos en archivo2 que no están en archivo1:`, JSON.stringify(obtenerDiferencias(data2, data1)));
        }
      });
    };

    // Lógica para leer el segundo archivo Excel
    reader2.readAsArrayBuffer(archivo2);
  };

  // Lógica para leer el primer archivo Excel
  reader1.readAsArrayBuffer(archivo1);
}

function compararContenido(data1, data2) {
  if (data1.length !== data2.length) {
    return false;
  }

  // Convertir las filas en conjuntos
  const set1 = new Set(data1.map(JSON.stringify));
  const set2 = new Set(data2.map(JSON.stringify));

  // Comparar los conjuntos
  for (const item of set1) {
    if (!set2.has(item)) {
      return false;
    }
  }

  return true;
}

 

function obtenerDiferencias(data1, data2) {
  const differences = [];

  for (let i = 0; i < data1.length; i++) {
    const row1 = data1[i];
    const row2 = data2[i];

    if (row1.length !== row2.length) {
      differences.push({ index: i, values: row1 });
      continue;
    }

    for (let j = 0; j < row1.length; j++) {
      if (row1[j] !== row2[j]) {
        differences.push({ index: i, values: row1 });
        break;
      }
    }
  }

  return differences;
}