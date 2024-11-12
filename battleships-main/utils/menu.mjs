import { ANSI } from "../utils/ansi.mjs";
import KeyBoardManager, { clearScreen } from "../utils/io.mjs";
import { print, printCenterd } from "../utils/io.mjs";

let currentActiveMenuItem = 0;

function createMenu(menuItems) {
    return {
        isDrawn: false,
        next: null,
        transitionTo: null,

        update: function (dt) {
            if (KeyBoardManager.isUpPressed()) {
                currentActiveMenuItem--;
                if (currentActiveMenuItem < 0) {
                    currentActiveMenuItem = 0;
                }
                this.isDrawn = false;
            }
            else if (KeyBoardManager.isDownPressed()) {
                currentActiveMenuItem++;
                if (currentActiveMenuItem >= menuItems.length) {
                    currentActiveMenuItem = menuItems.length - 1;
                }
                this.isDrawn = false;
            }
            else if (KeyBoardManager.isEnterPressed()) {
                // Only trigger the selected action when Enter is pressed, no automatic action
                if (menuItems[currentActiveMenuItem].action) {
                    menuItems[currentActiveMenuItem].action();
                }
            }
        },

        draw: function () {
            if (!this.isDrawn) {
                this.isDrawn = true;
                clearScreen();
                let output = "";

                for (let index in menuItems) {
                    let menuItem = menuItems[index];
                    let title = menuItem.text;
                    if (currentActiveMenuItem == menuItem.id) {
                        title = `*${menuItem.text}*`; // Highlight current selection
                    } else {
                        title = ` ${menuItem.text} `;
                    }
                    output += title + "\n";
                }

                printCenterd(output);
            }
        }
    };
}

export default createMenu;
