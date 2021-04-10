<?php
class Util { 
    private static $configFolderPath = '/../config/';
    private static $configFileName = 'config.json';
    private static $configBaseFileName = 'config-base.json';

    public static function get_config() {
        $path = dirname(__FILE__).Util::$configFolderPath.Util::$configFileName;

        if (!file_exists($path)) {
            Util::create_default_config();
        }

        $file = @file_get_contents($path);

        if ($file === false) {
            throw new Exception('Could not open config file.');
        }

        return json_decode($file, true);
    }

    public static function save_config($config) {
        $path = dirname(__FILE__).Util::$configFolderPath.Util::$configFileName;
        $version = self::generate_version();
        $config['version'] = $version;
        $json = json_encode($config, JSON_PRETTY_PRINT);
        $resp = @file_put_contents($path, $json);

        if ($resp === false) {
            throw new Exception('Could not save config file.');
        }

        return $version;
    }

    private static function create_default_config() {
        $basePath = dirname(__FILE__).Util::$configFolderPath.Util::$configBaseFileName;
        $path = dirname(__FILE__).Util::$configFolderPath.Util::$configFileName;
        echo copy($basePath, $path);
    }

    private static function generate_version() {
        return date('YmdHisv');
    }
}
?>