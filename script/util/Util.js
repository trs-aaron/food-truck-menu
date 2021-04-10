class Util {

    static buildUrl(path) {
        path = (path) ? path.replace(/^\//g, '') : '';
        return `${Util.BASE_URL}/${path}`;
    }

    static convertToSlug(text) {
        let slug = '';

        if (text && text !== '') {
            slug = text.toLowerCase();
            slug = slug.replace(/[^a-zA-Z0-9\s]/g, '');
            slug = slug.replace(/\s/g, '-');
        }

        return slug;
    }
}

Util.BASE_URL = /^(.*)(\/script\/.*)/g.exec(import.meta.url)[1];


export default Util;