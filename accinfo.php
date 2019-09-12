<?php 
$myfile = fopen("session.txt", "r");
$username1=fgets($myfile);
fclose($myfile);
$servername = "35.231.176.119";
    $username = "root";
    $password = "";
    
    // Create connection
    $conn = new mysqli($servername, $username, $password,"Consrv");
    
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    $sql = "SELECT * FROM Login WHERE username='" . $username1 . "';";

    $result = mysqli_query($conn,$sql) or die("failed");
    $row = mysqli_fetch_assoc($result) or die("failed");
    $myJSON = json_encode($row);
    echo $myJSON;
    file_put_contents("json_demo.txt", $myJSON) or die("Could not open file");


?>