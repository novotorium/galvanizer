$(function(){
  "use strict";
  $('a, button').on("click", function(event){
    var text = event.currentTarget.textContent.trim();
    ga('send', 'event', 'link', 'click', text);
    console.log("Event label: "+text);
  });
});
