import { ipcMain } from 'electron';
import { User, Supplier, Location, Type, Item, StockMovement, Reception } from './db';

const getModelIncludes = (modelName: string) => {
    switch (modelName) {
        case 'item':
            return [Type, Supplier, Location];
        case 'stockmovement':
            return [Item];
        case 'reception':
            return [StockMovement];
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
        const result = await model.create(data);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
  });

  ipcMain.handle(`${modelName}:getAll`, async () => {
    try {
        const result = await model.findAll({ include: includes });
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
  });

  ipcMain.handle(`${modelName}:getById`, async (_, id) => {
    try {
        const result = await model.findByPk(id, { include: includes });
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
  });

  ipcMain.handle(`${modelName}:update`, async (_, { id, data }) => {
    try {
        const record = await model.findByPk(id);
        if (record) {
            const updated = await record.update(data);
            return { success: true, data: updated };
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

// Register CRUD handlers for all models
[User, Supplier, Location, Type, Item, StockMovement, Reception].forEach(handleCRUD);
