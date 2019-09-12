<?php 

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

$userval = $_POST["username"];
$passval = $_POST["password"];
$emailval = $_POST["email"];
$yeet=0;
$sql = "INSERT INTO Login (username, pass_word, email) VALUES (". '"' . $userval . '"' . "," . '"' . $passval . '"' ."," . '"' . $emailval . '"' .");";
$result = mysqli_query($conn, $sql);

?>