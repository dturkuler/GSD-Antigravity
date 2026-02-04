#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function install() {
    const targetDir = process.cwd();
    // Location of the .agent folder relative to this script in the package
    const sourceAgentDir = path.join(__dirname, '..', '.agent');
    const targetAgentDir = path.join(targetDir, '.agent');

    console.log('🌌 Initializing GSD-Antigravity Skill System...');

    try {
        // 1. Copy .agent folder
        if (fs.existsSync(sourceAgentDir)) {
            console.log(`📦 Copying .agent skills to ${targetDir}...`);

            // We use a simple recursive copy strategy
            copyFolderSync(sourceAgentDir, targetAgentDir);
            console.log('✅ .agent folder installed successfully.');
        } else {
            console.error('❌ Error: Could not find .agent folder in the package.');
            process.exit(1);
        }

        // 2. Offer to run the converter
        console.log('\n✨ GSD-Antigravity is now in your project.');
        console.log('To initialize the GSD engine, run:');
        console.log('  py .agent/skills/gsd-converter/scripts/convert.py gsd\n');

    } catch (err) {
        console.error('❌ Installation failed:', err.message);
        process.exit(1);
    }
}

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
        const stat = fs.lstatSync(path.join(from, element));
        if (stat.isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else if (stat.isDirectory()) {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}

install();
