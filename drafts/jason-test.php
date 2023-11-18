<?php
$js = file_get_contents('php://input');
echo 'printing var js:';
echo $js;
echo '<br/>';
$data = json_decode($js,true);
echo 'printing variable data=json_decode(js):';
echo $data;echo '<br/>';
print_r($data);
echo '<br/>';echo '<br/>';
echo 'Now we will do the dweet catch thing:';echo '<br/>';
$url = "https://dweet.io/get/latest/dweet/for/gvt";
$newCurl = curl_init();
curl_setopt($newCurl, CURLOPT_URL, $url);
curl_setopt($newCurl, CURLOPT_RETURNTRANSFER, true);
$data2 = curl_exec($newCurl);
echo $data2;
//$data3 = json_decode($output,true);
$data3 =  json_decode( preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $data2), true ); 
echo $data3;
/* Testing
curl --header "Content-Type:application/json" --header "Accept: application/json" --request POST --data '{"DT":"08/11/2023 16:35:48","VR":"20906,20761,20739"}' http://127.0.0.1/jason-test.php
Response:
ArrayArray
(
    [DT] => 08/11/2023 16:35:48
    [VR] => 20906,20761,20739
)
hello

*/

?>
html_hello
