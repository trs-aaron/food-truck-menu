import Api from '../util/Api.js';
import Menu from '../model/Menu.js';
import Util from '../util/Util.js';
import ValueField from '../model/ValueField.js'
import PLACEHOLDER from './PLACEHOLDER.js';
import STRING from './STRING.js';


const app = angular.module('TamMenuAdmin', ['ui.bootstrap']);


app.factory( 'init', ['$rootScope', '$uibModal', async ($rootScope, $uibModal) => {
    let funcs = {};

    funcs.isCurrentMenu = (menu) => {
        return (menu.id === $rootScope.currentMenuId);
    };

    funcs.onTabSelected = async (tabIndex) => {
        let calls = [];

        $rootScope._tableSelectedListeners.forEach((l) => {
            calls.push((() => l(tabIndex))());
        });

        return Promise.all(calls);
    }

    funcs.refreshMenu = async (menuId) => {
        let menu = null;
        let menus = await Api.getMenus();

        if (menus && menuId in menus) {
            menu = menus[menuId];
            $rootScope.menus[menuId] = menu;
        }

        return menu;
    }

    funcs.openAlertModal = (title, message) => {
        $uibModal.open({
            animation: false,
            component: 'alertModalCpnt',
            resolve: {
                title: () => title,
                message: () => message
            }
        });
    };

    funcs.openConfirmationModal = (title, message, onResult) => {
        let modal = $uibModal.open({
            animation: false,
            component: 'confirmationModalCpnt',
            resolve: {
                title: () => title,
                message: () => message
            }
        });

        let handleResult = (result) => {
            if (onResult) {
                onResult(result);
            }
        };

        modal.result.then(handleResult, null);
    };

    funcs.openNewMenuModal = (onCreate, onDismiss) => {
        let modal = $uibModal.open({
            animation: false,
            component: 'newMenuModalCpnt',
            resolve: {}
        });

        let handleCreate = (results) => {
            if (onCreate) {
                onCreate(results.menuName, results.menuTitle);
            }
        };

        let handleDismiss = () => {
            if (onDismiss) {
                onDismiss();
            }
        };

        modal.result.then(handleCreate, handleDismiss);
    };

    funcs.addTabSelectedListener = (listener) => {
        $rootScope._tableSelectedListeners.push(listener);
    }

    $rootScope.funcs = { ...$rootScope.funcs, ...funcs };

    $rootScope.currentMenuId = await Api.getCurrentMenuId();
    $rootScope.menus = await Api.getMenus();
    $rootScope.activeTabIndex = 0;
    $rootScope._tableSelectedListeners = [];
}]);


app.controller('Availability', ['$scope', '$rootScope', 'init', ($scope, $rootScope, init) => {
    const TAB_INDEX = 0;
    let funcs = {};
    $scope.menuTitle = null;
    $scope.groups = [];

    const update = () => {
        $scope.menu = ($rootScope.currentMenuId && $rootScope.menus && $rootScope.currentMenuId in $rootScope.menus) ? $rootScope.menus[$rootScope.currentMenuId] : null;
        $scope.itemGroups = []

        if ($scope.menu) {
            if ($scope.menu.food.hasItems) {
                $scope.itemGroups.push({
                    title: 'Food',
                    items: $scope.menu.food.items.filter((i) => !i.isEmpty)
                });
            }

            $scope.menu.other.forEach((ig) => {
                if (ig.hasItems) {
                    $scope.itemGroups.push({
                        title: ig.title,
                        items: ig.items.filter((i) => !i.isEmpty)
                    });
                }
            });
        }
    }

    const refreshMenu = async () => {
        if ($scope.menu) {
            $scope.menu = await $scope.funcs.refreshMenu($scope.menu.id);
            update();
        }
    }

    const onTabSelected = async (tabIndex) => {
        if (tabIndex === TAB_INDEX) {
            await update();
        }
    }

    funcs.update = update;

    funcs.reset = async () => {
        let onResult = async (result) => {
            if (result === true) {
                try {
                    $scope.menu.setAllItemsAvailable();
                    await Api.saveMenu($scope.menu);
                    await refreshMenu();
                } catch (e) {
                    $scope.funcs.openAlertModal(STRING.resetAvail.error.title, STRING.resetAvail.error.message);
                }
            }
        };

        $scope.funcs.openConfirmationModal(STRING.resetAvail.confirmModal.title, STRING.resetAvail.confirmModal.message, onResult);
    };

    funcs.onItemAvailableChange = async (item) => {
        try {
            await Api.saveMenu($scope.menu);
        } catch(e) {
            item.available = !item.available;
        }
    }

    $scope.funcs = {...$scope.funcs, ...funcs};

    init.then(() => {
        $scope.funcs.addTabSelectedListener(async (i) => { await onTabSelected(i) });
        $scope.$watch($rootScope.currentMenuId, update);
        update();
        $scope.$apply();
    });
}]);


app.controller('Menus', ['$scope', '$rootScope', 'init', ($scope, $rootScope, init) => {
    const TAB_INDEX = 1;
    let funcs = {};
    $scope.menu = null;
    $scope.menuSelect = {
        selected: '',
        isOpen: false,
        opts: [],
        funcs: {}
    };

    const refreshMenu = async () => {
        try {
            if ($scope.menu) {
                $scope.menu = await $scope.funcs.refreshMenu($scope.menu.id);
                $scope.$apply();
            }
        } catch(e) {
            $scope.menu = null;
        }
    };

    const refreshMenuSelect = () => {
        $scope.menuSelect.opts = Object.values($rootScope.menus).sort((m1, m2) => m1.name.localeCompare(m2.name));

        if (!$scope.menuSelect.selected && $scope.menuSelect.opts.length > 0) {
            $scope.menuSelect.selected = ($rootScope.currentMenuId && $rootScope.currentMenuId in $rootScope.menus && $rootScope.menus[$rootScope.currentMenuId]) ? $rootScope.currentMenuId : $scope.menuSelect.opts[0].id;
        }

        $scope.menu = $rootScope.menus[$scope.menuSelect.selected];
    }

    const addMenu = (menu) => {
        if (menu) {
            $rootScope.menus[menu.id] = menu;
            $scope.menu = menu;
            $scope.menuSelect.selected = menu.id;
            refreshMenuSelect();
        }
    }

    const removeMenu = (menu) => {
        if (menu && menu.id in $rootScope.menus) {
            delete $rootScope.menus[menu.id];
            $scope.menuSelect.selected = null;
            refreshMenuSelect();
        }
    }

    const onTabSelected = async (tabIndex) => {
        if (tabIndex === TAB_INDEX) {
            await refreshMenu();
        }
    }

    funcs.setAsCurrent = async () => {
        let confirmMsg = STRING.setAsCurrent.confirmModal.message.replace(PLACEHOLDER.menuName, $scope.menuSelect.selected);
        let errMsg = STRING.setAsCurrent.error.message.replace(PLACEHOLDER.menuName, $scope.menuSelect.selected);

        let onResult = async (result) => {
            if (result === true) {
                if ($scope.menuSelect.selected) {
                    try {
                        let menu = $scope.menus[$scope.menuSelect.selected];
                        menu.setAllItemsAvailable();
                        await Api.setCurrentMenuId($scope.menuSelect.selected);
                        await Api.saveMenu(menu);
                        $rootScope.currentMenuId = await Api.getCurrentMenuId();
                    } catch(e) {
                        $scope.funcs.openAlertModal(STRING.setAsCurrent.error.title, errMsg);
                    }
                } else {
                    $scope.funcs.openAlertModal(STRING.setAsCurrent.error.title, errMsg);
                }
            }
        };

        $scope.funcs.openConfirmationModal(STRING.setAsCurrent.confirmModal.title, confirmMsg, onResult);
    };

    funcs.save = async () => {
        let confirmMsg = STRING.saveMenu.confirmModal.message.replace(PLACEHOLDER.menuName, $scope.menuSelect.selected);
        let errMsg = STRING.saveMenu.error.message.replace(PLACEHOLDER.menuName, $scope.menuSelect.selected);

        let onResult = async (result) => {
            if (result === true) {
                if ($scope.menu) {
                    try {
                        await Api.saveMenu($scope.menu);
                        await refreshMenu();
                    } catch(e) {
                        $scope.funcs.openAlertModal(STRING.saveMenu.error.title, errMsg);
                    }

                    await refreshMenu();
                }
            }
        };

        $scope.funcs.openConfirmationModal(STRING.saveMenu.confirmModal.title, confirmMsg, onResult);
    };

    funcs.delete = async () => {
        let confirmMsg = STRING.deleteMenu.confirmModal.message.replace(PLACEHOLDER.menuName, $scope.menuSelect.selected);
        let errMsg = STRING.deleteMenu.error.message.replace(PLACEHOLDER.menuName, $scope.menuSelect.selected);

        let onResult = async (result) => {
            if (result === true) {
                if ($scope.menu) {
                    try {
                        await Api.deleteMenu($scope.menu);
                        removeMenu($scope.menu);
                    } catch(e) {
                        $scope.funcs.openAlertModal(STRING.deleteMenu.error.title, errMsg);
                    }

                    refreshMenuSelect();
                }
            }
        };

        $scope.funcs.openConfirmationModal(STRING.deleteMenu.confirmModal.title, confirmMsg, onResult);
    };

    funcs.new = () => {
        let onResult = async (menuName, menuTitle) => {
            if (menuName && menuName !== '') {
                try {
                    let id = Util.convertToSlug(menuName);
                    let menu = Menu.build(id, menuName);

                    await Api.saveMenu(menu);

                    addMenu(menu);

                    if (Object.keys($rootScope.menus).length === 1) {
                        let currMenuId = await Api.getCurrentMenuId();

                        if (!currMenuId || currMenuId === '') {
                            await Api.setCurrentMenuId(menu.id);
                            $rootScope.currentMenuId = await Api.getCurrentMenuId();
                        }
                    }
                } catch(e) {
                    $scope.funcs.openAlertModal(STRING.newMenu.error.title, STRING.newMenu.error.message);
                }
            } else {
                $scope.funcs.openAlertModal(STRING.newMenu.error.title, STRING.newMenu.error.message);
            }
        };

        $scope.funcs.openNewMenuModal(onResult);
    };

    funcs.addOtherItemGroup = (itemGroup) => {
        $scope.menu.newOtherItemGroup(itemGroup.index + 1);
    };

    funcs.removeOtherItemGroup = (itemGroup) => {
        let confirmMsg = STRING.removeOtherItemGroup.confirmModal.message.replace(PLACEHOLDER.itemGroupTitle, itemGroup.title);
        let errMsg = STRING.removeOtherItemGroup.error.message.replace(PLACEHOLDER.itemGroupTitle, itemGroup.title);

        let onResult = async (result) => {
            if (result === true) {
                if ($scope.menu) {
                    try {
                        $scope.menu.removeOtherItemGroup(itemGroup);
                    } catch(e) {
                        $scope.funcs.openAlertModal(STRING.removeOtherItemGroup.error.title, errMsg);
                    }

                    refreshMenuSelect();
                } else {
                    $scope.funcs.openAlertModal(STRING.removeOtherItemGroup.error.title, errMsg);
                }
            }
        };

        $scope.funcs.openConfirmationModal(STRING.removeOtherItemGroup.confirmModal.title, confirmMsg, onResult);
    };

    funcs.moveOtherItemGroupUp = (itemGroup) => {
        $scope.menu.moveOtherItemGroupUp(itemGroup);
    };

    funcs.moveOtherItemGroupDown = (itemGroup) => {
        $scope.menu.moveOtherItemGroupDown(itemGroup);
    };

    funcs.isFirstOtherItemGroup = (itemGroup) => {
        return $scope.menu.isFirstOtherItemGroup(itemGroup);
    };

    funcs.isLastOtherItemGroup = (itemGroup) => {
        return $scope.menu.isLastOtherItemGroup(itemGroup);
    };

    funcs.addItem = (item, itemGroup) => {
        itemGroup.newItem(item.index + 1);
    };

    funcs.removeItem = (item, itemGroup) => {
        let confirmMsg = STRING.removeItem.confirmModal.message.replace(PLACEHOLDER.itemTitle, item.title);
        let errMsg = STRING.removeItem.error.message.replace(PLACEHOLDER.itemTitle, item.title);

        let onResult = async (result) => {
            if (result === true) {
                if (itemGroup) {
                    try {
                        itemGroup.removeItem(item);
                    } catch(e) {
                        $scope.funcs.openAlertModal(STRING.removeItem.error.title, errMsg);
                    }

                    refreshMenuSelect();
                } else {
                    $scope.funcs.openAlertModal(STRING.removeItem.error.title, errMsg);
                }
            }
        };

        $scope.funcs.openConfirmationModal(STRING.removeItem.confirmModal.title, confirmMsg, onResult);
    };

    funcs.moveItemUp = (item, itemGroup) => {
        itemGroup.moveItemUp(item);
    };

    funcs.moveItemDown = (item, itemGroup) => {
        itemGroup.moveItemDown(item);
    };

    funcs.isFirstItem = (item, itemGroup) => {
        return itemGroup.isFirstItem(item);
    };

    funcs.isLastItem = (item, itemGroup) => {
        return itemGroup.isLastItem(item);
    };

    $scope.menuSelect.funcs.onToggleDropdown = ($event) => {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isOpen = !$scope.status.isOpen;
    };

    $scope.menuSelect.funcs.onChange = () => {
        $scope.menu = ($scope.menuSelect.selected && $scope.menuSelect.selected in $rootScope.menus) ? $rootScope.menus[$scope.menuSelect.selected] : null;
    };

    $scope.funcs = {...$scope.funcs, ...funcs};

    init.then(() => {
        if ($rootScope.menus) {
            if ($rootScope.currentMenuId && $rootScope.currentMenuId in $rootScope.menus && $rootScope.menus[$rootScope.currentMenuId]) {
                $scope.menu = $rootScope.menus[$rootScope.currentMenuId];
            }

            refreshMenuSelect();
        }

        $scope.funcs.addTabSelectedListener(async (i) => { await onTabSelected(i) });
    });
}]);


app.controller('Settings', ['$scope', '$rootScope', 'init', ($scope, $rootScope, init) => {
    let funcs = {};
    $scope.theme= new ValueField(null);
    $scope.progressionDelay = new ValueField();
    $scope.settingsModified = () => { return ($scope.theme.modified || $scope.progressionDelay.modified); };

    const refreshValues = async () => {
        $scope.theme = new ValueField(await Api.getTheme());
        $scope.progressionDelay = new ValueField(parseInt(await Api.getProgressionDelay()));
    };

    funcs.save = async () => {
        let onResult = async (result) => {
            if (result === true) {
                try {
                    await Api.setTheme($scope.theme.value);
                    await Api.setProgressionDelay($scope.progressionDelay.value);
                    await refreshValues();
                } catch(e) {
                    $scope.funcs.openAlertModal(STRING.saveSettings.error.title, STRING.saveSettings.error.message);
                }
            }
        };

        $scope.funcs.openConfirmationModal(STRING.saveSettings.confirmModal.title, STRING.saveSettings.confirmModal.message, onResult);
    };

    $scope.funcs = {...$scope.funcs, ...funcs};

    init.then(async() => {
        await refreshValues();
    });
}]);


app.component('alertModalCpnt', {
    templateUrl: 'alertModal.html',
    bindings: {
        resolve: '<',
        close: '&'
    },
    controller: function AlertModalCtrl($scope, $element, $attrs) {
        this.$onInit = () => {
            $scope.title = this.resolve.title;
            $scope.message = this.resolve.message;
        };

        this.ok = () => {
            this.close();
        };
    }
});


app.component('confirmationModalCpnt', {
    templateUrl: 'confirmationModal.html',
    bindings: {
        resolve: '<',
        close: '&'
    },
    controller: function ConfirmationModalCtrl($scope, $element, $attrs) {
        this.$onInit = () => {
            $scope.title = this.resolve.title;
            $scope.message = this.resolve.message;
        };

        this.yes = () => {
            this.close({ $value: true });
        };

        this.no = () => {
            this.close({ $value: false });
        };
    }
});


app.component('newMenuModalCpnt', {
    templateUrl: 'newMenuModal.html',
    bindings: {
        resolve: '<',
        close: '&',
        dismiss: '&'
    },
    controller: function NewMenuModalCtrl($scope, $element, $attrs) {
        let validate = () => {
            $scope.menuNameInvalidReason = null;
            $scope.isCreateBttnEnabled = true;
            $scope.isMenuNameInvalid = false;

            if (!$scope.menuName || $scope.menuName === '') {
                $scope.isCreateBttnEnabled = false;
                return;
            }

            if ($scope.currMenuIds.includes(Util.convertToSlug($scope.menuName))) {
                $scope.isCreateBttnEnabled = false;
                $scope.isMenuNameInvalid = true;
                $scope.menuNameInvalidReason = STRING.newMenu.nameInvalid.duplicate;
                return;
            }
        }

        this.$onInit = () => {
            $scope.isCreateBttnEnabled = false;
            $scope.menuName = null;
            $scope.isMenuNameUnique = true;
            $scope.currMenuIds = Object.values($scope.$root.menus).map((m) => m.id);
            $scope.$watch('menuName', () => { validate(); });
            validate();
        };

        this.create = () => {
            this.close({
                $value: {
                    menuName: $scope.menuName
                }
            });
        };

        this.cancel = () => {
            this.dismiss();
        };
    }
});