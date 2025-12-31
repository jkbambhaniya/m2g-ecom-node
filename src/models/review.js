module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['productId'] },
      { fields: ['isApproved'] },
      { fields: ['productId', 'isApproved'] }
    ]
  });

  Review.associate = (models) => {
    console.log('Associating Review model...');
    Review.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    Review.belongsTo(models.Product, {
      foreignKey: 'productId'
    });
    Review.belongsTo(models.Order, {
      foreignKey: 'orderId'
    });
  };

  return Review;
};
