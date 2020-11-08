import "../css/popup.css";
import "../img/18px_level1.png";
import "../img/18px_level2.png";
import "../img/18px_level3.png";
import "../img/18px_donator.png";
import "../img/18px_betatester.png";

import browser from "webextension-polyfill";

const levels = [0, 100, 400, 800, 1000];
const button = document.getElementById("signin");

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

button.onclick = async () => {
    const redirectUrl = await browser.identity.launchWebAuthFlow({
        url:
            "https://api.twitch.tv/kraken/oauth2/authorize?response_type=code&client_id=dv2j00xctf5qhix8y271pl0vnm20ny&redirect_uri=https://iecemifilihdioifbjkecacedfgfbfpl.chromiumapp.org/cb&scope=user:read:email",
        interactive: true,
    });
    const url = new URL(redirectUrl);
    const authCode = url.searchParams.get("code");

    const response = await fetch(
        `https://twitchtos.herokuapp.com/auth?authcode=${authCode}`
    );
    const result = await response.text();
    await browser.storage.sync.set({ access_token: result });
    await browser.storage.sync.set({ logged_in: true });
    console.log("Logged in");
    location.reload();
};

browser.storage.sync.get(["logged_in"]).then(async (syncResult) => {
    if (syncResult.logged_in) {
        const profile = document.getElementById("profile");

        const secondSyncResult = await browser.storage.sync.get([
            "access_token",
        ]);
        const fetchResult = await fetch(
            `https://twitchtos.herokuapp.com/userinfo`,
            {
                headers: { Authorization: secondSyncResult.access_token },
            }
        );
        const text = await fetchResult.text();
        if (text === "not found") {
            await browser.storage.sync.set({ logged_in: false });
            const error = document.getElementById("error");
            error.style.removeProperty("display");
            return;
        }
        const data = JSON.parse(text);
        const XP = data.userVoteExp;
        const userVoteLevel = data.userVoteLevel;
        const nextlevel = levels[userVoteLevel];
        const percentage = (XP / nextlevel) * 100;

        const userField = document.getElementById("user");
        const imageField = document.getElementById("image");
        const levelField = document.getElementById("level");
        const logOut = document.getElementById("logout");
        const xpBar = document.getElementById("xp");
        const ratedVids = document.getElementById("ratedvids");
        const xpBarVisibility = document.getElementById("xpbar");
        const badge = document.getElementById("badge");
        const xp = document.getElementById("xp");

        userField.innerHTML = data.userName;
        imageField.src = data.userPicture;
        if (userVoteLevel === 99) {
            xpBar.style.width = "100%";
            ratedVids.innerHTML = "Donator";
            xpBar.innerHTML = "(Donator <3)";
            badge.src = browser.runtime.getURL("18px_donator.png");
        } else if (userVoteLevel === 98) {
            xpBar.style.width = "100%";
            ratedVids.innerHTML = "Beta Tester";
            xpBar.innerHTML = "(Beta Tester <3)";
            badge.src = browser.runtime.getURL("18px_betatester.png");
        } else {
            xpBar.style.width = `${percentage}%`;
            ratedVids.innerHTML = `${userVoteLevel} (${XP}/${nextlevel}XP)`;
            if (percentage >= 30) {
                xp.innerHTML = `(${XP}/${nextlevel}XP)`;
            }
            badge.src = browser.runtime.getURL(
                `18px_level${userVoteLevel}.png`
            );
        }

        if (data.userLevel === "") {
            levelField.innerHTML = "User";
        } else {
            levelField.innerHTML = capitalizeFirstLetter(data.userLevel);
        }

        xpBarVisibility.style.removeProperty("display");
        profile.style.removeProperty("display");
        logOut.onclick = async () => {
            await browser.storage.sync.set({ logged_in: false });
            location.reload();
        };
    } else {
        const button = document.getElementById("button");
        button.style.removeProperty("display");
    }
});
