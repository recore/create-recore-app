import crypto = require("crypto");
import fs = require("fs");

export default function shasum(filename: string, algorithm = "sha1") {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const input = fs.createReadStream(filename);
    input.on("readable", () => {
      const data = input.read();
      if (data) {
        hash.update(data);
      } else {
        resolve(hash.digest("hex"));
      }
    });
    input.on("error", (err: Error) => {
      reject(err);
    });
  });
}
