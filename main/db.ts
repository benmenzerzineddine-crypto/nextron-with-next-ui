import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { dialog } from 'electron';
import * as XLSX from 'xlsx';

const isDev = process.env.NODE_ENV === 'development';
const dbPath = isDev ? 'db.sqlite' : path.join(process.resourcesPath, 'db.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log,
});

// Define Models

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff'),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
});

const Type = sequelize.define('Type', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
  },
});

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  grammage: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

const StockMovement = sequelize.define('StockMovement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('IN', 'OUT'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  weight: {
    type: DataTypes.FLOAT,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.STRING,
  },
});

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.ENUM('RECEPTION', 'CONSOMMATION'),
    allowNull: false,
  },
});

// Define Relationships

// Item relationships
Type.hasMany(Item, { foreignKey: 'type_id' });
Item.belongsTo(Type, { foreignKey: 'type_id' });

Supplier.hasMany(Item, { foreignKey: 'supplier_id' });
Item.belongsTo(Supplier, { foreignKey: 'supplier_id' });

Location.hasMany(Item, { foreignKey: 'location_id' });
Item.belongsTo(Location, { foreignKey: 'location_id' });

// StockMovement relationships
Item.hasMany(StockMovement, { foreignKey: 'item_id' });
StockMovement.belongsTo(Item, { foreignKey: 'item_id' });

User.hasMany(StockMovement, { foreignKey: 'user_id' });
StockMovement.belongsTo(User, { foreignKey: 'user_id' });

// Transaction relationships
Transaction.hasMany(StockMovement, { foreignKey: 'transaction_id', onDelete: 'CASCADE' });
StockMovement.belongsTo(Transaction, { foreignKey: 'transaction_id' });

Supplier.hasMany(Transaction, { foreignKey: 'supplier_id' });
Transaction.belongsTo(Supplier, { foreignKey: 'supplier_id' });

User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });


// Sync database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database & tables created!');
});

export const backupDatabase = async () => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Save Database Backup',
    defaultPath: `backup-${new Date().toISOString().slice(0, 10)}.sqlite`,
    filters: [
      { name: 'SQLite Files', extensions: ['sqlite'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (filePath) {
    try {
      fs.copyFileSync(dbPath, filePath);
      return { success: true, path: filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Sauvegarde annulée' };
};

export const exportTable = async (tableName: string) => {
  const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
  const model = sequelize.models[modelName];
  if (!model) {
    return { success: false, error: 'Nom de table invalide' };
  }

  const { filePath, canceled } = await dialog.showSaveDialog({
    title: `Export ${tableName} Data`,
    defaultPath: `${tableName}-${new Date().toISOString().slice(0, 10)}`,
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'XLSX Files', extensions: ['xlsx'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!canceled && filePath) {
    try {
      const data = await model.findAll({ raw: true });
      const extension = filePath.split('.').pop();

      if (extension === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        fs.writeFileSync(filePath, csvData);
      } else if (extension === 'json') {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      } else if (extension === 'xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
        XLSX.writeFile(workbook, filePath);
      }

      return { success: true, path: filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Exportation annulée' };
};

export const importTable = async (tableName: string) => {
  const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
  const model = sequelize.models[modelName];
  if (!model) {
    return { success: false, error: 'Invalid table name' };
  }

  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: `Import Data to ${tableName}`,
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'XLSX Files', extensions: ['xlsx'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });

  if (!canceled && filePaths && filePaths.length > 0) {
    const filePath = filePaths[0];
    try {
      const extension = filePath.split('.').pop();
      let data;

      if (extension === 'csv' || extension === 'xlsx') {
        const workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else if (extension === 'json') {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        data = JSON.parse(fileContent);
      }

      await model.bulkCreate(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Importation annulée' };
};

export {
  sequelize,
  User,
  Supplier,
  Location,
  Type,
  Item,
  StockMovement,
  Transaction,
};
