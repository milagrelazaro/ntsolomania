const fs = require("fs");
const app = fs.readFileSync("App.js", "utf8");
const lines = app.split("\n").length;
console.log("Linhas atuais:", lines);
console.log("Preparando versao educativa...");
