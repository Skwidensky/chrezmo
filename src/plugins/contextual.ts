
export class Contextual {
    position: boolean;
    menuControl: Element | any;
    /**
     * Creates a new contextual menu
     * @param {object} opts options which build the menu e.g. position and items
     * @param {event} opts.event
     * @param {number} opts.width sets the width of the menu including children
     * @param {boolean} opts.isSticky sets how the menu apears, follow the mouse or sticky
     * @param {Array<ContextualItem>} opts.items sets the default items in the menu
     */
    constructor(opts: any) {
        event = opts.event;
        contextualCore.CloseMenu();

        this.position = opts.isSticky != null ? opts.isSticky : false;
        this.menuControl = contextualCore.CreateEl(`<ul class='contextualJs contextualMenu'></ul>`);
        this.menuControl.style.width = opts.width != null ? opts.width : '200px';
        opts.items.forEach((value: any) => {
            let item = new ContextualItem(value);
            this.menuControl.appendChild(item.element);
        });

        if (event != undefined) {
            event.stopPropagation()
            document.body.appendChild(this.menuControl);
            contextualCore.PositionMenu(this.position, event, this.menuControl);
        }

        document.onclick = function (e: any) {
            if (!e.target.classList.contains('contextualJs')) {
                contextualCore.CloseMenu();
            }
        }
    }
    /**
     * Adds item to this contextual menu instance
     * @param {ContextualItem} item item to add to the contextual menu
     */
    add(item: ContextualItem) {
        this.menuControl.appendChild(item.element);
    }
    /**
     * Makes this contextual menu visible
     */
    show() {
        if (event != undefined) {
            event.stopPropagation()
            document.body.appendChild(this.menuControl);
            contextualCore.PositionMenu(this.position, event, this.menuControl);
        }
    }
    /**
     * Hides this contextual menu
     */
    hide() {
        if (event != undefined) {
            event.stopPropagation()
            contextualCore.CloseMenu();
        }
    }
    /**
     * Toggle visibility of menu
     */
    toggle() {
        if (event != undefined) {
            event.stopPropagation()
            if (this.menuControl.parentElement != document.body) {
                document.body.appendChild(this.menuControl);
                contextualCore.PositionMenu(this.position, event, this.menuControl);
            } else {
                contextualCore.CloseMenu();
            }
        }
    }
}
class ContextualItem {
    element: any;
    /**
     * 
     * @param {Object} opts
     * @param {string} [opts.label]
     * @param {string} [opts.type]
     * @param {string} [opts.markup]
     * @param {string} [opts.icon]
     * @param {string} [opts.cssIcon]
     * @param {string} [opts.shortcut]
     * @param {void} [opts.onClick]
     * @param {boolean} [opts.enabled]
     * @param {Array<ContextualItem>} [opts.items]
     * 
     */
    constructor(opts: any) {
        switch (opts.type) {
            case 'seperator':
                this.seperator();
                break;
            case 'custom':
                this.custom(opts.markup);
                break;
            case 'multi':
                this.multiButton(opts.items);
                break;
            case 'submenu':
                this.subMenu(opts.label, opts.items, (opts.icon !== undefined ? opts.icon : ''), (opts.cssIcon !== undefined ? opts.cssIcon : ''), (opts.enabled !== undefined ? opts.enabled : true));
                break;
            case 'hovermenu':
                this.hoverMenu(opts.label, opts.items, (opts.icon !== undefined ? opts.icon : ''), (opts.cssIcon !== undefined ? opts.cssIcon : ''), (opts.enabled !== undefined ? opts.enabled : true));
                break;
            case 'normal':
            default:
                this.button(opts.label, opts.onClick, (opts.shortcut !== undefined ? opts.shortcut : ''), (opts.icon !== undefined ? opts.icon : ''), (opts.cssIcon !== undefined ? opts.cssIcon : ''), (opts.enabled !== undefined ? opts.enabled : true));
        }
    }

    button(label: any, onClick: any, shortcut = '', icon = '', cssIcon = '', enabled = true) {
        this.element = contextualCore.CreateEl(`
            <li class='contextualJs contextualMenuItemOuter'>
                <div class='contextualJs contextualMenuItem ${enabled == true ? '' : 'disabled'}'>
                    ${icon != '' ? `<img src='${icon}' class='contextualJs contextualMenuItemIcon'/>` : `<div class='contextualJs contextualMenuItemIcon ${cssIcon != '' ? cssIcon : ''}'></div>`}
                    <span class='contextualJs contextualMenuItemTitle'>${label == undefined ? 'No label' : label}</span>
                    <span class='contextualJs contextualMenuItemTip'>${shortcut == '' ? '' : shortcut}</span>
                </div>
            </li>`);

        if (enabled == true) {
            this.element.addEventListener('click', () => {
                if (event != undefined) {
                    event.stopPropagation();
                    if (onClick !== undefined) { onClick(); }
                    contextualCore.CloseMenu();
                }
            }, false);
        }
    }
    custom(markup: any) {
        this.element = contextualCore.CreateEl(`<li class='contextualJs contextualCustomEl'>${markup}</li>`);
    }
    hoverMenu(label: any, items: any, icon = '', cssIcon = '', enabled = true) {
        this.element = contextualCore.CreateEl(`
            <li class='contextualJs contextualHoverMenuOuter'>
                <div class='contextualJs contextualHoverMenuItem ${enabled == true ? '' : 'disabled'}'>
                    ${icon != '' ? `<img src='${icon}' class='contextualJs contextualMenuItemIcon'/>` : `<div class='contextualJs contextualMenuItemIcon ${cssIcon != '' ? cssIcon : ''}'></div>`}
                    <span class='contextualJs contextualMenuItemTitle'>${label == undefined ? 'No label' : label}</span>
                    <span class='contextualJs contextualMenuItemOverflow'>></span>
                </div>
                <ul class='contextualJs contextualHoverMenu'>
                </ul>
            </li>
        `);

        let childMenu = this.element.querySelector('.contextualHoverMenu'),
            menuItem = this.element.querySelector('.contextualHoverMenuItem');

        if (items !== undefined) {
            items.forEach(function (this: Contextual, value: any) {
                let item = new ContextualItem(value);
                childMenu.appendChild(item.element);
            });
        }
        if (enabled == true) {
            menuItem.addEventListener('mouseenter', () => {

            });
            menuItem.addEventListener('mouseleave', () => {

            });
        }
    }
    multiButton(buttons: any) {
        this.element = contextualCore.CreateEl(`
            <li class='contextualJs contextualMultiItem'>
            </li>
        `);
        buttons.forEach(function (this: ContextualItem, value: any) {
            let item = new ContextualItem(value);
            this.element.appendChild(item.element);
        });
    }
    subMenu(label: any, items: any, icon = '', cssIcon = '', enabled = true) {
        this.element = contextualCore.CreateEl(`
            <li class='contextualJs contextualMenuItemOuter'>
                <div class='contextualJs contextualMenuItem ${enabled == true ? '' : 'disabled'}'>
                    ${icon != '' ? `<img src='${icon}' class='contextualJs contextualMenuItemIcon'/>` : `<div class='contextualJs contextualMenuItemIcon ${cssIcon != '' ? cssIcon : ''}'></div>`}
                    <span class='contextualJs contextualMenuItemTitle'>${label == undefined ? 'No label' : label}</span>
                    <span class='contextualJs contextualMenuItemOverflow'>
                        <span class='contextualJs contextualMenuItemOverflowLine'></span>
                        <span class='contextualJs contextualMenuItemOverflowLine'></span>
                        <span class='contextualJs contextualMenuItemOverflowLine'></span>
                    </span>
                </div>
                <ul class='contextualJs contextualSubMenu contextualMenuHidden'>
                </ul>
            </li>`);

        let childMenu = this.element.querySelector('.contextualSubMenu'),
            menuItem = this.element.querySelector('.contextualMenuItem');

        if (items !== undefined) {
            items.forEach(function (this: ContextualItem, value: any) {
                let item = new ContextualItem(value);
                childMenu.appendChild(item.element);
            });
        }
        if (enabled == true) {
            menuItem.addEventListener('click', () => {
                menuItem.classList.toggle('SubMenuActive');
                childMenu.classList.toggle('contextualMenuHidden');
            }, false);
        }
    }
    seperator() {
        this.element = contextualCore.CreateEl(`<li class='contextualJs contextualMenuSeperator'><span></span></li>`);
    }
}

const contextualCore = {
    PositionMenu: (docked: any, el: any, menu: any) => {
        if (docked) {
            menu.style.left = ((el.target.offsetLeft + menu.offsetWidth) >= window.innerWidth) ?
                ((el.target.offsetLeft - menu.offsetWidth) + el.target.offsetWidth) + "px"
                : (el.target.offsetLeft) + "px";

            menu.style.top = ((el.target.offsetTop + menu.offsetHeight) >= window.innerHeight) ?
                (el.target.offsetTop - menu.offsetHeight) + "px"
                : (el.target.offsetHeight + el.target.offsetTop) + "px";
        } else {
            menu.style.left = ((el.clientX + menu.offsetWidth) >= window.innerWidth) ?
                ((el.clientX - menu.offsetWidth)) + "px"
                : (el.clientX) + "px";

            menu.style.top = ((el.clientY + menu.offsetHeight) >= window.innerHeight) ?
                (el.clientY - menu.offsetHeight) + "px"
                : (el.clientY) + "px";
        }
    },
    CloseMenu: () => {
        let openMenuItem = document.querySelector('.contextualMenu:not(.contextualMenuHidden)');
        if (openMenuItem != null) { document.body.removeChild(openMenuItem); }
    },
    CreateEl: (template: any) => {
        var el = document.createElement('div');
        el.innerHTML = template;
        return el.firstElementChild;
    }
};
