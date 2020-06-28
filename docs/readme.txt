1. Select folder with the application, open its properties and check "Unblock" checkbox if it is displayed here.
Files downloaded from the Internet are marked as readonly (blocked), so make sure you have unblocked all files of the application.

2. Launch runme.bat
It will start local web-server along with the application.
As the application has started (check for "Started PoeticaApplication in ..... seconds" string in the black console), launch any modern browser on your computer.
And go to the address:

localhost:8080

or

127.0.0.1:8080

Browser will display the web-application ready to work with.

Please note, application generates poetica.sqlite file upon start if it does not exist. It is database file, that holds all application information.