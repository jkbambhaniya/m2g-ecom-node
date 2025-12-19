module.exports = (sequelize, DataTypes) => {
  return sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0.00 }
  }, { tableName: 'order_items' });
};
