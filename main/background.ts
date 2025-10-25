import path from 'path'
import './db';
import './api';
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import JsExcelTemplate from 'js-excel-template';

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  mainWindow.setMenuBarVisibility(false)

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('xslx', async (event, arg) => {
  const excelTemplate = await JsExcelTemplate.fromFile("demo/test.xlsx");
  excelTemplate.set("name", "John");
  excelTemplate.set("age", 123);
  excelTemplate.set("now", new Date());
  excelTemplate.set("isBoy", true);
  const students = [
    { name: "Tommy", age: 12 },
    { name: "Philips", age: 13 },
    { name: "Sara", age: 14 },
  ];
  for (let i = 1; i <= 5; i++) {
    if (i <= students.length) {
      excelTemplate.set(`name${i}`, students[i - 1].name);
      excelTemplate.set(`age${i}`, students[i - 1].age);
    } else {
      excelTemplate.set(`name${i}`, "");
      excelTemplate.set(`age${i}`, "");
    }
  }
  excelTemplate.set("average", students.reduce((p, c) => p + c.age, 0) / students.length);
  
  excelTemplate.set('fields', [{ name: 'Name' }, { name: 'Age' }], { duplicateCellIfArray: true })
  
  excelTemplate.set("students", students);
  await excelTemplate.saveAs("spec/out.xlsx");
  
})
