import dns from 'dns';
import axios from 'axios';

// Keep reference to the original lookup
const originalLookup = dns.lookup;

// Create a custom DNS resolver using public servers
const globalDnsResolver = new dns.Resolver();
globalDnsResolver.setServers(['8.8.8.8', '1.1.1.1']);

dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.local')) {
    return originalLookup(hostname, options, callback);
  }

  globalDnsResolver.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return originalLookup(hostname, options, callback);
    }
    
    if (options.all) {
      const addressObjects = addresses.map(addr => ({ address: addr, family: 4 }));
      callback(null, addressObjects);
    } else {
      callback(null, addresses[0], 4);
    }
  });
};

async function testWithRealUserId() {
  const userId = 'CK101285823'; // Real User ID from your screenshot
  const apiKey = 'dummy_apikey';
  const amount = 100;
  const phone = '08031234567';
  const requestId = 'TEST-' + Date.now();

  const url = `https://www.nellobytesystems.com/APIAirtimeV1.asp?UserID=${userId}&APIKey=${apiKey}&MobileNetwork=01&Amount=${amount}&MobileNumber=${phone}&RequestID=${requestId}`;

  console.log("Testing with real UserID:", url);

  try {
    const res = await axios.get(url, { timeout: 15000 });
    console.log("Response:", res.data);
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

testWithRealUserId();
