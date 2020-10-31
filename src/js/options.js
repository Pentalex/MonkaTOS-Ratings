import "../css/options.css";

const button = document.getElementById("signin");
button.onclick = () => {
    chrome.identity.launchWebAuthFlow(
        {
            url:
                "https://api.twitch.tv/kraken/oauth2/authorize?response_type=code&client_id=dv2j00xctf5qhix8y271pl0vnm20ny&redirect_uri=https://iecemifilihdioifbjkecacedfgfbfpl.chromiumapp.org/cb&scope=user:read:email",
            interactive: true,
        },
        (redirect_url) => {
            const url = new URL(redirect_url);

            const authcode = url.searchParams.get("code");

            chrome.storage.sync.set({
                authcode: authcode,
            });
            console.log(authcode);
            alert("Successfully signed in! You can now close the tab.");
        }
    );
};
