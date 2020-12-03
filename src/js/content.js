// eslint-disable-next-line no-unused-vars
import $, { css } from "jquery";
//import { createPopper } from "@popperjs/core";
import tippy from "tippy.js";

import Swal from "sweetalert2";
import "../css/content.css";
import "../img/downvote.png";
import "../img/upvote.png";
import "../img/18px_level1.png";
import "../img/18px_level2.png";
import "../img/18px_level3.png";
import "../img/18px_donator.png";
import "../img/18px_betatester.png";
//import { createPopper } from "@popperjs/core";

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

    const path = chrome.extension.getURL("content.css");

    $("head").append(
        $("<link>")
            .attr("rel", "stylesheet")
            .attr("type", "text/css")
            .attr("href", path)
    );

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
          <img class="hvr-shrink heart" style="cursor: pointer; float: left;padding: 5px;"
               src="${chrome.extension.getURL("upvote.png")}"
               width="24"
               height="24"
               id="upvote" />
          <img class="hvr-shrink heart" style="cursor: pointer; float: left;padding: 5px;"
               src="${chrome.extension.getURL("downvote.png")}"
               width="24"
               height="24"
               id="downvote" />
          <p id="tos" class="hvr-grow"style="float: left;  font-size:1.3em;">
              TOS Score: <span id='scoretext'>${scoreText}(${result})</span>
          </p>
          `
                    );
                }

                const upvoteButton = document.getElementById("upvote");
                const downvoteButton = document.getElementById("downvote");
                const scoreTextElement = document.getElementById("tos");

                if (upvoteButton) {
                    upvoteButton.addEventListener("click", upvote);
                }
                if (downvoteButton) {
                    downvoteButton.addEventListener("click", downvote);
                }
                if (scoreTextElement) {
                    scoreTextElement.addEventListener("click", function () {
                        Swal.fire({
                            title: "Reported Timestamps",
                            footer:
                                "Click on a timestamp to review it! (Don't review on stream!)",
                            html: `<table id="table" border=1 style="margin-left: auto;
                            margin-right: auto;">
                                  <thead>
                                      <tr>
                                          <th>Start Timestamp</th>
                                          <th>-</th>
                                          <th>End Timestamp</th>
                                      </tr>
                                  </thead>
                                  <tbody id="tbody">
                          </tbody>
                          </table>`,
                        });

                        fetch(
                            `https://twitchtos.herokuapp.com/timestamps?video_id=${videoId}`
                        )
                            .then((r) => r.text())
                            .then((result) => {
                                const table = document.getElementById("tbody");
                                result = JSON.parse(result);
                                console.log(result);
                                console.log(result.timestamps1);
                                // eslint-disable-next-line no-var
                                for (
                                    let i = 0;
                                    i < result.timestamps1.length;
                                    i++
                                ) {
                                    console.log(result.timestamps1[i]);
                                    const temp = document.createElement("tr");
                                    table.appendChild(temp);
                                    const startStamp = document.createElement(
                                        "td"
                                    );
                                    console.log(
                                        result.timestamps1[i].split(":").length
                                    );
                                    if (
                                        result.timestamps1[i].split(":")
                                            .length === 3
                                    ) {
                                        const hoursSeconds =
                                            parseInt(
                                                result.timestamps1[i].split(
                                                    ":"
                                                )[0]
                                            ) * 3600;
                                        const minutesSeconds =
                                            parseInt(
                                                result.timestamps1[i].split(
                                                    ":"
                                                )[1]
                                            ) * 60;
                                        const secondsSeconds = parseInt(
                                            result.timestamps1[i].split(":")[2]
                                        );
                                        const lastSeconds = (
                                            hoursSeconds +
                                            minutesSeconds +
                                            secondsSeconds
                                        ).toString();
                                        startStamp.innerHTML = `<a href="https://youtu.be/${videoId}?t=${lastSeconds}">`;
                                    } else if (
                                        result.timestamps1[i].split(":")
                                            .length === 2
                                    ) {
                                        const minutesSeconds =
                                            parseInt(
                                                result.timestamps1[i].split(
                                                    ":"
                                                )[0]
                                            ) * 60;
                                        const secondsSeconds = parseInt(
                                            result.timestamps1[i].split(":")[1]
                                        );
                                        const lastSeconds = (
                                            minutesSeconds + secondsSeconds
                                        ).toString();
                                        startStamp.innerHTML = `<a href="https://youtu.be/${videoId}?t=${lastSeconds}">${result.timestamps1[i]}</a>`;
                                    } else {
                                        const lastSeconds = "??";
                                        startStamp.innerHTML = `<a href="https://youtu.be/${videoId}?t=${lastSeconds}">`;
                                    }

                                    const endStamp = document.createElement(
                                        "td"
                                    );
                                    endStamp.innerHTML = result.timestamps2[i];
                                    const dash = document.createElement("td");
                                    dash.innerHTML = "-";
                                    temp.appendChild(startStamp);
                                    temp.appendChild(dash);
                                    temp.appendChild(endStamp);
                                }
                            });
                    });
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

                tippy("#upvote", {
                    content: "This video is safe!",
                });
                tippy("#downvote", {
                    content: "This video is against TOS!",
                });
                tippy("#tos", {
                    content: "View reported timestamps",
                });
                chrome.storage.sync.get(["access_token"], async (token) => {
                    fetch(
                        `https://twitchtos.herokuapp.com/checkrated?video_id=${videoId}`,
                        {
                            headers: { Authorization: token.access_token },
                        }
                    )
                        .then((r) => r.text())
                        .then((result) => {
                            console.log(result);
                            if (result === "uprated exists") {
                                downvoteButton.style.filter = "grayscale(100%)";
                                upvoteButton.style.filter = "grayscale(0%)";
                            } else if (result === "downrated exists") {
                                downvoteButton.style.filter = "grayscale(0%)";
                                upvoteButton.style.filter = "grayscale(100%)";
                            }
                        });
                });
            });
    });
}

//https://twitchtos.herokuapp.com/rate?video_id=${videoId}&rating=plus
function upvote() {
    const url = window.location.href;
    const videoId = youtubeParser(url);
    const upvoteButton = document.getElementById("upvote");
    const downvoteButton = document.getElementById("downvote");

    chrome.storage.sync.get(["access_token"], (result) => {
        fetch(
            `https://twitchtos.herokuapp.com/rate?video_id=${videoId}&rating=plus`,
            {
                method: "POST",
                headers: { Authorization: result.access_token },
            }
        )
            .then((r) => r.text())
            .then((result) => {
                if (result === "found") {
                    Swal.fire({
                        icon: "error",
                        title: "You have already upvoted this video!",
                        showConfirmButton: false,
                        timer: 1200,
                    });
                    return;
                } else if (result === "Successfuly rated video!") {
                    downvoteButton.parentNode.removeChild(downvoteButton);
                    upvoteButton.style.outline = "auto";
                    upvoteButton.style.outlineOffset = "-4px";
                    init();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Failed to upvote video. Please try again!",
                        showConfirmButton: false,
                        timer: 1500,
                    });
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

    chrome.storage.sync.get(["access_token"], async (token) => {
        fetch(
            `https://twitchtos.herokuapp.com/rate?video_id=${videoId}&rating=minus`,
            {
                method: "POST",
                headers: {
                    Authorization: token.access_token,
                },
            }
        )
            .then((r) => r.text())
            .then(async (result) => {
                if (result === "found") {
                    Swal.fire({
                        icon: "error",
                        title: "You have already downvoted this video!",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    return;
                } else if (result === "Successfuly rated video!") {
                    upvoteButton.parentNode.removeChild(upvoteButton);
                    downvoteButton.style.outline = "auto";
                    downvoteButton.style.outlineOffset = "-4px";
                    init();
                    const { value: formValues } = await Swal.fire({
                        title: "Add Timestamps",
                        showCancelButton: true,
                        confirmButtonText: "Submit",
                        cancelButtonText: "Cancel",
                        html:
                            '<div><label for="swal-input1">Start Timestamp:</label><br><br>' +
                            '<input id="swal-input1" class="swal2-input" placeholder="0:00">' +
                            '<label for="swal-input1">End Timestamp:</label><br><br>' +
                            '<input id="swal-input2" class="swal2-input" placeholder="1:25"></div>',
                        focusConfirm: false,
                        footer:
                            "WARNING: You can only do this once per video. So make sure the timestamps are correct!",
                        preConfirm: () => {
                            return [
                                document.getElementById("swal-input1").value,
                                document.getElementById("swal-input2").value,
                            ];
                        },
                    });
                    fetch(
                        `https://twitchtos.herokuapp.com/addtimestamp?video_id=${videoId}`,
                        {
                            headers: {
                                Authorization: token.access_token,
                                timestamp1: formValues[0],
                                timestamp2: formValues[1],
                            },
                        }
                    )
                        .then((r) => r.text())
                        .then(async (result) => {
                            console.log(result);
                            if (result === "invalid timestamp") {
                                Swal.fire({
                                    icon: "error",
                                    title:
                                        "You entered an invalid timestamp. Please try again!",
                                    showConfirmButton: false,
                                    timer: 1500,
                                });
                            }
                            if (result === "already stamped") {
                                Swal.fire({
                                    icon: "error",
                                    title:
                                        "You have already added a timestamp to this video!",
                                    showConfirmButton: false,
                                    timer: 1500,
                                    width: 500,
                                    height: 300,
                                });
                            }
                            if (result === "Successfully stamped video") {
                                Swal.fire({
                                    icon: "success",
                                    title:
                                        "You have successfully added a timestamp and received bonus XP!",
                                    showConfirmButton: false,
                                    timer: 1500,
                                    width: 500,
                                    height: 300,
                                });
                            }
                        });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Failed to downvote video. Please try again!",
                        showConfirmButton: false,
                        timer: 1500,
                    });
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
