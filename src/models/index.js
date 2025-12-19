const { Sequelize, DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const cfg = require('../config/config.js')[env];

const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, cfg);

const db = { sequelize, Sequelize: Sequelize };

db.User = require('./user')(sequelize, DataTypes);
db.Role = require('./role')(sequelize, DataTypes);
db.Category = require('./category')(sequelize, DataTypes);
db.Product = require('./product')(sequelize, DataTypes);
db.Order = require('./order')(sequelize, DataTypes);
db.OrderItem = require('./orderItem')(sequelize, DataTypes);
db.Admin = require('./admin')(sequelize, DataTypes);
db.Settings = require('./settings')(sequelize, DataTypes);

db.Role.hasMany(db.User, { foreignKey: 'roleId' });
db.User.belongsTo(db.Role, { foreignKey: 'roleId' });

db.Category.hasMany(db.Product, { foreignKey: 'categoryId' });
db.Product.belongsTo(db.Category, { foreignKey: 'categoryId' });

db.User.hasMany(db.Order, { foreignKey: 'userId' });
db.Order.belongsTo(db.User, { foreignKey: 'userId' });

db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId' });

db.Product.hasMany(db.OrderItem, { foreignKey: 'productId' });
db.OrderItem.belongsTo(db.Product, { foreignKey: 'productId' });

module.exports = db;
