MrFaxe
======

Features
--------

- reveice faxes and store it as PDF
- print the received faxes
- store informations about the faxes
- view (and reprint) the faxes in a webinterface

Requirements
------------

a working isdn card
capisuite 4.5
python >= 2.4 & < 3
python-pysqlite2
libtiff-tools
sfftobmp
a webserver with php

Installation
------------

Install CapiSuite (http://www.capisuite.org/).

Unpack the MrFaxe tarball to /opt

    $ tar xfz mrfaxe_*.tar.gz -C /opt

Create a folder to save the received faxes

    $ mkdir /fax

Edit CapiSuite config (/etc/capisuite/capisuite.conf), set

    incoming_script="/opt/mrfaxe/receive.py"
    idle_script_interval="0"

Copy the mrfaxe.conf.dist to mrfaxe.conf and edit the file

    $ cd /opt/mrfaxe
    $ cp mrfaxe.conf.dist mrfaxe.conf
    $ edit mrfaxe.conf

Create the database and add a new user

    $> cd /opt/mrfaxe
    $> ./mfmanager mrfaxe.conf
    The database does not exists.
    Do you want to create it now? (Y/n) Y
    > adduser
    Username: Admin
    Password:
    Retype password:
    Done.
    > quit 

Restart Capisuite

    $ /etc/init.d/capisuite restart

To get access to the webfrontend (http://<server>/fax), create a link to it

    $ ln -s /opt/mrfaxe/webgui /var/www/fax

