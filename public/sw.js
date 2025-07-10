// Service Worker untuk mendeteksi IP lokal
self.addEventListener("install", () => {
  console.log("Service Worker installed");
});

self.addEventListener("activate", () => {
  console.log("Service Worker activated");
});

// Fungsi untuk mendeteksi IP lokal
async function detectLocalIP() {
  try {
    const RTCPeerConnection =
      self.RTCPeerConnection ||
      self.webkitRTCPeerConnection ||
      self.mozRTCPeerConnection;

    if (!RTCPeerConnection) {
      throw new Error("WebRTC tidak didukung");
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    return new Promise((resolve, reject) => {
      const ips = [];

      pc.createDataChannel("");
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((err) => reject(err));

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          const localIPs = ips.filter(
            (ip) =>
              ip.startsWith("192.168.") ||
              ip.startsWith("10.") ||
              ip.startsWith("172.") ||
              ip === "127.0.0.1"
          );

          if (localIPs.length > 0) {
            resolve(localIPs[0]);
          } else {
            reject(new Error("Tidak dapat mendeteksi IP lokal"));
          }
          pc.close();
        } else {
          const ip = event.candidate.candidate.split(" ")[4];
          if (ip && !ips.includes(ip)) {
            ips.push(ip);
          }
        }
      };

      setTimeout(() => {
        pc.close();
        reject(new Error("Timeout mendeteksi IP lokal"));
      }, 5000);
    });
  } catch (error) {
    throw error;
  }
}

// Handle message dari main thread
self.addEventListener("message", async (event) => {
  if (event.data.type === "DETECT_LOCAL_IP") {
    try {
      const localIP = await detectLocalIP();
      event.ports[0].postMessage({ success: true, ip: localIP });
    } catch (error) {
      event.ports[0].postMessage({ success: false, error: error.message });
    }
  }
});
