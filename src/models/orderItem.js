module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
    orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    variantId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, { tableName: 'order_items' });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'orderId'
    });
    OrderItem.belongsTo(models.Product, {
      foreignKey: 'productId'
    });
    OrderItem.belongsTo(models.ProductVariant, {
      foreignKey: 'variantId'
    });
  };

  return OrderItem;
};
