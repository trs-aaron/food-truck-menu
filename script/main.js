(() => {
    const CONFIG_FILE_PATH = './menus.json';
    const FOOD_ITEMS_TMPL_ID = 'tam-menu-food-items-TEMPLATE';
    const BEV_ITEMS_TMPL_ID = 'tam-menu-bev-items-TEMPLATE';


    class MenuItem {

        constructor(el) {
            this._el = el;
        }

        get isVisible() {
            this._el.getAttribute(MenuItem.VISIBLE_ATTR);
        }

        hide() {
            this._el.setAttribute(MenuItem.VISIBLE_ATTR, 0);
        }

        show() {
            this._el.setAttribute(MenuItem.VISIBLE_ATTR, 1);
        }

        init() {
            return;
        }
    }

    MenuItem.EL_CLASS = 'tam-menu_item';
    MenuItem.VISIBLE_ATTR = 'data-is-visible';


    class MenuItemCntr {

        constructor(el) {
            this._el = el;
            this._items = [];
        }

        init() {
            this._items = [];
            let itemEls = this._el.getElementsByClassName(MenuItem.EL_CLASS);

            Array.from(itemEls).forEach((el) => {
                let item = new MenuItem(el);
                item.init();
                this._items.push(item);
            });
        }

        async show() {
            await this._showItems(0);
        }

        async hide() {
            await this._hideItems()
        }

        async progressItems() {
            let lastVisIndex = this._getLastVisibleIndex();
            let firstNewVisIndex = 0;

            if (lastVisIndex !== null && !isNaN(lastVisIndex)) {
                firstNewVisIndex = lastVisIndex + 1;
            }

            firstNewVisIndex = (this._items.length > firstNewVisIndex) ? firstNewVisIndex : 0;

            await this._hideItems();
            await this._moveToItem(firstNewVisIndex);
            await this._showItems(firstNewVisIndex);
        }

        _getLastVisibleIndex() {
            return null;
        }

        _isItemInFocus(index) {
            return true;
        }

        async _hideItems(delay=250) {
            return new Promise((resolve, reject) => {
                if (isNaN(delay)) {
                    reject();
                }

                // Recursively called function with delay timeout to hide items.
                const hideFunc = (index) => {
                    if (index < this._items.length) {
                        if (this._items[index] !== null && this._isItemInFocus(index)) {
                            this._items[index].hide();
                        }

                        setTimeout(() => { hideFunc(index + 1); }, delay);
                    } else {
                        resolve();
                    }
                };

                hideFunc(0);
            });
        }

        async _showItems(startIndex=0, delay=250) {
            return new Promise((resolve, reject) => {
                // Parameter check.
                if (isNaN(startIndex) || isNaN(delay)) {
                    reject();
                }

                // Recursively called function with delay timeout to show items.
                const showFunc = (index) => {
                    if (index < this._items.length && this._items[index] !== null && this._isItemInFocus(index)) {
                        this._items[index].show();
                        setTimeout(() => { showFunc(index + 1); }, delay);
                    } else {
                        resolve();
                    }
                };

                showFunc(startIndex);
            });
        }

        async _moveToItem(index) {
            return new Promise((resolve) => {
                // Parameter check.
                if (index === null || isNaN(index)) {
                    reject();
                }

                resolve();
            });
        }
    }

    MenuItemCntr.ITEM_CNTR_EL_CLASS = 'tam-menu_item-cntr';


    class Menu {

        constructor(itemProgressionDelay) {
            this._itemProgDelay = itemProgressionDelay;
            this._foodCntr = null;
            this._bevCntr = null;
            this._paused = true;
        }

        get paused() {
            return this._paused;
        }

        init() {
            let foodCntrEl = document.getElementById(Menu.FOOD_CNTR_ID);
            let bevCntrEl = document.getElementById(Menu.BEV_CNTR_ID);

            this._foodCntr = new MenuItemCntr(foodCntrEl);
            this._bevCntr = new MenuItemCntr(bevCntrEl);

            this._foodCntr.init();
            this._bevCntr.init();

            this._foodCntr.show();
            this._bevCntr.show();
        }

        restart() {
            this.pause();
            setTimeout(() => { this.start() }, (2 * this._itemProgDelay));
        }

        pause() {
            this._paused = true;
        }

        start() {
            this._paused = false;
            this._startMenuProgressions();
        }

        _startMenuProgressions() {
            const progFunc = () => {
                if (this.paused) {
                    return;
                }

                Promise.allSettled([
                    this._foodCntr.progressItems(),
                    this._bevCntr.progressItems()
                ]).then(() => {
                    setTimeout(progFunc, this._itemProgDelay);
                }).catch((error) => {
                    console.log(error);
                    this.restart();
                })
            }

            setTimeout(() => { progFunc(); }, this._itemProgDelay);
        }
    }

    Menu.FOOD_CNTR_ID = 'tam-menu_food';
    Menu.BEV_CNTR_ID = 'tam-menu_bev';

    async function getConfig() {
        let resp = await fetch(CONFIG_FILE_PATH);
        let config = await resp.json();

        return {
            progressionDelay: config.progressionDelay,
            menu: (config.currentMenuId !== null && config.currentMenuId !== "" && config.menus && config.menus[config.currentMenuId]) ? config.menus[config.currentMenuId] : null
        }
    }

    async function init(config) {
        let menu = new Menu(config.progressionDelay);
        menu.init();
        menu.start();
    }


    async function render(config) {
        let foodCntrEl = document.getElementById(Menu.FOOD_CNTR_ID).getElementsByClassName(MenuItemCntr.ITEM_CNTR_EL_CLASS)[0];
        let bevCntrEl = document.getElementById(Menu.BEV_CNTR_ID).getElementsByClassName(MenuItemCntr.ITEM_CNTR_EL_CLASS)[0];
        let foodItemsTmpl = document.getElementById(FOOD_ITEMS_TMPL_ID).innerHTML;
        let bevItemsTmpl = document.getElementById(BEV_ITEMS_TMPL_ID).innerHTML;

        if (config.menu.food && config.menu.food.length > 0) {
            foodCntrEl.innerHTML = Mustache.render(foodItemsTmpl, { items: config.menu.food });
        }

        if (config.menu.beverages && config.menu.beverages.length > 0) {
            bevCntrEl.innerHTML = Mustache.render(bevItemsTmpl, { items: config.menu.beverages });
        }
    }


    window.onload = async () => {
        let config = null;

        try {
            config = await getConfig();
        } catch(e) {
            alert('Could not retrieve configuration.');
            return;
        }

        if (!config) {
            alert('Could not retrieve configuration.');
            return;
        }

        if (!config['progressionDelay'] || isNaN(config.progressionDelay) || config.progressionDelay < 0) {
            alert('Progression delay not valid.');
            return;
        }

        if (!config['menu']) {
            alert('Current menu id not valid.');
            return;
        }

        render(config);
        init(config);
    };
})();