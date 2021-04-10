<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once(dirname(__FILE__).'/../../../../Util.php');

try {
    $rawPostBody = file_get_contents('php://input');
    $postData = json_decode($rawPostBody, true);

    if (isset($postData['menuId'])) {
        $menuId = $postData['menuId'];
        $config = Util::get_config();
        $config['currentMenuId'] = $menuId;
        $version = Util::save_config($config);
        echo $version;
    } else {
        http_response_code(400);
        echo 'Menu not in POST body.';
    }
}
catch (exception $e) {
    http_response_code(500);
    echo $e->getMessage();
}
?>