
/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var UNKNOWN = 'UNKNOWN';
var read = require('read-installed');
var treeify = require('treeify');
var fs = require('fs');
var _ = require('underscore');
var packageLicense = require('package-license');

var flatten = function(data, unversioned, json, options) {
    if (!json.name || !json.version){   // in case dependencies were were empty
        return;
    }
    if (data[json.name + '@' + json.version]){ // prevent circular
        return;
    }
    if (json.extraneous){ // filter out root devDependencies and manually installed packages
        return;
    }

    var moduleInfo = unversioned[json.name] || {licenses: UNKNOWN};
    var moduleId;

    data[json.name + '@' + json.version] = moduleInfo;

    if (!unversioned[json.name]) {
        if (json.repository && typeof json.repository === 'object' && typeof json.repository.url === 'string') {
            moduleInfo.repository = json.repository.url
                .replace('git+ssh://git@', 'git://')
                .replace('git+https://github.com', 'https://github.com')
                .replace('git://github.com', 'https://github.com')
                .replace('git@github.com:', 'https://github.com/')
                .replace('.git', '');
        }
        if (json.url && typeof json.url === 'object') moduleInfo.url = json.url.web;

        var licenseData = json.license || json.licenses || undefined;
        if (licenseData) {
            if (Array.isArray(licenseData) && licenseData.length > 0) {
                moduleInfo.licenses = licenseData.map(function(license){
                    if (typeof license === 'object')  return license.type
                    else if (typeof license === 'string') return license;
                });
            } else if (typeof licenseData === 'object' && licenseData.type) {
                moduleInfo.licenses = licenseData.type;
            } else if (typeof licenseData === 'string') {
                moduleInfo.licenses = licenseData;
            }
        } else {
            moduleInfo.licenses = packageLicense(json.path);
        }
    }

    options.include.forEach(function(dependencyType){
        if (json[dependencyType]) {
            Object.keys(json[dependencyType]).forEach(function(moduleName) {
                // special check for dependencyType === 'dependencies' which contains ALL types actually
                if (dependencyType === 'dependencies'){
                    if ((json.devDependencies && json.devDependencies[moduleName])
                        || (json.optionalDependencies && json.optionalDependencies[moduleName])
                        || (json.peerDependencies && json.peerDependencies[moduleName])){
                        return;
                    }
                }
                if (json[dependencyType] && json[dependencyType][moduleName]){
                    var childDependency = json.dependencies[moduleName];
                    if (childDependency){
                        flatten(data, unversioned, childDependency, options);
                    } 
                }
            });
        }
    });

};

exports.init = function(options, callback) {

    var defaults = {
        start: '.',
        unknown: false,
        depth: 'all', 
        include: 'dependencies',
        meta: null
    };
    var data = {};
    var unversioned = {}; 

    options = _.extend(defaults, options);

    if (typeof options.meta === 'string'){
        var meta = require(process.cwd() + '/' + options.meta);
        var mapToUse = data;
        for (var moduleKey in meta){
            if (moduleKey.indexOf('@') > -1){
                mapToUse = data;
            } else {
                mapToUse = unversioned;
            }
            if (typeof meta[moduleKey] === 'string'){
                mapToUse[moduleKey] = {licenses: meta[moduleKey]};
            }
            else if (typeof meta[moduleKey] === 'object')
                mapToUse[moduleKey] = meta[moduleKey];
        }
    }

    if (typeof options.include === 'string') {
        if (options.include === 'all'){
            options.include = ['dependencies','devDependencies','bundledDependencies','bundleDependencies','optionalDependencies','peerDependencies']
        } else{
            options.include = [options.include]; 
        }
    }
    
    var opt = {
        depth: options.depth,
        dev: options.include.indexOf('devDependencies') != -1,
    }
    
    read(options.start, opt, function(err, json) {
        flatten(data, unversioned, json, options);
        var sorted = {};
        Object.keys(data).sort().forEach(function(item) {
            if (options.unknown && data[item].licenses !== UNKNOWN && data[item].licenses.indexOf('*') === -1)
                delete data[item];
            if (data[item]) sorted[item] = data[item];
        });
        callback(sorted);
    });
};

exports.print = function(sorted, format) {
    if (format === "json"){
        console.log(JSON.stringify(sorted));
    } else{
        console.log(treeify.asTree(sorted, true));
    }
};
