import $ from "jquery";
import browser from "webextension-polyfill";

import "../img/downvote.png";
import "../img/upvote.png";
import "../img/18px_level1.png";
import "../img/18px_level2.png";
import "../img/18px_level3.png";
import "../img/18px_donator.png";
import "../img/18px_betatester.png";

console.log("Running script");

function youtubeParser(url) {
    const regexp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regexp);
    return match && match[7].length == 11 ? match[7] : false;
}

browser.runtime.onMessage.addListener((_request, _sender, _sendResponse) => {
    console.log("page change");

    setTimeout(() => {
        init();
    }, 500);
});

async function elementLoaded(el) {
    if ($(el).length) {
        // Element is now loaded.
        return $(el);
    } else {
        // Repeat every 500ms.
        setTimeout(async () => {
            await elementLoaded(el);
        }, 500);
    }
}

async function init() {
    const url = window.location.href;
    const videoId = youtubeParser(url);
    console.log(videoId);
    if (videoId == false) {
        return;
    }

    await elementLoaded(".ytd-video-primary-info-renderer");
    const response = await fetch(
        `https://twitchtos.herokuapp.com/getrating?video_id=${videoId}`
    );
    const text = await response.text();
    console.log(text);
    let scoreText;
    const parsed = parseInt(text);
    if (parsed > 0 && parsed < 3) {
        scoreText = "Decent";
    } else if (parsed < 0 && parsed > -3) {
        scoreText = "Bad";
    } else if (parsed <= -3) {
        scoreText = "Terrible";
    } else if (parsed >= 3) {
        scoreText = "Good";
    }

    const el = document.getElementsByClassName(
        "ytd-video-primary-info-renderer"
    )[0].children[5].children[1];
    console.log(
        document.getElementsByClassName("ytd-video-primary-info-renderer")[0]
            .children[5]
    );
    $(".toscontainer").empty();
    $(".toscontainer").remove();
    el.insertAdjacentHTML("beforeend", '<div class="toscontainer"></div>');

    const upvoteURL = browser.runtime.getURL("upvote.png");
    const downvoteURL = browser.runtime.getURL("downvote.png");
    if (text == "approved") {
        $(".toscontainer").append(
            `
        <img style="float: left;padding: 5px;"
             src="${upvoteURL}"
             width="24"
             height="24"
             id="upvote" />
        <img style="float: left;display: none;"
             src="${downvoteURL}"
             width="24"
             height="24"
             id="downvote" />
        <p id="tos" style="float: left;  padding 5px;">The creator of this video is guaranteed to be TOS friendly.</span></p>
        `
        );
    } else if (text == "0") {
        $(".toscontainer").append(
            `
        <img style="cursor: pointer; float: left;padding: 5px;"
             src="${upvoteURL}"
             width="24"
             height="24"
             id="upvote" />
        <img style="cursor: pointer; float: left;padding: 5px;"
             src="${downvoteURL}"
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
               src="${upvoteURL}"
               width="24"
               height="24"
               id="upvote" />
          <img style="cursor: pointer; float: left;padding: 5px;"
               src="${downvoteURL}"
               width="24"
               height="24"
               id="downvote" />
          <p id="tos" style="float: left;  padding 5px;">
              TOS Score: <span id='scoretext'>${scoreText}(${text})</span>
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

    if (text == "approved") {
        document.getElementById("tos").style.color = "Green";
    }

    if (scoreText == "Good") {
        document.getElementById("scoretext").style.color = "Green";
    }
    if (scoreText == "Decent") {
        document.getElementById("scoretext").style.color = "GreenYellow";
    }
    if (scoreText == "Bad") {
        document.getElementById("scoretext").style.color = "IndianRed";
    }
    if (scoreText == "Terrible") {
        document.getElementById("scoretext").style.color = "Red";
    }
}

async function upvote() {
    const url = window.location.href;
    const videoId = youtubeParser(url);
    const upvoteButton = document.getElementById("upvote");
    const downvoteButton = document.getElementById("downvote");

    const result = await browser.storage.sync.get(["access_token"]);
    const response = await fetch(
        `https://twitchtos.herokuapp.com/rate?video_id=${videoId}&rating=plus`,
        { headers: { Authorization: result.access_token } }
    );
    const text = await response.text();
    console.log(text);
    if (text === "found") {
        alert("You have already upvoted this video!");
        return;
    } else if (text === "Successfuly rated video!") {
        console.log(text);
        downvoteButton.parentNode.removeChild(downvoteButton);
        upvoteButton.style.outline = "auto";
        upvoteButton.style.outlineOffset = "-4px";
        await init();
    } else {
        alert("Failed to upvote video, please try signing in again.");
        await browser.storage.sync.set({ logged_in: false });
    }
}

async function downvote() {
    const url = window.location.href;
    const videoId = youtubeParser(url);
    const upvoteButton = document.getElementById("upvote");
    const downvoteButton = document.getElementById("downvote");

    const result = await browser.storage.sync.get(["access_token"]);
    const response = await fetch(
        `https://twitchtos.herokuapp.com/rate?video_id=${videoId}&rating=minus`,
        { headers: { Authorization: result.access_token } }
    );
    const text = await response.text();
    if (text === "found") {
        alert("You have already downvoted this video!");
        return;
    } else if (text === "Successfuly rated video!") {
        console.log(text);
        upvoteButton.parentNode.removeChild(upvoteButton);
        downvoteButton.style.outline = "auto";
        downvoteButton.style.outlineOffset = "-4px";
        init();
    } else {
        alert("Failed to downvote video, please try signing in again.");
        await browser.storage.sync.set({ logged_in: false });
    }
}

const donatorURL = browser.runtime.getURL("18px_donator.png");
const betaTesterURL = browser.runtime.getURL("18px_betatester.png");

//Special credits to RavenBtw
if (window.location.href.indexOf("twitch")) {
    if (!document.querySelector(".pentalexDiv")) {
        const pentalexDiv = document.createElement("div");
        pentalexDiv.classList.add("pentalexDiv");
        document.body.appendChild(pentalexDiv);

        fetch("https://twitchtos.herokuapp.com/users")
            .then((data) => data.json())
            .then((json) => {
                console.log(json);
                const subStylesheet = document.createElement("style");
                document.head.appendChild(subStylesheet);
                let chatDiv;
                const chatObserver = new MutationObserver((mutations) => {
                    function finder(username) {
                        console.log(json.length);
                        for (let i = 0; i < json.length; i++) {
                            console.log(i);
                            if (json[i].userName.toLowerCase() === username) {
                                return json[i].userVoteLevel;
                            }
                        }
                    }

                    for (const mutation in mutations) {
                        if (mutations[mutation].addedNodes.length) {
                            let username;
                            if (
                                mutations[mutation].addedNodes[0].querySelector(
                                    "[data-a-user]"
                                )
                            ) {
                                username = mutations[
                                    mutation
                                ].addedNodes[0].querySelector("[data-a-user]")
                                    .dataset.aUser;
                            } else {
                                username =
                                    mutations[mutation].addedNodes[0].dataset
                                        .user;
                            }
                            console.log(username);
                            // eslint-disable-next-line no-var
                            var foundUserLevel = finder(username);
                            if (foundUserLevel) {
                                if (foundUserLevel === 99) {
                                    console.log("Username found");
                                    mutations[mutation].addedNodes[0]
                                        .querySelector(".chat-line__username")
                                        .insertAdjacentHTML(
                                            "beforebegin",
                                            `<a title="TwitchTOS Donator <3"
                                                               href="https://chrome.google.com/webstore/detail/monkatos-ratings/iecemifilihdioifbjkecacedfgfbfpl"
                                                               target="_blank">
                                                                   <img src="${donatorURL}" class="chat-badge">
                                                            </a>`
                                        );
                                } else if (foundUserLevel === 98) {
                                    console.log("Username found");
                                    mutations[mutation].addedNodes[0]
                                        .querySelector(".chat-line__username")
                                        .insertAdjacentHTML(
                                            "beforebegin",
                                            `<a title="TwitchTOS Beta Tester <3"
                                                               href="https://chrome.google.com/webstore/detail/monkatos-ratings/iecemifilihdioifbjkecacedfgfbfpl"
                                                               target="_blank">
                                                                   <img src="${betaTesterURL}" class="chat-badge">
                                                               </a>`
                                        );
                                } else {
                                    console.log("Username found");
                                    mutations[mutation].addedNodes[0]
                                        .querySelector(".chat-line__username")
                                        .insertAdjacentHTML(
                                            "beforebegin",
                                            `<a title="TwitchTOS Level ${foundUserLevel}"
                                                               href="https://chrome.google.com/webstore/detail/monkatos-ratings/iecemifilihdioifbjkecacedfgfbfpl"
                                                               target="_blank">
                                                                   <img src="${browser.runtime.getURL(
                                                                       `18px_level${foundUserLevel}.png`
                                                                   )}" class="chat-badge">
                                                               </a>`
                                        );
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
