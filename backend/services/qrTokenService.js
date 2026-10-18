const crypto = require('crypto');
const Session = require('../models/Session');

function sign(sessionId, issuedAt) {
  return crypto.createHmac('sha256', process.env.QR_SECRET)
    .update(`${sessionId}:${issuedAt}`)
    .digest('hex');
}

// Token format: "<time issued in ms>.<signature>".
// The signature proves the server issued this token for this session at that time.
function generateToken(sessionId) {
  const issuedAt = Date.now();
  return `${issuedAt}.${sign(sessionId, issuedAt)}`;
}

// Used for scans saved while offline: returns the time the token was issued
// if it is a genuine token for this session, otherwise null.
function tokenIssuedAt(sessionId, token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [timePart, signature] = token.split('.');
  const issuedAt = Number(timePart);
  if (!Number.isFinite(issuedAt)) return null;
  const expected = Buffer.from(sign(sessionId, issuedAt), 'hex');
  const given = Buffer.from(signature || '', 'hex');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  return issuedAt;
}

const activeLoops = new Map();

function startRefreshLoop(sessionId, intervalMs = 7000) {
  const handle = setInterval(async () => {
    try {
      const newToken = generateToken(sessionId);
      await Session.updateOne(
        { sessionId },
        { currentToken: newToken, tokenUpdatedAt: new Date() }
      );
    } catch (err) {
      // Internet dropped for a moment: skip this refresh and try again on the next one
      console.error(`QR refresh skipped for ${sessionId}: ${err.message}`);
    }
  }, intervalMs);
  activeLoops.set(sessionId, handle);
  return handle;
}

function stopRefreshLoop(sessionId) {
  const handle = activeLoops.get(sessionId);
  if (handle) {
    clearInterval(handle);
    activeLoops.delete(sessionId);
  }
}

module.exports = { generateToken, tokenIssuedAt, startRefreshLoop, stopRefreshLoop };
