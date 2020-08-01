<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/plain; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

try {
    $newMenuId = $_GET['id'];

    $configPath = '../../../../../../config/config.json';
    $config = json_decode(file_get_contents($configPath), true);

    if (array_key_exists($newMenuId, $config['menus'])) {
        $config['currentMenuId'] = $newMenuId;
        $configFile = fopen($configPath, "w");
        $configTxt = json_encode($config, JSON_PRETTY_PRINT);
        fwrite($configFile, $configTxt);
        fclose($configFile);

        echo 'Success';
    } else {
        echo "Invalid menu id.";
    } 
} catch (Exception $e) {
    echo 'Faied';
}
?>