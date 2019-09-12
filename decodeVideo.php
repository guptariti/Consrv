<?php
$servername = "35.231.176.119";
$username = "root";
$password = "";

try {
	$conn = new PDO("mysql:host=$servername;dbname=Consrv", $username, $password);
    // set the PDO error mode to exception
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	//echo "Connected successfully"; 
}
catch(PDOException $e)
{
	echo "Connection failed: " . $e->getMessage();
}

	//start of that bullshit
$keycode="0CB5AF045CA6D473";
$EAN = $_POST['ean'];

//echo "test for curtis";

$raw=file_get_contents("http://eandata.com/feed/?v=3&mode=json&keycode=".urlencode($keycode)."&find=".$EAN);

$reply=json_decode($raw);


header("content-type:text/plain");

//echo "Status: ".$reply->status->code."\n";

if($reply->status->code!=200)
{
	// echo "Message: ".$reply->status->message."\n";
}

else
{
		// if(isset($reply->product->attributes->product))            echo "Product: ".$reply->product->attributes->product."\n";
		// if(isset($reply->company->name))            echo "Company: ".$reply->company->name."\n";
		// if(isset($reply->product->attributes->description))        echo "Description: ".$reply->product->attributes->description."\n";
		// if(isset($reply->product->attributes->category_text_long)) echo "Category: ".$reply->product->attributes->category_text_long."\n";
		// //if(isset($reply->product->attributes->long_desc))          echo "Long: ".$reply->product->attributes->long_desc."\n";
		// if(isset($reply->product->image))                          echo "Image: ".$reply->product->image."\n";
}

// echo "\n\n\n\n";
	//var_dump($reply);
$servername = "35.231.176.119";
$username = "root";
$password = "";
$scorefinal=0;

    // Create connection
$conn = new mysqli($servername, $username, $password,"Consrv");

    // Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

$sql="";

$product =substr($reply->product->attributes->product, 0,7)or die("not an Eco friendly product");
if (strpos($product, '&') !== false){
	$product =str_replace("&","and", $product);
}
if (is_null($reply->company->name) == false) {
	$compname = substr($reply->company->name, 0,7);
	if (strpos($compname, '&') !== false){
		$compname =str_replace("&","and", $compname);
	}
	$sql = "SELECT overall_score FROM comps WHERE company_name LIKE'" . $compname . "%';";
	$result =mysqli_query($conn,$sql);
	//echo $sql;
	if (mysqli_num_rows($result)>0){
		$scores= mysqli_fetch_assoc($result);
		$scorefinal = intval($scores['overall_score'])/5;
		//echo $scorefinal;
	}
	else {


		$sql = "SELECT overall_score FROM comps WHERE company_name LIKE'" . $product . "%';";
		$result =mysqli_query($conn,$sql);
		//echo $sql;
		if (mysqli_num_rows($result)>0){
			$scores= mysqli_fetch_assoc($result);
			$scorefinal = intval($scores['overall_score']/5);
			//echo $scorefinal;
		}
		else {
			//echo "this product is not eco friendly";
		}

	}

}
else {
	$sql = "SELECT overall_score FROM comps WHERE company_name LIKE'" . $product . "%';";
	$result =mysqli_query($conn,$sql);
	//echo $sql;
	if (mysqli_num_rows($result)>0){
		$scores= mysqli_fetch_assoc($result);
		$scorefinal = intval($scores['overall_score']/5);
		//echo $scorefinal;
	}
	else {
		echo "this product is not eco friendly";
	}
}
$myfile = fopen("session.txt", "r");
$username1=fgets($myfile);
fclose($myfile);
$sql =  "SELECT " . "points" . " FROM Login WHERE username= '". $username1 ."';";
$result = mysqli_query($conn, $sql);
$temp = mysqli_fetch_assoc($result);
$temp1 = intval($temp['points']);
$updatepoints = $temp1+$scorefinal;
echo $scorefinal;
$sql = "UPDATE Login SET points ='". $updatepoints . "' WHERE username= '". $username1 ."';";
$result = mysqli_query($conn,$sql) or die("failass");



?>