var TableSorter = {
    init: function (config) {
        this.tables = config.tables;
        this.firstState = config.firstState || 'ascending';
        this.cache = {};
        this.bindListeners();
    },

    bindListeners: function () {
        var i,
            len,
            table,
            tbody;

        for (i = 0, len = this.tables.length; i < len; i += 1) {
            table = this.tables[i];
            table.addEventListener('click', this.handleClicks.bind(this, table), false);
        }
    },

    handleClicks: function (table, e) {
        var index,
            type,
            cacheEntry,
            target = e.target || e.srcElement;

        if (target && target.nodeName.toLowerCase() === 'th') {
            if (target.dataset) {
                index = target.dataset.index;
                type = target.dataset.type || "string";
            } else {
                index = target.getAttribute('data-index');
                type = target.getAttribute('data-type') || "string";
            }

            if (index) {
                cacheEntry = this.cache[index];

                if ((!cacheEntry && this.firstState === 'descending') ||
                        (cacheEntry && !cacheEntry.isDescending)) {
                    this.sortDescending(table, index, type);
                } else {
                    this.sortAscending(table, index, type);
                }
            }
        }

        e.stopPropagation();
    },

    sortAscending: function (table, index, type) {
        var ascSortedArray = this.getSortedArray(table, index, type, false),
            i,
            len,
            tbody = table.tBodies[0],
            tbodyClone = tbody.cloneNode(false);

        for (i = 0, len = ascSortedArray.length; i < len; i += 1) {
            tbodyClone.appendChild(ascSortedArray[i]);
        }

        table.replaceChild(tbodyClone, tbody);
    },

    sortDescending: function (table, index, type) {
        var ascSortedArray = this.getSortedArray(table, index, type, true),
            i = ascSortedArray.length,
            tbody = table.tBodies[0],
            tbodyClone = tbody.cloneNode(false);

        while (i--) {
            tbodyClone.appendChild(ascSortedArray[i]);
        }

        table.replaceChild(tbodyClone, tbody);
    },

    getSortedArray: function (table, index, type, isDescending) {
        var tbody = table.tBodies[0],
            cacheEntry = this.cache[index],
            ascSortedArray;

        if (!cacheEntry) {
            // array is saved as sorted ascending
            ascSortedArray = this.sortRows(tbody.rows, index, type);

            this.cache[index] = {
                isDescending: !!isDescending,
                sortedArray: ascSortedArray
            };

            return ascSortedArray;
        }

        cacheEntry.isDescending = !!isDescending;

        return cacheEntry.sortedArray;
    },

    sortRows: function (rows, index, type) {
        var i,
            len,
            arr = [];

        for (i = 0, len = rows.length; i < len; i += 1) {
            arr.push(rows[i]);
        }

        switch (type) {
        case "string":
            return arr.sort(this.bindSortFn(this.stringSort, this, index));
        case "date":
            return arr.sort(this.bindSortFn(this.dateSort, this, index));
        }

        return arr;
    },

    stringSort: function (a, b, index) {
        var wordOne = a.cells[index].innerHTML.toLowerCase() || "zzzzzzzzz", // sorry..
            wordTwo = b.cells[index].innerHTML.toLowerCase() || "zzzzzzzzz";

        if (wordOne > wordTwo) {
            return 1;
        }

        if (wordOne < wordTwo) {
            return -1;
        }

        return 0;
    },

    dateSort: function (d1, d2, index) {
        var firstDate = d1.cells[index].innerHTML,
            secondDate = d2.cells[index].innerHTML,
            firstYear = this.getYear(firstDate),
            secondYear = this.getYear(secondDate),
            firstMonth,
            secondMonth,
            firstDay,
            secondDay;

        if (firstYear > secondYear) {
            return 1;
        }

        if (firstYear < secondYear) {
            return -1;
        }

        firstMonth = this.getMonth(firstDate);
        secondMonth = this.getMonth(secondDate);

        if (firstMonth > secondMonth) {
            return 1;
        }

        if (firstMonth < secondMonth) {
            return -1;
        }

        firstDay = this.getDay(firstDate);
        secondDay = this.getDay(secondDate);

        if (firstDay > secondDay) {
            return 1;
        }

        if (firstDay < secondDay) {
            return -1;
        }

        return 0;
    },

    getDateComponent: function (dateStr, component) {
        var matches = dateStr.match(/([0-9]{2})(?:[\-\/\.])([0-9]{2})(?:[\-\/\.])([0-9]{4})/),
            match = null;

        if (matches) {
            switch (component) {
            case "day":
                match = matches[1];
                break;
            case "month":
                match = matches[2];
                break;
            case "year":
                match = matches[3];
                break;
            }
        }

        return match;
    },

    getYear: function (dateStr) {
        return parseInt(this.getDateComponent(dateStr, 'year'), 10);
    },

    getMonth: function (dateStr) {
        return parseInt(this.getDateComponent(dateStr, 'month'), 10);
    },

    getDay: function (dateStr) {
        return parseInt(this.getDateComponent(dateStr, 'day'), 10);
    },

    bindSortFn: function (fn, context) {
        var args = Array.prototype.slice.call(arguments, 2);
        return function (a, b) {
            return fn.apply(context, [a, b].concat(args));
        };
    }
};