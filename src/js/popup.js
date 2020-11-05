import "../css/popup.css";
import "../img/18px_level1.png";
import "../img/18px_level2.png";
import "../img/18px_level3.png";
import "../img/18px_donator.png";

const levels = [0, 100, 250, 400, 650];
const button = document.getElementById("signin");
button.onclick = () => {
    chrome.identity.launchWebAuthFlow(
        {
            url:
                "https://api.twitch.tv/kraken/oauth2/authorize?response_type=code&client_id=dv2j00xctf5qhix8y271pl0vnm20ny&redirect_uri=https://iecemifilihdioifbjkecacedfgfbfpl.chromiumapp.org/cb&scope=user:read:email",
            interactive: true,
        },
        (redirectUrl) => {
            const url = new URL(redirectUrl);

            const authCode = url.searchParams.get("code");

            fetch(`https://twitchtos.herokuapp.com/auth?authcode=${authCode}`)
                .then((r) => r.text())
                .then((result) => {
                    chrome.storage.sync.set({ access_token: result });
                    chrome.storage.sync.set({ logged_in: true });
                    console.log("Logged in");
                    location.reload();
                });
        }
    );
};

chrome.storage.sync.get(["logged_in"], (result) => {
    console.log(result);
    if (result.logged_in) {
        const profile = document.getElementById("profile");

        chrome.storage.sync.get(["access_token"], (result) => {
            fetch(`https://twitchtos.herokuapp.com/userinfo`, {
                headers: { Authorization: result.access_token },
            }).then(function (result) {
                result.text().then(function (result) {
                    if (result === "not found") {
                        chrome.storage.sync.set({ logged_in: false });
                    }
                    const data = JSON.parse(result);
                    const XP = data.userVoteExp;
                    const userVoteLevel = data.userVoteLevel;
                    const nextlevel = levels[userVoteLevel];
                    const percentage = (XP / nextlevel) * 100;
                    console.log(data);

                    const userField = document.getElementById("user");
                    const imageField = document.getElementById("image");
                    const levelField = document.getElementById("level");
                    const logOut = document.getElementById("logout");
                    const xpbar = document.getElementById("xp");
                    const ratedvids = document.getElementById("ratedvids");
                    const xpbarvisibility = document.getElementById("xpbar");
                    const badge = document.getElementById("badge");

                    userField.innerHTML = data.userName;
                    imageField.src = data.userPicture;
                    if (userVoteLevel === 99) {
                        xpbar.style.width = "100%";
                        ratedvids.innerHTML = "Donator";
                        xpbar.innerHTML = `(Donator <3)`;
                        badge.src = chrome.extension.getURL("18px_donator.png");
                    } else {
                        xpbar.style.width = `${percentage}%`;
                        ratedvids.innerHTML = `${userVoteLevel} (${XP}/${nextlevel}XP)`;
                        xpbar.innerHTML = `(${XP}/${nextlevel}XP)`;
                        badge.src = chrome.extension.getURL(
                            `18px_level${userVoteLevel}.png`
                        );
                    }

                    if (data.userLevel === "") {
                        levelField.innerHTML = "User";
                    } else {
                        levelField.innerHTML = data.userLevel;
                    }

                    xpbarvisibility.style.removeProperty("display");
                    profile.style.removeProperty("display");
                    logOut.onclick = function () {
                        chrome.storage.sync.set({ logged_in: false });
                        location.reload();
                    };
                });
            });
        });
    } else {
        const button = document.getElementById("button");
        button.style.removeProperty("display");
    }
});
