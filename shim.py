from xerblin import (
  World,
  words,
  ROOT,
  items,
  handle_sequence,
  handle_branch,
  handle_loop,
  enstacken,
  )
from types import FunctionType
import json


_D = dict(words)
for w in (handle_sequence, handle_branch, handle_loop, enstacken):
  _D[w.__name__] = w


def p(n):
  if isinstance(n, FunctionType):
    return {
      'class': '__function__',
      'name': n.__name__,
      }


def q(o):
  if o.get('class') == '__function__':
    return _D[o['name']]
  return o


##print json.loads(s, object_hook=q)


W = World()


def as_json(w=W):
  stack, dictionary = w.getCurrentState()
  dictionary = list(name for name, function in items(dictionary))
  return json.dumps((stack, dictionary), default=p, indent=2)


def get_session(foo):
  return W


def view(I):
  s = json.dumps(I, default=p, indent=2)
  print s ; print


def cmd_loop(w):
  while True:
    try:
      command = raw_input('> ').split()
    except EOFError:
      break
    w.step(command)
    print as_json(get_session(None))
