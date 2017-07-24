; (function ($, window, document, undefined) {

    "use strict";
    var MAX_SIZE = 10;

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
            ajax: undefined
        };

    // Constructor
    function Plugin(element, options) {
        this.element = element;

        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.size = [];
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

            this.calcSize();
            this.addDays();
        },
        calcSize: function () {
            for (var iDay in this.settings.days) {
                var maxData = 0;
                for (var iHour in this.settings.hours) {
                    var n = this.settings.data[iDay][iHour];
                    if (!n || n == 0) continue;

                    if (maxData < n) maxData = n;
                }

                var dayList = [];
                for (var iHour in this.settings.hours) {
                    var n = this.settings.data[iDay][iHour];
                    if (!n) break;

                    var pers = n/ maxData;

                    dayList.push(Math.ceil(pers * MAX_SIZE))
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
                    var n = this.settings.data[iDay][iHour] | 0;
                    var size = this.size[iDay][iHour] | 0
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
                    + '    </div>'
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
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" +
                    pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);