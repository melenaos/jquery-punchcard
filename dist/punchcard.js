; (function ($, window, document, undefined) {

    "use strict";
    var MAX_SIZE = 10;
    var TIME_OFFSET_ANCHOR = moment('20160101'); //use a moment in time that no DLS is on

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
            ajax: undefined,
            timezones: [],
            timezoneIndex: 0,
            nightModeFrom: undefined,
            nightModeTo: undefined,
        };

    // Constructor
    function Plugin(element, options) {
        this.element = element;

        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.data = createArray(this.settings.days.length, this.settings.hours.length);
        this.size = [];
        this.initialWidth = 0;
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

            this.applyTimezone();
            this.calcSize();
            this.addDays();

            this.initialWidth = $(this.element).width();
            this.registerResizeListener();
            this.setScale();
        },
        registerResizeListener: function() {
            var self = this;
            $(window).resize(function() {
                self.setScale();
            });
        },
        setScale: function() {
            var parentWidth = $(this.element).parent().width();
            var ratio = parentWidth / this.initialWidth;
            $(this.element).css('transform', 'scale(' + ratio + ')');
        },
        refresh: function () {
            $(this.element).empty();

            this.applyTimezone();
            this.calcSize();
            this.addDays();
        },
        changeTimezone: function (timezoneIndex) {
            this.settings.timezoneIndex = timezoneIndex;
            this.refresh();
        },
        applyTimezone: function () {
            var offset = getTimezoneOffset(this.settings.timezones, this.settings.timezoneIndex);

            var daysLength = this.settings.days.length;
            var hourLength = this.settings.hours.length;
            var weekHours = daysLength  * hourLength;

            for (var iDay = 0; iDay < daysLength; iDay++) {
                for (var iHour = 0; iHour < hourLength; iHour++) {
                    var n = this.settings.data[iDay][iHour] | 0;

                    var weekIndex = hourLength * iDay + iHour + offset;
                    weekIndex = weekIndex > 0 ? weekIndex : weekHours + weekIndex; 
                    var day = Math.floor(weekIndex / hourLength) % daysLength;
                    var hour = weekIndex % hourLength;

                    this.data[day][hour] = n;
                }
            }
        },
        calcSize: function () {
            this.size = [];
            for (var iDay in this.settings.days) {
                var maxData = 0;
                for (var iHour in this.settings.hours) {
                    var n = this.data[iDay][iHour];
                    if (n == undefined || n == 0) continue;

                    if (maxData < n) maxData = n;
                }

                var dayList = [];
                for (var iHour in this.settings.hours) {
                    var n = this.data[iDay][iHour];
                    if (n == undefined) break;

                    var pers = n / maxData;

                    dayList.push(Math.ceil(pers * MAX_SIZE));
                }
                this.size.push(dayList);
            }

        },

        addDays: function () {
            var tmp = '';
            //render days
            for (var iDay in this.settings.days) {
                tmp += '<div class="punch-card-day">'
                    + '    <div class="punch-card-day-name">'
                    + '         <div class="punch-card-day-name-label">' + this.settings.days[iDay] + '</div>'
                    + '     </div >';
                for (var iHour in this.settings.hours) {
                    var n = this.data[iDay][iHour] | 0;
                    var size = this.size[iDay][iHour] | 0;
                    tmp += '<div class="punch-card-hour">'
                        + '     <div class="punch-card-hour-data size-' + size + '"></div>'
                        + '     <div class="punch-card-hour-tooltip">'
                        + '         <b>' + n + '</b> ' + this.description(n)
                        + '         <div class="arrow"></div>'
                        + '     </div>'
                        + '     <div class="punch-card-hour-tick"></div>'
                        + ' </div >';
                }
                tmp += '</div > ';
            }

            tmp += '<div class="punch-card-hour-name">';
            for (var iHour in this.settings.hours) {
                tmp += '    <div class="punch-card-hour-name-label">'
                    + this.settings.hours[iHour]
                    + '    </div>';
            }
            tmp += '</div>';

            $(this.element).html(tmp);
        },
        description: function (n) {
            if (n == 1)
                return this.settings.singular || "event";
            else
                return this.settings.plural || "events";
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
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

    var getTimezoneOffset = function (timezones, tzIndex) {
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
    };

    var createArray = function (length) {
        var arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while (i--) arr[length - 1 - i] = createArray.apply(this, args);
        }

        return arr;
    };

})(jQuery, window, document);
