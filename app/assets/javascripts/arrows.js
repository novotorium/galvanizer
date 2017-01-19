function parallax() {
  var styles = document.styleSheets[1];
  var num = -(window.pageYOffset /8)+'px';
  var num2 = 65-(window.pageYOffset / 40)+'px';
  styles.addRule(".triangle-left:after", "bottom:"+ num +" !important;");
  styles.addRule(".triangle-right:after", "bottom:"+ num +" !important;");
  styles.addRule(".triangle-bottom:after", "bottom:"+ num2 +" !important;");
}
window.addEventListener("scroll",parallax,false);
