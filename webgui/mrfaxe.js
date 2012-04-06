function initScripts()
{
    initCalendar();
    infoboxObj = new infobox();
    // document.onmousemove = function(e) { infoboxObj.mousemove(e) };a
    lastRequest = false;
    setTimeout('pingServer()', 120000);

}

// Calendar functions
var cal = new Calendar('cal');

// workaround to avoid php session timeout
function pingServer()
{
    ajaxTextRequest('POST', 'request.php?ping', 'ping', function() {});
    setTimeout('pingServer()', 120000);
}

function initCalendar()
{
    cal.setYearElement(document.getElementById('cal_year'));
    cal.setMonthElement(document.getElementById('cal_month'));
    cal.setWeeksElement(document.getElementById('cal_weeks'));
    cal.setActionFunc(getFaxlistByDate);
    cal.print();
}

function getFaxlistByDate(year, month, day)
{
    if (month < 10)
    {
        month = '0' + month; 
    }
    if (day < 10)
    {
        day = '0' + day;
    }

    ajaxXMLRequest('POST', 'request.php?do=list', 'date=' + year + '-' + month + '-' + day, setFaxlist);

    lastRequest = new Array(year, month, day);
}

function getFaxlistBySearch(obj, def)
{
    if (obj.value != def)
    {
        if (obj.value == '')
        {
            obj.value = def;
        }
        else
        {
            ajaxXMLRequest('POST', 'request.php?do=list', 'search=' + obj.value, setFaxlist);
        }
    }
    lastRequest = false;
}

function setFaxlist(xml)
{
    var tbl = document.getElementById('faxlist').getElementsByTagName('tbody')[0];

    while (tbl.rows.length > 0)
    {
        tbl.deleteRow(tbl.rows.length - 1);
    }

    var faxlist = xml.getElementsByTagName('fax');
    for (var i = 0; i < faxlist.length; i++)
    {
        var row = tbl.insertRow(-1);

        // 
        var faxID = (faxlist[i].getElementsByTagName('id')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('id')[0].firstChild.nodeValue : '-';
        var faxDate = (faxlist[i].getElementsByTagName('date')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('date')[0].firstChild.nodeValue : '-';
        var faxFrom = (faxlist[i].getElementsByTagName('from')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('from')[0].firstChild.nodeValue : '-';
        var faxStationID = (faxlist[i].getElementsByTagName('stationid')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('stationid')[0].firstChild.nodeValue.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '-';
        var faxError = (faxlist[i].getElementsByTagName('errorstr')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('errorstr')[0].firstChild.nodeValue : '-';
        var faxErrorNo = (faxlist[i].getElementsByTagName('errorno')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('errorno')[0].firstChild.nodeValue : '-';
        var faxISDNError = (faxlist[i].getElementsByTagName('isdnerror')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('isdnerror')[0].firstChild.nodeValue : '-';
        var faxISDNErrorStr = (faxlist[i].getElementsByTagName('isdnerrorstr')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('isdnerrorstr')[0].firstChild.nodeValue : 'UNKOWN';
        var faxProtError = (faxlist[i].getElementsByTagName('proterror')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('proterror')[0].firstChild.nodeValue : '-';
        var faxProtErrorStr = (faxlist[i].getElementsByTagName('proterrorstr')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('proterrorstr')[0].firstChild.nodeValue : 'UNKOWN';
        var faxFileName = (faxlist[i].getElementsByTagName('filename')[0].hasChildNodes()) ? faxlist[i].getElementsByTagName('filename')[0].firstChild.nodeValue : '-';

        // call from number
        var col = row.insertCell(-1);
        col.innerHTML = faxFrom;

        // stationid
        var col = row.insertCell(-1);
        col.innerHTML = faxStationID;

        // date
        var col = row.insertCell(-1);
        col.innerHTML = faxDate;

        // links ans icons
        var col = row.insertCell(-1);
        col.align = 'right';

        if (faxErrorNo == 0)
        {
            row.className = 'ok';
            
            var a = document.createElement('a');
            col.appendChild(a);
            a.href = 'request.php?do=get&id=' + faxID;
            a.target = '_blank';

            var img = document.createElement('img');
            a.appendChild(img);
            img.src = 'images/go-down.png';
            img.alt = 'download';
        }
        else
        {
            row.className = 'fail';

            var img = document.createElement('img');
            col.appendChild(img);
            img.src = 'images/error.png';
            img.alt = 'error';
        }
        var info = document.createElement('img');
        info.src = 'images/info.png';
        info.alt = 'info';
        info.longdesc = '<table>'
                      + '<tr><th>Fax ID</th><td>' + faxID + '</td></tr>'
                      + '<tr><th>Datum</th><td>' + faxDate + '</td></tr>'
                      + '<tr><th>Stations ID</th><td>' + faxStationID + '</td></tr>'
                      + '<tr><th>Rufnummer</th><td>' + faxFrom + '</td></tr>'
                      + '<tr><th>Error</th><td>' + faxError + ' (' + faxErrorNo + ')</td></tr>'
                      + '<tr><th>ISDN Error</th><td>' + faxISDNError + ' - ' + faxISDNErrorStr + '</td></tr>'
                      + '<tr><th>Prot. Error</th><td>' + faxProtError + ' - ' + faxProtErrorStr + '</td></tr>'
                      + '<tr><th>File</th><td>' + faxFileName + '</td></tr>'
                      + '</table>';

        info.onmouseover = function() { infoboxObj.show(this); };
        info.onmouseout  = function() { infoboxObj.hide() };
        col.appendChild(info);
    }
}

// Ajax
function createAjaxRequestObj()
{
    try
    {
        // Firefox, Safari, Opera ...
        var httpr = new XMLHttpRequest();
    }
    catch (e)
    {   
        // IE
        try
        {
            var httpr = new ActiveXObject('Msxml2.XMLHTTP');
        }
        catch (e)
        {
            try
            {
                var httpr = new ActiveXObject('Microsoft.XMLHTTP');
            }
            catch (e)
            {
                alert('Sorry! Your browser does not support AJAX!');
                return false;
            }
        }
    }
    return httpr;
}

function ajaxXMLRequest(method, url, send, func)
{
    httpr = createAjaxRequestObj();
    httpr.open(method, url);
    httpr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    httpr.onreadystatechange = function()
    {
        if (httpr.readyState == 4 && httpr.status == 200)
        {
            func(httpr.responseXML);
        }
    }
    httpr.send(send);
    return true;
}

function ajaxTextRequest(method, url, send, func)
{
    httpr = createAjaxRequestObj();
    httpr.open(method, url);
    httpr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    httpr.onreadystatechange = function()
    {   
        if (httpr.readyState == 4 && httpr.status == 200)
        {   
            func(httpr.responseText);
        }
    }
    httpr.send(send);
    return true;
}

