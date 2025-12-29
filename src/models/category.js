module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      parent_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      tableName: 'categories',
      timestamps: false
    }
  );

  /* =========================
     Self Relations
  ========================= */

  Category.belongsTo(Category, {
    as: 'parent',
    foreignKey: 'parent_id'
  });

  Category.hasMany(Category, {
    as: 'children',
    foreignKey: 'parent_id'
  });

  Category.associate = (models) => {
    Category.hasMany(models.Product, {
      foreignKey: 'categoryId'
    });
  };

  return Category;
};
