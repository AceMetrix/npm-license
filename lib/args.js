/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var nopt = require('nopt'),
    noptUsage = require("nopt-usage"),
    known = {
        json: require('path'),
        unknown: Boolean,
        version: Boolean,
        start: String,
        export: String,
        help: Boolean,
        depth: Number,
        include: String,
    },
    shorts = {
        "e" : ["--export"],
        "v" : ["--version"],
        "h" : ["--help"]
    },
    description = {
        "json" : "Path to be scanned",
        "version" : "Show the current version",
        "export" : "Export format, 'tree' or 'json'",
        "help" : "This help",
        "include": "Set this to dependencies or devDependencies",
        "start": "Path to the npm project directory",
    },
    defaults = {
        "json" : ".",
        "version" : false,
        "export" : "tree",
        "help" : false,
        "include": "dependencies",
        "start": process.cwd(),
    };


var raw = function (args) {
    var parsed = nopt(known, shorts, (args || process.argv));
    return parsed;
};

var usage = function () {
    return noptUsage(known, shorts, description, defaults);
};

var has = function (a) {
    var cooked = raw().argv.cooked,
        ret = false;

    cooked.forEach(function (o) {
        if ((o === '--' + a) || (o === '--no-' + a)) {
            ret = true;
        }
    });

    return ret;
};

var clean = function(args) {
    var parsed = raw(args);    
    delete parsed.argv;
    return parsed;
};

var setDefaults = function(parsed) {
    if (parsed === undefined) {
        parsed = clean();
    }
    
    return parsed;
};

var parse = function (args) {
    var parsed = clean(args);
    return setDefaults(parsed);
};

exports.defaults = setDefaults;
exports.has = has;
exports.raw = raw;
exports.parse = parse;
exports.shorts = shorts;
exports.known = known;
exports.usage = usage;
