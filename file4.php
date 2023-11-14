<?php

$needle = "VR";
$content = file_get_contents('./dweet.txt');
//echo $content; //this works and prints out the whole file, but i think the whole file is printed as a single line!
$newcontent=str_replace('}','}\n',$content);
//echo $newcontent;
preg_match($needle, $newcontent, $line);
echo $line[1];

$str = "Visit W3Schools";
$pattern = "/w3schools/i";
//echo 
preg_match($pattern, $str,$ll);
echo $ll[0];

?>
<br/>
This is a hello message Outside of php - pure html!
