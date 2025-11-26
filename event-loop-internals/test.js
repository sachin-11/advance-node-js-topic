const crypto = require("crypto");

console.log("start");

for (let i = 0; i < 5; i++) {
  crypto.pbkdf2("password", "salt", 100000, 64, "sha512", () => {
    console.log("done", i);
  });
}

console.log("end");

