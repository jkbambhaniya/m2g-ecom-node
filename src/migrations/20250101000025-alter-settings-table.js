'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE settings
      ADD COLUMN siteName VARCHAR(255) DEFAULT 'My E-Commerce',
      ADD COLUMN logoUrl VARCHAR(255),
      ADD COLUMN faviconUrl VARCHAR(255),
      ADD COLUMN primaryColor VARCHAR(255) DEFAULT '#3b82f6',
      ADD COLUMN accentColor VARCHAR(255) DEFAULT '#1e40af'
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE settings
      DROP COLUMN siteName,
      DROP COLUMN logoUrl,
      DROP COLUMN faviconUrl,
      DROP COLUMN primaryColor,
      DROP COLUMN accentColor
    `);
  },
};
