module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    total: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0.00 },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }
  }, { tableName: 'orders' });
};
