window.onload = startfun;
function startfun () {
    var submitbutton = document.getElementById("submit");
    submitbutton.onclick = checkpass;
}
function checkpass () {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "checkpassword.php",true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            if(xhr.responseText==="1") {
                
            } else {
                
            }
            window.open("portal.html", "_self", true);
        }
    }
    var username = document.getElementById("username");
    var password = document.getElementById("password");
    var userval = username.value;
    var passval = password.value;
    
    xhr.send("username=" + userval + "&password="+passval);

}