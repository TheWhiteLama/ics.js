/* global saveAs, Blob, BlobBuilder, console */
/* exported ics */

var ics = function (uidDomain, prodId) {
    'use strict';

    if (navigator.userAgent.indexOf('MSIE') > -1 && navigator.userAgent.indexOf('MSIE 10') === -1) {
        console.log('Unsupported Browser');
        return;
    }

    if (typeof uidDomain === 'undefined') { uidDomain = 'default'; }
    if (typeof prodId === 'undefined') { prodId = 'Calendar'; }

    var SEPARATOR = navigator.appVersion.indexOf('Win') !== -1 ? '\r\n' : '\n';
    var calendarEvents = [];
    var calendarStart = [
        'BEGIN:VCALENDAR',
        'PRODID:' + prodId,
        'VERSION:2.0'
    ].join(SEPARATOR);
    var calendarEnd = SEPARATOR + 'END:VCALENDAR';

    return {
        /**
         * Returns events array
         * @return {array} Events
         */
        'events': function() {
            return calendarEvents;
        },

        /**
         * Returns calendar
         * @return {string} Calendar in iCalendar format
         */
        'calendar': function() {
            return calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;
        },

        /**
         * Add event to the calendar
         * @param  {string} subject     Subject/Title of event
         * @param  {string} description Description of event
         * @param  {string} location    Location of event
         * @param  {string} begin       Beginning date of event
         * @param  {string} stop        Ending date of event
         * @returns {string} a calendarEvent
         */
        'addEvent': function(subject, description, location, begin, stop) {
            // I'm not in the mood to make these optional... So they are all required
            if (typeof subject === 'undefined' ||
                typeof description === 'undefined' ||
                typeof location === 'undefined' ||
                typeof begin === 'undefined' ||
                typeof stop === 'undefined'
            ) {
                return false;
            }

            //TODO add time and time zone? use moment to format?
            var start_date = new Date(begin);
            var end_date = new Date(stop);
            var now_date = new Date();

            var start_year = ("0000" + start_date.getFullYear().toString()).slice(-4);
            var start_month = ("00" + (start_date.getMonth() + 1).toString()).slice(-2);
            var start_day = ("00" + (start_date.getDate()).toString()).slice(-2);
            var start_hours = ("00" + start_date.getHours().toString()).slice(-2);
            var start_minutes = ("00" + start_date.getMinutes().toString()).slice(-2);
            var start_seconds = ("00" + start_date.getSeconds().toString()).slice(-2);

            var end_year = ("0000" + end_date.getFullYear().toString()).slice(-4);
            var end_month = ("00" + (end_date.getMonth() + 1).toString()).slice(-2);
            var end_day = ("00" + (end_date.getDate()).toString()).slice(-2);
            var end_hours = ("00" + end_date.getHours().toString()).slice(-2);
            var end_minutes = ("00" + end_date.getMinutes().toString()).slice(-2);
            var end_seconds = ("00" + end_date.getSeconds().toString()).slice(-2);

            var now_year = ("0000" + (now_date.getFullYear().toString())).slice(-4);
            var now_month = ("00" + ((now_date.getMonth() + 1).toString())).slice(-2);
            var now_day = ("00" + ((now_date.getDate()).toString())).slice(-2);
            var now_hours = ("00" + (now_date.getHours().toString())).slice(-2);
            var now_minutes = ("00" + (now_date.getMinutes().toString())).slice(-2);
            var now_seconds = ("00" + (now_date.getSeconds().toString())).slice(-2);

            // Since some calendars don't add 0 second events, we need to remove time if there is none...
            var start_time = 'T' + start_hours + start_minutes + start_seconds;
            var end_time = 'T' + end_hours + end_minutes + end_seconds;

            if (end_date - start_date === 0) {
                start_time = '';
                end_time = '';
            }
            var now_time = 'T' + now_hours + now_minutes + now_seconds;

            var start = start_year + start_month + start_day + start_time;
            var end = end_year + end_month + end_day + end_time;
            var now = now_year + now_month + now_day + now_time;

            var calendarEvent = [
                'BEGIN:VEVENT',
                'UID:' + calendarEvents.length + "@" + uidDomain,
                'CLASS:PUBLIC',
                'DESCRIPTION:' + description,
                //'DTSTAMP;VALUE=DATE-TIME:' + now,
                'DTSTART;VALUE=DATE-TIME:' + start,
                'DTEND;VALUE=DATE-TIME:' + end,
                'LOCATION:' + location,
                'SUMMARY;LANGUAGE=en-us:' + subject,
                'TRANSP:TRANSPARENT',
                'END:VEVENT'
            ].join(SEPARATOR);

            calendarEvents.push(calendarEvent);
            return calendarEvent;
        },

        /**
         * Download calendar using the saveAs function from filesave.js
         * @param  {string} filename Filename
         * @param  {string} ext      Extention
         * @returns {string} a calendar
         */
        'download': function(filename, ext) {
            if (calendarEvents.length < 1) {
                return false;
            }

            ext = typeof ext !== 'undefined' ? ext : '.ics';
            filename = typeof filename !== 'undefined' ? filename : 'calendar';
            var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;

            var blob;
            if (navigator.userAgent.indexOf('MSIE 10') === -1) { // chrome or firefox
                blob = new Blob([calendar]);
            } else { // ie
                var bb = new BlobBuilder();
                bb.append(calendar);
                blob = bb.getBlob('text/x-vCalendar;charset=' + document.characterSet);
            }
            saveAs(blob, filename + ext);
            return calendar;
        },

        /**
         * Build and return the ical contents
         */
        'build': function () {
            if (calendarEvents.length < 1) {
                return false;
            }

            var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;

            return calendar;
        }
    };
};
