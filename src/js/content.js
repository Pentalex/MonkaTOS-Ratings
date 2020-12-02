/* eslint-disable no-undef */
import $ from "jquery";
import "../img/downvote.png";
import "../img/upvote.png";
import "../img/18px_level1.png";
import "../img/18px_level2.png";
import "../img/18px_level3.png";
import "../img/18px_donator.png";
import "../img/18px_betatester.png";

function youtubeParser(url) {
    const regexp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regexp);
    return match && match[7].length == 11 ? match[7] : false;
}

chrome.runtime.onMessage.addListener((_request, _sender, _sendResponse) => {
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
    const url = window.location.href;
    const videoId = youtubeParser(url);
    if (videoId == false) {
        return;
    }

    elementLoaded(".ytd-video-primary-info-renderer", (_el) => {
        fetch(`https://twitchtos.herokuapp.com/getrating?video_id=${videoId}`)
            .then((r) => r.text())
            .then((result) => {
                let scoreText;
                if (parseInt(result) > 0 && parseInt(result) < 3) {
                    scoreText = "Decent";
                } else if (parseInt(result) < 0 && parseInt(result) > -3) {
                    scoreText = "Bad";
                } else if (parseInt(result) <= -3) {
                    scoreText = "Terrible";
                } else if (parseInt(result) >= 3) {
                    scoreText = "Good";
                }

                const el = document.getElementsByClassName(
                    "ytd-video-primary-info-renderer"
                )[0].children[5].children[1];

                $(".toscontainer").empty();
                $(".toscontainer").remove();
                el.insertAdjacentHTML(
                    "beforeend",
                    '<div class="toscontainer"></div>'
                );

                if (result == "approved") {
                    $(".toscontainer").append(
                        `
        <img style="float: left;padding: 5px;"
             src="${chrome.extension.getURL("upvote.png")}"
             width="24"
             height="24"
            />
        <img style="float: left;display: none;"
             src="${chrome.extension.getURL("downvote.png")}"
             width="24"
             height="24"
             id="downvote" />
        <p id="tos" style="float: left; font-size:1.3em">The creator of this video is guaranteed to be TOS friendly.</span></p>
        `
                    );
                } else if (result == "0") {
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
        <p id="tos" style="float: left;   font-size:1.3em;">This video hasn't been rated.</span></p>
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
          <p id="tos" style="float: left;  font-size:1.3em;">
              TOS Score: <span id='scoretext'>${scoreText}(${result})</span>
          </p>
          `
                    );
                }

                const upvoteButton = document.getElementById("upvote");
                const downvoteButton = document.getElementById("downvote");
                if (upvoteButton) {
                    upvoteButton.addEventListener("click", upvote);
                }
                if (downvoteButton) {
                    downvoteButton.addEventListener("click", downvote);
                }
                if (
                    getComputedStyle(document.documentElement).getPropertyValue(
                        "--yt-spec-brand-background-solid"
                    ) === " #212121"
                ) {
                    document.getElementById("tos").style.color = "white";
                } else {
                    document.getElementById("tos").style.color = "black";
                }
                document.getElementById("tos").style.fontSize = "1.3em";

                document.getElementById("tos").style.paddingTop = "9px";

                if (result == "approved") {
                    document.getElementById("tos").style.color = "Green";
                }

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
    const url = window.location.href;
    const videoId = youtubeParser(url);
    const upvoteButton = document.getElementById("upvote");
    const downvoteButton = document.getElementById("downvote");

    chrome.storage.sync.get(["access_token"], (result) => {
        fetch(
            `https://twitchtos.herokuapp.com/rate?video_id=${videoId}&rating=plus`,
            { headers: { Authorization: result.access_token } }
        )
            .then((r) => r.text())
            .then((result) => {
                if (result === "found") {
                    alert("You have already upvoted this video!");
                    return;
                } else if (result === "Successfuly rated video!") {
                    downvoteButton.parentNode.removeChild(downvoteButton);
                    upvoteButton.style.outline = "auto";
                    upvoteButton.style.outlineOffset = "-4px";
                    init();
                } else {
                    alert(
                        "Failed to upvote video, please try signing in again."
                    );
                    chrome.storage.sync.set({ logged_in: false });
                }
            });
    });
}

function downvote() {
    const url = window.location.href;
    const videoId = youtubeParser(url);
    const upvoteButton = document.getElementById("upvote");
    const downvoteButton = document.getElementById("downvote");

    chrome.storage.sync.get(["access_token"], (result) => {
        fetch(
            `https://twitchtos.herokuapp.com/rate?video_id=${videoId}&rating=minus`,
            { headers: { Authorization: result.access_token } }
        )
            .then((r) => r.text())
            .then((result) => {
                if (result === "found") {
                    alert("You have already downvoted this video!");
                    return;
                } else if (result === "Successfuly rated video!") {
                    upvoteButton.parentNode.removeChild(upvoteButton);
                    downvoteButton.style.outline = "auto";
                    downvoteButton.style.outlineOffset = "-4px";
                    init();
                } else {
                    alert(
                        "Failed to downvote video, please try signing in again."
                    );
                    chrome.storage.sync.set({ logged_in: false });
                }
            });
    });
}

//Special credits to RavenBtw

chrome.storage.sync.get(["badgetoggle"], (result) => {
    if (result.badgetoggle === true) {
        return;
    }
    if (window.location.href.indexOf("twitch")) {
        if (!document.querySelector(".pentalexDiv")) {
            const pentalexDiv = document.createElement("div");
            pentalexDiv.classList.add("pentalexDiv");
            document.body.appendChild(pentalexDiv);

            fetch("https://twitchtos.herokuapp.com/users")
                .then((data) => data.json())
                .then((json) => {
                    const subStylesheet = document.createElement("style");
                    document.head.appendChild(subStylesheet);
                    let chatDiv;
                    const chatObserver = new MutationObserver((mutations) => {
                        function finder(username) {
                            for (let i = 0; i < json.length; i++) {
                                if (
                                    json[i].userName.toLowerCase() === username
                                ) {
                                    return json[i].userVoteLevel;
                                }
                            }
                        }

                        for (const mutation in mutations) {
                            if (mutations[mutation].addedNodes.length) {
                                let username;
                                if (
                                    mutations[
                                        mutation
                                    ].addedNodes[0].querySelector(
                                        "[data-a-user]"
                                    )
                                ) {
                                    username = mutations[
                                        mutation
                                    ].addedNodes[0].querySelector(
                                        "[data-a-user]"
                                    ).dataset.aUser;
                                } else {
                                    username =
                                        mutations[mutation].addedNodes[0]
                                            .dataset.user;
                                }
                                // eslint-disable-next-line no-var
                                var foundUserLevel = finder(username);
                                if (foundUserLevel) {
                                    if (foundUserLevel === 99) {
                                        mutations[mutation].addedNodes[0]
                                            .querySelector(
                                                ".chat-line__username"
                                            )
                                            .insertAdjacentHTML(
                                                "beforebegin",
                                                `<a title="TwitchTOS Donator <3" href="https://chrome.google.com/webstore/detail/monkatos-ratings/iecemifilihdioifbjkecacedfgfbfpl" target="_blank"><img src="${chrome.extension.getURL(
                                                    "18px_donator.png"
                                                )}" class="chat-badge"></a>`
                                            );
                                    } else if (foundUserLevel === 98) {
                                        mutations[mutation].addedNodes[0]
                                            .querySelector(
                                                ".chat-line__username"
                                            )
                                            .insertAdjacentHTML(
                                                "beforebegin",
                                                `<a title="TwitchTOS Beta Tester <3" href="https://chrome.google.com/webstore/detail/monkatos-ratings/iecemifilihdioifbjkecacedfgfbfpl" target="_blank"><img src="${chrome.extension.getURL(
                                                    "18px_betatester.png"
                                                )}" class="chat-badge"></a>`
                                            );
                                    } else if (foundUserLevel >= 5) {
                                        mutations[mutation].addedNodes[0]
                                            .querySelector(
                                                ".chat-line__username"
                                            )
                                            .insertAdjacentHTML(
                                                "beforebegin",
                                                `<a title="TwitchTOS Level ${foundUserLevel}" href="https://chrome.google.com/webstore/detail/monkatos-ratings/iecemifilihdioifbjkecacedfgfbfpl" target="_blank"><img src="https://twitchtos.herokuapp.com/badge?id=${foundUserLevel}"
                                                 class="chat-badge"></a>`
                                            );
                                    } else {
                                        return;
                                    }
                                }
                            }
                        }
                    });
                    setInterval(() => {
                        const currentChatDiv = document.querySelector(
                            ".chat-scrollable-area__message-container"
                        );
                        if (currentChatDiv && chatDiv !== currentChatDiv) {
                            chatDiv = document.querySelector(
                                ".chat-scrollable-area__message-container"
                            );
                            chatObserver.disconnect();
                            chatObserver.observe(chatDiv, {
                                childList: true,
                            });
                        }
                    }, 1000);
                });
        }
    }
});
