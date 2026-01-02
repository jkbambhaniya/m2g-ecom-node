const db = require('../../models');

// Get all hero slides for admin
async function list(req, res) {
    try {
        const heroes = await db.Hero.findAll({
            order: [['position', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(heroes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Create hero slide
async function create(req, res) {
    try {
        const { title, subtitle, link, order, isActive } = req.body;
        const image = req.file ? `/uploads/hero/${req.file.filename}` : null;

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const hero = await db.Hero.create({
            title,
            subtitle,
            image,
            link,
            position: order || 0,
            isActive: isActive === 'false' ? false : true
        });

        // create admin notification
        try {
            const notif = await db.Notification.create({
                type: 'hero_created',
                title: 'Hero slide created',
                message: `Hero \"${hero.title}\" was created`
            });

            // Emit real-time notification
            const io = req.app.locals.io;
            if (io) {
                io.emit('notification:new', {
                    id: notif.id,
                    type: notif.type,
                    title: notif.title,
                    message: notif.message,
                    createdAt: notif.createdAt,
                    isRead: notif.isRead
                });
            }
        } catch (e) {
            console.error('Notification error:', e.message);
        }

        res.status(201).json(hero);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Update hero slide
async function update(req, res) {
    try {
        const { title, subtitle, link, order, isActive } = req.body;
        const hero = await db.Hero.findByPk(req.params.id);

        if (!hero) {
            return res.status(404).json({ error: 'Hero slide not found' });
        }

        if (title) hero.title = title;
        if (subtitle !== undefined) hero.subtitle = subtitle;
        if (link !== undefined) hero.link = link;
        if (order !== undefined) hero.position = order;
        if (isActive !== undefined) hero.isActive = isActive === 'false' ? false : true;

        if (req.file) {
            hero.image = `/uploads/hero/${req.file.filename}`;
        }

        await hero.save();

        try {
            const notif = await db.Notification.create({
                type: 'hero_updated',
                title: 'Hero slide updated',
                message: `Hero \"${hero.title}\" was updated`
            });

            const io = req.app.locals.io;
            if (io) {
                io.emit('notification:new', {
                    id: notif.id,
                    type: notif.type,
                    title: notif.title,
                    message: notif.message,
                    createdAt: notif.createdAt,
                    isRead: notif.isRead
                });
            }
        } catch (e) {
            console.error('Notification error:', e.message);
        }
        res.json(hero);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Delete hero slide
async function remove(req, res) {
    try {
        const hero = await db.Hero.findByPk(req.params.id);
        if (!hero) {
            return res.status(404).json({ error: 'Hero slide not found' });
        }
        await hero.destroy();
        try {
            const notif = await db.Notification.create({
                type: 'hero_deleted',
                title: 'Hero slide deleted',
                message: `Hero \"${hero.title}\" was deleted`
            });

            const io = req.app.locals.io;
            if (io) {
                io.emit('notification:new', {
                    id: notif.id,
                    type: notif.type,
                    title: notif.title,
                    message: notif.message,
                    createdAt: notif.createdAt,
                    isRead: notif.isRead
                });
            }
        } catch (e) {
            console.error('Notification error:', e.message);
        }

        res.json({ message: 'Hero slide deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Toggle status
async function toggleStatus(req, res) {
    try {
        const hero = await db.Hero.findByPk(req.params.id);
        if (!hero) {
            return res.status(404).json({ error: 'Hero slide not found' });
        }
        hero.isActive = !hero.isActive;
        await hero.save();
        try {
            const notif = await db.Notification.create({
                type: 'hero_toggled',
                title: 'Hero slide status changed',
                message: `Hero \"${hero.title}\" is now ${hero.isActive ? 'active' : 'inactive'}`
            });

            const io = req.app.locals.io;
            if (io) {
                io.emit('notification:new', {
                    id: notif.id,
                    type: notif.type,
                    title: notif.title,
                    message: notif.message,
                    createdAt: notif.createdAt,
                    isRead: notif.isRead
                });
            }
        } catch (e) {
            console.error('Notification error:', e.message);
        }

        res.json(hero);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Public: Get active hero slides
async function getActiveSlides(req, res) {
    try {
        const heroes = await db.Hero.findAll({
            where: { isActive: true },
            order: [['position', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(heroes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { list, create, update, remove, toggleStatus, getActiveSlides };
