module.exports = (sequelize, DataTypes) => {
  const Attribute = sequelize.define('Attribute', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false }
  }, {
    tableName: 'attributes',
    timestamps: true
  });

  Attribute.associate = (models) => {
    Attribute.hasMany(models.AttributeValue, {
      foreignKey: 'attribute_id',
      as: 'values'
    });
  };

  return Attribute;
};
