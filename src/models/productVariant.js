module.exports = (sequelize, DataTypes) => {
    const ProductVariant = sequelize.define('ProductVariant', {
        id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        name: { type: DataTypes.STRING(255), allowNull: false }, // e.g. "Red - L" or "Small"
        price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0.00 },
        stock: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
        sku: { type: DataTypes.STRING(100) },
        image: { type: DataTypes.STRING }, // Variant specific image
        attributes: { type: DataTypes.JSON, defaultValue: {} } // e.g. { Color: "Red", Size: "L" }
    }, {
        tableName: 'product_variants',
        timestamps: true
    });

    ProductVariant.associate = (models) => {
        ProductVariant.belongsTo(models.Product, {
            foreignKey: 'productId',
            onDelete: 'CASCADE'
        });
        ProductVariant.hasMany(models.CartItem, {
            foreignKey: 'variantId'
        });
        ProductVariant.hasMany(models.OrderItem, {
            foreignKey: 'variantId'
        });
    };

    return ProductVariant;
};
