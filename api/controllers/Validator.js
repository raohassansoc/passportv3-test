let hash = require("object-hash");
const TARGET_HASH = 1560;
module.exports.validProof = (proof) => {
  let guessHash = hash(proof);
  return guessHash == hash(TARGET_HASH);
};

module.exports.proofOfWork = () => {
  let proof = 0;
  while (true) {
    if (!module.exports.validProof(proof)) {
      proof++;
    } else {
      break;
    }
  }
  return hash(proof);
};
