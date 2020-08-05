import Api from '../util/Api.js';


const app = angular.module('TamMenuAdmin', ['ui.bootstrap']);


app.factory( 'init', ['$rootScope', async ($rootScope) => {
    $rootScope.currentMenuId = await Api.getCurrentMenuId();
    $rootScope.menus = await Api.getMenus();
}]);


app.controller('Availability', ['$scope', 'init', ($scope, init) => {
    $scope.menuTitle = null;
    $scope.groups = []
    $scope.funcs = {};

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

    $scope.funcs.reset = () => {
        alert('reset');
    };

    init.then(() => {
        $scope.$watch($scope.currentMenuId, update);
        update();
    });
}]);


app.controller('Menus', ['$scope', 'init', ($scope, init) => {
    $scope.menu = null;
    $scope.funcs = {};
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
            } else {
                $scope.menu = null;
            }
        } catch(e) {
            $scope.menu = null;
        }
    };

    $scope.funcs.save = async () => {
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

    $scope.funcs.setAsCurrent = async () => {
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

    $scope.funcs.new = () => {
        alert('new');
    };

    $scope.menuSelect.funcs.onToggleDropdown = ($event) => {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isOpen = !$scope.status.isOpen;
    };

    $scope.menuSelect.funcs.onChange = () => {
        $scope.menu = ($scope.menuSelect.selected && $scope.menuSelect.selected in $scope.menus) ? $scope.menus[$scope.menuSelect.selected] : null;
    }

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