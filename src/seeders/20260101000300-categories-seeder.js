'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		// Parent Categories
		await queryInterface.bulkInsert('categories', [
			{ id: 1, name: 'Fresh Produce', slug: 'fresh-produce', createdAt: new Date(), updatedAt: new Date() },
			{ id: 2, name: 'Dairy & Eggs', slug: 'dairy-eggs', createdAt: new Date(), updatedAt: new Date() },
			{ id: 3, name: 'Rice & Grains', slug: 'rice-grains', createdAt: new Date(), updatedAt: new Date() }
		]);

		// Sub Categories
		await queryInterface.bulkInsert('categories', [
			{ name: 'Fruits', slug: 'fruits', parent_id: 1, createdAt: new Date(), updatedAt: new Date() },
			{ name: 'Vegetables', slug: 'vegetables', parent_id: 1, createdAt: new Date(), updatedAt: new Date() },
			{ name: 'Milk', slug: 'milk', parent_id: 2, createdAt: new Date(), updatedAt: new Date() },
			{ name: 'Eggs', slug: 'eggs', parent_id: 2, createdAt: new Date(), updatedAt: new Date() },
			{ name: 'Rice', slug: 'rice', parent_id: 3, createdAt: new Date(), updatedAt: new Date() },
			{ name: 'Pulses', slug: 'pulses', parent_id: 3, createdAt: new Date(), updatedAt: new Date() }
		]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('categories', null, {});
	}
};
