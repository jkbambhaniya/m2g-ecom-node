const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'admins',
    hooks: {
      beforeCreate: async (admin) => {
        if (admin.password) admin.password = await bcrypt.hash(admin.password, 10);
      },
      beforeUpdate: async (admin) => {
        if (admin.changed('password')) admin.password = await bcrypt.hash(admin.password, 10);
      }
    }
  });

  Admin.prototype.comparePassword = function(plain) {
    return bcrypt.compare(plain, this.password);
  };

  return Admin;
};
