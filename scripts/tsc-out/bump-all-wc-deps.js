"use strict";
/**
 * Update all dependencies for web components (Material, Lit)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const packagesDir = path.resolve(__dirname, '..', '..', 'libs', 'web-components');
function mapPackageVersion(packageName, versions) {
    if (packageName.startsWith('@material/mwc-')) {
        return versions.mwc;
    }
    if (packageName.startsWith('@material/')) {
        return versions.mdc;
    }
    if (packageName === 'lit-element') {
        return versions.litElement;
    }
    if (packageName === 'lit-html') {
        return versions.litHtml;
    }
    return '';
}
function main() {
    const latestVersions = {
        mdc: getPkgVersion('@material/base@latest'),
        mwc: getPkgVersion('@material/mwc-base@latest'),
        litHtml: getPkgVersion('lit-html@latest'),
        litElement: getPkgVersion('lit-element@latest')
    };
    console.log(`Found latest MDC Web version: ${latestVersions.mdc}\n`);
    console.log(`Found latest MWC Web version: ${latestVersions.mwc}\n`);
    console.log(`Found latest Lit Element version: ${latestVersions.litElement}\n`);
    console.log(`Found latest Lit Html version: ${latestVersions.litHtml}\n`);
    const packageJsonPaths = glob.sync(path.join('*', 'package.json'), { cwd: packagesDir });
    let anyChanged = false;
    for (const relPath of packageJsonPaths) {
        const absPath = path.join(packagesDir, relPath);
        const pj = JSON.parse(fs.readFileSync(absPath, 'utf8'));
        if (!pj.dependencies && !pj.devDependencies) {
            continue;
        }
        console.log(`Checking ${pj.name}`);
        let changed = false;
        const updateDependencies = (dependencies) => {
            for (const [pkg, oldVersion] of Object.entries(dependencies)) {
                const newVersion = mapPackageVersion(pkg, latestVersions);
                if (newVersion) {
                    if (oldVersion !== newVersion.substring(1)) {
                        dependencies[pkg] = newVersion.substring(1);
                        console.log(`\tUpdating ${pkg} from ${oldVersion} to ${newVersion}`);
                        changed = true;
                        anyChanged = true;
                    }
                }
            }
        };
        if (pj.dependencies) {
            updateDependencies(pj.dependencies);
        }
        if (pj.devDependencies) {
            updateDependencies(pj.devDependencies);
        }
        if (changed) {
            console.log(`\tWriting new package.json`);
            fs.writeFileSync(absPath, JSON.stringify(pj, null, 2) + '\n', 'utf8');
        }
    }
    if (anyChanged) {
        // Set an output value for consumption by a GitHub Action.
        // https://help.github.com/en/articles/development-tools-for-github-actions#set-an-output-parameter-set-output
        console.log(`::set-output name=new-mdc-version::${latestVersions.mdc.substring(1)}`);
        console.log(`::set-output name=new-mwc-version::${latestVersions.mwc.substring(1)}`);
        console.log(`::set-output name=new-lit-html-version::${latestVersions.litHtml.substring(1)}`);
        console.log(`::set-output name=new-lit-element-version::${latestVersions.litElement.substring(1)}`);
        console.log(`\nRemember to run npm install!`);
    }
}
function getPkgVersion(packageName) {
    const packageVersion = '=' +
        child_process_1.execFileSync('npm', ['info', packageName, 'version'], {
            encoding: 'utf8'
        }).trim();
    return packageVersion;
}
main();
//# sourceMappingURL=bump-all-wc-deps.js.map