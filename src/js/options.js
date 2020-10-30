import "../css/options.css";

button = document.getElementById("signin");
button.onclick = function () {
  chrome.identity.launchWebAuthFlow(
    {
      url:
        "https://api.twitch.tv/kraken/oauth2/authorize?response_type=code&client_id=dv2j00xctf5qhix8y271pl0vnm20ny&redirect_uri=https://iecemifilihdioifbjkecacedfgfbfpl.chromiumapp.org/cb&scope=user:read:email",
      interactive: true,
    },
    function (redirect_url) {
      const url = new URL(redirect_url);

      authcode = url.searchParams.get("code");

      chrome.storage.sync.set({
        authcode: authcode,
      });
      console.log(authcode);
      alert("Successfully signed in! You can now close the tab.");
    }
  );
};
