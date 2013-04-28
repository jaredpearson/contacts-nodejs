"use strict";

module.exports = {
    /**
     * Iterates over each item in the array invoking the callback for each.
     */
    each: function(arr, callback) {
        for(var index in arr) {
            callback(arr[index], index);
        }
    },

    /**
     * Returns the first item that returns true from the specified
     * callback.
     */
    find: function(arr, callback) {
        for(var index in arr) {
            if(callback(arr[index], index)) {
                return arr[index];
            }
        }
        return null;
    }
}
