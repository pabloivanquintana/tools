document.addEventListener('DOMContentLoaded', function() {
  const compareButton = document.getElementById('compareButton');
  const clearButton = document.getElementById('clearButton');
  const fileInput1 = document.getElementById('fileInput1');
  const fileInput2 = document.getElementById('fileInput2');
  const resultContainer = document.getElementById('resultContainer');

  fileInput1.addEventListener('change', handleFileInputChange);
  fileInput2.addEventListener('change', handleFileInputChange);
  compareButton.addEventListener('click', compararClick);
  clearButton.addEventListener('click', reiniciarPrograma);

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

        resultContainer.innerHTML = '';

        sheetNames1.forEach((sheetName, index) => {
          const worksheet1 = workbook1.Sheets[sheetName];
          const worksheet2 = workbook2.Sheets[sheetNames2[index]];

          const data1 = XLSX.utils.sheet_to_json(worksheet1, { header: 1 });
          const data2 = XLSX.utils.sheet_to_json(worksheet2, { header: 1 });

          const differences = obtenerDiferencias(data1, data2);

          if (differences.length === 0) {
            const resultElement = document.createElement('p');
            resultElement.textContent = `No se encontraron diferencias en la hoja "${sheetName}".`;
            resultContainer.appendChild(resultElement);
          } else {
            const resultElement = document.createElement('div');
            resultElement.innerHTML = `
              <p>Diferencias encontradas en la hoja "${sheetName}":</p>
              <p>Datos en archivo1 que no están en archivo2:</p>
              <ul>
                ${differences.map(difference => `<li>${JSON.stringify(difference)}</li>`).join('')}
              </ul>
            `;
            resultContainer.appendChild(resultElement);
          }
        });
      };

      // Lógica para leer el segundo archivo Excel
      reader2.readAsArrayBuffer(archivo2);
    };

    // Lógica para leer el primer archivo Excel
    reader1.readAsArrayBuffer(archivo1);
  }

  function reiniciarPrograma() {
    fileInput1.value = '';
    fileInput2.value = '';
    compareButton.disabled = true;
    resultContainer.innerHTML = '';
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
});
