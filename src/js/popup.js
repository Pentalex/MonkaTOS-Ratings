import "../css/popup.css";
import "../img/18px_donator.png";
import "../img/18px_betatester.png";
const levels = differenceAlgorithm(50);
const button = document.getElementById("signin");
const donate = document.getElementById("donate");

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
button.onclick = () => {
    const redirectUrl = chrome.identity.getRedirectURL();
    console.log(redirectUrl);

    chrome.identity.launchWebAuthFlow(
        {
            url: `https://api.twitch.tv/kraken/oauth2/authorize?response_type=code&client_id=dv2j00xctf5qhix8y271pl0vnm20ny&redirect_uri=${encodeURIComponent(
                redirectUrl
            )}&scope=user:read:email`,
            interactive: true,
        },
        (redirectUrl) => {
            const url = new URL(redirectUrl);
            const oldRedirectUrl = chrome.identity.getRedirectURL();
            console.log(oldRedirectUrl);
            const authCode = url.searchParams.get("code");
            console.log(authCode);

            fetch(
                `https://twitchtos.herokuapp.com/auth?authcode=${authCode}&redirect_uri=${oldRedirectUrl}`
            )
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
    if (result.logged_in) {
        const profile = document.getElementById("profile");

        chrome.storage.sync.get(["access_token"], (result) => {
            fetch(`https://twitchtos.herokuapp.com/userinfo`, {
                headers: { Authorization: result.access_token },
            }).then(function (result) {
                result.text().then(function (result) {
                    if (result === "not found") {
                        chrome.storage.sync.set({ logged_in: false });
                        const error = document.getElementById("error");
                        error.style.removeProperty("display");
                        return;
                    }
                    const data = JSON.parse(result);
                    const XP = data.userVoteExp;
                    const userVoteLevel = data.userVoteLevel;
                    const nextlevel = levels[userVoteLevel];
                    const percentage = (XP / nextlevel) * 100;

                    const userField = document.getElementById("user");
                    const imageField = document.getElementById("image");
                    const levelField = document.getElementById("level");
                    const logOut = document.getElementById("logout");
                    const xpbar = document.getElementById("xp");
                    const ratedvids = document.getElementById("ratedvids");
                    const xpbarvisibility = document.getElementById("xpbar");
                    const badge = document.getElementById("badge");
                    const xp = document.getElementById("xp");

                    userField.innerHTML = data.userName;
                    imageField.src = data.userPicture;
                    if (userVoteLevel === 99) {
                        xpbar.style.width = "100%";
                        ratedvids.innerHTML = "Donator";
                        xpbar.innerHTML = `(Donator <3)`;
                        badge.src = chrome.extension.getURL("18px_donator.png");
                    } else if (userVoteLevel === 98) {
                        xpbar.style.width = "100%";
                        ratedvids.innerHTML = "Beta Tester";
                        xpbar.innerHTML = `(Beta Tester <3)`;
                        // eslint-disable-next-line prettier/prettier
                        badge.src = chrome.extension.getURL("18px_betatester.png");
                    } else if (userVoteLevel < 5) {
                        xpbar.style.width = `${percentage}%`;
                        ratedvids.innerHTML = `${userVoteLevel} (${XP}/${nextlevel}XP)`;
                        if (percentage >= 30) {
                            xp.innerHTML = `(${XP}/${nextlevel}XP)`;
                        }
                        badge.style.display = "none";
                    } else {
                        xpbar.style.width = `${percentage}%`;
                        ratedvids.innerHTML = `${userVoteLevel} (${XP}/${nextlevel}XP)`;
                        if (percentage >= 30) {
                            xp.innerHTML = `(${XP}/${nextlevel}XP)`;
                        }
                        badge.src = `https://twitchtos.herokuapp.com/badge?id=${userVoteLevel}`;
                    }

                    if (data.userLevel === "") {
                        levelField.innerHTML = "User";
                    } else {
                        levelField.innerHTML = capitalizeFirstLetter(
                            data.userLevel
                        );
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

function differenceAlgorithm(level) {
    const helper = (level) => {
        if (level == 1) {
            return [0];
        } else {
            const difference = (level - 1) * 10;
            const prev = helper(level - 1);
            return [difference + prev[0], ...prev];
        }
    };
    return helper(level).reverse();
}

donate.onclick = () => {
    window.open("https://paypal.me/pentalex", "_blank");
};
