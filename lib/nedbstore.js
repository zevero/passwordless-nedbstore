'use strict';

var util = require('util');
var bcrypt = require('bcryptjs');
var TokenStore = require('passwordless-tokenstore');
var NedbClient = require('nedb');

/**
 * Constructor of NedbStore
 * @param {String} Path of Nedb Datafile or Nedb options object
 * @constructor
 */
var db_cache = {};
function NedbStore(path_or_options) {
	if(arguments.length === 0 || (typeof path_or_options !== 'string'  && typeof path_or_options !== 'object') ) {
		throw new Error('Valid options have to be provided');
	}

	TokenStore.call(this);
    var options = (typeof path_or_options === 'string') 
         ? { filename: path_or_options, autoload:true}
         : path_or_options;
    // BE AWARE OF THE HACK!!!!
    // Nedb does not handle multiple instances on the same file well. Therefore I reuse the first instance of every filename.
    // It is mainly a cheat to complete the test suite!!!
    if (!db_cache[options.filename]) {
      //console.log('Opened',options.filename )
      this._db = db_cache[options.filename] = new NedbClient(options);
    }
    else this._db = db_cache[options.filename];
}  

util.inherits(NedbStore, TokenStore);

/**
 * Checks if the provided token / user id combination exists and is
 * valid in terms of time-to-live. If yes, the method provides the 
 * the stored referrer URL if any. 
 * @param  {String}   token to be authenticated
 * @param  {String}   uid Unique identifier of an user
 * @param  {Function} callback in the format (error, valid, referrer).
 * In case of error, error will provide details, valid will be false and
 * referrer will be null. If the token / uid combination was not found 
 * found, valid will be false and all else null. Otherwise, valid will 
 * be true, referrer will (if provided when the token was stored) the 
 * original URL requested and error will be null.
 */
NedbStore.prototype.authenticate = function(token, uid, callback) {
	if(!token || !uid || !callback) {
		throw new Error('TokenStore:authenticate called with invalid parameters');
	}

	this._db.findOne({ uid: uid, ttl: { $gt: new Date() }}, 
      function(err, item) {
          if(err) {
              callback(err, false, null);
          } else if(item) {
              bcrypt.compare(token, item.hashedToken, function(err, res) {
                  if(err) {
                      callback(err, false, null);
                  } else if(res) {
                      callback(null, true, item.originUrl);
                  } else {
                      callback(null, false, null);
                  }
              });

          } else {
              callback(null, false, null);
          }
      }
    );
};
/**
 * Stores a new token / user ID combination or updates the token of an
 * existing user ID if that ID already exists. Hence, a user can only
 * have one valid token at a time
 * @param  {String}   token Token that allows authentication of _uid_
 * @param  {String}   uid Unique identifier of an user
 * @param  {Number}   msToLive Validity of the token in ms
 * @param  {String}   originUrl Originally requested URL or null
 * @param  {Function} callback Called with callback(error) in case of an
 * error or as callback() if the token was successully stored / updated
 */
NedbStore.prototype.storeOrUpdate = function(token, uid, msToLive, originUrl, callback) {
    var self = this;
    //console.log('STUP START');
	if(!token || !uid || !msToLive || !callback) {
		throw new Error('TokenStore:storeOrUpdate called with invalid parameters');
	}

		bcrypt.hash(token, 10, function(err, hashedToken) {
			if(err) {
              console.log('BCRYPT error!!', err);
				return callback(err);
			}

			var newRecord = {
				'hashedToken': hashedToken,
				'uid': uid,
				'ttl': new Date(Date.now() + msToLive),
				'originUrl': originUrl
			};

			// Insert or update
			self._db.update( { 'uid': uid}, newRecord, {upsert:true}, function(err) {
				if(err) {
                    console.log('STOREORUPDATE error!!', err);
					callback(err);
				} else {
                   // console.log('STOREORUPDATE callback!!');
					callback();
				}
			});
		});

};

/**
 * Invalidates and removes a user and the linked token
 * @param  {String}   user ID
 * @param  {Function} callback called with callback(error) in case of an
 * error or as callback() if the uid was successully invalidated
 */
NedbStore.prototype.invalidateUser = function(uid, callback) {
	if(!uid || !callback) {
		throw new Error('TokenStore:invalidateUser called with invalid parameters');
	}
	this._db.remove( { uid: uid}, {multi:true}, function(err) {
			if(err) {
				callback(err);
			} else {
				callback();
			}
	});
};

/**
 * Removes and invalidates all token
 * @param  {Function} callback Called with callback(error) in case of an
 * error or as callback() if the token was successully stored / updated
 */
NedbStore.prototype.clear = function(callback) {
	if(!callback) {
		throw new Error('TokenStore:clear called with invalid parameters');
	}
	this._db.remove( {}, {multi:true}, function(err) {
			if(err) {
				callback(err);
			} else {
				callback();
			}
    });
}

/**
 * Number of tokens stored (no matter the validity)
 * @param  {Function} callback Called with callback(null, count) in case
 * of success or with callback(error) in case of an error
 */
NedbStore.prototype.length = function(callback) {
	//this._db.count({},callback);
    this._db.count({},callback);
};

module.exports = NedbStore;