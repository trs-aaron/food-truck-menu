import Api from '../util/Api.js';
import ItemGroup from '../model/ItemGroup.js';


const app = angular.module('TamMenuAdmin', ['ui.bootstrap']);


app.factory( 'init', ['$rootScope', async ($rootScope) => {
    let funcs = {};

    funcs.isCurrentMenu = (menu) => {
        return (menu.id === $rootScope.currentMenuId);
    };

    $rootScope.funcs = { ...$rootScope.funcs, ...funcs };

    $rootScope.currentMenuId = await Api.getCurrentMenuId();
    $rootScope.menus = await Api.getMenus();
    $rootScope.activeTabIndex = 0;
}]);


app.controller('Availability', ['$scope', 'init', ($scope, init) => {
    let funcs = {};
    $scope.menuTitle = null;
    $scope.groups = []

    const update = () => {
        $scope.menuTitle = null;
        $scope.groups = []

        let currMenu = ($scope.currentMenuId && $scope.menus && $scope.currentMenuId in $scope.menus) ? $scope.menus[$scope.currentMenuId] : null;

        if (currMenu) {
            $scope.menuTitle = currMenu.title;

            if (currMenu.food.items.length > 0) {
                $scope.groups.push({
                    title: 'Food',
                    items: currMenu.food.items.map((i) => i)
                });
            }

            currMenu.other.forEach((o) => {
                if (o.items.length > 0) {
                    $scope.groups.push({
                        title: o.title,
                        items: o.items.map((i) => i)
                    });
                }
            });
        }
    }

    funcs.reset = () => {
        alert('reset');
    };

    $scope.funcs = {...$scope.funcs, ...funcs};

    init.then(() => {
        $scope.$watch($scope.currentMenuId, update);
        update();
        $scope.$apply();
    });
}]);


app.controller('Menus', ['$scope', 'init', ($scope, init) => {
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
            let menus = await Api.getMenus();

            if (menus && $scope.menu.id in menus) {
                $scope.menus[$scope.menu.id] = menus[$scope.menu.id];
                $scope.menu = menus[$scope.menu.id];
                $scope.$apply();
            } else {
                $scope.menu = null;
            }
        } catch(e) {
            $scope.menu = null;
        }
    };

    funcs.save = async () => {
        if ($scope.menu) {
            try {
                await Api.saveMenu($scope.menu);
                await refreshMenu();
            } catch(e) {
                alert('Failed to save menu.');
            }

            await refreshMenu();
        }
    };

    funcs.setAsCurrent = async () => {
        if ($scope.menuSelect.selected) {
            try {
                await Api.setCurrentMenuId($scope.menuSelect.selected);
            } catch(e) {
                alert('Failed to set as current menu.');
            }
        } else {
            alert('Failed to set as current menu.');
        }
    };

    funcs.new = () => {
        alert('new');
    };

    funcs.addOtherItemGroup = (itemGroup) => {
        $scope.menu.newOtherItemGroup(itemGroup.index + 1);
    };

    funcs.removeOtherItemGroup = (itemGroup) => {
        $scope.menu.removeOtherItemGroup(itemGroup);
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
        itemGroup.removeItem(item);
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
        $scope.menu = ($scope.menuSelect.selected && $scope.menuSelect.selected in $scope.menus) ? $scope.menus[$scope.menuSelect.selected] : null;
    };

    $scope.funcs = {...$scope.funcs, ...funcs};

    init.then(() => {
        if ($scope.menus) {
            if ($scope.currentMenuId && $scope.currentMenuId in $scope.menus && $scope.menus[$scope.currentMenuId]) {
                $scope.menuSelect.selected = $scope.currentMenuId;
                $scope.menuSelect.opts.push($scope.menus[$scope.currentMenuId]);
                $scope.menu = $scope.menus[$scope.currentMenuId];
            }

            Object.keys($scope.menus).forEach((mId) => {
                if (mId !== $scope.currentMenuId && mId in $scope.menus && $scope.menus[mId]) {
                    $scope.menuSelect.opts.push($scope.menus[mId]);
                }
            });

            if (!$scope.menuSelect.selected && $scope.menuSelect.opts.length > 0) {
                $scope.menuSelect.selected = $scope.menuSelect.opts[0].id;
            }
        }
    });
}]);
