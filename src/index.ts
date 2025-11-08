import { setUser, readConfig } from "./config.js";

function main() {
    const cfg = readConfig();
    setUser("mash");

    console.log(cfg);
}

main();