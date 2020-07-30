(() => {
    const CONFIG_FILE_PATH = './menus.json';


    class MenuItemField {

        constructor(el) {
            this._el = el;
        }

        get top() {
            return this._el.getBoundingClientRect().top;
        }

        get bottom() {
            return this._el.getBoundingClientRect().bottom;
        }

        init() {
            return;
        }
    }

    MenuItemField.EL_CLASS = 'tam-menu_item_field'


    class MenuItem {

        constructor(el) {
            this._el = el;
            this._fields = [];
        }

        get isAvailable() {
            return (this._el.getAttribute(MenuItem.AVAILABLE_ATTR) === '1');
        }

        get isVisible() {
            return (this._el.getAttribute(MenuItem.VISIBLE_ATTR) === '1');
        }

        get top() {
            return (this._fields.length > 0) ? Math.min(...this._fields.map((f) => f.top)) : 0;
        }

        get bottom() {
            return (this._fields.length > 0) ? Math.max(...this._fields.map((f) => f.bottom)) : 0;
        }

        hide() {
            this._el.setAttribute(MenuItem.VISIBLE_ATTR, 0);
        }

        show() {
            this._el.setAttribute(MenuItem.VISIBLE_ATTR, 1);
        }

        init() {
            this._fields = [];
            let fieldEls = this._el.getElementsByClassName(MenuItemField.EL_CLASS);

            Array.from(fieldEls).forEach((el) => {
                this._fields.push(new MenuItemField(el));
            });

            this._fields.forEach((f) => {
                f.init();
            });
        }
    }

    MenuItem.EL_CLASS = 'tam-menu_item';
    MenuItem.AVAILABLE_ATTR = 'data-is-available';
    MenuItem.VISIBLE_ATTR = 'data-is-visible';


    class MenuItemCntr {

        constructor(el) {
            this._el = el;
            this._itemsEl = null;
            this._items = [];
        }

        get top() {
            return this._el.getBoundingClientRect().top;
        }

        get bottom() {
            return this._el.getBoundingClientRect().bottom;
        }

        get itemsTop() {
            return this._itemsEl.getBoundingClientRect().top;
        }

        get itemsBottom() {
            return this._itemsEl.getBoundingClientRect().bottom;
        }

        areAllItemsVisible() {
            for (let i = 0; i < this._items.length; i++) {
                if (!this._items[i].isVisible) {
                    return false;
                }
            }

            return true;
        }

        init() {
            this._itemsEl = this._el.getElementsByClassName(MenuItemCntr.ITEMS_EL_CLASS)[0];
            this._items = [];
            let itemEls = this._el.getElementsByClassName(MenuItem.EL_CLASS);

            Array.from(itemEls).forEach((el) => {
                this._items.push(new MenuItem(el));
            });

            this._items.forEach((i) => {
                i.init();
            });
        }

        async show() {
            await this._showItems(0);
        }

        async hide() {
            await this._hideItems()
        }

        async progressItems() {
            if (this.areAllItemsVisible()) {
                return;
            }

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

        _getFirstVisibleIndex() {
            for (let i = 0; i < this._items.length; i++) {
                if ( this._items[i].isVisible) {
                    return i;
                }
            }

            return null;
        }

        _getLastVisibleIndex() {
            let firstVisIndex = this._getFirstVisibleIndex();

            if (firstVisIndex !== null && !isNaN(firstVisIndex)) {
                for(let i = firstVisIndex; i < this._items.length; i++) {
                    if (!this._items[i].isVisible) {
                        return (i - 1);
                    }
                }
            }

            return null;
        }

        _isItemInFocus(index) {
            let itop = this._items[index].top;
            let ibot = this._items[index].bottom;
            let ctop = this.top;
            let cbot = this.bottom;
            return (this._items[index] !== null) ? (this._items[index].top >= this.top && this._items[index].bottom <= this.bottom) : false;
        }

        async _setItemsTransform(y) {
            return new Promise((resolve, reject) => {
                if (isNaN(y)) {
                    reject();
                }

                const newTransform = `translateY(${y}px)`;

                window.requestAnimationFrame(() => {
                    this._itemsEl.style.transform = newTransform;
                    this._itemsEl.style.MozTransform = newTransform;
                    this._itemsEl.style.webkitTransform = newTransform;
                    this._itemsEl.style.msTransform = newTransform;
                    resolve();
                });
            });
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
                        try {
                            this._items[index].show();
                            setTimeout(() => {
                                showFunc(index + 1);
                            }, delay);
                        } catch(e) {
                            console.log(e);
                        }
                    } else {
                        resolve();
                    }
                };

                showFunc(startIndex);
            });
        }

        async _moveToItem(index) {
            return new Promise(async (resolve, reject) => {
                // Parameter check.
                if (index === null || isNaN(index)) {
                    reject();
                }

                let newTop = (this._items[index]) ? (this._items[index].top - this.itemsTop) : 0;
                this._setItemsTransform(-newTop).then(resolve).catch(reject);
            });
        }
    }

    MenuItemCntr.ITEMS_EL_CLASS = 'tam-menu_items-cntr';


    class Menu {

        constructor() {
            this._menu = null;
            this._itemProgDelay = Menu.DEFAULT_PROGRESSION_DELAY;
            this._cntrEl = null;
            this._foodCntrEl = null;
            this._otherCntrEl = null;
            this._itemCntrs = [];
            this._paused = true;
            this._foodItemsTmpl = null;
            this._extraItemsTmpl = null;
        }

        get paused() {
            return this._paused;
        }

        get hasFood() {
            return this._cntrEl.getAttribute(Menu.HAS_FOOD_ATTR);
        }

        get otherCount() {
            return this._cntrEl.getAttribute(Menu.OTHER_COUNT_ATTR);
        }

        setMenu(menu) {
            this._menu = menu;
        }

        setItemProgressionDelay(delay) {
            this._itemProgDelay = delay;
        }

        setHasFood(value) {
            this._cntrEl.setAttribute(Menu.HAS_FOOD_ATTR, (value == true) ? 1 : 0);
        }

        setOtherCount(value) {
            this._cntrEl.setAttribute(Menu.OTHER_COUNT_ATTR, value);
        }

        hide() {
            this._cntrEl.setAttribute(Menu.VISIBLE_ATTR, 0);
        }

        show() {
            this._cntrEl.setAttribute(Menu.VISIBLE_ATTR, 1);
        }

        async init() {
            this._cntrEl = document.getElementById(Menu.CNTR_ID);
            this._foodCntrEl = document.getElementById(Menu.FOOD_CNTR_ID);
            this._otherCntrEl = document.getElementById(Menu.OTHER_CNTR_ID);
            this._foodItemsTmpl = document.getElementById(Menu.FOOD_ITEMS_TMPL_ID).innerHTML;
            this._extraItemsTmpl = document.getElementById(Menu.EXTRA_ITEMS_TMPL_ID).innerHTML;

            await this._getConfig();
            await this._renderItems();

            let itemCntrEls = document.getElementsByClassName(Menu.ITEMS_EL_CLASS);

            Array.from(itemCntrEls).forEach((el) => {
                this._itemCntrs.push(new MenuItemCntr(el));
            });

            this._itemCntrs.forEach((ic) => {
                ic.init();
                ic.show();
            });

            this.show();
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

        async _getConfig() {
            return new Promise(async (resolve, reject) => {
                let config = null;

                let onError = (msg) => {
                    alert(msg);
                    reject(new Error(e));
                }

                let headers = new Headers();
                headers.append('pragma', 'no-cache');
                headers.append('cache-control', 'no-cache');

                let init = {
                    method: 'GET',
                    headers: headers,
                };

                try {
                    let resp = await fetch(CONFIG_FILE_PATH, init);
                    config = await resp.json();
                } catch(e) {
                    onError('Could not retrieve configuration.');
                }

                if (!config) {
                    onError('Could not retrieve configuration.');
                }

                if (!('progressionDelay' in config) || !('menus' in config)) {
                    onError('Invalid configuration.');
                }

                if (isNaN(config.progressionDelay) || config.progressionDelay < 0) {
                    onError('Progression delay not valid.');
                }

                if (!config.menus[config.currentMenuId]) {
                    onError('Current menu id not valid.');
                }

                if (!(config.currentMenuId in config.menus)) {
                    onError('Current menu id not valid.');
                }

                if (!config.menus[config.currentMenuId]) {
                    onError('Invalid menu configuration.');
                }

                let menu = (config.currentMenuId !== null && config.currentMenuId !== "" && config.menus && config.menus[config.currentMenuId]) ? config.menus[config.currentMenuId] : null;

                if (!('food' in menu) || !('other' in menu) || !Array.isArray(menu.other)) {
                    onError('Invalid menu configuration.');
                }

                this.setItemProgressionDelay(config.progressionDelay);
                this.setMenu(menu);
                this.setHasFood((menu.food && Array.isArray(menu.food) && menu.food.length > 0));
                this.setOtherCount(menu.other.length);

                resolve();
            });
        }

        async _renderItems() {
            if (this._menu) {
                if (this._menu.food && this._menu.food.length > 0) {
                    this._foodCntrEl.innerHTML = Mustache.render(this._foodItemsTmpl, { items: this._menu.food });
                }

                if (this._menu.other && this._menu.other.length > 0) {
                    this._otherCntrEl.innerHTML = Mustache.render(this._extraItemsTmpl, { sections: this._menu.other });
                }
            }
        }

        _startMenuProgressions() {
            const progFunc = () => {
                if (this.paused) {
                    return;
                }

                let p = this._itemCntrs.map((ic) => ic.progressItems());

                Promise.allSettled(p).then(() => {
                    setTimeout(progFunc, this._itemProgDelay);
                }).catch((error) => {
                    console.log(error);
                    this.restart();
                })
            }

            setTimeout(() => { progFunc(); }, this._itemProgDelay);
        }
    }

    Menu.DEFAULT_PROGRESSION_DELAY = 10000;
    Menu.CNTR_ID = 'tam-menu_cntr';
    Menu.FOOD_CNTR_ID = 'tam-menu_food';
    Menu.OTHER_CNTR_ID = 'tam-menu_other';
    Menu.ITEMS_EL_CLASS = 'tam-menu_items';
    Menu.VISIBLE_ATTR = 'data-is-visible';
    Menu.HAS_FOOD_ATTR = 'data-has-food';
    Menu.OTHER_COUNT_ATTR = 'data-other-count';
    Menu.FOOD_ITEMS_TMPL_ID = 'tam-menu-food-items-TEMPLATE';
    Menu.EXTRA_ITEMS_TMPL_ID = 'tam-menu-extra-items-TEMPLATE';


    window.onload = async () => {
        let menu = new Menu();
        await menu.init();
        menu.start();
    };
})();