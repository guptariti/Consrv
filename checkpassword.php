<?php
    $servername = "35.231.176.119";
    $username = "root";
    $password = "";
    
    // Create connection
    $conn = new mysqli($servername, $username, $password,"Consrv");
    
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $userval = $_POST["username"];
    $passval = $_POST["password"];

    $myfile = "session.txt";
    file_put_contents($myfile, $userval) or die("Could not open file");
    $sql = "SELECT " . "username,pass_word" . " FROM Login WHERE pass_word= '". $passval ."';";
    $result = mysqli_query($conn,$sql);
    $rownum = mysqli_num_rows($result);
    if ($rownum>0){
        $yeet="1";
    } 
    else {
        $yeet = "0";
    }
    echo $yeet;
    ?>