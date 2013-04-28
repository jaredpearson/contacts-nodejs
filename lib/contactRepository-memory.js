"use strict";

var utils = require('./utils');

var nextContactId = 1;
var contacts = [];

/**
 * Gets the index of the contact within the in memory repository.
 * Returns a -1 if the ID does not correspond with a contact
 */
function getContactIndex(id) {
    for(var index = 0; index < contacts.length; index++) {
        if(contacts[index].id === id) {
            return index;
        }
    }
    return null;
}

var ContactRepository = function(options) {
    options = options || {};
    var self = this;
    if(options.data) {
        //TODO: assumes the data is always an array
        utils.each(options.data, function(data) {
            self.addContact(data);
        });
    }
}

/**
 * Gets the array of contacts
 */
ContactRepository.prototype.getContacts = function(callback) {
    if(callback) callback({success: true}, contacts);
}

/**
 * Adds the contact to the in memory repository
 */
ContactRepository.prototype.addContact = function(contact, callback) {
    if(contact) {
        contact.id = nextContactId++;

        //TODO: ensure that the contact has all of the required properties

        contacts.push(contact);
        if(callback) callback({success: true}, contact);
    }
}

/**
 * Gets the contact with the specified ID from the in memory repository.
 * If the ID does not correspond with a contact, a null reference is returned.
 */
ContactRepository.prototype.getContactById = function(id, callback) {
    var result = null;
	var foundIndex = getContactIndex(id);
	if(foundIndex > -1) {
		result = contacts[foundIndex];
	}
    if(callback) callback({success: true}, result);
}

/**
 * Removes the contact with the specified ID from the 
 */
ContactRepository.prototype.removeContactById = function(id, callback) {
    var result = false;
    var foundIndex = getContactIndex(id);
    if(foundIndex > -1) {
        contacts.splice(foundIndex, 1);
        result = true;
    }
    if(callback) callback({success: true}, result);
}

exports.ContactRepository = ContactRepository;