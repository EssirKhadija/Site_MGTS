const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generate2FASecret = (email) => {
  return speakeasy.generateSecret({
    name: `${process.env.TWO_FA_APP_NAME} (${email})`,
    length: 20,
  });
};

const generate2FAQRCode = async (otpauthUrl) => {
  return await QRCode.toDataURL(otpauthUrl);
};

const verify2FAToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
};

module.exports = { generate2FASecret, generate2FAQRCode, verify2FAToken };