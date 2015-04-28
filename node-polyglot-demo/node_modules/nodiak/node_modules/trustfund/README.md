## Overview

This module improves on the node.js `util.inherits(child, parent)` method by inheriting _not only_ instance methods and attributes, but _also_ any class methods and attributes from the parent object.

## Installation

    $ npm install trustfund

## Usage
####trustfund.inherits( *child, parent* )

Given the following `Parent` object:

```javascript
var Parent = function Parent() {
    this.instance_attr = "life savings";
}

Parent.prototype.instance_method = function() {
    console.log('I was inherited!');
}

Parent.class_method = function() {
    console.log('All parents want to leave something to their children');
}
```

You can inherit all its methods and attributes using:

```javascript
var inherits = require('trustfund').inherits;

var Child = function Child() {
    Child.super_.call(this);
} inherits(Child, Parent);
```

Now the `Child` object will include all the functionality of its `Parent`.  Easy.  The standard node.js `util.inherits(child, parent)` would have dropped `Parent.class_method`.

## Tests

The test suite can be run by simply:

    $ cd /path/to/trustfund
    $ npm install -d
    $ npm test

## License

(The MIT License)

Copyright (c) 2012 Coradine Aviation Systems

Copyright (c) 2012 Nathan Aschbacher

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.