module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    paymentMethod: { type: DataTypes.STRING, defaultValue: 'COD' }, // e.g., 'COD', 'Online'
    paymentStatus: { type: DataTypes.STRING, defaultValue: 'pending' }, // e.g., 'pending', 'paid', 'failed'
    transactionId: { type: DataTypes.STRING, allowNull: true },
    billingAddress: { type: DataTypes.TEXT, allowNull: true }, // Store as JSON string
    shippingAddress: { type: DataTypes.TEXT, allowNull: true }, // Store as JSON string
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    razorpayOrderId: { type: DataTypes.STRING, allowNull: true },
    razorpayPaymentId: { type: DataTypes.STRING, allowNull: true },
    razorpaySignature: { type: DataTypes.STRING, allowNull: true }
  }, { tableName: 'orders' });

  Order.associate = (models) => {
    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items'
    });
    Order.hasMany(models.Payment, {
      foreignKey: 'orderId',
      as: 'payments'
    });
    Order.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };

  return Order;
};
