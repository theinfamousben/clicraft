import chalk from 'chalk';
import pkg from '../package.json' with { type: "json" };

const art = 
    "   _____ _      _____                __ _   \n" + 
    "  / ____| |    |_   _|              / _| |  \n" +
    " | |    | |      | |  ___ _ __ __ _| |_| |_ \n" +
    " | |    | |      | | / __| '__/ _` |  _| __|\n" +
    " | |____| |____ _| || (__| | | (_| | | | |_ \n" +
    "  \\_____|______|_____\\___|_|  \\__,_|_|  \\__|\n"
;

const output = (`
    ${chalk.white(art)}\n
    ${chalk.white('Version:')} ${chalk.gray(pkg.default.version)}
`);

export function version() {
    console.log(output);
}