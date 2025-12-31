module.exports = (sequelize, DataTypes) => {
    const CartItem = sequelize.define('CartItem', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        variantId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
    }, { tableName: 'cart_items' });

    CartItem.associate = (models) => {
        CartItem.belongsTo(models.User, {
            foreignKey: 'userId'
        });
        CartItem.belongsTo(models.Product, {
            foreignKey: 'productId'
        });
        CartItem.belongsTo(models.ProductVariant, {
            foreignKey: 'variantId'
        });
    };

    return CartItem;
};
