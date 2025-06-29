
const bcrypt = require('bcrypt');
const { createHmac } = require('crypto');


exports.doHash = async (value, saltRounds = 10) => {
  const hashed = await bcrypt.hash(value, saltRounds);
  return hashed;
};
exports.doHashValidation = (value, hashedValue) => {
    const result = bcrypt.compare(value, hashedValue);
    return result;
};

exports.hmacProcess = (value, key) => {
  const result = createHmac('sha256', key)
    .update(value).digest('hex');
  return result;
}