import { loadSettings } from "./config";

async function checkForUpdates() {
    const packageInfo = await fetchJson('https://registry.npmjs.org/@bobschlowinskii/clicraft');
    const latestVersion = packageInfo['dist-tags'].latest;
    const currentVersion = version;

    if (latestVersion !== currentVersion) {
        console.log(chalk.yellow(`\n✓ A new CLIcraft version is available (v${latestVersion})`));
        console.log(chalk.gray('  Run ') + chalk.cyan('npm install -g @bobschlowinskii/clicraft') + chalk.gray(' to update.\n'));
        return;
    }

}

export function callPostCommandActions() {
    const settings = loadSettings();

    if (settings.checkUpdates) {
        checkForUpdates();
    }
}