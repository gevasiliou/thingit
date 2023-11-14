<?php

$var = "Hello World!";
$html = <<<EOT
<div>
   The value of the variable is: $var
</div>
EOT;

echo $html;
