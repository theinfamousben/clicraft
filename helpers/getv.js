import pkg from '../package.json' with { type: "json" };

const version = pkg.version ?? pkg.default.version;

export default version;