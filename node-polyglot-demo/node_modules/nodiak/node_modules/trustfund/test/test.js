// (The MIT License)

// Copyright (c) 2012 Coradine Aviation Systems
// Copyright (c) 2012 Nathan Aschbacher

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

describe("Trustfund inheritance Test Suite", function() {
    var should = require('should');
    var inherits = require('../index.js').inherits;
    var Parent;

    before(function(done){
        Parent = function Parent(init_with) {
            this.inited_with = init_with || "parent";
            this.instance_attr = "instance_attr";
        };

        Parent.prototype.instance_method = function() {
            return "instance_method";
        };

        Parent.class_method = function() {
            return "class_method";
        };

        Parent.class_attr = "class_attr";

        done();
    });

    it("should give a Child all the knowledge and wealth of its Parent.", function(done) {
        var Child = function Child(init_with) {
            Child.super_.call(this, init_with);
        }; inherits(Child, Parent);

        Child.class_attr.should.eql('class_attr');
        Child.class_method().should.eql('class_method');

        var child = new Child();

        child.inited_with.should.eql('parent');
        child.instance_attr.should.eql('instance_attr');
        child.instance_method().should.eql('instance_method');

        var newborn = new Child('baby');

        newborn.inited_with.should.eql('baby');

        done();
    });
});
