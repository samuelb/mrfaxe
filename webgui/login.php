<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" 
   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
    <head>
        <title>MrFaxe</title>
        <link rel="stylesheet" type="text/css" href="./style.css" />
    </head>
    <body onLoad="">
        <h1 id="headline">MrFaxe</h1>

        <?php
            if (isset($loginerror) && $loginerror) {
        ?>
        <div id="loginerror">
            Login ist fehlgeschlagen. Benutzername und/oder Passwort falsch.
        </div>
        <?php
            }
        ?>

        <form name="login" action="./" method="POST">
            <div id="loginbox">
                <table align="center">
                    <tr>
                        <td class="title"><label>Username:</label></td>
                        <td><input type="text" name="username"/></td>
                    </tr>
                    <tr>
                        <td class="title"><label>Password:</label></td>
                        <td><input type="password" name="password"/></td>
                    </tr>
                </table>
                <input class="button" type="submit" value="Ok" name="login">
            </div>
        </form>

    </body>
</html>
