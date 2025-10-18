import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';

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
  origine: {
    type: DataTypes.STRING,
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

const Reception = sequelize.define('Reception', {
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

// Reception relationships
Reception.hasMany(StockMovement, { foreignKey: 'reception_id', onDelete: 'CASCADE' });
StockMovement.belongsTo(Reception, { foreignKey: 'reception_id' });

Supplier.hasMany(Reception, { foreignKey: 'supplier_id' });
Reception.belongsTo(Supplier, { foreignKey: 'supplier_id' });

User.hasMany(Reception, { foreignKey: 'user_id' });
Reception.belongsTo(User, { foreignKey: 'user_id' });


// Sync database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database & tables created!');
});

export {
  sequelize,
  User,
  Supplier,
  Location,
  Type,
  Item,
  StockMovement,
  Reception,
};
