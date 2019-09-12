window.onload = main;

function main() {
    var searchBtn = document.getElementById("searchButton");
    searchBtn.onclick = searchFriends;
}

function searchFriends() {
    var username = document.getElementById("usernameSearch").value;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "share.php",true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if(this.readyState==4 && this.status == 200) {
            location.replace("garden2.html");
        }
    }
    xhr.send("username="+username); 
}