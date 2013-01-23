/*

  Copyright © 2013 Simon Forman
  This file is Xerblin.

  Xerblin is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Xerblin is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Xerblin.  If not, see <http://www.gnu.org/licenses/>.

*/

(function( xerblin, _, undefined ) {

  //Private Property
  var isHot = true;

  //Public Property
  xerblin.ingredient = "Bacon Strips";

  xerblin.push = function push(stack) {
    var args = _.toArray(arguments);
    args.shift();
    return _.reduce(args, function(stk, item) { return [item, stk]; }, stack);
  }

  xerblin.pop = function pop(stack, number) {
    var results = [], item;
    _.each(_.range(number), function() {
      item = stack[0];
      stack = stack[1];
      results.push(item);
    });
    results.push(stack);
    return results;
  }


  function insert(node, key, value) {

    if (node.length == 0) {
      return [key, value, [], []];
    }

    var node_key = node[0], node_value = node[1],
      lower = node[2], higher = node[3];

    if (key < node_key) {
      return [node_key, node_value, insert(lower, key, value), higher];
    }

    if (key > node_key) {
      return [node_key, node_value, lower, insert(higher, key, value)];
    }

    return [key, value, lower, higher];
  }

  function get(node, key) {

    if (node.length == 0) {
      throw "KeyError";
    }

    var node_key = node[0], node_value = node[1],
      lower = node[2], higher = node[3];

    if (key == node_key) {
      return node_value;
    }

    return get((key < node_key) ? lower : higher, key);
  }


  function del(node, key) {

    if (node.length == 0) {
      throw "KeyError";
    }

    var node_key = node[0], node_value = node[1],
      lower = node[2], higher = node[3];

    if (key < node_key) {
      return [node_key, node_value, del(lower, key), higher];
    }
    if (key > node_key) {
      return [node_key, node_value, lower, del(higher, key)];
    }

    if (lower.length == 0) { return higher; }
    if (higher.length == 0) { return lower; }

    node = lower;
    while (node[3].length != 0) { node = node[3]; };
    key = node[0], node_value = node[1];

    return [key, node_value, del(lower, key), higher];
  }

  function to_obj(node) {
    var args = _.toArray(arguments);
    var result = (args.length == 1) ? {} : args[1];

    if (node.length == 0) { return result; };

    var node_key = node[0], node_value = node[1],
      lower = node[2], higher = node[3];

    result[node_key] = node_value;
    to_obj(lower, result);
    to_obj(higher, result);

    return result;
  }


  function apply_func(I, func) {
    if (_.isArray(func)) {
      var handler = func[0];
      return handler(I, func);
    }
    return func(I);
  }

  function _pop_TOS(I) {
    var stack = I[0], dictionary = I[1];
    var TOS = stack[0];
    stack = stack[1]
    return [TOS, [stack, dictionary]];
  }

  function handle_sequence(I, seq) {
    var body = seq.slice(1);
    return _.reduce(body, function(interpreter, func) {
      return apply_func(interpreter, func);
    }, I);
  }

  function handle_branch(I, branch) {
    var it = _pop_TOS(I);
    var TOS = it[0];
    var func = branch[(!!TOS) ? 1 : 2]; // i.e. true = 1; false = 2
    return apply_func(it[1], func);
  }

  function handle_loop(I, loop) {
    while (true) {
      var it = _pop_TOS(I);
      var TOS = it[0];
      if (!TOS) { break; };
      I = handle_sequence(it[1], loop)
    }
    return I;
  }

  function interpret(I, command) {
    return _.reduce(command, function(interpreter, word) {
      var stack = interpreter[0], dictionary = interpreter[1];
      var n = Number(word);
      if (!_.isNaN(n)) {
        // Word is a number.
        return [[n, stack], dictionary];
      }
      n = word.length;
      if (word[0] == '"' && word[n - 1] == '"') {
        // Word is a string literal.
        var s = (n < 3) ? "" : word.substr(1, n - 2); // '"' and '""'...
        return [[s, stack], dictionary];
      }
      func = get(dictionary, word);
      return apply_func(interpreter, func);
    }, I);
  }


  var library = {

    dup: function dup(I) {
      var stack = I[0], TOS = stack[0];
      stack = push(stack, TOS);
      return [stack, I[1]];
    },

    swap: function swap(I) {
      var stack = I[0];
      var t = pop(stack, 2);
      stack = push(t[2], t[0], t[1])
      return [stack, I[1]];
    },

    drop: function drop(I) {
      return [I[0][1], I[1]];
    },

    lookup: function lookup(I) {
      var stack = I[0], name = stack[0];
      word = get(I[1], name)
      return [[word, stack[1]], I[1]];
    },

    inscribe: function inscribe(I) {
      var stack = I[0];
      var t = pop(stack, 2);
      var name = t[0], word = t[1];
      stack = t[2];
      dictionary = insert(I[1], name, word)
      return [stack, dictionary];
    },

    NewSeqWord: function NewSeqWord(I) {
      var stack = I[0], s = [], item;
      while (stack.length != 0) {
        item = stack[0];
        stack = stack[1];
        s.push(item);
      }
      s.push(handle_sequence)
      stack = [s.reverse(), []];
      return [stack, I[1]];
    },

    NewLoopWord: function NewLoopWord(I) {
      var stack = I[0], s = [handle_loop], item;
      while (stack.length != 0) {
        item = stack[0];
        stack = stack[1];
        s.push(item);
      }
      s.push(handle_loop)
      stack = [s.reverse(), []];
      return [stack, I[1]];
    },

    NewBranchWord: function NewBranchWord(I) {
      var stack = I[0];
      var t = pop(stack, 2);
      var b = [handle_branch, t[0], t[1]];
      stack = [b, t[2]];
      return [stack, I[1]];
    },

  /*
    : function (I) {
      return [];
    },
  */

  }

  function create_new_interpreter() {
    var d = [];
    _.each(library, function(value, key) { d = insert(d, key, value); });
    return [[], d];
  }


}( window.xerblin = window.xerblin || {}, _ ));

