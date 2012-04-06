# MrFaxe receive script

homepath = '/opt/mrfaxe/'

import sys

sys.path.append(homepath)

import os
import time
import mfconfig
import capisuite

try:
    import sqlite3
except ImportError:
    from pysqlite2 import dbapi2 as sqlite3


ERROR_UNKOWN  = 2
ERROR_RECEIVE = 4
ERROR_CONVERT = 8
ERROR_ARCHIVE = 16
ERROR_PRINT   = 32


class receiveError(Exception):
    pass

class convertError(Exception):
    pass

class archiveError(Exception):
    pass

class printError(Exception):
    pass


def callIncoming(call, service, fax_caller, fax_callee):
    timenow        = time.localtime()
    fax_stationid  = ''
    fax_bitrate    = ''
    fax_resolution = ''
    fax_color      = ''
    fax_error      = (-1, -1)
    fax_pdffile    = ''
    error          = 0

    # open config
    try:
        cfg = mfconfig.config(os.path.join(homepath, 'mrfaxe.conf'))
    except mfconfig.Error, e:
        capisuite.error('Failed to read config file: ' + str(e))
        capisuite.reject(call, 0x34A9)
        return

    # chek if all needed config settings are set
    miss = cfg.exists(('stationid', 'headline', 'delay', 'tempdir',
        'temppref', 'savedir', 'savepref', 'dbfile', 'printing', 'printer',
        'printsrv', 'papersize', 'sfftobmp', 'tiff2pdf', 'lp'))
    if not miss is None:
        capisuite.error('Missing settings in config' + str(miss))
        capisuite.reject(call, 0x34A9)
        return
    del(miss)

    # ceck if if the external tools exists
    try:
        if not os.path.exists(cfg.get('sfftobmp')):
            raise Exception, cfg.get('sfftobmp')
        if not os.path.exists(cfg.get('tiff2pdf')):
            raise Exception, cfg.get('tiff2pdf')
        if not os.path.exists(cfg.get('lp')) and cfg.getbool('printing'):
            raise Exception,cfg.get('lp')
    except Exception, e:
        capisuite.error(str(e) +' missing but needed')
        capisuite.reject(call, 0x34A9)
        return

    sqlitefile = cfg.get('dbfile')
    # check if the database file exists
    if not os.path.exists(sqlitefile):
        capisuite.error('Database file does not exists!')
        capisuite.reject(call, 0x34A9)
        return

    try:
        # open the database
        dbcon = sqlite3.connect(sqlitefile)
        dbcon.isolation_level = None
        dbcur = dbcon.cursor()

        # create archive subfolders
        savedir = os.path.join(cfg.get('savedir'), time.strftime('%Y/%m/%d', timenow))
        if not os.path.exists(savedir):
            os.makedirs(savedir)
            if not os.path.exists(savedir):
                raise archiveError

        # create filenames
        fax_tempsff = os.path.join(cfg.get('tempdir'), cfg.get('temppref') + time.strftime('%Y%m%d%H%M%S_', timenow) + fax_caller + '.sff')
        fax_temptif = os.path.join(cfg.get('tempdir'), cfg.get('temppref') + time.strftime('%Y%m%d%H%M%S_', timenow) + fax_caller + '.tif')
        fax_pdffile = os.path.join(savedir, time.strftime('%Y%m%d%H%M%S_', timenow) + fax_caller + '.pdf')

        # receive fax
        try:
            (fax_stationid, fax_bitrate, fax_resolution, fax_color) = capisuite.connect_faxG3(
                call, cfg.get('stationid'), cfg.get('headline'), cfg.getint('delay'))
            
            capisuite.fax_receive(call, fax_tempsff)
        except:
            fax_error = capisuite.disconnect(call)
            capisuite.log('Connection finished with cause 0x%X, 0x%X' % fax_error, 1, call)

        # check if the received fax really exists
        if not os.path.exists(fax_tempsff):
            raise receiveError, 'No sff file found. (ISDN=0x%X, Protocol=0x%X)' % fax_error
        elif not os.path.getsize(fax_tempsff) > 0:
            raise receiveError, 'Received sff file is empty'
        
        # Faxe von ZF kommen mit einem Fehler, aber werden scheinbar komplett uebertragen.
        # Pruefung ab das Fax tatsaechlich angekommen ist, geschiet jediglich ueber das bestehen der .sff-Datei
        #if not fax_error in ((0x3400, 0x0), (0x3480, 0x0), (0x3490, 0x0), (0x3490, 0x3314)):
        #    raise receiveError, 'Transmission error (ISDN=0x%X, Protocol=0x%X)' % fax_error

        # convert the fax
        try:
            if os.system('%s -tif %s -o %s' % (cfg.get('sfftobmp'), fax_tempsff, fax_temptif)) > 0:
                raise convertError, 'Failed to convert the .sff to .tif.'
            if os.system('%s -p%s -f -o %s %s' %(cfg.get('tiff2pdf'), cfg.get('papersize'), fax_pdffile, fax_temptif)) > 0:
                raise convertError, 'Failed to convert the .tif to .pdf.'
        except OSError, e:
            raise convertError, e

        # print the pdf
        if cfg.getbool('printing'):
            try:
                if os.system('%s -h %s -d %s %s' % (cfg.get('lp'), cfg.get('printsrv'), cfg.get('printer'), fax_pdffile)) > 0:
                    raise printError, 'LP Error'
            except OSError, e:
                raise printError, e;
                
    except sqlite3.Error, e:
        capisuite.error('Database error: ' + str(e))
        capisuite.reject(call, 0x34A9)

    except archiveError, e:
        capisuite.error('Failed to create archive subdirs.')
        capisuite.reject(call, 0x34A9)
        error += ERROR_ARCHIVE

    except receiveError, e:
        capisuite.error('Fax Transmission failed: ' + str(e))
        fax_pdffile = ''
        error += ERROR_RECEIVE

    except convertError, e:
        capisuite.error('Failed to archive/convert the fax: ' + str(e))
        error += ERROR_CONVERT

    except printError, e:
        capisuite.error('Printing failed: ' + str(e))
        error += ERROR_PRINT

    except Exception, e:
        capisuite.error('Unkown error occured: ' + str(e))
        error += ERROR_UNKOWN

    if fax_tempsff and os.path.exists(fax_tempsff):
        os.unlink(fax_tempsff)
    if fax_temptif and os.path.exists(fax_temptif):
        os.unlink(fax_temptif)

    if dbcur:
        dbcur.execute('''
            INSERT INTO Calls (
                CallDate,
                CallFrom,
                StationID,
                CallTo,
                BitRate,
                HiRes,
                ColorFax,
                Error,
                ISDNError,
                ProtError,
                Filename
            )
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);''', (
            time.strftime('%Y-%m-%d %H:%M:%S', timenow),
            fax_caller,
            fax_stationid.strip(),
            fax_callee,
            fax_bitrate,
            fax_resolution,
            fax_color,
            error,
            fax_error[0],
            fax_error[1],
            fax_pdffile))
        dbcur.close()

    if dbcon:
        dbcon.commit()
        dbcon.close()

    return
# end callIncoming()


# vim: set expandtab softtabstop=4 tabstop=4 shiftwidth=4:
