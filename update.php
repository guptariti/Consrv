<?php
	$points = $_POST['points'];
	$json = $_POST['json'];
	// $myfile = fopen("session.txt", "r") or die("it died");
	// $username1=fgets($myfile);
	// fclose($myfile);
	$username1 = file_get_contents("session.txt");
	$servername="35.231.176.119";
	$username="root";
	$password = "";
	$conn = new mysqli($servername, $username, $password, "Consrv");
	if ($conn->connect_error) {
		die();
	}
	$sql = "UPDATE Login SET points ='". $points. "' WHERE username= '". $username1 ."';";
	$result = mysqli_query($conn,$sql) or die("failass");
	$sql = "UPDATE Login SET garden ='". $json. "' WHERE username= '". $username1 ."';";
	$result = mysqli_query($conn,$sql) or die("failass");
?>