const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function startBackend() {
  const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
  const backendPath = path.join(__dirname, '../backend/main.py');

  try {
    pythonProcess = spawn(pythonExecutable, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], {
      cwd: path.join(__dirname, '../backend'),
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`[Backend]: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`[Backend ERR]: ${data}`);
    });
  } catch (err) {
    console.error('Failed to spawn Python backend process', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: 'Igreja+ | Sistema Profissional de Gestão Eclesiástica',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const appUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  mainWindow.loadURL(appUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  startBackend();
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
