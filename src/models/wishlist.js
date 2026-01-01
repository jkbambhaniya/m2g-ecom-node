const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Wishlist extends Model {
        static associate(models) {
            Wishlist.belongsTo(models.User, {
                foreignKey: 'userId'
            });
            Wishlist.belongsTo(models.Product, {
                foreignKey: 'productId'
            });
        }
    }

    Wishlist.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        productId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Wishlist',
        tableName: 'wishlists',
        timestamps: true
    });

    return Wishlist;
};
