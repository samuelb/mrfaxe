<?php

define('NOLOGIN', true);
require_once './init.php';


function createXMLAttr($name, $value)
{
    $value = htmlentities(trim($value));
    if ($value == "")
    {
        return "<$name/>";
    }
    else
    {
        return "<$name>$value</$name>";
    }
}

$errordesc = array(
    0  => 'No Error',
    2  => 'Unkown Error',
    4  => 'Receive Error',
    8  => 'Convert Error',
    16 => 'Archive Error',
    32 => 'Print Error'
);


if (is_readable(ERRCODE_INI))
{
    $errorcodes = parse_ini_file(ERRCODE_INI);
}
else
{
    $errrorcodes = false;
}

function getErrStr($error)
{
    global $errorcodes;

    if ($errorcodes && isset($errorcodes[dechex($error)]))
    {
        return $errorcodes[dechex($error)];
    }
    return null;
}


if (empty($_REQUEST['do']))
{
    trigger_error('GET Argument \'?do=...\' missing - nothing to do ...', E_USER_ERROR);
    die();
}

switch ($_REQUEST['do'])
{
    case 'list':
        $query = 'SELECT ID, CallDate, CallFrom, StationID, Error, ISDNError, ProtError, FileName FROM Calls WHERE ';
        if (!empty($_REQUEST['date']))
        {
            $query .= "CallDate > '{$_REQUEST['date']} 00:00:00' AND CallDate < '{$_REQUEST['date']} 24:00:00'";
        }
        else if (!empty($_REQUEST['search']))
        {   
            $search = str_replace('*', '%', $_REQUEST['search']);
            $query .= "CallFrom LIKE '%$search%' OR StationID LIKE '%$search%'";
        }
        else
        {
            trigger_error('Missing Parameter - Nothing to do ...', E_USER_ERROR);
            break;
        }

        if (!$res = $db->query($query . ' ORDER BY CallDate ASC;'))
        {
            trigger_error('Database query faild', E_USER_ERROR);
            break;
        }

        $xml = '';

        while ($data = $res->fetch(PDO::FETCH_ASSOC))
        {
            $xml .= '<fax>' . NL
                  . createXMLAttr('id', $data['ID']) . NL
                  . createXMLAttr('date', $data['CallDate']) . NL
                  . createXMLAttr('from', $data['CallFrom']) . NL
                  . createXMLAttr('stationid', $data['StationID']) . NL
                  . createXMLAttr('errorno', $data['Error']) . NL
                  . createXMLAttr('errorstr', $errordesc[$data['Error']]) . NL
                  . createXMLAttr('isdnerror', dechex($data['ISDNError'])) . NL
                  . createXMLAttr('isdnerrorstr', getErrStr($data['ISDNError'])) . NL
                  . createXMLAttr('proterror', dechex($data['ProtError'])) . NL
                  . createXMLAttr('proterrorstr', getErrStr($data['ProtError'])) . NL
                  . createXMLAttr('filename', $data['FileName']) . NL
                  . '</fax>' . NL;
        }

        header('Content-type: text/xml');
        echo '<?xml version="1.0" encoding="ISO-8859-1" ?>' . NL
           . '<faxlist>' . NL
           . $xml
           . '</faxlist>' . NL;

        $res->closeCursor();
        break;

    case 'get':
        if (empty($_REQUEST['id']))
        {
            trigger_error('No fax id given', E_USER_ERROR);
            break;
        }
        
        if (!$res = $db->query("SELECT FileName FROM Calls WHERE ID = '{$_REQUEST['id']}';"))
        {
            trigger_error('Database query faild', E_USER_ERROR);
            break;
        }
        
        $data = $res->fetch(PDO::FETCH_ASSOC);
        $res->closeCursor();

        if (is_readable($data['FileName']))
        {
             header('Content-type: application/pdf');
             header('Content-Disposition: attachment; filename="fax_'.substr($data['FileName'], strrpos($data['FileName'], '/') + 1).'"');
             readfile($data['FileName']);
        }
        else
        {
            trigger_error('Requested fax file does not exist!', E_USER_ERROR);
        }
        break;
    default:
        trigger_error('Invalid do value', E_USER_ERROR);
        break;
}

?>
