// ─── FINGERPRINT SPOOFING CORE ───
// Electron webview preload script — runs BEFORE page scripts
// Hooks browser APIs to return fake fingerprint values per profile

(function () {
  'use strict';

  // ── 1. Profile loading ──
  // Profile must be injected via executeJavaScript BEFORE navigation completes:
  //   window.__FINGERPRINT_PROFILE__ = {...};
  const profile = window.__FINGERPRINT_PROFILE__;
  if (!profile) return; // Fingerprint protection not enabled for this webview

  // ── Utility: seeded PRNG for consistent noise within this profile ──
  function seededRand(seed) {
    let s = seed | 0;
    return function () {
      s = (s * 1103515245 + 12345) | 0;
      return (s >>> 0) / 0xFFFFFFFF;
    };
  }
  const rand = seededRand(profile.seed || 42);

  // ── 2. Navigator spoofing ──
  const navProps = {
    hardwareConcurrency: profile.hardwareConcurrency,
    deviceMemory: profile.deviceMemory,
    maxTouchPoints: profile.maxTouchPoints,
    platform: profile.platform,
    language: profile.language,
    languages: profile.languages,
  };

  try {
    Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
      get: function () { return navProps.hardwareConcurrency; },
      configurable: true,
    });
  } catch (e) { /* silent */ }

  try {
    if (navProps.deviceMemory !== undefined) {
      Object.defineProperty(Navigator.prototype, 'deviceMemory', {
        get: function () { return navProps.deviceMemory; },
        configurable: true,
      });
    }
  } catch (e) { /* silent */ }

  try {
    Object.defineProperty(Navigator.prototype, 'maxTouchPoints', {
      get: function () { return navProps.maxTouchPoints; },
      configurable: true,
    });
  } catch (e) { /* silent */ }

  try {
    Object.defineProperty(Navigator.prototype, 'platform', {
      get: function () { return navProps.platform; },
      configurable: true,
    });
  } catch (e) { /* silent */ }

  try {
    Object.defineProperty(Navigator.prototype, 'language', {
      get: function () { return navProps.language; },
      configurable: true,
    });
  } catch (e) { /* silent */ }

  try {
    Object.defineProperty(Navigator.prototype, 'languages', {
      get: function () { return Object.freeze([...navProps.languages]); },
      configurable: true,
    });
  } catch (e) { /* silent */ }

  // Vendor spoof matching OS
  try {
    if (profile.vendor) {
      Object.defineProperty(Navigator.prototype, 'vendor', {
        get: function () { return profile.vendor; },
        configurable: true,
      });
    }
  } catch (e) { /* silent */ }

  // Oscpu
  try {
    if (profile.oscpu) {
      Object.defineProperty(Navigator.prototype, 'oscpu', {
        get: function () { return profile.oscpu; },
        configurable: true,
      });
    }
  } catch (e) { /* silent */ }

  // ── 3. Screen spoofing ──
  const screenProps = {
    width: profile.screenWidth,
    height: profile.screenHeight,
    availWidth: profile.availWidth,
    availHeight: profile.availHeight,
    colorDepth: profile.colorDepth,
    pixelDepth: profile.pixelDepth,
  };

  try {
    Object.defineProperty(Screen.prototype, 'width', {
      get: function () { return screenProps.width; },
      configurable: true,
    });
  } catch (e) { /* silent */ }
  try {
    Object.defineProperty(Screen.prototype, 'height', {
      get: function () { return screenProps.height; },
      configurable: true,
    });
  } catch (e) { /* silent */ }
  try {
    Object.defineProperty(Screen.prototype, 'availWidth', {
      get: function () { return screenProps.availWidth; },
      configurable: true,
    });
  } catch (e) { /* silent */ }
  try {
    Object.defineProperty(Screen.prototype, 'availHeight', {
      get: function () { return screenProps.availHeight; },
      configurable: true,
    });
  } catch (e) { /* silent */ }
  try {
    Object.defineProperty(Screen.prototype, 'colorDepth', {
      get: function () { return screenProps.colorDepth; },
      configurable: true,
    });
  } catch (e) { /* silent */ }
  try {
    Object.defineProperty(Screen.prototype, 'pixelDepth', {
      get: function () { return screenProps.pixelDepth; },
      configurable: true,
    });
  } catch (e) { /* silent */ }

  // ── 4. Canvas fingerprint spoofing (toDataURL / toBlob) ──
  const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
  const origToBlob = HTMLCanvasElement.prototype.toBlob;

  function addCanvasNoise(canvas) {
    try {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      // Only add noise to small canvases (typical fingerprint size)
      // Large canvases are likely user content
      if (w * h > 500000) return;
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const noiseLevel = profile.canvasNoise || 0.0002;
      for (let i = 0; i < data.length; i += 4) {
        // Deterministic per-pixel jitter based on seed and position
        const pixelRng = seededRand(profile.seed + i);
        const noise = (pixelRng() - 0.5) * noiseLevel * 255;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);
    } catch (e) { /* silent */ }
  }

  HTMLCanvasElement.prototype.toDataURL = function () {
    addCanvasNoise(this);
    return origToDataURL.apply(this, arguments);
  };

  HTMLCanvasElement.prototype.toBlob = function (callback) {
    addCanvasNoise(this);
    // Wrap callback to pass through original args
    const args = arguments;
    const wrappedCallback = function (blob) {
      callback(blob);
    };
    return origToBlob.call(this, wrappedCallback, args[1], args[2]);
  };

  // ── 5. WebGL fingerprint spoofing ──
  const WEBGL_PARAMS = {
    0x1F00: profile.webglVendor,        // VENDOR
    0x1F01: profile.webglRenderer,      // RENDERER
    0x9245: profile.webglUnmaskedVendor,  // UNMASKED_VENDOR_WEBGL
    0x9246: profile.webglUnmaskedRenderer, // UNMASKED_RENDERER_WEBGL
  };

  function hookWebGLContext(contextType) {
    try {
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function () {
        const ctx = origGetContext.apply(this, arguments);
        if (ctx && (arguments[0] === 'webgl' || arguments[0] === 'webgl2' || arguments[0] === 'experimental-webgl')) {
          hookWebGLGetParameter(ctx, arguments[0]);
        }
        return ctx;
      };
    } catch (e) { /* silent */ }
  }

  function hookWebGLGetParameter(gl, type) {
    const origGetParameter = gl.getParameter;
    gl.getParameter = function (pname) {
      if (WEBGL_PARAMS.hasOwnProperty(pname)) {
        return WEBGL_PARAMS[pname];
      }
      // Jitter numeric parameters slightly
      const result = origGetParameter.call(this, pname);
      if (typeof result === 'number' && (
        pname === 0x8B8A || // MAX_TEXTURE_SIZE
        pname === 0x8B8B || // MAX_VIEWPORT_DIMS
        pname === 0x0D33 || // MAX_RENDERBUFFER_SIZE
        pname === 0x851C     // MAX_CUBE_MAP_TEXTURE_SIZE
      )) {
        const jitter = (rand() - 0.5) * 0.02 * result;
        return Math.round(result + jitter);
      }
      return result;
    };
  }

  hookWebGLContext();

  // Also hook OffscreenCanvas if available
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const origOffGetContext = OffscreenCanvas.prototype.getContext;
      OffscreenCanvas.prototype.getContext = function () {
        const ctx = origOffGetContext.apply(this, arguments);
        if (ctx && (arguments[0] === 'webgl' || arguments[0] === 'webgl2' || arguments[0] === 'experimental-webgl')) {
          hookWebGLGetParameter(ctx, arguments[0]);
        }
        return ctx;
      };
    } catch (e) { /* silent */ }
  }

  // ── 6. AudioContext fingerprint spoofing ──
  const origGetChannelData = AudioBuffer.prototype.getChannelData;
  const audioNoiseLevel = profile.audioNoise || 0.00003;

  AudioBuffer.prototype.getChannelData = function (channel) {
    const data = origGetChannelData.call(this, channel);
    // Only add noise if the buffer was created via OfflineAudioContext rendering
    // (typical fingerprint buffer is very short: ~4500 samples)
    if (data.length <= 50000) {
      for (let i = 0; i < data.length; i++) {
        const sampleRng = seededRand(profile.seed + i + channel * 100000);
        data[i] += (sampleRng() - 0.5) * audioNoiseLevel * 2;
      }
    }
    return data;
  };

  // Also hook copyFromChannel for completeness
  const origCopyFromChannel = AudioBuffer.prototype.copyFromChannel;
  AudioBuffer.prototype.copyFromChannel = function (destination, channelNumber, startInChannel) {
    origCopyFromChannel.call(this, destination, channelNumber, startInChannel || 0);
    if (this.length <= 50000) {
      for (let i = 0; i < destination.length; i++) {
        const sampleRng = seededRand(profile.seed + i + channelNumber * 100000 + 999999);
        destination[i] += (sampleRng() - 0.5) * audioNoiseLevel * 2;
      }
    }
  };

  // ── 7. WebRTC IP leak protection ──
  // Override RTCPeerConnection to strip local IPs from SDP
  if (typeof RTCPeerConnection !== 'undefined') {
    const OrigRTCPeerConnection = RTCPeerConnection;

    window.RTCPeerConnection = function () {
      const pc = new OrigRTCPeerConnection(...arguments);

      const origCreateOffer = pc.createOffer;
      pc.createOffer = function () {
        return origCreateOffer.apply(this, arguments).then(function (offer) {
          if (offer && offer.sdp) {
            // Remove local IP addresses (IPv4 and IPv6) from SDP
            offer.sdp = offer.sdp
              .replace(/a=candidate:(\d+) \d+ UDP \d+ (\d+\.\d+\.\d+\.\d+) \d+ typ host/g,
                function (match, foundation, ip) {
                  // Replace with a placeholder local IP
                  return match.replace(ip, '0.0.0.0');
                })
              .replace(/a=candidate:(\d+) \d+ UDP \d+ ([0-9a-f:]+) \d+ typ host/gi,
                function (match, foundation, ip) {
                  return match.replace(ip, '::1');
                });
          }
          return offer;
        });
      };

      const origCreateAnswer = pc.createAnswer;
      pc.createAnswer = function () {
        return origCreateAnswer.apply(this, arguments).then(function (answer) {
          if (answer && answer.sdp) {
            answer.sdp = answer.sdp
              .replace(/a=candidate:(\d+) \d+ UDP \d+ (\d+\.\d+\.\d+\.\d+) \d+ typ host/g,
                function (match, foundation, ip) {
                  return match.replace(ip, '0.0.0.0');
                })
              .replace(/a=candidate:(\d+) \d+ UDP \d+ ([0-9a-f:]+) \d+ typ host/gi,
                function (match, foundation, ip) {
                  return match.replace(ip, '::1');
                });
          }
          return answer;
        });
      };

      return pc;
    };
    window.RTCPeerConnection.prototype = OrigRTCPeerConnection.prototype;
  }

  // ── 8. Timezone spoofing ──
  if (profile.timezoneOffset !== undefined) {
    const origGetTZOffset = Date.prototype.getTimezoneOffset;
    Date.prototype.getTimezoneOffset = function () {
      return profile.timezoneOffset;
    };

    // Override Intl.DateTimeFormat for timezone
    try {
      const OrigDateTimeFormat = Intl.DateTimeFormat;
      Intl.DateTimeFormat = function (locales, options) {
        const opts = options ? Object.assign({}, options) : {};
        if (profile.timezone && !opts.timeZone) {
          opts.timeZone = profile.timezone;
        }
        return new OrigDateTimeFormat(locales, opts);
      };
      Intl.DateTimeFormat.prototype = OrigDateTimeFormat.prototype;
    } catch (e) { /* silent */ }
  }

  // ── 9. Font enumeration protection ──
  // Intercept document.fonts to limit font enumeration
  try {
    const origFontsDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'fonts');
    if (origFontsDescriptor && origFontsDescriptor.get) {
      const origFontsGet = origFontsDescriptor.get;
      Object.defineProperty(Document.prototype, 'fonts', {
        get: function () {
          const fonts = origFontsGet.call(this);
          // Intercept font loading to limit detectable fonts
          const origCheck = fonts.check;
          fonts.check = function (font, text) {
            const allowedFonts = profile.fonts || [];
            // Extract font family name from font spec
            const family = font.split(':')[0].replace(/['"]/g, '');
            if (allowedFonts.length > 0 && !allowedFonts.includes(family)) {
              return false;
            }
            return origCheck.call(this, font, text);
          };
          return fonts;
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch (e) { /* silent */ }

  // ── 10. Plugins / MimeTypes ──
  // Override navigator.plugins to hide plugin enumeration
  try {
    Object.defineProperty(Navigator.prototype, 'plugins', {
      get: function () {
        // Return a PluginArray-like object with limited entries
        return Object.freeze(Object.create(PluginArray.prototype, {
          length: { value: 3, enumerable: true },
          0: { value: createFakePlugin('Chrome PDF Plugin', 'Chromium PDF Plugin'), enumerable: true },
          1: { value: createFakePlugin('Chrome PDF Viewer', 'Chromium PDF Viewer'), enumerable: true },
          2: { value: createFakePlugin('Native Client', ''), enumerable: true },
        }));
      },
      configurable: true,
    });
  } catch (e) { /* silent */ }

  function createFakePlugin(name, desc) {
    return {
      name: name,
      description: desc,
      filename: 'internal-pdf-viewer',
      length: 1,
      item: function () { return null; },
      namedItem: function () { return null; },
    };
  }

  try {
    Object.defineProperty(Navigator.prototype, 'mimeTypes', {
      get: function () {
        return Object.freeze(Object.create(MimeTypeArray.prototype, {
          length: { value: 3, enumerable: true },
        }));
      },
      configurable: true,
    });
  } catch (e) { /* silent */ }

  // ── 11. Product spoofing ──
  try {
    Object.defineProperty(Navigator.prototype, 'productSub', {
      get: function () { return '20030107'; },
      configurable: true,
    });
  } catch (e) { /* silent */ }

  try {
    Object.defineProperty(Navigator.prototype, 'appVersion', {
      get: function () {
        return '5.0 (' + profile.platformDetail + ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      },
      configurable: true,
    });
  } catch (e) { /* silent */ }

  // Mark profile as applied for debugging
  window.__FINGERPRINT_APPLIED__ = profile.profileId || true;
})();
