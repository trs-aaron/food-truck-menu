class Util {

    static buildUrl(path) {
        path = (path) ? path.replace(/^\//g, '') : '';
        return `${Util.BASE_URL}/${path}`;
    }
}

Util.BASE_URL = /^(.*)(\/script\/.*)/g.exec(import.meta.url)[1];


export default Util;