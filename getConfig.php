var config = <?php
if (file_exists('config.json')) {   
    echo file_get_contents("config.json");
} else {    
    echo "nope";
} ?>;