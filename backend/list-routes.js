const app = require('./src/app');

function listRoutes(stack, prefix = '') {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      console.log(methods + ' ' + prefix + layer.route.path);
    } else if (layer.name === 'router') {
      let newPrefix = prefix;
      if (layer.regexp) {
        // Very simplified extraction for standard router mounts
        const match = layer.regexp.toString().match(/^\/\^\\\/([a-zA-Z0-9\-_]+)/);
        if (match) {
          newPrefix += '/' + match[1];
        }
      }
      listRoutes(layer.handle.stack, newPrefix);
    }
  });
}

console.log('--- REGISTERED ROUTES ---');
listRoutes(app._router.stack);
console.log('-------------------------');
process.exit(0);
