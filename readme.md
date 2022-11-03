WP Rest API
===========

debug
-----

Accessing our endpoint with a command line client, triggering breakpoints in phpstorm.
We need to add a nonce here when we implemented that.

    http --json -p HBhb POST http://marikenhuis.localhost:8080/wp-json/mhwp-ipso/v1/reservation \
    cookie:XDEBUG_SESSION=PHPSTORM \
    activityCalendarId=12055 email='frans.jaspers@marikenhuis.nl' firstName=Henk lastName=Jaspers \
    lastNamePrefix='' phoneNumber='0645267137'
