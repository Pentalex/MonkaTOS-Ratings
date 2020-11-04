import "../css/popup.css";

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
                    console.log(data.userLevel);

                    const userField = document.getElementById("user");
                    const imageField = document.getElementById("image");
                    const levelField = document.getElementById("level");
                    const logOut = document.getElementById("logout");

                    userField.innerHTML = data.userName;
                    imageField.src = data.userPicture;

                    if (data.userLevel === "") {
                        levelField.innerHTML = "User";
                    } else {
                        levelField.innerHTML = data.userLevel;
                    }
                    profile.style.removeProperty("display");
                    logOut.onclick = function () {
                        chrome.storage.sync.set({ logged_in: false });
                        location.reload();
                    };

                    //TODO: Function to fetch amount of votes/XP depending on system used and a level.
                });
            });
        });
    } else {
        const button = document.getElementById("button");
        button.style.removeProperty("display");
    }
});
