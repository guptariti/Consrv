<?php
$username1 = $_POST['username'];
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

$myfile = "target.txt";
file_put_contents($myfile, $username1);

$sql = "SELECT garden FROM Login WHERE username= '". $username1 ."';";
$result = mysqli_query($conn,$sql);
$temp = mysqli_fetch_assoc($result);
echo $temp['garden'];
?>