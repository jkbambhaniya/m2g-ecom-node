module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        orderId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gatewayResponse: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, { tableName: 'payments' });

    Payment.associate = (models) => {
        Payment.belongsTo(models.Order, {
            foreignKey: 'orderId',
            as: 'order'
        });
    };

    return Payment;
};
