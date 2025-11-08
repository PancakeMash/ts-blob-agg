import fs from "fs";
import os from "os";
import path from "path";


type Config = {
    "dbUrl": string;
    "currentUserName"?: string;
}

const home = os.homedir();
const configFilename = ".gatorconfig.json";

export function setUser(user: string): void {
    const cfg = readConfig();
    cfg.currentUserName = user;
    writeConfig(cfg);
}

export function readConfig(): Config {
    const filePath = getConfigFilePath();

    let raw: string;
    try {
        raw = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
        throw new Error(`failed to read config at ${filePath}: ${err}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        throw new Error(`invalid JSON in ${filePath}: ${err}`);
    }

    return validateConfig(parsed);
}


//Helper functions:

function getConfigFilePath(): string {
    return path.join(home, configFilename);
}

function writeConfig(cfg: Config): void {
    const convertedJSON: string = JSON.stringify({db_url: cfg.dbUrl, current_user_name: cfg.currentUserName}, null, 2);
    fs.writeFileSync(getConfigFilePath(), convertedJSON, "utf-8");
}

function validateConfig(rawConfig: unknown): Config {
    if (!validateObject(rawConfig)) {
        throw new Error("Config must be an object");
    }

    const dbUrl = rawConfig["db_url"];
    const currentUserName = rawConfig["current_user_name"];

    if (typeof dbUrl !== "string" || dbUrl.length === 0) {
        throw new Error("dbUrl must be a non-empty string");
    }

    if (currentUserName !== undefined && typeof currentUserName !== "string") {
        throw new Error("current_user_name must be a string if present");
    }

    return {
        dbUrl,
        currentUserName
    };
}

function validateObject(obj: unknown): obj is Record<string,unknown> {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}