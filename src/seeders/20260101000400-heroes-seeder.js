'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
	await queryInterface.bulkInsert('heroes', [
	  {
		title: 'Summer Collection 2024',
		subtitle: 'Discover the latest trends and styles',
		image: '/uploads/hero/hero-summer.jpg',
		link: '/products',
		position: 1,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	  },
	  {
		title: 'Fresh & Organic Products',
		subtitle: 'Quality guaranteed for your family',
		image: '/uploads/hero/hero-organic.jpg',
		link: '/categories',
		position: 2,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	  },
	  {
		title: 'Limited Time Offer',
		subtitle: 'Up to 50% discount on selected items',
		image: '/uploads/hero/hero-sale.jpg',
		link: '/products',
		position: 3,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	  }
	]);
  },

  async down(queryInterface, Sequelize) {
	await queryInterface.bulkDelete('heroes', null, {});
  }
};
