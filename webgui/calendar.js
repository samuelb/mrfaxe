function Calendar(instName)
{
    this.instName     = instName;
    this.today        = new Date();
    this.date         = new Date();
    this.yearElement  = '';
    this.monthElement = '';
    this.weeksElement = '';
    this.actionFunc   = '';

    this.setYearElement = function(value)
    {
        this.yearElement = value;
    }

    this.setMonthElement = function(value)
    {
        this.monthElement = value;
    }

    this.setWeeksElement = function(value)
    {
        this.weeksElement = value;
    }

    this.setActionFunc = function(func)
    {
        this.actionFunc = func;
    }

    this.yearNext = function()
    {
        this.date.setFullYear(this.date.getFullYear() + 1);
    }

    this.yearPrev = function()
    {
        this.date.setFullYear(this.date.getFullYear() - 1);
    }

    this.monthNext = function()
    {
        if (this.date.getMonth() >= 11)
        {
            this.yearNext();
            this.date.setMonth(0);
        }
        else
        {
            this.date.setMonth(this.date.getMonth() + 1);
        }
    }

    this.monthPrev = function()
    {
        if (this.date.getMonth() <= 0)
        {
            this.yearPrev();
            this.date.setMonth(11);
        }
        else
        {
            this.date.setMonth(this.date.getMonth() - 1);
        }
    }

    this.action = function(day)
    {
        return this.actionFunc(this.date.getFullYear(), this.date.getMonth() + 1, day);
    }

    this.getMonthDays = function()
    {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (this.date.getMonth() == 1)
        {
            if (this.date.getFullYear() % 4 != 0
            || (this.date.getFullYear() % 100 == 0
                && this.date.getFullYear() % 400 != 0))
            {
                return daysInMonth[1];
            }
            else
            {
                return daysInMonth[1] + 1;
            }
        }
        return daysInMonth[this.date.getMonth()];
    }

    this.getFirstDay = function()
    {
        var orgDate = this.date.getDate();
        this.date.setDate(1);
        var day = this.date.getDay();
        this.date.setDate(orgDate);
        return day;
    }

    this.getMonthName = function(month)
    {
        var monthName = ['Januar', 'Februar', 'M&auml;rz', 'April', 'Mai', 'Juni',
                     'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        return monthName[month];
    }

    this.print = function()
    {
        this.yearElement.innerHTML  = this.date.getFullYear();
        this.monthElement.innerHTML = this.getMonthName(this.date.getMonth());

        while (this.weeksElement.rows.length > 0)
        {
            this.weeksElement.deleteRow(this.weeksElement.rows.length - 1);
        }
        
        var startDay = this.getFirstDay();
        var cellNum  = 1;
        for (var row = 1; row <= Math.ceil((startDay + this.getMonthDays() - 1) / 7); row++)
        {
            var cRow = this.weeksElement.insertRow(-1);
            for (var col = 1; col <= 7; col++)
            {
                var cCell = cRow.insertCell(-1);
                if (cellNum >= startDay && cellNum < (this.getMonthDays() + startDay))
                {
                    var day = cellNum - startDay + 1;
                    cLink = document.createElement('a');
                    cCell.appendChild(cLink);
                    cLink.href = 'javascript:' + this.instName + '.action(' + day + ');';
                    cLink.innerHTML = day;

                    if (day == this.today.getDate()
                        && this.date.getMonth()    == this.today.getMonth()
                        && this.date.getFullYear() == this.today.getFullYear())
                    {
                        cCell.id = 'now';
                    }
                    if (col == 6)
                    {
                        cCell.className = 'sat';
                    }
                    else if (col == 7)
                    {
                        cCell.className = 'sun';
                    }
                }
                cellNum++;
            }
        }
    }
}
