<?php
class Util { 
    private static $configFolderPath = '/../config/';
    private static $configFileName = 'config.json';

    public static function get_config() {
        $path = dirname(__FILE__).Util::$configFolderPath.Util::$configFileName;
        $file = file_get_contents($path);
        return json_decode($file, true);
    }

    public static function save_config($config) {
        $path = dirname(__FILE__).Util::$configFolderPath.Util::$configFileName;
        $version = self::generateVersion();
        $config['version'] = $version;
        $json = json_encode($config, JSON_PRETTY_PRINT);
        file_put_contents($path, $json);
        return $version;
    }

    private static function generateVersion() {
        return date('YmdHisv');
    }
}
?>