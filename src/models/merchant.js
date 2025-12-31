const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Merchant = sequelize.define('Merchant', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        shopName: { type: DataTypes.STRING, allowNull: true },
        phone: { type: DataTypes.STRING, allowNull: true },
        image: { type: DataTypes.STRING, allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        tableName: 'merchants',
        hooks: {
            beforeCreate: async (merchant) => {
                if (merchant.password) merchant.password = await bcrypt.hash(merchant.password, 10);
            },
            beforeUpdate: async (merchant) => {
                if (merchant.changed('password')) merchant.password = await bcrypt.hash(merchant.password, 10);
            }
        }
    });

    Merchant.prototype.comparePassword = function (plain) {
        return bcrypt.compare(plain, this.password);
    };

    Merchant.associate = (models) => {
        Merchant.hasMany(models.Product, {
            foreignKey: 'merchantId',
            as: 'products'
        });
    };

    return Merchant;
};
