# Passwordless-NedbStore

This module provides token storage for [Passwordless](https://github.com/florianheinemann/passwordless), a node.js module for express that allows website authentication without password using verification through email or other means. Visit the project's website https://passwordless.net for more details.

Tokens are stored in [Nedb](https://github.com/louischatriot/nedb)  and are hashed and salted using [bcryptjs](https://github.com/dcodeIO/bcrypt.js).

This is a crude adaption from [passwordless-mongostore](https://github.com/florianheinemann/passwordless-mongostore) from Florian Heinemann.

## Usage

First, install the module:

`$ npm install passwordless-nedbstore --save`

Afterwards, follow the guide for [Passwordless](https://github.com/florianheinemann/passwordless). A typical implementation may look like this:

```javascript
var passwordless = require('passwordless');
var NedbStore = require('passwordless-nedbstore');

passwordless.init(new NedbStore());

passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        // Send out a token
    });
    
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken());
```

## Initialization

```javascript
new NedbStore();
```

Example:
```javascript
passwordless.init(new NedbStore());
```

## Hash and salt
As the tokens are equivalent to passwords (even though they do have the security advantage of only being valid for a limited time) they have to be protected in the same way. passwordless-nedbstore uses [bcryptjs](https://github.com/dcodeIO/bcrypt.js) with automatically created random salts. To generate the salt 10 rounds are used.

## Tests

`$ npm test`
Since Tests of Nedb are not compatible with multiple instances of the same file, the first instance for every filename is cached!
Call it cheating, but I think its good enough!

## License

[MIT License](http://opensource.org/licenses/MIT)

## Author
Puschkarski Severin has rewritten [passwordless-mongostore](https://github.com/florianheinemann/passwordless-mongostore) from Florian Heinemann