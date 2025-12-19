module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Category', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.STRING(255), allowNull: true }
  }, { tableName: 'categories' });
};
