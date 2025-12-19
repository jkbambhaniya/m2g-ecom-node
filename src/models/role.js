module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Role', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, { tableName: 'roles', timestamps: false });
};
