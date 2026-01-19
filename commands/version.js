import chalk from 'chalk';
import * as pkg from '../package.json' with { type: "json" };

const art = 
    "                      _         \n" + 
    "                     | |        \n" +
    " _ __ ___   ___ _ __ | | ____ _ \n" +
    "| '_ ` _ \\ / __| '_ \\| |/ / _` |\n" +
    "| | | | | | (__| |_) |   < (_| |\n" +
    "|_| |_| |_|\\___| .__/|_|\\_\\__, |\n" +
    "               | |         __/ |\n" +
    "               |_|        |___/ "
;

console.log(`
    ${chalk.white(art)}\n
    ${chalk.white('Version:')} ${chalk.gray(pkg.version)}
`);