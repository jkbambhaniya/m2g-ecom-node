const app = require('./app');
const db = require('./models');
const PORT = process.env.PORT || 4000;

async function start() {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
start();
