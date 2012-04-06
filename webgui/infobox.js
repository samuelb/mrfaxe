function infobox()
{
    this.offsetX = 0;
    this.offsetY = 24;
    this.maxposY = 0;
    this.body    = (document.compatMode && document.compatMode != 'BackCompat') ? document.documentElement : document.body;
    this.isIE    = (document.all) ? true : false;
    this.isNS6   = (document.getElementById && !document.all) ? true : false;
    this.htmlbox = document.createElement('div');
    this.htmlbox.id = 'infobox';
    this.htmlbox.style.visibility = 'hidden';
    this.htmlbox.style.position   = 'absolute';
    document.body.appendChild(this.htmlbox);


    this.mousemove = function(e)
    {
        var posX = (this.isNS6) ? e.pageX : event.clientX + this.body.scrollLeft;
        var posY = (this.isNS6) ? e.pageY : event.clientY + this.body.scrollTop;

        var bottomedge = (this.isIE && !window.opera) ? this.body.clientHeight - event.clientY - this.offsetY : window.innerHeight - e.clientY - this.offsetY - 20;
        
        this.htmlbox.style.left = (this.isIE) ? this.body.scrollLeft + event.clientX - this.htmlbox.offsetWidth - this.offsetX + 'px' : window.pageXOffset + e.clientX - this.htmlbox.offsetWidth - this.offsetX + 'px';

        if (bottomedge < this.htmlbox.offsetHeight)
        {
            if (this.maxposY == 0) this.maxposY = posY + this.offsetY;
            this.htmlbox.style.top = this.maxposY + 'px';
        }
        else
        {
            if (this.maxposY > 0) this.maxposY = 0;
            this.htmlbox.style.top = posY + this.offsetY + 'px';
        }
    }

    this.move = function(x, y)
    {
        this.htmlbox.style.left = x + this.offsetX + 'px';
        this.htmlbox.style.top  = y + this.offsetY + 'px';
    }

    this.setPosFromObj = function(obj)
    {
        var curleft = 0;
        var curtop  = 0;
        if (obj.offsetParent)
        {
            while (1) 
            {
                curleft += obj.offsetLeft;
                curtop  += obj.offsetTop;
                if (!obj.offsetParent)
                {
                    break;
                }
                obj = obj.offsetParent;
            }
        }
        else if (obj.x)
        {
            curleft += obj.x;
            curtop  += obj.y;
        }
        this.htmlbox.style.left = curleft - this.htmlbox.offsetWidth - this.offsetX + 'px';
        this.htmlbox.style.top = curtop + this.offsetY + 'px';
    }

    this.show = function(obj)
    {
        this.htmlbox.innerHTML = obj.longdesc;
        this.setPosFromObj(obj);
        //this.htmlbox.style.position = 'fixed';
        //this.htmlbox.style.top = '20px';
        //this.htmlbox.style.right = '100px';
        this.htmlbox.style.visibility = 'visible';
    }

    this.hide = function()
    {
        this.htmlbox.style.visibility = 'hidden';
    }
}
