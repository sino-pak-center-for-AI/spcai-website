# Argument Parsing

We provide a custom argument parsing implementation. The main difference between
this argparser and others is that we support the concept of "menus".
Jarvis calls sub-modules, which each have their own specific interfaces.
There are sub-modules for modifying the resource graph, initializing jarvis,
creating pipelines, etc. These modules each have different parameter spaces.

## Defining Arguments

The `ArgParse` class has an abstract method called define_options. Create
a class inheriting from that method and use define_options to make the menu.

We have the example [basic_argparse.py](https://github.com/grc-iit/jarvis-util/blob/master/example/basic_argparse.py) below:

```python
from jarvis_util.util.argparse import ArgParse

class MyArgParse(ArgParse):
    def define_options(self):
        self.add_menu()
        self.add_args([
            {
                'name': 'hello',
                'msg': 'A message to print',
                'type': str,  # The type of this variable
                'required': True,  # This argument is required
                'pos': True,  # This is a positional argument
            },
            {
                'name': 'hello_optional',
                'msg': 'An optional message to print',
                'type': str,  # The type of the variable to produce
                'default': 'no optional message given',
                'required': False,  # This argument is not required
                'pos': True,  # This is a positional argument
            },
            {
                'name': 'hello_kwarg',
                'msg': 'An integer keyword argument to print',
                'type': int,  # The type of the variable
                'default': 0,
            },
        ])

    # When add_menu has no parameters, process_args will call this function
    def main_menu(self):
        # Parsed parameters are placed in self.kwargs
        print(self.kwargs['hello'])
        print(self.kwargs['hello_optional'])
        print(self.kwargs['hello_kwarg'])
        print(self.real_kwargs)


args = MyArgParse()
args.process_args()
```

### Required Positional Arguments

The first argument we defined was "hello", which is a required parameter.

```python
{
    'name': 'hello',
    'msg': 'A message to print',
    'type': str,  # The type of this variable
    'required': True,  # This argument is required
    'pos': True,  # This is a positional argument
}
```

This is the only required parameter in this case. We can run the program
above with only this one parameter.

```bash
python3 example/basic_argparse.py 'my required msg'
```

Output:

```
my required msg
no optional message given
0
{'hello_kwarg': 0, 'hello': 'my required msg', 'hello_optional': 'no optional message given'}
{'hello': 'my required msg'}
```

### Optional Positional Arguments

The second argument we defined was "hello_optional", which is optional.

```python
{
    'name': 'hello_optional',
    'msg': 'An optional message to print',
    'type': str,  # The type of the variable to produce
    'default': 'no optional message given',
    'required': False,  # This argument is not required
    'pos': True,  # This is a positional argument
}
```

To input the optional positional parameter, run the command below:

```bash
python3 example/basic_argparse.py 'my required msg' 'my optional message'
```

Output:

```
my required msg
my optional message
0
{'hello_kwarg': 0, 'hello': 'my required msg', 'hello_optional': 'my optional message'}
{'hello': 'my required msg', 'hello_optional': 'my optional message'}
```

### `keyword` Arguments

The third argument we defined was "hello_kwarg". keyword arguments are
always optional. The default value, if not specified, will be None.

```python
{
    'name': 'hello_kwarg',
    'msg': 'An integer keyword argument to print',
    'type': int,  # The type of the variable
    'default': 0,
}
```

The following commands are all correct and mean the same thing. You can
use -- and - in front of keyword arguments. They mean the same thing.
We support this for more legacy reasons.

```bash
python3 example/basic_argparse.py 'my required msg' hello_kwarg=124
python3 example/basic_argparse.py 'my required msg' --hello_kwarg=124
python3 example/basic_argparse.py 'my required msg' -hello_kwarg=124
```

In each case, the output is:

```
my required msg
no optional message given
124
{'hello_kwarg': 124, 'hello': 'my required msg', 'hello_optional': 'no optional message given'}
{'hello': 'my required msg', 'hello_kwarg': 124}
```

### Detecting Explicitly Set Parameters

Sometimes, it's good to know what parameters the user set explicitly, without filling in default values for everything. self.kwargs stores the entire parameter scope with default values filled in, whereas self.real_kwargs stores the values passed in specifically by the users.

```
python3 example/basic_argparse.py 'my required msg' hello_kwarg=124
```

Output:

```
my required msg
no optional message given
124
{'hello_kwarg': 124, 'hello': 'my required msg', 'hello_optional': 'no optional message given'}
{'hello': 'my required msg', 'hello_kwarg': 124}
```

Notice that self.real_kwargs (last line) does not have 'hello_optional', since it was not passed explicitly by the user.

### Help

You can print the help message by using the "h" or "help" keyword arguments.
These are provided automatically and should not be manually defined.

```bash
python3 example/basic_argparse.py h
python3 example/basic_argparse.py -h
python3 example/basic_argparse.py --help
python3 example/basic_argparse.py -help
python3 example/basic_argparse.py help
```

In each case, the output is:

```bash
USAGE: basic_argparse.py  [hello] [hello_optional (opt)] ...

Name            Default                    Type    Description
--------------  -------------------------  ------  -------------------------------------
hello                                      str     A message to print
hello_optional  no optional message given  str     An optional message to print
hello_kwarg     0                          int     An integer keyword argument to print
help            False                      bool    Print help menu
h               False                      bool    Print help menu
```

## Menus

Let's say we're building an application launcher. Each application has it's
own parameter space. We have two applications:

1. VPIC: A particle simulator code
2. BD-CATS: A particle clustering code

VPIC only has one operation: to generate the particle data.

BD-CATS has two operations: cluster the particle data and then visualize
the clustering by rendering an image at a certain resolution.

Below is the code from [example/menu_argparse.py](https://github.com/grc-iit/jarvis-util/blob/master/example/menu_argparse.py):

```python
from jarvis_util.util.argparse import ArgParse


class MyArgParse(ArgParse):
    def define_options(self):
        self.add_menu('vpic')
        self.add_args([
            {
                'name': 'steps',
                'msg': 'Number of execution steps',
                'type': int,  # The type of this variable
                'required': True,  # This argument is required
                'pos': True,  # This is a positional argument
            }
        ])

        self.add_menu('bd-cats run')
        self.add_args([
            {
                'name': 'path',
                'msg': 'Path to particle data',
                'type': str,  # The type of this variable
                'required': True,  # This argument is required
                'pos': True,  # This is a positional argument
            }
        ])

        self.add_menu('bd-cats draw')
        self.add_args([
            {
                'name': 'resolution',
                'msg': 'Dimensions of the image to create',
                'type': str,  # The type of this variable
                'required': True,  # This argument is required
                'pos': True,  # This is a positional argument
            }
        ])

    def vpic(self):
        print(f'Starting VPIC with {self.kwargs["steps"]} steps')

    def bd_cats_run(self):
        print(f'Starting BD-CATS with {self.kwargs["path"]}')

    def bd_cats_draw(self):
        print(f'Drawing BD-CATS output at {self.kwargs["resolution"]}')


args = MyArgParse()
args.process_args()
```

process_args will execute the function corresponding to the menu name.
In this case, the menu names are:

1. vpic
2. bdcats run
3. bdcats draw

### VPIC Menu

The following code defines the VPIC menu

```python
self.add_menu('vpic')
self.add_args([
    {
        'name': 'steps',
        'msg': 'Number of execution steps',
        'type': int,  # The type of this variable
        'required': True,  # This argument is required
        'pos': True,  # This is a positional argument
    }
])
```

To execute the VPIC menu:

```
python3 example/menu_argparse.py vpic 24
```

Output:

```bash
Starting VPIC with 24 steps
```

### BD-CATS Run Menu

```python
self.add_menu('bd-cats draw')
self.add_args([
    {
        'name': 'resolution',
        'msg': 'Dimensions of the image to create',
        'type': str,  # The type of this variable
        'required': True,  # This argument is required
        'pos': True,  # This is a positional argument
    }
])
```

process_args will search for the method name corresponding to 'bd-cats draw'.
The corresponding method name replaces all spaces with '\_' and all '-' with
'\_'. In this case, it will search for bd_cats_run.

To execute the BD-CATS run menu:

```
python3 example/menu_argparse.py bd-cats run /tmp/output.bin
```

Output:

```bash
Starting BD-CATS with /tmp/output.bin
```

### BD-CATS Draw Menu

```python
self.add_menu('bd-cats draw')
self.add_args([
    {
        'name': 'resolution',
        'msg': 'Dimensions of the image to create',
        'type': str,  # The type of this variable
        'required': True,  # This argument is required
        'pos': True,  # This is a positional argument
    }
])
```

process_args will search for the method name corresponding to 'bd-cats draw'.
The corresponding method name replaces all spaces with '\_' and all '-' with
'\_'. In this case, it will search for bd_cats_draw.

To execute the BD-CATS draw menu:

```
python3 example/menu_argparse.py bd-cats run /tmp/output.bin
```

Output:

```bash
Drawing BD-CATS output at 4096x4096
```

## Argument Types

We currently support five main types of arguments:

1. Strings
2. Integers
3. Floats
4. Booleans
5. Lists of the above types

Of these, booleans and lists are somewhat special.

### Boolean Arguments

Booleans are special in the sense that they have a special command line
syntax when used as keyword arguments (as opposed to positional).

Let's say we are at a restaurant and are ordering pasta. You have
two options: with cheese and without cheese.

Below is the code from [example/boolean_spaghetti.py](https://github.com/grc-iit/jarvis-util/blob/master/example/boolean_spaghetti.py).

```python
from jarvis_util.util.argparse import ArgParse

class MyArgParse(ArgParse):
    def define_options(self):
        self.add_menu('spaghetti')
        self.add_args([
            {
                'name': 'cheese',
                'msg': 'Whether to use cheese',
                'type': bool,  # The type of this variable
                'default': True
            }
        ])

    def spaghetti(self):
        if self.kwargs['cheese']:
            print('I will take the spaghetti with cheese')
        else:
            print('I want actual Italian, and will not take your cheese')


args = MyArgParse()
args.process_args()
```

#### `True`

There are two ways to indicate truth

```bash
python3 example/boolean_spaghetti.py spaghetti --cheese=true
python3 example/boolean_spaghetti.py spaghetti +cheese
```

Output:

```bash
I will take the spaghetti with cheese
```

#### `False`

There are two ways to indicate false

```bash
python3 example/boolean_spaghetti.py spaghetti --cheese=false
python3 example/boolean_spaghetti.py spaghetti -cheese
```

Output:

```bash
I want actual Italian, and will not take your cheese
```

### List Arguments

There are many cases where having a list of information is needed.
One case that comes up is deciding which nodes in a distributed system
to execute software. For this case, we use a list of strings.

Below we have an example of running the VPIC application on a set
of machines in parallel.

```python
from jarvis_util.util.argparse import ArgParse


class MyArgParse(ArgParse):
    def define_options(self):
        self.add_menu('vpic run',
                      keep_remainder=False)
        self.add_args([
            {
                'name': 'hosts',
                'msg': 'A list of hosts and threads pr',
                'type': list,
                'args': [
                    {
                        'name': 'host',
                        'msg': 'A string representing a host',
                        'type': str,
                    }
                ]
            }
        ])

    def vpic_run(self):
        print(self.kwargs['hosts'])


args = MyArgParse()
args.process_args()
```

To pass a list of strings, run the following:

```bash
python3 example/hostfile_test.py vpic run --hosts="[127.0.0.1, 10.0.0.1]"
```

Output:

```bash
['127.0.0.1', '10.0.0.1']
```

### Nested List Arguments

Sometimes, you may want to have a list of lists. We use YAML format
to parse such a thing.

```python
from jarvis_util.util.argparse import ArgParse


class MyArgParse(ArgParse):
    def define_options(self):
        self.add_menu('vpic run',
                      keep_remainder=False)
        self.add_args([
            {
                'name': 'hosts',
                'msg': 'A list of hosts and threads per-host',
                'type': list,
                'args': [
                    {
                        'name': 'host',
                        'msg': 'Host name',
                        'type': str,
                    },
                    {
                        'name': 'count',
                        'msg': 'The number of devices to search for',
                        'type': int,
                    }
                ]
            }
        ])


args = MyArgParse()
args.process_args()
```

To pass a list of strings and ints, run the following:

```bash
python3 example/hostfile_threads_test.py vpic run --hosts="[[127.0.0.1, 4], [10.0.0.1, 4]]"
```

Output:

```bash
[['127.0.0.1', 4], ['10.0.0.1', 4]]
```

## Tracking Remaining Arguments

Sometimes, you don't want your argument parser to error if a parameter is
unrecognized. You may want to implement a special syntax for parsing the
remaining parameters.

In this case, menus provide the "keep_remainder" option and "remainder_as_kv" options.

### List Remainder

```python
from jarvis_util.util.argparse import ArgParse


class MyArgParse(ArgParse):
    def define_options(self):
        self.add_menu(keep_remainder=True)
        self.add_args([
            {
                'name': 'hi',
                'msg': 'hello',
                'type': str,
                'default': None
            }
        ])

    def main_menu(self):
        print(self.kwargs['hi'])
        print(self.remainder)


args = MyArgParse()
args.process_args()
```

This will create a keyword argument name "hi", which takes as input a string,
and keeps the remaining arguments in a list named "self.remainder".

Run the following command:

```bash
python3 example/remainder.py --hi=hi 1 2 3 4 5
```

Output:

```bash
hi
['1', '2', '3', '4', '5']
```

### Key-Value Remainder

Sometimes the remainder should be stored as a dict instead of
a list.

```python
from jarvis_util.util.argparse import ArgParse


class MyArgParse(ArgParse):
    def define_options(self):
        self.add_menu(keep_remainder=True,
                      remainder_as_kv=True)
        self.add_args([
            {
                'name': 'hi',
                'msg': 'hello',
                'type': str,
                'default': None
            }
        ])

    def main_menu(self):
        print(self.kwargs['hi'])
        print(self.remainder_kv)


args = MyArgParse()
args.process_args()
```

This will create a keyword argument name "hi", which takes as input a string, and keeps the remaining arguments in a dict named "self.remainder_kv".

Run the following command:

```bash
python3 example/remainder_kv.py --hi=hi VAR1=25 VAR2=26
```

```bash
hi
{'VAR1': '25', 'VAR2': '26'}
```

## Choice Arguments

Sometimes you have parameters which have a well-defined set of values.
In this case, you can define 'choices'.

```python
from jarvis_util.util.argparse import ArgParse


class MyArgParse(ArgParse):
    def define_options(self):
        self.add_menu()
        self.add_args([
            {
                'name': 'hi',
                'msg': 'hello',
                'type': str,
                'choices': ['a', 'b', 'c'],
                'default': None
            }
        ])

    def main_menu(self):
        print(self.kwargs['hi'])


args = MyArgParse()
args.process_args()
```

Example of correct input:

```bash
python3 example/choices.py hi=a
```

```bash
a
```

Example of incorrect input:

```bash
python3 example/choices.py hi=d
```

```bash
In the menu , hi=d is not a valid choice
USAGE: choices.py   ...

Name    Default    Type    Description
------  ---------  ------  ---------------
hi                 str     hello
help    False      bool    Print help menu
h       False      bool    Print help menu
In the menu , hi was not of type <class 'str'>
USAGE: choices.py   ...
```
