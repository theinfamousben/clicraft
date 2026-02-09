import path from "path";
import { spawn } from "child_process";
import fs from "fs";
import chalk from "chalk";

export function startServer(instancePath) {
    const startScript = process.platform === 'win32' ? 'start.bat' : 'start.sh';
    const startPath = path.join(instancePath, startScript);

    if (!fs.existsSync(startPath)) {
        console.error(chalk.red(`Error: Start script not found at ${startPath}`));
        return;
    }

    const serverProcess = spawn(startPath, [], {
        cwd: instancePath,
        shell: true,
        stdio: 'inherit'
    });

    serverProcess.on('error', (err) => {
        console.error(chalk.red(`Failed to start server: ${err.message}`));
    });

    serverProcess.on('exit', (code) => {
        if (code === 0) {
            console.log(chalk.green('Server stopped successfully.'));
        } else {
            console.error(chalk.red(`Server exited with code ${code}`));
        }
    });
}