import Digest from 'digest-js';

export const objectHash = (obj) => {
  const json = JSON.stringify(obj);
  const dg = new Digest.SHA1();
  return dg.digest(json);
};
