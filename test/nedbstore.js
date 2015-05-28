'use strict';

var expect = require('chai').expect;
var uuid = require('node-uuid');
var chance = new require('chance')();

var NedbStore = require('../');
var TokenStore = require('passwordless-tokenstore');

var standardTests = require('passwordless-tokenstore-test');

var testPath = 'data/konto.db';//__dirname +'/../data/konto.db';
function TokenStoreFactory() {
	return new NedbStore(testPath);
}



var beforeEachTest = function(done) {
	done();
};

var afterEachTest = function(done) {
	done();
};

// Call all standard tests
standardTests(TokenStoreFactory, beforeEachTest, afterEachTest);

describe('Specific tests', function() {

	beforeEach(function(done) {
		beforeEachTest(done);
	});

	afterEach(function(done) {
		afterEachTest(done);
	});

	it('should not allow the instantiation with an empty constructor', function () {
		expect(function() { new NedbStore() }).to.throw(Error);
	});

	it('should not allow the instantiation with a bad constructor', function () {
		expect(function() { new NedbStore(123); }).to.throw(Error);
	});

	it('should allow proper instantiation', function () {
		expect(function() { TokenStoreFactory() }).to.not.throw;
	});

	it('should allow proper instantiation with options', function () {
		expect(function() { new NedbStore({ filename: testPath, autostart: true}); }).to.not.throw;
	});

/*
	it('should store tokens only in their hashed form', function (done) {
		var store = TokenStoreFactory();
		var token = uuid.v4();
		var uid = chance.email();
		store.storeOrUpdate(token, uid, 
			1000*60, 'http://' + chance.domain() + '/page.html', 
			function() {
				MongoClient.connect(testUri, function(err, db) {
					db.collection('passwordless-token', function(err, collection) {
						collection.findOne({uid: uid}, function(err, item) {
							expect(item.uid).to.equal(uid);
							expect(item.hashedToken).to.not.equal(token);
							done();
						});
					});
				})
			});
	})

	it('should store tokens not only hashed but also salted', function (done) {
		var store = TokenStoreFactory();
		var token = uuid.v4();
		var uid = chance.email();
		store.storeOrUpdate(token, uid, 
			1000*60, 'http://' + chance.domain() + '/page.html', 
			function() {
				MongoClient.connect(testUri, function(err, db) {
					db.collection('passwordless-token', function(err, collection) {
						collection.findOne({uid: uid}, function(err, item) {
							var hashedToken1 = item.hashedToken;
							store.clear(function() {
								store.storeOrUpdate(token, uid, 
									1000*60, 'http://' + chance.domain() + '/page.html', 
									function() {
										collection.findOne({uid: uid}, function(err, item) {
											var hashedToken2 = item.hashedToken;
											expect(hashedToken2).to.not.equal(hashedToken1);
											done();
										});
									});
							})
						});
					});
				})
			});
	})*/
})