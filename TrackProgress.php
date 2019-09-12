<?php
$points = $_POST['epoints'];
$username1 = file_get_contents("session.txt");
$servername = "35.231.176.119";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password, "Consrv");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 
echo "Connected successfully";
$sql = "SELECT points FROM Login WHERE username='" . $username1 ."';";
$result = mysqli_query($conn, $sql);
$temppoints = mysqli_fetch_assoc($result);
$finalpoints = intval($temppoints['points']) + $points;
$sql = "UPDATE Login SET points='" . $finalpoints ."' WHERE username='" . $username1 . "';";
$result = mysqli_query($conn, $sql);


?>