const db = require('./src/models');

async function test() {
    try {
        const heroes = await db.Hero.findAll();
        console.log('Found', heroes.length, 'heroes');
        heroes.forEach(h => console.log('-', h.dataValues));
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
}

test();
