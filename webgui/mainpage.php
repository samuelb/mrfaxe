<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" 
   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
    <head>
        <title>MrFaxe</title>
        <link rel="stylesheet" type="text/css" href="./style.css" />
        <script type="text/javascript" src="calendar.js"></script>
        <script type="text/javascript" src="infobox.js"></script>
        <script type="text/javascript" src="mrfaxe.js"></script>
    </head>
    <body onLoad="initScripts();">
        <h1 id="headline">MrFaxe</h1>

        <?php if ($cfg['dbauth']) { ?>
        <a href="./?logout" id="logout"><img src="images/logout.png" alt="logout"></a>
        <?php } ?>

        <form action="javascript:getFaxlistBySearch(document.getElementById('stext'), 'suchen ...');" class="search">
            <input id="stext" type="text" value="suchen ..." onFocus="this.value = '';" onBlur="if (this.value == '') this.value = 'suchen ...';" /><button type="submit" class="submit"><img src="images/apply.gif" alt="ok" /></button>
        </form>


        <table cellpadding="0" cellspacing="0" class="calendar">
            <thead>
                <tr class="cal_row_year">
                    <td colspan="1"><a href="#" onClick="javascript:cal.yearPrev();cal.print()"><img src="images/go-previous.gif" /></a></td>
                    <th colspan="5" id="cal_year"></th>
                    <td colspan="1"><a href="#" onClick="javascript:cal.yearNext();cal.print()"><img src="images/go-next.gif" /></a></td>
                </tr>
                <tr class="cal_row_month">
                    <td colspan="1"><a href="#" onClick="javascript:cal.monthPrev();cal.print()"><img src="images/go-previous.gif" /></a></td>
                    <th colspan="5" id="cal_month"></th>
                    <td colspan="1"><a href="#" onClick="javascript:cal.monthNext();cal.print()"><img src="images/go-next.gif" /></a></td>
                </tr>
                <tr class="cal_row_week">
                    <th>Mo</th>
                    <th>Di</th>
                    <th>Mi</th>
                    <th>Do</th>
                    <th>Fr</th>
                    <th>Sa</th>
                    <th>So</th>
                </tr>
            </thead>
            <tbody id="cal_weeks">
            </tbody>
        </table>


        <div id="faxlist">
            <table cellspacing="0" cellpadding="0">
                <thead>
                    <tr>
                        <th>Rufnummer</th>
                        <th>Station ID</th>
                        <th>Datum</th>
                        <th width="50"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th colspan="4">
                            <h2>Tag w&auml;hlen</h2>
                        </th>
                    </tr>
                </tbody>
            </table>
        </div>

    </body>
</html>
