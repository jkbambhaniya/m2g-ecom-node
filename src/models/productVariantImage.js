module.exports = (sequelize, DataTypes) => {
  const ProductVariantImage = sequelize.define('ProductVariantImage', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_variant_id: { type: DataTypes.INTEGER, allowNull: false },
    image_path: { type: DataTypes.STRING(255), allowNull: false },
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    tableName: 'product_variant_images',
    timestamps: true
  });

  ProductVariantImage.associate = (models) => {
    ProductVariantImage.belongsTo(models.ProductVariant, {
      foreignKey: 'product_variant_id'
    });
  };

  return ProductVariantImage;
};
