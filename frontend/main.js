const { app, BrowserWindow, ipcMain, session, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const os = require('os');
const { execFile, exec } = require('child_process');

const mangoPath = 'C:\\Program Files\\Mango\\Mango.exe'; // Ajusta la ruta según tu sistema

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.loadURL('http://localhost:3000');

  // Intercepta la apertura de nuevas ventanas (target="_blank")
win.webContents.setWindowOpenHandler(({ url }) => {
  // Bloquea solo si NO es un archivo descargable
  if (/\.(nii\.gz|dcm|zip|nii)$/i.test(url)) {
    return { action: 'allow' }; // Permite la descarga (Electron la maneja con will-download)
  }
  return { action: 'deny' }; // Bloquea otras ventanas
});


  // Intercepta descargas para gestionarlas (opcional)
  session.defaultSession.on('will-download', (event, item, webContents) => {
    // Puedes personalizar la ruta de guardado aquí si lo deseas
    // const savePath = path.join(os.homedir(), 'Descargas', item.getFilename());
    // item.setSavePath(savePath);

    // Puedes mostrar progreso, notificaciones, etc.
    item.once('done', (event, state) => {
      if (state === 'completed') {
        // Notifica al usuario si lo deseas
        // webContents.send('descarga-completada', item.getSavePath());
      }
    });
  });
}

// Espera activa hasta que todos los archivos estén presentes y completos
async function esperarArchivosListos(tempDir, cantidad, intentos = 30, ms = 200) {
  for (let i = 0; i < intentos; i++) {
    try {
      const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.dcm'));
      if (files.length === cantidad) {
        // Verifica que todos tengan tamaño mayor que cero
        const completos = files.every(f => {
          const stats = fs.statSync(path.join(tempDir, f));
          return stats.size > 0;
        });
        if (completos) return true;
      }
    } catch (e) {}
    await new Promise(res => setTimeout(res, ms));
  }
  return false;
}

ipcMain.on('abrir-dicom', async (event, dicomUrls) => {
  try {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dicom-serie-'));
    const descargas = dicomUrls.map((url, idx) => {
      return new Promise((resolve, reject) => {
        const fileName = `I${String(idx + 1).padStart(5, '0')}.dcm`;
        const filePath = path.join(tempDir, fileName);
        const file = fs.createWriteStream(filePath);
        const client = url.startsWith('https') ? https : http;
        client.get(url, response => {
          if (response.statusCode !== 200) return reject();
          response.pipe(file);
          file.on('finish', () => file.close(resolve));
        }).on('error', reject);
      });
    });

    await Promise.all(descargas);

    // Espera activa a que todos los archivos estén realmente presentes y completos
    const listos = await esperarArchivosListos(tempDir, dicomUrls.length, 40, 200); // 8 segundos máximo
    if (!listos) {
      event.reply('abrir-dicom-error', 'No se completaron todos los archivos DICOM.');
      return;
    }

    // Opcional: Cierra instancias previas de Mango
    exec('taskkill /IM Mango.exe /F', () => {
      setTimeout(() => {
        execFile(mangoPath, [tempDir], (error) => {
          if (error) {
            event.reply('abrir-dicom-error', 'No se pudo abrir Mango.');
          } else {
            event.reply('abrir-dicom-ok');
          }
        });
      }, 300);
    });
  } catch (err) {
    event.reply('abrir-dicom-error', 'Error al descargar la serie DICOM.');
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // En macOS es común mantener la app activa hasta que el usuario cierra explícitamente
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // En macOS, recrea la ventana si el usuario hace click en el dock y no hay ventanas abiertas
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
