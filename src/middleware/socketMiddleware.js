// Middleware to attach io and broadcast utilities to requests
function socketMiddleware(req, res, next) {
    req.io = req.app.locals.io;
    req.broadcastNewOrder = req.app.locals.broadcastNewOrder;
    req.broadcastOrderUpdate = req.app.locals.broadcastOrderUpdate;
    req.broadcastDashboardStats = req.app.locals.broadcastDashboardStats;
    next();
}

module.exports = socketMiddleware;
