import { ANSI } from "./utils/ansi.mjs";
import { print, clearScreen, askQuestion } from "./utils/io.mjs"; 
import DICTIONARY from "./utils/language.mjs";
import SplashScreen from "./game/splash.mjs";
import { FIRST_PLAYER, SECOND_PLAYER } from "./consts.mjs";
import createMenu from "./utils/menu.mjs";
import createMapLayoutScreen from "./game/mapLayoutScreen.mjs";
import createInnBetweenScreen from "./game/innbetweenScreen.mjs";
import createBattleshipScreen from "./game/battleshipsScreen.mjs";

const GAME_FPS = 1000 / 60;
let currentState = null;
let gameLoop = null;
let mainMenuScene = null;
let currentLanguage = DICTIONARY.en;

function checkResolution() {
    const MIN_WIDTH = 80;
    const MIN_HEIGHT = 20;
    const width = process.stdout.columns;
    const height = process.stdout.rows;
    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        clearScreen();
        print(`Please resize your window to at least ${MIN_WIDTH}x${MIN_HEIGHT} and press Enter to start.`);
        return false;
    }
    return true;
}

async function selectLanguage() {
    clearScreen();
    print("Select Language:\n1. English\n2. Norwegian\n");
    const choice = await askQuestion("");
    currentLanguage = (choice === "2") ? DICTIONARY.no : DICTIONARY.en;
}

function buildMenu() {
    let menuItemCount = 0;
    return [
        {
            text: currentLanguage.START_GAME,
            id: menuItemCount++,
            action: function () {
                clearScreen();
                let innbetween = createInnBetweenScreen();
                innbetween.init(currentLanguage.PLAYER_ONE_READY, () => {
                    let p1map = createMapLayoutScreen();
                    p1map.init(FIRST_PLAYER, (player1ShipMap) => {
                        let innbetween = createInnBetweenScreen();
                        innbetween.init(currentLanguage.PLAYER_TWO_READY, () => {
                            let p2map = createMapLayoutScreen();
                            p2map.init(SECOND_PLAYER, (player2ShipMap) => {
                                return createBattleshipScreen(player1ShipMap, player2ShipMap);
                            });
                            return p2map;
                        });
                        return innbetween;
                    });
                    return p1map;
                }, 3);
                currentState.next = innbetween;
                currentState.transitionTo = "Map layout";
            }
        },
        {
            text: currentLanguage.EXIT_GAME,
            id: menuItemCount++,
            action: function () {
                print(ANSI.SHOW_CURSOR);
                clearScreen();
                process.exit();
            }
        },
        {
            text: currentLanguage.SELECT_LANGUAGE,
            id: menuItemCount++,
            action: async function () {
                await selectLanguage();
                mainMenuScene = createMenu(buildMenu());
                currentState = mainMenuScene;
            }
        }
    ];
}

(async function initialize() {
    print(ANSI.HIDE_CURSOR);
    clearScreen();

    if (!checkResolution()) {
        process.stdin.once("data", initialize); 
        return;
    }

    await selectLanguage();

    mainMenuScene = createMenu(buildMenu());
    SplashScreen.next = mainMenuScene;
    currentState = SplashScreen;
    gameLoop = setInterval(update, GAME_FPS);
})();

function update() {
    currentState.update(GAME_FPS);
    currentState.draw(GAME_FPS);
    if (currentState.transitionTo != null) {
        currentState = currentState.next;
        print(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
    }
}
