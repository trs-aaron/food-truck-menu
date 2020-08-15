import Menu from '../model/Menu.js';
import Util from './Util.js';


class Api {

    static async getConfigVersion() {
        let resp = await fetch(Util.buildUrl(Api.CONFIG_VERSION_PATH));
        return resp.text();
    }

    static async getProgressionDelay() {
        let resp = await fetch(Util.buildUrl(Api.PROGRESSION_DELAY_PATH));
        return resp.text();
    }

    static async getCurrentMenuId() {
        let resp = await fetch(Util.buildUrl(Api.CURR_MENU_ID_PATH));
        return resp.text();
    }

    static async getCurrentMenu() {
        let resp = await fetch(Util.buildUrl(Api.CURR_MENU_PATH));
        return Menu.fromJSON(await resp.json());
    }

    static async getMenus() {
        let menus = {};
        let resp = await fetch(Util.buildUrl(Api.ALL_MENUS_PATH));
        let menusJson = await resp.json();

        Object.keys(menusJson).forEach((id) => {
            let menu = Menu.fromJSON(menusJson[id]);
            menus[menu.id] = menu;
        });

        return menus;
    }

    static async setProgressionDelay(delay) {
        alert(`SET PROGRESSION DELAY ${delay}`);
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
        return await resp.text();
    }
}

Api.CONFIG_VERSION_PATH = '/api/config/version/';
Api.PROGRESSION_DELAY_PATH = '/api/config/progressionDelay/';
Api.CURR_MENU_ID_PATH = '/api/config/menu/current/id/';
Api.CURR_MENU_PATH = '/api/config/menu/current/';
Api.ALL_MENUS_PATH = '/api/config/menu/all/';
Api.SAVE_MENU_PATH = '/api/config/menu/save/';
Api.SET_CURRENT_MENU_PATH = 'api/config/menu/current/set/';


export default Api;