module.exports = (sequelize, DataTypes) => {
    const ProductVariant = sequelize.define('ProductVariant', {
        id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        product_id: { type: DataTypes.INTEGER, allowNull: false },
        sku: { type: DataTypes.STRING(100) },
        price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0.00 },
        sale_price: { type: DataTypes.DECIMAL(12, 2) },
        stock: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
        thumbnail: { type: DataTypes.STRING(255) },
        status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
    }, {
        tableName: 'product_variants',
        timestamps: true
    });

    ProductVariant.associate = (models) => {
        ProductVariant.belongsTo(models.Product, {
            foreignKey: 'product_id',
            onDelete: 'CASCADE'
        });
        ProductVariant.hasMany(models.ProductVariantAttribute, {
            foreignKey: 'product_variant_id',
            as: 'variantAttributes'
        });
        ProductVariant.hasMany(models.ProductVariantImage, {
            foreignKey: 'product_variant_id',
            as: 'images'
        });
        ProductVariant.hasMany(models.Cart, {
            foreignKey: 'variantId'
        });
        ProductVariant.hasMany(models.OrderItem, {
            foreignKey: 'variantId'
        });
    };

    return ProductVariant;
};
