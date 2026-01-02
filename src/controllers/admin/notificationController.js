const db = require('../../models');
const Notification = db.Notification;

async function list(req, res) {
    try {
        const notifications = await Notification.findAll({
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        const unreadCount = await Notification.count({ where: { isRead: false } });
        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function markAsRead(req, res) {
    try {
        await Notification.update({ isRead: true }, { where: { isRead: false } });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { list, markAsRead };
module.exports = { list, markAsRead, markOne };
