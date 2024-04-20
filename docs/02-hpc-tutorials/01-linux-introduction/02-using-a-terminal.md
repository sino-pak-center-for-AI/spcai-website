# Basics of using a Terminal

In this section, we will use Ubuntu 22.04 as our Linux distro. First, we will discuss the basic aspects of using a Linux terminal.

A terminal provides a way of interacting with the OS using a command prompt. Users enter commands into the terminal based on memory
instead of using a graphical user interface (GUI). This can be faster since it avoids clicking and memorizing menus. However, it is
also necessary since many HPC machines are remote and do not support fancy GUIs. There are many commands Linux users should be
familiar with in general.

## Interacting with the Filesystem

Examples of the basic filesystem operations are as follows:

```bash
# Change directory to your home directory
# ~/ is shorthand for home directory
# ~ is a special character used by the terminal
cd ~/

# Create a directory
mkdir hello

# Create directories + subdirectories
mkdir -p hello/hi/hi2

# Change into the "hello" directory
# cd: "change directory"
cd hello

# Create 4 empty files
touch hi.txt
touch hi2.txt
touch hi3.txt hi4.txt

# List the hello directory (view its contents)
ls hello

# Change into the "hi2" directory
# NOTE: ./ is optional
# cd hi/hi2 would do the same thing
cd ./hi/hi2

# Go to the parent directory (hi)
cd ..
# Go to hello's parent
cd ../../

# Remove 3 of the files
# NOTE: rm is permanent, data recovery is not really possible
rm hello/hi.txt
rm hello/hi2.txt hello/hi3.txt

# Remove directories and subdirectories
# "r" means to "recursively" delete all data in the directory
# "f" means "force" delete the directory without asking for confirmation
rm -rf hello

# Append a string to a file
# >> is the append operator
# hello.txt contains 2525
echo "25" >> hello.txt
echo "25" >> hello.txt

# Create a new file with string as its data
# > truncates a file and replaces its text with the echo'd string
# hello.txt contains 30
echo "30" > hello.txt
```

## Environment variables

Environment variables are used to store some sort of information without having to hard-code it each time.
Many programs rely on environment variables as a way of passing information to the program.

### Printing Environment Variables

To set an environment variable and print it, run:

```bash
MY_VAR=25
echo ${MY_VAR}
```

Output:

```bash
25
```

### Environment Variable Scope

Scope refers to the visibility of a variable. For example, can a program read the environment variable after it has been set?

Let's say we have the following bash script named `printenv.sh`:

```bash
#!/bin/bash

echo ${MY_VAR}
```

To use this bash script, run:

```bash
cd ${SCS_TUTORIAL}/1.1.linux_intro
```

### Limited Scope

Run the following code:

```bash
MY_VAR=25
bash printenv.sh
```

Output:

```bash

```

The output is empty. This is because the scope of `MY_VAR` is limited to the current shell. When launching `printenv.sh`,
a new shell is created and the variable `MY_VAR` is not passed to it.

### Pass Environment Variables

To pass environment variables to programs, run the following:

```bash
MY_VAR=25
MY_VAR=20 bash printenv.sh
echo ${MY_VAR}
```

Output:

```bash
20
25
```

In this example, `MY_VAR=20` is passed to `printenv.sh`, which then prints `20`. However, `MY_VAR=20` does not change the
value of `MY_VAR` in the parent shell. Running `echo ${MY_VAR}` prints `25`, which was the original value.

### Export Environment Variables

Exporting an environment variables modifies the value of the variable in the current shell and passes the variable to
programs executed in the shell.

```bash
export MY_VAR=20
bash printenv.sh
echo ${MY_VAR}
```

Output:

```bash
20
```

### Removing Environment Variables

To remove an environment variable:

```bash
unset MY_VAR
bash printenv.sh
```

Output:

```bash

```

### Common Environment Variables

Below we describe some environment variables that come automatically when you open a terminal:

```bash
# HOME represents your home directory
echo "HOME=${HOME}"
cd ${HOME}
# PWD stands for print working directory
# Output will be equivalent to ${HOME} in this case
echo "PWD=${PWD}"
# USER represents your username
echo "USER=${USER}"
```

This list is not comprehensive, and there are many more variables that are important -- but they will
be discussed later.

### Bashrc: Saving Environment Variables

In your home directory, there is a file called `~/.bashrc`. This file is executed every time you open a shell.
This file can be used for storing environment variables.

Bashrc contains a bunch of code. This code is used to initialize the state of a shell. Typically it's best to
place environment variables at the bottom of the bashrc file. This can be done as follows:

```bash
echo "export MY_VAR=30" >> ~/.bashrc
```

1. `echo "MY_VAR=25"` will print the string `"MY_VAR=25"`.
1. `>>` will append the string `"MY_VAR=25"` to `~/.bashrc`

If you open ~/.bashrc you should see at the bottom of the file is that export statement.

Note, appending the export statement does NOT rerun the bashrc script. Your current shell will not be updated yet.
To execute the bashrc script and update the current shell, run:

```bash
source ~/.bashrc
echo ${MY_VAR}
```

Output:

```bash
30
```

## Simple text editing

There are three main terminal text editors: nano, vim, and emacs. vim and emacs rely heavily on memorizing key bindings.
For new users, this is typically challenging. In general, we do not code using terminal text editors, we only use them to
do minor changes. We recommend that large changes to files be made in an IDE, office tool, or graphical text editor.

For this reason, we will discuss only the basics of vim and nano. We will not touch emacs, as vim and nano are almost
always the default text editors. Generally, we recommend nano since it's simple. Some cases, vim may be the default,
so it will be discussed too.

### Nano

To open or create a file using nano, do the following:

```bash
nano ~/hello.txt
```

The file can be edited immediately (if you have edit rights to the file).

The main keybindings to be aware of are as follows:

1. "<kbd>Ctrl</kbd> <kbd>s</kbd>" will save a file
1. "<kbd>Ctrl</kbd> <kbd>x</kbd>" will close the file

NOTE: `nano` does not come by default on every single machine. You may have to install separately.

### Vim

To open a file using vim, do the following:

```bash
vi ~/hello.txt
```

When the file is opened, the main keybindings to consider are is follows:

1. Initially, the file is opened in "normal mode". **You must press "<kbd>i</kbd>" in order to switch to "edit mode"**.
1. When you have finished editing, press <kbd>ESC</kbd> on your keyboard. This will bring you back to normal mode
1. Press <kbd>:</kbd> to bring you into "command mode"
1. Then type "wq" to "write" and then "quit". Press enter, and the editor will close

NOTE: if you accidentally press "<kbd>Ctrl</kbd> <kbd>s</kbd>", you will not be able to type anything (not even commands).
To get out of this, type "<kbd>Ctrl</kbd> <kbd>q</kbd>"
