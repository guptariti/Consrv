window.onload = startfun;
		function startfun () {
			//alert("hi");
			var submitbutton = document.getElementById("submit");
			submitbutton.onclick = checkpass;
		}
		function checkpass () {
			//alert("jiggy");
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "register.php",true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function() {
				if(this.readyState == 4 && this.status == 200) {
					if(xhr.responseText==="1") {
						location.replace("");
					}
					else {

					}

				}
			}
			var username = document.getElementById("username");
			var password = document.getElementById("password");
			var email = document.getElementById("email");
			var userval = username.value;
			var passval = password.value;
			var emailval = email.value;
			xhr.send("username=" + userval + "&password="+passval + "&email=" +emailval);
		}