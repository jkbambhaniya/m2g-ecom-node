module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    shortDescription: { type: DataTypes.STRING(500) },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0.00 },
    discountPrice: { type: DataTypes.DECIMAL(12, 2) },
    stock: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    sku: { type: DataTypes.STRING(100), unique: true },
    image: { type: DataTypes.STRING },
    images: { type: DataTypes.JSON, defaultValue: [] },
    rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    weight: { type: DataTypes.DECIMAL(8, 2) },
    dimensions: { type: DataTypes.JSON },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    categoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    merchantId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'products',
    timestamps: true,
    indexes: [
      { fields: ['categoryId'] },
      { fields: ['isActive'] },
      { fields: ['isFeatured'] }
    ]
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId'
    });
    Product.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant'
    });
    Product.hasMany(models.OrderItem, {
      foreignKey: 'productId'
    });
    Product.hasMany(models.ProductVariant, {
      foreignKey: 'productId',
      as: 'variants'
    });
    Product.hasMany(models.Review, {
      foreignKey: 'productId',
      as: 'reviews'
    });
  };

  return Product;
};
