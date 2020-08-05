import Menu from '../model/Menu';


class Api {

    static async getConfigVersion() {
        let resp = await fetch(Api.CONFIG_VERSION_PATH);
        return resp.text();
    }

    static async getProgressionDelay() {
        let resp = await fetch(Api.PROGRESSION_DELAY_PATH);
        return resp.text();
    }

    static async getCurrentMenuId() {
        let resp = await fetch(Api.CURR_MENU_ID_PATH);
        return resp.text();
    }

    static async getCurrentMenu() {
        let resp = await fetch(Api.CURR_MENU_PATH);
        return Menu.fromJSON(await resp.json());
    }

}

Api.CONFIG_VERSION_PATH = 'api/config/version/';
Api.PROGRESSION_DELAY_PATH = 'api/config/progressionDelay';
Api.CURR_MENU_ID_PATH = 'api/config/menu/current/id';
Api.CURR_MENU_PATH = 'api/config/menu/current/';


export default Api;