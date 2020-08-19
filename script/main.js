import Api from './util/Api.js';
import ValueField from './model/ValueField.js';


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
        this._firstVisibleIndex = null;
        this._lastVisibleIndex = null;
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

    get firstVisibleIndex() {
        return this._firstVisibleIndex;
    }

    get lastVisibleIndex() {
        return this._lastVisibleIndex;
    }

    areAllItemsVisible() {
        return (this._firstVisibleIndex === 0 && this._lastVisibleIndex === (this._items.length - 1));
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

        this._setVisibleIndexes();
    }

    async show() {
        await this._showItems();
    }

    async hide() {
        await this._hideItems()
    }

    async progressItems() {
        if (this.areAllItemsVisible()) {
            return;
        }

        let moveToItemIndex = this._lastVisibleIndex + 1;
        moveToItemIndex = (moveToItemIndex < this._items.length) ? moveToItemIndex : 0;

        await this._moveToItem(moveToItemIndex);
        this._setVisibleIndexes();
    }

    _isItemInFocus(index) {
        return (this._items[index] !== null) ? (this._items[index].top >= this.top && this._items[index].bottom <= this.bottom) : false;
    }

    _setVisibleIndexes() {
        for (let i = 0; i <= this._items.length; i++) {
            if (i >= this._items.length) {
                this._firstVisibleIndex = 0;
                break;
            }

            if (this._isItemInFocus(i)) {
                this._firstVisibleIndex = i;
                break;
            }
        }

        for (let i = this._firstVisibleIndex; i <= this._items.length; i++) {
            if (i >= this._items.length) {
                this._lastVisibleIndex = (this._items.length - 1)
                break;
            }

            if (!this._isItemInFocus(i)) {
                this._lastVisibleIndex = Math.max((i - 1), 0);
                break;
            }
        }
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
            // Parameter check.
            if (isNaN(delay)) {
                reject();
            }

            // Recursively called function with delay timeout to hide items.
            const hideFunc = (iteration) => {
                if (iteration < this._items.length) {
                    let index = (iteration + this._firstVisibleIndex) % this._items.length;

                    if (this._items[index] !== null && this._isItemInFocus(index)) {
                        this._items[index].hide();
                    }

                    setTimeout(() => { hideFunc(iteration + 1); }, delay);
                } else {
                    resolve();
                }
            };

            hideFunc(0);
        });
    }

    async _showItems(delay=250) {
        return new Promise((resolve, reject) => {
            // Parameter check.
            if (isNaN(delay)) {
                reject();
            }

            // Recursively called function with delay timeout to show items.
            const showFunc = (index) => {
                if (index < this._items.length && index <= this._lastVisibleIndex) {
                    if (this._items[index]) {
                        this._items[index].show();
                    }
                    setTimeout(() => { showFunc(index + 1); }, delay);
                } else {
                    resolve();
                }
            };

            showFunc(this._firstVisibleIndex);
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


class MenuCntr {

    constructor() {
        this._configVersion = null;
        this._theme = new ValueField(null);
        this._menuId = null;
        this._menu = null;
        this._itemProgDelay = MenuCntr.DEFAULT_PROGRESSION_DELAY;
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
        return this._cntrEl.getAttribute(MenuCntr.HAS_FOOD_ATTR);
    }

    get otherCount() {
        return this._cntrEl.getAttribute(MenuCntr.OTHER_COUNT_ATTR);
    }

    setTheme(theme) {
        this._theme.value = theme;
    }

    setConfigVersion(version) {
        this._configVersion = version;
    }

    setMenuId(id) {
        this._menuId = id;
    }

    setMenu(menu) {
        this._menu = menu;
    }

    setItemProgressionDelay(delay) {
        this._itemProgDelay = delay;
    }

    setHasFood(value) {
        this._cntrEl.setAttribute(MenuCntr.HAS_FOOD_ATTR, (value == true) ? 1 : 0);
    }

    setOtherCount(value) {
        this._cntrEl.setAttribute(MenuCntr.OTHER_COUNT_ATTR, value);
    }

    hide() {
        this._cntrEl.setAttribute(MenuCntr.VISIBLE_ATTR, 0);
    }

    show() {
        this._cntrEl.setAttribute(MenuCntr.VISIBLE_ATTR, 1);
    }

    async init() {
        this._theme = new ValueField(await Api.getTheme());

        this._cntrTmpl = document.getElementById(MenuCntr.CNTR_TMPL_ID).innerHTML;
        this._foodItemsTmpl = document.getElementById(MenuCntr.FOOD_ITEMS_TMPL_ID).innerHTML;
        this._extraItemsTmpl = document.getElementById(MenuCntr.EXTRA_ITEMS_TMPL_ID).innerHTML;

        await this._renderContainer();

        this._cntrEl = document.getElementById(MenuCntr.CNTR_ID);
        this._foodCntrEl = document.getElementById(MenuCntr.FOOD_CNTR_ID);
        this._otherCntrEl = document.getElementById(MenuCntr.OTHER_CNTR_ID);

        await this._refresh();
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

    async _isConfigCurrent() {
        let resps = await Promise.all([
            (await Api.getConfigVersion()),
            (await Api.getCurrentMenuId())
        ]);

        return (this._configVersion === resps[0] && this._menuId === resps[1]);
    }

    async _getConfig() {
        return new Promise(async (resolve, reject) => {

            let onError = (msg) => {
                alert(msg);
                reject(new Error(msg));
            }

            Promise.all([
                await Api.getTheme(),
                await Api.getConfigVersion(),
                await Api.getProgressionDelay(),
                await Api.getCurrentMenuId(),
                await Api.getCurrentMenu()
            ]).then((results) => {
                let theme = results[0];
                let configVersion = results[1];
                let progDelay = results[2];
                let currMenuId = results[3];
                let currMenu = results[4];

                if (!theme || theme === '') {
                    onError('Could not retrieve theme.');
                }

                if (!configVersion || configVersion === '') {
                    onError('Could not retrieve configuration version.');
                }

                if (!progDelay || isNaN(progDelay)) {
                    onError('Could not retrieve progression delay.');
                }

                if (!currMenuId || currMenuId === '') {
                    onError('Could not retrieve current menu id.');
                }

                if (!currMenu) {
                    onError('Could not retrieve current menu.');
                }

                this.setTheme(theme);
                this.setConfigVersion(configVersion);
                this.setItemProgressionDelay(progDelay);
                this.setMenuId(currMenuId);
                this.setMenu(currMenu);
                this.setHasFood(currMenu.food.hasItems);
                this.setOtherCount(currMenu.otherCnt);

                resolve();
            }).catch((e) => {
                onError(e.msg);
            });
        });
    }

    async _renderContainer() {
        let themeClass = null;

        switch(this._theme.value) {
            case 'light':
                themeClass = 'tam-menu_theme_light';
                break;

            default:
                themeClass = 'tam-menu_theme_dark';
                break;
        }

        document.body.innerHTML = Mustache.render(this._cntrTmpl, { themeClass: themeClass });
    }

    async _renderItems() {
        if (this._menu) {
            if (this._menu.food && this._menu.food.itemCnt > 0) {
                this._foodCntrEl.innerHTML = Mustache.render(this._foodItemsTmpl, { items: this._menu.food.items });
            }

            if (this._menu.other && this._menu.otherCnt > 0) {
                this._otherCntrEl.innerHTML = Mustache.render(this._extraItemsTmpl, { sections: this._menu.other });
            }
        }
    }

    async _refresh() {
        this.hide();
        await this._getConfig();

        if (this._theme.modified) {
            location.reload();
        }

        await this._renderItems();

        let itemCntrEls = document.getElementsByClassName(MenuCntr.ITEMS_EL_CLASS);

        Array.from(itemCntrEls).forEach((el) => {
            this._itemCntrs.push(new MenuItemCntr(el));
        });

        this.show();

        this._itemCntrs.forEach((ic) => {
            ic.init();
            ic.show();
        });
    }

    async _progressMenu() {
        let itemCntrs = this._itemCntrs.filter((ic) => !ic.areAllItemsVisible());
        await Promise.all(itemCntrs.map((ic) => ic.hide()));
        await Promise.all(itemCntrs.map((ic) => ic.progressItems()));
        await Promise.all(itemCntrs.map((ic) => ic.show()));
    }

    _startMenuProgressions() {
        const progFunc = async () => {
            if (this.paused) {
                return;
            }

            try {
                if (!(await this._isConfigCurrent())) {
                    await this._refresh();
                } else {
                    await this._progressMenu();
                }

                setTimeout(progFunc, this._itemProgDelay);
            } catch(e) {
                console.log(e);
                this.restart();
            }
        }

        setTimeout(() => { progFunc(); }, this._itemProgDelay);
    }
}

MenuCntr.DEFAULT_PROGRESSION_DELAY = 10000;
MenuCntr.CNTR_ID = 'tam-menu_cntr';
MenuCntr.FOOD_CNTR_ID = 'tam-menu_food';
MenuCntr.OTHER_CNTR_ID = 'tam-menu_other';
MenuCntr.ITEMS_EL_CLASS = 'tam-menu_items';
MenuCntr.VISIBLE_ATTR = 'data-is-visible';
MenuCntr.HAS_FOOD_ATTR = 'data-has-food';
MenuCntr.OTHER_COUNT_ATTR = 'data-other-count';
MenuCntr.CNTR_TMPL_ID = 'tam-menu-container-TEMPLATE';
MenuCntr.FOOD_ITEMS_TMPL_ID = 'tam-menu-food-items-TEMPLATE';
MenuCntr.EXTRA_ITEMS_TMPL_ID = 'tam-menu-extra-items-TEMPLATE';


window.onload = async () => {
    let menu = new MenuCntr();
    await menu.init();
    menu.start();
};