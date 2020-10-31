import $ from "jquery";
import "../img/downvote.png";
import "../img/upvote.png";

function youtubeParser(url) {
    var regexp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regexp);
    return match && match[7].length == 11 ? match[7] : false;
}

chrome.runtime.onMessage.addListener((_request, _sender, _sendResponse) => {
    console.log("page change");

    setTimeout(() => {
        init();
    }, 500);
});

function elementLoaded(el, cb) {
    if ($(el).length) {
        // Element is now loaded.
        cb($(el));
    } else {
        // Repeat every 500ms.
        setTimeout(() => {
            elementLoaded(el, cb);
        }, 500);
    }
}

function init() {
    var url = window.location.href;
    var videoId = youtubeParser(url);
    console.log(videoId);

    elementLoaded(".ytd-video-primary-info-renderer", (_el) => {
        console.log("We're on a video!");

        fetch("https://twitchtos.herokuapp.com/getrating?video_id=" + videoId)
            .then((r) => r.text())
            .then((result) => {
                console.log(result);
                let scoreText;
                if (parseInt(result) > 0 && parseInt(result) < 3) {
                    scoreText = "Decent";
                } else if (parseInt(result) < 0 && parseInt(result) > -3) {
                    scoreText = "Bad";
                } else if (parseInt(result) < -3) {
                    scoreText = "Terrible";
                } else if (parseInt(result) > 3) {
                    scoreText = "Good";
                }

                var el = document.getElementsByClassName(
                    "ytd-video-primary-info-renderer"
                )[0].children[5].children[1];
                console.log(
                    document.getElementsByClassName(
                        "ytd-video-primary-info-renderer"
                    )[0].children[5]
                );
                $(".toscontainer").empty();
                $(".toscontainer").remove();
                el.insertAdjacentHTML(
                    "beforeend",
                    '<div class="toscontainer"></div>'
                );
                if (result == "0") {
                    $(".toscontainer").append(
                        `
        <img style="cursor: pointer; float: left;padding: 5px;"
             src="${chrome.extension.getURL("upvote.png")}"
             width="24"
             height="24"
             id="upvote" />
        <img style="cursor: pointer; float: left;padding: 5px;"
             src="${chrome.extension.getURL("downvote.png")}"
             width="24"
             height="24"
             id="downvote" />
        <p id="tos" style="float: left;  padding 5px;">This video hasn't been rated.</span></p>
        `
                    );
                } else {
                    $(".toscontainer").empty();
                    $(".toscontainer").append(
                        `
          <img style="cursor: pointer; float: left;padding: 5px;"
               src="${chrome.extension.getURL("upvote.png")}"
               width="24"
               height="24"
               id="upvote" />
          <img style="cursor: pointer; float: left;padding: 5px;"
               src="${chrome.extension.getURL("downvote.png")}"
               width="24"
               height="24"
               id="downvote" />
          <p id="tos" style="float: left;  padding 5px;">
              TOS Score: <span id='scoretext'>${scoreText}(${result})</span>
          </p>
          `
                    );
                }

                const upvoteButton = document.getElementById("upvote");
                const downvoteButton = document.getElementById("downvote");
                upvoteButton.addEventListener("click", upvote);
                downvoteButton.addEventListener("click", downvote);

                if (
                    window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                ) {
                    document.getElementById("tos").style.color = "white";
                } else {
                    document.getElementById("tos").style.color = "black";
                }
                document.getElementById("tos").style.fontSize = "medium";

                document.getElementById("tos").style.paddingTop = "7px";

                if (scoreText == "Good") {
                    document.getElementById("scoretext").style.color = "Green";
                }
                if (scoreText == "Decent") {
                    document.getElementById("scoretext").style.color =
                        "GreenYellow";
                }
                if (scoreText == "Bad") {
                    document.getElementById("scoretext").style.color =
                        "IndianRed";
                }
                if (scoreText == "Terrible") {
                    document.getElementById("scoretext").style.color = "Red";
                }
            });
    });
}

function upvote() {
    var url = window.location.href;
    var videoId = youtubeParser(url);
    const upvoteButton = document.getElementById("upvote");
    const downvoteButton = document.getElementById("downvote");

    chrome.storage.sync.get(["access_token"], (result) => {
        fetch(
            "https://twitchtos.herokuapp.com/rate?video_id=" +
                videoId +
                "&rating=plus",
            { headers: { Authorization: result.access_token } }
        )
            .then((r) => r.text())
            .then((result) => {
                console.log(result);
                if (result == "found") {
                    alert("You have already upvoted this video!");
                    return;
                } else {
                    downvoteButton.parentNode.removeChild(downvoteButton);
                    upvoteButton.style.outline = "auto";
                    upvoteButton.style.outlineOffset = "-4px";
                    console.log("Upvoted!");
                }
            });
    });
}

function downvote() {
    var url = window.location.href;
    var videoId = youtubeParser(url);
    const upvoteButton = document.getElementById("upvote");
    const downvoteButton = document.getElementById("downvote");

    chrome.storage.sync.get(["access_token"], (result) => {
        fetch(
            "https://twitchtos.herokuapp.com/rate?video_id=" +
                videoId +
                "&rating=minus",
            { headers: { Authorization: result.access_token } }
        )
            .then((r) => r.text())
            .then((result) => {
                if (result == "found") {
                    alert("You have already downvoted this video!");
                    return;
                } else {
                    upvoteButton.parentNode.removeChild(upvoteButton);
                    downvoteButton.style.outline = "auto";
                    downvoteButton.style.outlineOffset = "-4px";
                    console.log("Downvoted!");
                }
            });
    });
}
