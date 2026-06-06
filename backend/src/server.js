const http = require('http');
const app = require('./app');
const { initSocket } = require('./sockets');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Database connection & Server start
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    // In production, you'd use migrations instead of sync
    return sequelize.sync();
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Server gracefully handles port conflicts
