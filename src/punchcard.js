; (function ($, window, document, undefined) {

    "use strict";
    var MAX_SIZE = 10;
    var TIME_OFFSET_ANCHOR = moment('20160101'); //use a moment in time that no DLS is on
    var internals = {}

    internals.description = function (n, settings) {
        if (n == 1)
            return settings.singular || "event";
        else
            return settings.plural || "events";
    }
    internals.createArray = function createArray(length) {
        var arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while (i--) arr[length - 1 - i] = createArray.apply(this, args);
        }

        return arr;
    }
    internals.getTimezoneOffset = function (timezones, tzIndex) {
        var timezone = 'local';
        var offset = 0;
        if (timezones.length > 0) {
            tzIndex = tzIndex < 0 ||
                tzIndex >= timezones.length
                ? 0 : tzIndex;

            timezone = timezones[tzIndex].toLowerCase();
        }

        if (timezone == 'utc') {
            offset = 0;
        } else if (timezone == 'local') {
            offset = Math.floor(TIME_OFFSET_ANCHOR.local().utcOffset() / 60);
        } else {
            offset = Math.floor(TIME_OFFSET_ANCHOR.tz(timezone).utcOffset() / 60);
        }
        return offset;
    }
    internals.applyTimezone = function (settings) {
        var data = this.createArray(settings.days.length, settings.hours.length);
        var offset = this.getTimezoneOffset(settings.timezones, settings.timezoneIndex);
        var daysLength = settings.days.length;
        var hourLength = settings.hours.length;
        var weekHours = daysLength  * hourLength;

        for (var iDay = 0; iDay < daysLength; iDay++) {
            for (var iHour = 0; iHour < hourLength; iHour++) {
                var n = settings.data[iDay][iHour] | 0;

                var weekIndex = hourLength * iDay + iHour + offset;
                weekIndex = weekIndex > 0 ? weekIndex : weekHours + weekIndex; 
                var day = Math.floor(weekIndex / hourLength) % daysLength;
                var hour = weekIndex % hourLength;

                data[day][hour] = n;
            }
        }
        return data;
    }
    internals.calcSize = function (settings, data) {
        var size = [];
        for (var iDay in settings.days) {
            var maxData = 0;
            for (var iHour in settings.hours) {
                var n = data[iDay][iHour];
                if (n == undefined || n == 0) continue;

                if (maxData < n) maxData = n;
            }

            var dayList = [];
            for (var iHour in settings.hours) {
                var n = data[iDay][iHour];
                if (n == undefined) break;

                var pers = n / maxData;

                dayList.push(Math.ceil(pers * MAX_SIZE))
            }
            size.push(dayList);
        }
      return size;
    }
    internals.buildHtml = function (settings, data, size) {
        var tmp = '';
        //render days
        for (var iDay in settings.days) {
            tmp += '<div class="punch-card-day">'
                + '    <div class="punch-card-day-name">'
                + '         <div class="punch-card-day-name-label">' + settings.days[iDay] + '</div>'
                + '     </div >';
            for (var iHour in settings.hours) {
                var n = data[iDay][iHour] | 0;
                var divSize = size[iDay][iHour] | 0
                tmp += '<div class="punch-card-hour">'
                    + '     <div class="punch-card-hour-data size-' + divSize + '"></div>'
                    + '     <div class="punch-card-hour-tooltip">'
                    + '         <b>' + n + '</b> ' + this.description(n, settings)
                    + '         <div class="arrow"></div>'
                    + '     </div>'
                    + '     <div class="punch-card-hour-tick"></div>'
                    + ' </div >';
            }
            tmp += '</div > ';
        }

        tmp += '<div class="punch-card-hour-name">';
        for (var iHour in settings.hours) {
            tmp += '    <div class="punch-card-hour-name-label">'
                + settings.hours[iHour]
                + '    </div>'
        }
        tmp += '</div>';

       return tmp;
    }

    // Create the defaults once
    var pluginName = "punchcard",
        defaults = {
            days: [
                "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
            ],
            hours: [
                "24", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
                "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"
            ],
            singular: undefined,
            plural: undefined,
            data: undefined,
            timezones: [],
            timezoneIndex: 0,
            nightModeFrom: undefined,
            nightModeTo: undefined
        };

    // Constructor
    function Plugin(element, options) {
        this.element = element;

        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function () {
            //ensure that data is not undefined
            if (!this.settings.data) {
                console.log("punchcard plugin init: Data must be provided");
                return;
            }

            $(this.element).addClass('punchcard');

            this.render();
        },
        render: function () {
         var settings = this.settings;   
         var data = internals.applyTimezone(settings);
         var size = internals.calcSize(settings, data);
         var html = internals.buildHtml(settings, data, size)
         this.appendHtml(html);
        },
        refresh: function () {
            $(this.element).empty();
            this.render()

        },
        changeTimezone: function (timezoneIndex) {
            this.settings.timezoneIndex = timezoneIndex;
            this.render();
        },
        appendHtml: function (html) {
            $(this.element).html(html);

        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        // this will be used during unit test
        if(typeof options === 'string' && options === 'internals') {
            return internals;
         }
        // slice arguments to leave only arguments after function name
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            var item = $(this), instance = item.data("plugin_" + pluginName);
            if (!instance) {
                // create plugin instance and save it in data
                item.data("plugin_" + pluginName, new Plugin(this, options));
            } else {
                // if instance already created call method
                if (typeof options === 'string') {
                    instance[options].apply(instance, args);
                }
            }
        });
    };



    var isPromise = function (data) {
        return (typeof data.then) == 'function'
    }

})(jQuery, window, document);

