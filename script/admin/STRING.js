import PLACEHOLDER from './PLACEHOLDER.js'

export default {
    resetAvail: {
        confirmModal: {
            title: 'Reset Availibility',
            message: 'Are you sure you want to set all items to available?'
        },
        error: {
            title: 'Error',
            message: 'Failed to reset.'
        }
    },
    saveSettings: {
        confirmModal: {
            title: 'Save Settings',
            message: 'Are you sure you would like to save these settings?'
        },
        error: {
            title: 'Error',
            message: 'Failed to save these settings.'
        }
    },
    saveMenu: {
        confirmModal: {
            title: 'Save Menu',
            message: `Are you sure you would like to save the menu '${PLACEHOLDER.menuName}'?`
        },
        error: {
            title: 'Error',
            message: `Failed to save menu '${PLACEHOLDER.menuName}'.`
        }
    },
    deleteMenu: {
        confirmModal: {
            title: 'Delete Menu',
            message: `Are you sure you would like to delete the menu '${PLACEHOLDER.menuName}'?`
        },
        error: {
            title: 'Error',
            message: `Failed to delete menu '${PLACEHOLDER.menuName}'.`
        }
    },
    newMenu: {
        error: {
            title: 'Error',
            message: 'Failed to create new menu.'
        },
        nameInvalid: {
            duplicate: 'Menu name already exists.'
        }
    },
    setAsCurrent: {
        confirmModal: {
            title: 'Set as Current Menu',
            message: `Are you sure you want to set '${PLACEHOLDER.menuName}' as the current menu?`
        },
        error: {
            title: 'Error',
            message: `Failed to set '${PLACEHOLDER.menuName}' as the current menu.`
        }
    },
    removeOtherItemGroup: {
        confirmModal: {
            title: 'Set as Current Menu',
            message: `Are you sure you want to remove item group '${PLACEHOLDER.itemGroupTitle}'?`
        },
        error: {
            title: 'Error',
            message: `Failed to remove item group '${PLACEHOLDER.itemGroupTitle}'.`
        }
    },
    removeItem: {
        confirmModal: {
            title: 'Set as Current Menu',
            message: `Are you sure you want to remove item '${PLACEHOLDER.itemTitle}'?`
        },
        error: {
            title: 'Error',
            message: `Failed to remove item '${PLACEHOLDER.itemTitle}'.`
        }
    }
};