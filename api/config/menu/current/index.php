<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$configUrl = '../../../../config/config.json';
$config = json_decode(file_get_contents($configUrl), true);
$menus = $config['menus'];
$currMenuId = $config['currentMenuId'];

$menu = (object) [
  'version' => $config['version'],
  'progressionDelay' => $config['progressionDelay'],
  'menuId' => $currMenuId,
  'menu' => $menus[$currMenuId],
];

  echo json_encode($menu);
?>