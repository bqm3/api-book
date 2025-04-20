const os = require("os");
function getIPv4() {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    for (let iface of interfaces[interfaceName]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost"; // Dự phòng nếu không lấy được IP
}

const IP = getIPv4();

module.exports = IP;
