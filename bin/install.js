const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, (ans) => resolve(ans.toLowerCase().trim())));

async function install() {
    const targetDir = process.cwd();
    const sourceAgentDir = path.join(__dirname, '..', '.agent');
    const skillsSourceDir = path.join(sourceAgentDir, 'skills');
    
    // Skills to check/install
    const skillNames = ['gsd', 'gsd-converter'];
    const targetSkillsDir = path.join(targetDir, '.agent', 'skills');

    console.log('\n🌌 GSD-Antigravity Skill System Installer\n');

    try {
        // 1. Check for existing skills
        const existing = [];
        for (const name of skillNames) {
            if (fs.existsSync(path.join(targetSkillsDir, name))) {
                existing.push(name);
            }
        }

        if (existing.length > 0) {
            console.log(`⚠️  Detected existing skills in .agent/skills/: ${existing.join(', ')}`);
            const confirmRemove = await ask(`Do you want to REMOVE existing skills and perform a fresh install? (y/n): `);
            if (confirmRemove === 'y') {
                for (const name of existing) {
                    const p = path.join(targetSkillsDir, name);
                    console.log(`  🗑️  Removing ${name}...`);
                    fs.rmSync(p, { recursive: true, force: true });
                }
            } else {
                console.log('  ⏩ Skipping removal. New files will be merged/overwritten.');
            }
        }

        // 2. Interactive Installation Selection
        const installGsd = await ask(`Install GSD skill? (y/n) [default: y]: `);
        const installConverter = await ask(`Install GSD-Converter skill? (y/n) [default: y]: `);

        const selection = {
            'gsd': installGsd !== 'n',
            'gsd-converter': installConverter !== 'n'
        };

        // 3. Perform Installation
        if (!fs.existsSync(targetSkillsDir)) {
            fs.mkdirSync(targetSkillsDir, { recursive: true });
        }

        // Also copy rules if they exist
        const sourceRulesDir = path.join(sourceAgentDir, 'rules');
        const targetRulesDir = path.join(targetDir, '.agent', 'rules');
        if (fs.existsSync(sourceRulesDir)) {
            copyFolderSync(sourceRulesDir, targetRulesDir);
        }

        let installedCount = 0;
        for (const [name, shouldInstall] of Object.entries(selection)) {
            if (shouldInstall) {
                const src = path.join(skillsSourceDir, name);
                const tgt = path.join(targetSkillsDir, name);
                if (fs.existsSync(src)) {
                    console.log(`📦 Installing ${name}...`);
                    copyFolderSync(src, tgt);
                    installedCount++;
                }
            }
        }

        if (installedCount > 0) {
            console.log('\n✅ Installation completed successfully.');
            if (selection['gsd-converter']) {
                console.log('\n✨ To initialize the GSD engine, run:');
                console.log('  py .agent/skills/gsd-converter/scripts/convert.py gsd\n');
            }
        } else {
            console.log('\nℹ️  No skills were selected for installation.');
        }

    } catch (err) {
        console.error('\n❌ Installation failed:', err.message);
    } finally {
        rl.close();
    }
}

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
        const srcPath = path.join(from, element);
        const tgtPath = path.join(to, element);
        const stat = fs.lstatSync(srcPath);
        if (stat.isFile()) {
            fs.copyFileSync(srcPath, tgtPath);
        } else if (stat.isDirectory()) {
            copyFolderSync(srcPath, tgtPath);
        }
    });
}

install();
