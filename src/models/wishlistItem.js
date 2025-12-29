const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class WishlistItem extends Model {
        static associate(models) {
            WishlistItem.belongsTo(models.User, {
                foreignKey: 'userId'
            });
            WishlistItem.belongsTo(models.Product, {
                foreignKey: 'productId'
            });
        }
    }

    WishlistItem.init({
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
        modelName: 'WishlistItem',
        tableName: 'wishlist_items',
        timestamps: true
    });

    return WishlistItem;
};
