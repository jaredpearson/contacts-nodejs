
var nextContactId = 1;
var contacts = [];

//test fill the data
contacts = [{id: nextContactId++, firstName: "Jared", lastName: "Pearson", email: "jared.pearson@salesforce.com"}];

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

/**
 * Gets the array of contacts
 */
exports.getContacts = function() {
	return contacts;
}

/**
 * Adds the contact to the in memory repository
 */
exports.addContact = function(contact) {
	contact.id = nextContactId++;
	contacts.push(contact);
}

/**
 * Gets the contact with the specified ID from the in memory repository.
 * If the ID does not correspond with a contact, a null reference is returned.
 */
exports.getContactById = function(id) {
	var foundIndex = getContactIndex(id);
	if(foundIndex > -1) {
		return contacts[foundIndex];
	}
    return null;
}

/**
 * Removes the contact with the specified ID from the 
 */
exports.removeContactById = function(id) {
    var foundIndex = getContactIndex(id);
    if(foundIndex > -1) {
        contacts.splice(foundIndex, 1);
        return true;
    }
    return false;
}
