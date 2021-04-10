import Menu from '../model/Menu.js';
import Util from './Util.js';


class Api {

    static async getConfigVersion() {
        let resp = await fetch(Util.buildUrl(Api.GET_CONFIG_VERSION_PATH));

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        return resp.text();
    }

    static async getTheme() {
        let resp = await fetch(Util.buildUrl(Api.GET_THEME_PATH));

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        return resp.text();
    }

    static async getProgressionDelay() {
        let resp = await fetch(Util.buildUrl(Api.GET_PROGRESSION_DELAY_PATH));

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        return resp.text();
    }

    static async getCurrentMenuId() {
        let resp = await fetch(Util.buildUrl(Api.GET_CURR_MENU_ID_PATH));

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        return resp.text();
    }

    static async getCurrentMenu() {
        let resp = await fetch(Util.buildUrl(Api.GET_CURR_MENU_PATH));

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        return Menu.fromJSON(await resp.json());
    }

    static async getMenus() {
        let menus = {};
        let resp = await fetch(Util.buildUrl(Api.GET_ALL_MENUS_PATH));

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        let menusJson = await resp.json();

        Object.keys(menusJson).forEach((id) => {
            let menu = Menu.fromJSON(menusJson[id]);
            menus[menu.id] = menu;
        });

        return menus;
    }

    static async setTheme(theme) {
        let body = {
            theme: theme
        };

        let opts = {
            method: 'post',
            body: JSON.stringify(body)
        };

        let resp = await fetch(Util.buildUrl(Api.SET_THEME_PATH), opts);

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        return await resp.text();
    }

    static async setProgressionDelay(delay) {
        let body = {
            progressionDelay: delay
        };

        let opts = {
            method: 'post',
            body: JSON.stringify(body)
        };

        let resp = await fetch(Util.buildUrl(Api.SET_PROGRESSION_DELAY_PATH), opts);

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        return await resp.text();
    }

    static async setCurrentMenuId(id) {
        let body = {
            menuId: id
        };

        let opts = {
            method: 'post',
            body: JSON.stringify(body)
        };

        let resp = await fetch(Util.buildUrl(Api.SET_CURRENT_MENU_PATH), opts);

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        return await resp.text();
    }

    static async saveMenu(menu) {
        let body = {
            menu: menu
        };

        let opts = {
            method: 'post',
            body: JSON.stringify(body)
        };

        let resp = await fetch(Util.buildUrl(Api.SAVE_MENU_PATH), opts);

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        return await resp.text();
    }

    static async deleteMenu(menu) {
        let body = {
            menuId: menu.id
        };

        let opts = {
            method: 'post',
            body: JSON.stringify(body)
        };

        let resp = await fetch(Util.buildUrl(Api.DELETE_MENU_PATH), opts);

        if (resp.status !== 200) {
            throw new Error(resp.text());
        }

        return await resp.text();
    }
}

Api.GET_CONFIG_VERSION_PATH = '/api/config/version/';
Api.GET_THEME_PATH = '/api/config/theme/';
Api.SET_THEME_PATH = '/api/config/theme/set/';
Api.GET_PROGRESSION_DELAY_PATH = '/api/config/progressionDelay/';
Api.SET_PROGRESSION_DELAY_PATH = '/api/config/progressionDelay/set/';
Api.GET_CURR_MENU_ID_PATH = '/api/config/menu/current/id/';
Api.GET_CURR_MENU_PATH = '/api/config/menu/current/';
Api.GET_ALL_MENUS_PATH = '/api/config/menu/all/';
Api.SAVE_MENU_PATH = '/api/config/menu/save/';
Api.DELETE_MENU_PATH = '/api/config/menu/delete/';
Api.SET_CURRENT_MENU_PATH = 'api/config/menu/current/set/';


export default Api;