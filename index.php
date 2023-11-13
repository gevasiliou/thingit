<?php
//print_r($_GET);
echo '<br>';
echo 'Hello from Thingit Mr ' . htmlspecialchars($_GET["name"]) . '!';
echo '<br>';
echo '<br>';
echo "finished"
foreach($_GET as $key => $value)
{
//   echo 'Key = ' . $key . '<br />';
//   echo 'Value= ' . $value;
   echo $key.'='.$value.'<br />';
}


/*
    print_r($_POST);

    //Or:
//    foreach ($_POST as $key => $value)
    foreach ($_GET as $key => $value)

        echo $key.'='.$value.'<br />';
*/
?>
