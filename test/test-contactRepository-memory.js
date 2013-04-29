
var assert = require('assert'),
    ContactRepository = require('../lib/contactRepository-memory').ContactRepository;

exports.ContactRepositoryTest = {

	'test get contacts with empty repo': function(test) {
		var contactRepository = new ContactRepository();
		contactRepository.getContacts(function(event, result){

			assert.ok(event, 'event should always be a value');
			assert.ok(event.success, 'expected success because retrieving an empty repository shouldnt cause an exception');

			assert.ok(result, 'result should always be a value');
			assert.equal(result.length, 0, 'Expected the repository to be empty');

			test.done();
		});
	},

	'test add contacts': function(test) {
		var contactRepository = new ContactRepository();
		var newContact = {
			firstName: 'Test',
			lastName: 'Person',
			email: 'test@test.com'
		};
		contactRepository.addContact(newContact, function(event, contact){
			assert.ok(event);
			assert.ok(event.success);
			assert.ok(contact);
			assert.ok(contact.id);

			contactRepository.getContacts(function(event, result){
				assert.ok(event);
				assert.ok(event.success);
				assert.ok(result);
				assert.equal(result.length, 1);
				assert.equal(result[0].firstName, newContact.firstName);
				assert.equal(result[0].lastName, newContact.lastName);
				assert.equal(result[0].email, newContact.email);
				test.done();
			});
		});
	},

	'test get contact by id': function(test) {
		var contactRepository = new ContactRepository();
		var newContact = {
			firstName: 'Test',
			lastName: 'Person',
			email: 'test@test.com'
		};
		contactRepository.addContact(newContact, function(event, contact){
			assert.ok(event);
			assert.ok(event.success);
			assert.ok(contact);
			assert.ok(contact.id);

			contactRepository.getContactById(contact.id, function(event, result){
				assert.ok(event);
				assert.ok(event.success);
				assert.ok(result);
				assert.equal(result.firstName, newContact.firstName);
				assert.equal(result.lastName, newContact.lastName);
				assert.equal(result.email, newContact.email);
				test.done();
			});
		});
	},

	'test remove contact': function(test) {
		var contactRepository = new ContactRepository();
		var newContact = {
			firstName: 'Test',
			lastName: 'Person',
			email: 'test@test.com'
		};
		contactRepository.addContact(newContact, function(event, contact){
			assert.ok(event);
			assert.ok(event.success);
			assert.ok(contact);
			assert.ok(contact.id);

			contactRepository.removeContactById(contact.id, function(event, result){
				assert.ok(event);
				assert.ok(event.success);
				assert.ok(result);

				contactRepository.getContactById(contact.id, function(event, result){
					assert.ok(event);
					assert.ok(event.success);
					assert.equal(typeof(result), 'undefined');
					test.done();
				});

			});

		});
	}
}