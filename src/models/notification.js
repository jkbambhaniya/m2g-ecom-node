module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER, allowNull: true },
        merchantId: { type: DataTypes.INTEGER, allowNull: true },
        type: { type: DataTypes.STRING, allowNull: false }, // e.g., 'merchant_registration'
        title: { type: DataTypes.STRING, allowNull: true },
        message: { type: DataTypes.STRING, allowNull: false },
        isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
        data: { type: DataTypes.JSON, allowNull: true } // Store related IDs (e.g., { merchantId: 1 })
    }, {
        tableName: 'notifications',
        timestamps: true
    });

    return Notification;
};
