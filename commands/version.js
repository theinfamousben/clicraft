import chalk from 'chalk';
import version from '../helpers/getv.js';
import { callPostCommandActions } from '../helpers/post-command.js';

const art = "\n" +
    "   _____ _      _____                __ _   \n" +
    "  / ____| |    |_   _|              / _| |  \n" +
    " | |    | |      | |  ___ _ __ __ _| |_| |_ \n" +
    " | |    | |      | | / __| '__/ _` |  _| __|\n" +
    " | |____| |____ _| || (__| | | (_| | | | |_ \n" +
    "  \\_____|______|_____\\___|_|  \\__,_|_|  \\__|\n" +
    "                                            "
;

const output = (`
    ${chalk.white(art)}\n
    ${chalk.white('Version:')} ${chalk.gray(version)}
`);

export function showVersion() {
    console.log(output);

    callPostCommandActions();
}