<?php

define('CONFIG_FILE', '../mrfaxe.conf');
define('ERRCODE_INI', '../errorcodes.ini');
define('NL', "\n");


session_start();

// defuse the evil POST and GET vars
if (!get_magic_quotes_gpc())
{
    $addslashes_deep = create_function
    (
        '$value',
        '$value = is_array($value) ? array_map($GLOBALS[\'addslashes_deep\'], $value) : addslashes($value);' .
        'return $value;'
    );
    
    $_GET    = $addslashes_deep($_GET);
    $_POST   = $addslashes_deep($_POST);
    $_COOKIE = $addslashes_deep($_COOKIE);
    unset($addslashes_deep);
}

import_request_variables('GP');

// workaround to avoid session timeout
if (isset($_REQUEST['ping']))
{
    die('pong');
}

if (isset($_REQUEST['logout']))
{
    if (isset($_SESSION['auth']))
    {
        unset($_SESSION['auth']);
        session_destroy();
    }
    header('Location: ./');
}

if (!is_readable(CONFIG_FILE))
{
    trigger_error('Config file does not exists or ist not readable!', E_USER_ERROR);
    die();
}   
 
if (!$cfg = parse_ini_file(CONFIG_FILE, true))
{
    trigger_error('Faild to read config file', E_USER_ERROR);
    die();
}   
 
try {
    $db = new PDO('sqlite:'.$cfg['dbfile']);
} catch (PDOException $e) {
    trigger_error('Faild to open database', E_USER_ERROR);
    die();
}   

if (!isset($_SESSION['auth']) || !$_SESSION['auth'])
{
    if ($_REQUEST['login'])
    {
        if (!empty($_REQUEST['username']) && !empty($_REQUEST['password']))
        {
            $pwhash = md5($_REQUEST['password']);

            $res = $db->query("SELECT 1 FROM Users WHERE lower(Username) = lower('{$_REQUEST['username']}') AND lower(Password) = lower('{$pwhash}');");
           
            if (1 == $res->fetchColumn())
            {
                $_SESSION['auth'] = true;
                $res->closeCursor();
                header('Location: ./');
            } else {
                $res->closeCursor();
                $loginerror = true;
            }
        }
    }

    if (!defined(NOLOGON) && NOLOGIN)
    {
        require_once './login.php';
        exit();
    }
    else
    {
        trigger_error('AUTHORIZATION REQUIRED', E_USER_ERROR);
        die();
    }
}

?>
