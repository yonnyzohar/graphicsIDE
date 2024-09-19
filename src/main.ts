import { app, BrowserWindow, dialog, ipcMain, Menu, screen } from 'electron';
import * as path from 'path';
const fs = require('fs');
const fsp = require('fs').promises;

//npm run build-and-start

let win: BrowserWindow | null = null;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    win = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: true
        }
    });

    win.loadFile(path.join(__dirname, 'index.html'));
    win.webContents.openDevTools();
    addContextMenu();

}

function addContextMenu() {

    const menuTemplate: Array<(Electron.MenuItemConstructorOptions) | (Electron.MenuItem)> = [
        {
            label: 'File',
            submenu: [
                { 
                    label: 'Open', 
                    click: () => { 
                        console.log('Open clicked'); 
                        const dataToSend = { message: "Time to open a file!!" };
                        if(win)
                        {
                            //win?.webContents.send('data-from-main', dataToSend);
                            openFileDialog(win);
                        }
                        
                    } 
                },
                { 
                    label: 'Save', 
                    click: () => { 
                        console.log('Save clicked'); 
                        const dataToSend = { message: "save_file" };
                        win?.webContents.send('data-from-main', dataToSend);
                    } 
                },
                { type: 'separator' },
                { label: 'Exit', click: () => { app.quit(); } },
            ],
        }
    ];

    /*
    ,
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', role: 'undo' },
                { label: 'Redo', role: 'redo' },
                { type: 'separator' },
                { label: 'Cut', role: 'cut' },
                { label: 'Copy', role: 'copy' },
                { label: 'Paste', role: 'paste' },
            ],
        },
        {
            label: 'Help',
            submenu: [
                { label: 'About', click: () => { console.log('About clicked'); } },
            ],
        },
    */

    // Build the menu from the template
    const menu = Menu.buildFromTemplate(menuTemplate);

    // Set the application menu
    Menu.setApplicationMenu(menu);

    win?.webContents.on('did-finish-load', () => {
        const dataToSend = { message: "Hello from the main process!" };
        win?.webContents.send('data-from-main', dataToSend);
    });
}
async function saveJsonFile(jsonData:object) {
    // Show save dialog and get the file path
    const { filePath } = await dialog.showSaveDialog({
        title: 'Save JSON File',
        defaultPath: 'data.json', // Default file name
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (filePath) {
        try {
            // Write the JSON string to the file
            await fsp.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
            return { success: true, message: 'File saved successfully' };
        } catch (err) {
            console.error('Failed to save the file:', err);
            return { success: false, message: 'Failed to save the file' };
        }
    } else {
        return { success: false, message: 'Save dialog was canceled' };
    }
}


function openFileDialog(win: BrowserWindow) {
    dialog.showOpenDialog(win, {
        title: 'Select a file',
        defaultPath: path.join(app.getPath('home')),
        buttonLabel: 'Open',
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['*'] },
            { name: 'Text Files', extensions: ['txt', 'md'] },
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
        ]
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const selectedFile = result.filePaths[0];
            console.log('File selected:', selectedFile);

            const jsonData = fs.readFileSync(selectedFile, 'utf8'); // Read the file synchronously
            const data = JSON.parse(jsonData);

            const dataToSend = { message: "loaded_json", payload : data };
            win.webContents.send('data-from-main', dataToSend);
            // You can send this file path to the renderer process or handle it in the main process
        }
    }).catch(err => {
        console.error('Failed to open file dialog:', err);
    });
}


app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('data-from-browser', (event, data) => {
    console.log('Received from renderer:', data);
    saveJsonFile(data.payload);

    // Optionally, send a message back to the renderer process
});

