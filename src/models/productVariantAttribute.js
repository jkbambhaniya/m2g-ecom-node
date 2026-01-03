module.exports = (sequelize, DataTypes) => {
  const ProductVariantAttribute = sequelize.define('ProductVariantAttribute', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_variant_id: { type: DataTypes.INTEGER, allowNull: false },
    attribute_id: { type: DataTypes.INTEGER, allowNull: false },
    attribute_value_id: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'product_variant_attributes',
    timestamps: true
  });

  ProductVariantAttribute.associate = (models) => {
    ProductVariantAttribute.belongsTo(models.ProductVariant, {
      foreignKey: 'product_variant_id'
    });
    ProductVariantAttribute.belongsTo(models.Attribute, {
      foreignKey: 'attribute_id',
      as: 'attribute'
    });
    ProductVariantAttribute.belongsTo(models.AttributeValue, {
      foreignKey: 'attribute_value_id',
      as: 'value'
    });
  };

  return ProductVariantAttribute;
};
