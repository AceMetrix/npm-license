module.exports = function(str){
    if (str.indexOf('MIT') > -1) {
        return 'MIT*';
    } else if (str.indexOf(' mit ') > -1) {
        return 'MIT*';
    } else if (str.indexOf('(mit)') > -1) {
        return 'MIT*';
    } else if (str.indexOf('BSD') > -1) {
        return 'BSD*';
    } else if (str.indexOf('Apache License') > -1) {
        return 'Apache*';
    } else if (str.indexOf('DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE') > -1) {
        return 'WTF*';
    } else if (str.indexOf('Public Domain') > -1) {
        return 'PD*';
    } else if (str.indexOf('PUBLIC DOMAIN') > -1) {
        return 'PD*';
    }
    return null;
}
