const versions = [
    '0.1.0',
    '0.2.0',
    '0.2.1',
    '0.2.2',
    '0.3.0',
];


function enumerate(version) {
    return versions.indexOf(version) ?? -1;
}

function denumerate(index) {
    return versions[index] ?? null;
}

export { enumerate, denumerate };