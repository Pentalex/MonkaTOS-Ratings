import "../img/icon128.png";
import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(async (_object) => {
    await browser.tabs.create({ url: "/options.html" });
});

async function refresh() {
    const syncResult = await browser.storage.sync.get(["access_token"]);
    const url = `https://twitchtos.herokuapp.com/refresh?access_token=${syncResult.access_token}`;
    const response = await fetch(url);
    const result = await response.text();
    if (result == "bruh") {
        await browser.storage.sync.set({ logged_in: false });
    } else {
        await browser.storage.sync.set({ access_token: result });
        console.log(`Refreshing the thing ${result}`);
    }
}

setInterval(refresh, 1000 * 500);

browser.storage.onChanged.addListener(async (changes, _namespace) => {
    for (const key in changes) {
        const storageChange = changes[key];
        if (key == "authcode") {
            const authCode = storageChange.newValue;
            const response = await fetch(
                `https://twitchtos.herokuapp.com/auth?authcode=${authCode}`
            );
            const result = await response.text();
            await browser.storage.sync.set({ access_token: result });
            await browser.storage.sync.set({ logged_in: true });
            console.log("Logged in");
        }
    }
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo && changeInfo.status == "complete") {
        await browser.tabs.sendMessage(tabId, { data: tab });
    }
});
