

var Menu = function(list) {
    this.target = document.getElementById('area');
    
    let menu = document.createElement("nav");
    menu.classList.add("context-menu");
    
    this.target.appendChild(menu);
    let activeClass = "context-menu-active";
    let overflowClass = "context-menu-overflow";
    let containerClass = "context-menu_items";
    let oneItemClass = "context-menu_item";
    let childTitleClass = "context-menu_item-title";
    let submenuClass = "context-menu_sublevel";
    let hasSublevelClass = "context-menu_items-hasSublevel";
    let menuItemHiddenClass = "context-menu_item-hidden";
    let disabledClass = "context-menu_item-disabled";
    let scrollClass = "context-menu_scroll";   
    let scrollTopClass = "context-menu_scroll-top";
    let scrollBottomClass = "context-menu_scroll-bottom";
    let scrollHiddenClass = "context-menu_scroll-hidden";
    
    (() => {
        let items = renderMenu(list.menuItems);
        menu.appendChild(items);
    })();  
    
    function renderMenu(menuItems,level = 0) {
        let current_level = level || 0;
        let container = document.createElement("ul");
        
        container.classList.add(containerClass);
        if (current_level > 0) container.classList.add("context-menu_sublevel");
        menuItems.forEach((item,i,arr) => {
            let item_container = document.createElement('li');
            item_container.classList.add(oneItemClass);
            let title = document.createElement('span');
            title.classList.add(childTitleClass);
            title.innerHTML = item.title;
            item_container.appendChild(title);
            if (item.disabled) item_container.classList.add(disabledClass);
            let submenu;
            if (item.submenu.length) {
                item_container.classList.add(hasSublevelClass);
                submenu = renderMenu(item.submenu, current_level+1);
                item_container.appendChild(submenu);
                
                title.addEventListener("mouseover", (e) => {
                    setPosition(submenu,getPosSubmenu(e),true);
                    e.preventDefault();
                }); 
            }
            container.appendChild(item_container);
            item_container.addEventListener("click",item.click_event);
        });
        return container;
    } 

    this.showMenu = (pos) => {
        menu.classList.add(activeClass);
        setPosition(menu, pos);
    }
    
    this.hideMenu = () => {
        menu.classList.remove(activeClass);
    }
    
    function getPosition(e) {
      let posx = 0;
      let posy = 0;

      if (!e) e = window.event;

      if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
      } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + 
                           document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + 
                           document.documentElement.scrollTop;
      }
        
      return {
        x: posx,
        y: posy
      }
    }
    
    function getPosSubmenu(e) {
        let target = e.target;
        if (!target.classList.contains(oneItemClass)) target = target.parentNode;

        let submenu = target.querySelector("."+submenuClass);
        let posX = target.getClientRects()[0].width - 2;
        let posY = 5;
        
        let width = parseInt(window.getComputedStyle(submenu,null).getPropertyValue("width"));
        let height = parseInt(window.getComputedStyle(submenu,null).getPropertyValue("height"));
        
        let clientHeight = document.documentElement.clientHeight - 19;
        let clientWidth = document.documentElement.clientWidth - 19;
        
        let menuItem =  document.querySelector(".context-menu_item");
        let menuItemHeight = parseInt(window.getComputedStyle(menuItem,null).getPropertyValue("height"));
        
        let parentRightPos = target.getClientRects()[0].right;
        let parentTopPos = target.getClientRects()[0].top;

        if ((parentRightPos + posX) > clientWidth) {
            posX = 0 - posX;
        }
        
        if ((parentTopPos + posY + height) > clientHeight) posY = menuItemHeight - height - 5;
        
        return {
            x: posX,
            y: posY
        }
    }
    
    function setPosition(target, pos, relative = false) {
        let width = parseInt(window.getComputedStyle(target,null).getPropertyValue("width"));
        let height = parseInt(window.getComputedStyle(target,null).getPropertyValue("height"));
        let clientHeight = document.documentElement.clientHeight - 19;
        let clientWidth = document.documentElement.clientWidth - 19;
        let destX = pos.x;
        let destY = pos.y;
        
        let parent = target.parentNode;
        
        let parentTopPos = parent.getClientRects()[0].top;

        if ((pos.x + width) > clientWidth) destX = pos.x - width;
        
        if (relative) {
            pos.y = pos.y + parentTopPos;
        }
        
        if (height > clientHeight) {
            cutMenu(target,clientHeight);
            height = parseInt(window.getComputedStyle(target,null).getPropertyValue("height"));
            destY = Math.floor((clientHeight - height)/2);
            target.classList.add(overflowClass);
        }
        else {
            
            if ((pos.y + height) > clientHeight) {
                if ((pos.y - height) < 0) {
                    destY = Math.floor((clientHeight - height)/2);
                } else {
                    destY = pos.y - height;
                }
            } else {
                destY = pos.y;
                if (destY < 0) {
                    destY = 0;
                }
            }
        }
        
        if (relative) {
            destX = pos.x;
            destY = destY - parentTopPos;
        }
        
        target.style.left = destX + "px";
        target.style.top = destY + "px";
    }
    
    function cutMenu(target, clientHeight) {
        if (!target.classList.contains(containerClass))  target = target.querySelector("."+containerClass);
        let scrollTop = document.createElement("span");
        let scrollBottom = document.createElement("span");
        scrollTop.classList.add(scrollTopClass,scrollClass,scrollHiddenClass);
        scrollBottom.classList.add(scrollBottomClass,scrollClass);
        target.insertBefore(scrollTop,target.firstChild);
        target.appendChild(scrollBottom);
        target.setAttribute("data-scrollPos",0);
        let scrollButton = document.querySelector("."+scrollClass);
        let scrollButtonHeight = parseInt(window.getComputedStyle(scrollButton,null).getPropertyValue("height"));
        let aviableHeight = clientHeight - 2*scrollButtonHeight;
        let menuItem =  document.querySelector(".context-menu_item");
        let menuItemHeight = parseInt(window.getComputedStyle(menuItem,null).getPropertyValue("height"));
        let maxItemsCount = Math.floor(aviableHeight/menuItemHeight);
        target.setAttribute("data-itemsCount",maxItemsCount);
       
        let targetChildren = target.children;
        let totalItemsCount = targetChildren.length - 2;
        
       for (let i = 1; i<totalItemsCount - 1; i++) {
           if (i>= maxItemsCount-1) {
                targetChildren[i].classList.add("context-menu_item-hidden");
            }
       }

        
        
        scrollTop.addEventListener("click", (e) => {
            
            scrollMenu(target,-1);
      
        });
        scrollBottom.addEventListener("click", (e) => {
            scrollMenu(target,1);
  
        });
        
        
    }
    
    function scrollMenu(target, scrollValue) {

        let targetChildren = target.children;
        let totalItemsCount = targetChildren.length - 2;
        let currentScrollPos = parseInt(target.getAttribute("data-scrollPos"));
        let visibleItemsCount = parseInt(target.getAttribute("data-itemsCount"));
        
        let newScrollPos = currentScrollPos + scrollValue;
        
        if (newScrollPos < 0) newScrollPos = 0;
        if (newScrollPos > (totalItemsCount - visibleItemsCount)) newScrollPos = totalItemsCount - visibleItemsCount;
        
        
        if (newScrollPos == 0) {
            target.firstChild.classList.add(scrollHiddenClass);
        }
        else {
             target.firstChild.classList.remove(scrollHiddenClass);
        }
        if (newScrollPos == (totalItemsCount - visibleItemsCount)) {
             target.lastChild.classList.add(scrollHiddenClass);
        }
        else {
            target.lastChild.classList.remove(scrollHiddenClass);
        }

        
        target.setAttribute("data-scrollPos",newScrollPos);
        
        for (let i=1; i<targetChildren.length-1; i++) {
            targetChildren[i].classList.add(menuItemHiddenClass);
            if (((i-1) >= newScrollPos) && ((i-1) <= (newScrollPos + visibleItemsCount - 1))) {
                targetChildren[i].classList.remove(menuItemHiddenClass);
            }
        }
        
        
    }
    
    function bindEvent(el, eventName, eventHandler) {
      if (el.addEventListener){
        el.addEventListener(eventName, eventHandler, false); 
      } else if (el.attachEvent){
        el.attachEvent('on'+eventName, eventHandler);
      }
    }
    
    bindEvent(document,"contextmenu",(e) => {
        if (e.target == this.target || e.target.parentElement == this.target) {
            e.preventDefault();
            let pos = getPosition(e);
            this.showMenu(pos);
        }
        else {
            this.hideMenu();
        }

    });
    
    bindEvent(document,"click",(e) => {
        let target = e.target;
        let button = e.which || e.button;
        if ( button === 1 && !target.classList.contains("context-menu_scroll")) {
           this.hideMenu();
        }
    });
}


var itemList = {
    "menuItems": [
        {
            "click_event": itemClick,
            "title": "menu item 0",
            "disabled": true,
            "submenu": false
        },

        {
            "click_event": itemClick,
            "title": "menu item 1",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 1",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        },
        {
            "click_event": itemClick,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 2",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 3",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 3",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 3",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 4",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 4",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 4",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 5",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 5",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 5",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 6",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 6",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 6",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 7",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 7",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 7",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 8",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 8",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 8",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 9",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 9",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 9",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 10",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 10",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 10",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 11",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 11",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 11",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 12",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 12",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 12",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 13",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 13",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 13",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 14",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 14",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 14",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 15",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 15",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 15",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }
        ,
        {
            "click_event": itemClick,
            "title": "menu item 16",
            "disabled": false,
            "submenu": [
                {
                    "click_event": itemClick,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "click_event": itemClick,
                    "title": "menu item 16",
                    "disabled": false,
                    "submenu": [
                        {
                            "click_event": itemClick,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "click_event": itemClick,
                            "title": "menu item 16",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        }

    ]
}

function itemClick() {
    console.log("click at item");
}

var menu = new Menu(itemList);






