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
    }


    class Menu {

        constructor() {
            this._foodCntr = null;
            this._bevCntr = null;
        }

        init() {
            let foodCntrEl = document.getElementById(Menu.FOOD_CNTR_ID);
            let bevCntrEl = document.getElementById(Menu.BEV_CNTR_ID);

            this._foodCntr = new MenuItemCntr(foodCntrEl);
            this._bevCntr = new MenuItemCntr(bevCntrEl);

            this._foodCntr.init();
            this._bevCntr.init();
        }
    }

    Menu.FOOD_CNTR_ID = 'tam-menu_food';
    Menu.BEV_CNTR_ID = 'tam-menu_bev';

    async function init() {
        let menu = new Menu();
        menu.init();
    }


    async function render() {
        let resp = await fetch(CONFIG_FILE_PATH);
        let config = await resp.json();
        let menu = config.menus[0];
        let foodCntrEl = document.getElementById(Menu.FOOD_CNTR_ID);
        let bevCntrEl = document.getElementById(Menu.BEV_CNTR_ID);
        let foodItemsTmpl = document.getElementById(FOOD_ITEMS_TMPL_ID).innerHTML;
        let bevItemsTmpl = document.getElementById(BEV_ITEMS_TMPL_ID).innerHTML;

        foodCntrEl.innerHTML = Mustache.render(foodItemsTmpl, { items: menu.food });
        bevCntrEl.innerHTML = Mustache.render(bevItemsTmpl, { items: menu.beverages });
    }


    window.onload = async () => {
        await render();
        await init();
    };
})();