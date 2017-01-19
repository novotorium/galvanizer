$(function(){
  "use strict";
  $('a, button').on("click", function(event){
    var text = event.currentTarget.textContent.trim();
    if(text === '×'){
      text = 'close popup';
    }
    ga('send', 'event', 'link', 'click', text);
  });
});
