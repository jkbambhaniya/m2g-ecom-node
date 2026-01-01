module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define('Cart', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        variantId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
    }, { tableName: 'carts' });

    Cart.associate = (models) => {
        Cart.belongsTo(models.User, {
            foreignKey: 'userId'
        });
        Cart.belongsTo(models.Product, {
            foreignKey: 'productId'
        });
        Cart.belongsTo(models.ProductVariant, {
            foreignKey: 'variantId'
        });
    };

    return Cart;
};
