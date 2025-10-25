import { ipcMain } from 'electron';
import { User, Supplier, Location, Type, Item, StockMovement, Transaction, backupDatabase, exportTable, importTable } from './db';
import JsExcelTemplate from 'js-excel-template';

const getModelIncludes = (modelName: string) => {
    switch (modelName) {
        case 'item':
            return [Type, Supplier, Location, StockMovement];
        case 'stockmovement':
            return [Item];
        case 'transaction':
            return [StockMovement, Supplier];
        default:
            return [];
    }
}

// Generic CRUD handler
const handleCRUD = (model) => {
  const modelName = model.name.toLowerCase();
  const includes = getModelIncludes(modelName);

  ipcMain.handle(`${modelName}:create`, async (_, data) => {
    try {
        const result = await model.create(data, { include: includes });
        const plainData = result.get({ plain: true });
        return { success: true, data: plainData };
    } catch (error) {
        return { success: false, error: error.message };
    }
  });

  ipcMain.handle(`${modelName}:getAll`, async () => {
    try {
        const result = await model.findAll({ include: includes });
        const plainData = result.map(item => item.get({ plain: true }));
        return { success: true, data: plainData };
    } catch (error) {
        return { success: false, error: error.message };
    }
  });

  ipcMain.handle(`${modelName}:getById`, async (_, id) => {
    try {
        const result = await model.findByPk(id, { include: includes });
        const plainData = result ? result.get({ plain: true }) : null;
        return { success: true, data: plainData };
    } catch (error) {
        return { success: false, error: error.message };
    }
  });

  ipcMain.handle(`${modelName}:update`, async (_, { id, data }) => {
    try {
        const record = await model.findByPk(id);
        if (record) {
            const updated = await record.update(data);
            const plainData = updated.get({ plain: true });
            return { success: true, data: plainData };
        }
        return { success: false, error: 'Record not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
  });

  ipcMain.handle(`${modelName}:delete`, async (_, id) => {
    try {
        const record = await model.findByPk(id);
        if (record) {
          await record.destroy();
          return { success: true };
        }
        return { success: false, error: 'Record not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
  });
};

// Custom handler for finding items by SKU
ipcMain.handle('item:getBySku', async (_, sku) => {
  try {
    const result = await Item.findOne({
      where: { sku },
      include: [Type, Supplier, Location, StockMovement]
    });
    const plainData = result ? result.get({ plain: true }) : null;
    return { success: true, data: plainData };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Register CRUD handlers for all models
[User, Supplier, Location, Type, Item, StockMovement, Transaction].forEach(handleCRUD);

ipcMain.handle('consommation:create', async (_, data) => {
    try {
        const transactionData = {
            ...data,
            type: 'CONSOMMATION',
            StockMovements: data.Mouvement.map(m => ({
                ...m,
                type: 'OUT',
                quantity: -m.quantity,
                weight: m.weight ? -m.weight : undefined,
            })),
        };
        const result = await Transaction.create(transactionData, { include: [StockMovement] });
        const plainData = result.get({ plain: true });
        return { success: true, data: plainData };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db:backup', async () => {
    return await backupDatabase();
});

ipcMain.handle('db:export', async (_, tableName: string) => {
    return await exportTable(tableName);
});

ipcMain.handle('db:import', async (_, tableName: string) => {
    return await importTable(tableName);
});

ipcMain.handle('generate-excel', async (event, arg) => {
  const excelTemplate = await JsExcelTemplate.fromFile(`${__dirname}\\..\\demo\\test.xlsx`);
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
  await excelTemplate.saveAs("demo/out.xlsx");
  
})