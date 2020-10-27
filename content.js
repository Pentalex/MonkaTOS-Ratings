


function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('page change')

  setTimeout(function() {init()}, 500)
});

function elementLoaded(el, cb) {
    if ($(el).length) {
      // Element is now loaded.
      cb($(el));
    } else {
      // Repeat every 500ms.
      setTimeout(function() {
        elementLoaded(el, cb)
      }, 500);
    }
  };


function init(){
var url = window.location.href
var video_id = youtube_parser(url)
console.log(video_id)

elementLoaded('.ytd-video-primary-info-renderer', function(el) {
    
  console.log("We're on a video!")
      
      


fetch('https://twitchtos.herokuapp.com/getrating?video_id=' + video_id).then(r => r.text()).then(result => {
    console.log(result)
      if(parseInt(result) > 0 && parseInt(result) < 3){
        var scoretxt = 'Decent'
      }
        if(parseInt(result)< 0 && parseInt(result) > -3){
          var scoretxt = 'Bad'
        }
        if(parseInt(result) <  -3){
          var scoretxt = 'Terrible'
        }
        if(parseInt(result) >  3){
          var scoretxt = 'Good'
        }

        
        var el = document.getElementsByClassName('ytd-video-primary-info-renderer')[0].children[5].children[1]
        console.log(document.getElementsByClassName('ytd-video-primary-info-renderer')[0].children[5])
        $( ".toscontainer" ).empty()
        $( ".toscontainer" ).remove()
        el.insertAdjacentHTML('beforeend', '<div class="toscontainer"></div>')
        if(result == '0'){
          
          $( ".toscontainer" ).append( `
        <img style="cursor: pointer; float: left;padding: 5px;" src="` + chrome.extension.getURL("images/upvote.png") +`" width="24" height="24" id="upvote" />
        <img style="cursor: pointer; float: left;padding: 5px;" src="` + chrome.extension.getURL("images/downvote.png") +`" width="24" height="24" id="downvote" />
        <p id="tos" style="float: left;  padding 5px;">This video hasn't been rated.</span></p>
        `);
        }
        else{
          $( ".toscontainer" ).empty()
          $( ".toscontainer" ).append( `
          <img style="cursor: pointer; float: left;padding: 5px;" src="` + chrome.extension.getURL("images/upvote.png") +`" width="24" height="24" id="upvote" />
          <img style="cursor: pointer; float: left;padding: 5px;" src="` + chrome.extension.getURL("images/downvote.png") +`" width="24" height="24" id="downvote" />
          <p id="tos" style="float: left;  padding 5px;">TOS Score: <span id='scoretext'>` + scoretxt + ` (` + result +`)</span></p>
          `);
        }
        
        upvotebutton = document.getElementById('upvote')
        downvotebutton = document.getElementById('downvote')
        upvotebutton.addEventListener('click', upvote)
        downvotebutton.addEventListener('click', downvote)

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.getElementById('tos').style.color = 'white'
        }
        else{
          document.getElementById('tos').style.color = 'black'
        }
        document.getElementById('tos').style.fontSize = 'medium'

        document.getElementById('tos').style.paddingTop = '7px'
        
        if(scoretxt == 'Good'){
          document.getElementById('scoretext').style.color = "Green"
        }
        if(scoretxt == 'Decent'){
          document.getElementById('scoretext').style.color = "GreenYellow"
        }
        if(scoretxt == 'Bad'){
          document.getElementById('scoretext').style.color = "IndianRed"
        }
        if(scoretxt == 'Terrible'){
          document.getElementById('scoretext').style.color = "Red"
        }
        

        

        

      })
      
      
  });
}


function upvote(){
  var url = window.location.href
  var video_id = youtube_parser(url)
  upvotebutton = document.getElementById('upvote')
  downvotebutton = document.getElementById('downvote')

  chrome.storage.sync.get(['access_token'], function(result){
    fetch('https://twitchtos.herokuapp.com/rate?video_id=' + video_id + '&rating=plus', {headers: {'Authorization': result.access_token}}).then(r => r.text()).then(result => {
    console.log(result)
    if(result == 'found'){
      alert('You have already upvoted this video!')
      return
    }
    else{
      downvotebutton.parentNode.removeChild(downvotebutton);
      upvotebutton.style.outline = 'auto'
      upvotebutton.style.outlineOffset = '-4px'
      console.log('Upvoted!')
    }
    })
    
  })
}

function refresh(){
  
}
function downvote(){
  var url = window.location.href
  var video_id = youtube_parser(url)
  upvotebutton = document.getElementById('upvote')
  downvotebutton = document.getElementById('downvote')
  
  chrome.storage.sync.get(['access_token'], function(result){
    fetch('https://twitchtos.herokuapp.com/rate?video_id=' + video_id + '&rating=minus', {headers: {'Authorization': result.access_token}}).then(r => r.text()).then(result => {
    if(result == 'found'){
      alert('You have already downvoted this video!')
      return
    }
    else{
      upvotebutton.parentNode.removeChild(upvotebutton);
      downvotebutton.style.outline = 'auto'
      downvotebutton.style.outlineOffset = '-4px'
      console.log('Downvoted!')
    }
    })
    
  })

  
}







