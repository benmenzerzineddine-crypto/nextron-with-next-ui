import { ipcMain } from 'electron';
import { User, Supplier, Location, Type, Item, StockMovement, Reception } from './db';

const getModelIncludes = (modelName: string) => {
    switch (modelName) {
        case 'item':
            return [Type, Supplier, Location];
        case 'stockmovement':
            return [Item];
        case 'reception':
            return [StockMovement, Supplier];
        default:
            return [];
    }
}

const calculateItemQuantity = async (itemId: number) => {
  const movements = await StockMovement.findAll({ where: { item_id: itemId } });
  const in_quantity = movements
    .filter((m) => m.type === 'IN')
    .reduce((acc, m) => acc + m.quantity, 0);
  const out_quantity = movements
    .filter((m) => m.type === 'OUT')
    .reduce((acc, m) => acc + m.quantity, 0);
  return in_quantity - out_quantity;
};

// Generic CRUD handler
const handleCRUD = (model) => {
  const modelName = model.name.toLowerCase();
  const includes = getModelIncludes(modelName);

  ipcMain.handle(`${modelName}:create`, async (_, data) => {
    try {
        const result = await model.create(data);
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

// Custom handlers for Item to calculate quantity
ipcMain.handle('item:getAll', async () => {
  try {
    const items = await Item.findAll({ include: [Type, Supplier, Location] });
    const itemsWithQuantity = await Promise.all(
      items.map(async (item) => {
        const plainItem = item.get({ plain: true });
        plainItem.current_quantity = await calculateItemQuantity(plainItem.id);
        return plainItem;
      })
    );
    return { success: true, data: itemsWithQuantity };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('item:getById', async (_, id) => {
  try {
    const item = await Item.findByPk(id, { include: [Type, Supplier, Location] });
    if (item) {
      const plainItem = item.get({ plain: true });
      plainItem.current_quantity = await calculateItemQuantity(plainItem.id);
      return { success: true, data: plainItem };
    }
    return { success: false, error: 'Record not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('item:create', async (_, data) => {
  try {
    const result = await Item.create(data);
    const plainData = result.get({ plain: true });
    return { success: true, data: plainData };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('item:update', async (_, { id, data }) => {
  try {
    const record = await Item.findByPk(id);
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

ipcMain.handle('item:delete', async (_, id) => {
  try {
    const record = await Item.findByPk(id);
    if (record) {
      await record.destroy();
      return { success: true };
    }
    return { success: false, error: 'Record not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Custom handler for finding items by SKU
ipcMain.handle('item:getBySku', async (_, sku) => {
  try {
    const result = await Item.findOne({
      where: { sku },
      include: [Type, Supplier, Location]
    });
    const plainData = result ? result.get({ plain: true }) : null;
    if (plainData) {
        plainData.current_quantity = await calculateItemQuantity(plainData.id);
    }
    return { success: true, data: plainData };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Custom handlers for Reception to handle stock movements
ipcMain.handle('reception:create', async (_, data) => {
  try {
    const { Mouvement, ...receptionData } = data;
    const reception = await Reception.create(receptionData);
    if (Mouvement && Mouvement.length > 0) {
      const movements = await Promise.all(
        Mouvement.map(async (m) => {
          const movement = await StockMovement.create({ ...m, reception_id: reception.id });
          return movement;
        })
      );
      await reception.setMouvements(movements);
    }
    const plainData = reception.get({ plain: true });
    return { success: true, data: plainData };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('reception:update', async (_, { id, data }) => {
  try {
    const reception = await Reception.findByPk(id, { include: [StockMovement] });
    if (reception) {
      const { Mouvement, ...receptionData } = data;
      await reception.update(receptionData);

      const oldMovements = reception.Mouvements || [];
      const oldMovementIds = oldMovements.map(m => m.id);
      const newMovementIds = Mouvement?.map(m => m.id).filter(id => id) || [];

      // Delete movements that are no longer in the list
      const deletedMovementIds = oldMovementIds.filter(id => !newMovementIds.includes(id));
      for (const movementId of deletedMovementIds) {
        const movement = await StockMovement.findByPk(movementId);
        if (movement) {
          await movement.destroy();
        }
      }

      // Create or update movements
      if (Mouvement && Mouvement.length > 0) {
        await Promise.all(
          Mouvement.map(async (m) => {
            if (m.id) {
              // Update existing movement
              const movement = await StockMovement.findByPk(m.id);
              if (movement) {
                await movement.update(m);
              }
            } else {
              // Create new movement
              await StockMovement.create({ ...m, reception_id: reception.id });
            }
          })
        );
      }

      const updatedReception = await Reception.findByPk(id, { include: [StockMovement, Supplier] });
      const plainData = updatedReception.get({ plain: true });
      return { success: true, data: plainData };
    }
    return { success: false, error: 'Record not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('reception:delete', async (_, id) => {
  try {
    const reception = await Reception.findByPk(id, { include: [StockMovement] });
    if (reception) {
      await reception.destroy();
      return { success: true };
    }
    return { success: false, error: 'Record not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});


// Register CRUD handlers for all models
[User, Supplier, Location, Type, StockMovement].forEach(handleCRUD);