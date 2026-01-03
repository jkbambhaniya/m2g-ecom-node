module.exports = (sequelize, DataTypes) => {
  const AttributeValue = sequelize.define('AttributeValue', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    attribute_id: { type: DataTypes.INTEGER, allowNull: false },
    value: { type: DataTypes.STRING(255), allowNull: false }
  }, {
    tableName: 'attribute_values',
    timestamps: true
  });

  AttributeValue.associate = (models) => {
    AttributeValue.belongsTo(models.Attribute, {
      foreignKey: 'attribute_id',
      as: 'attribute'
    });
  };

  return AttributeValue;
};
