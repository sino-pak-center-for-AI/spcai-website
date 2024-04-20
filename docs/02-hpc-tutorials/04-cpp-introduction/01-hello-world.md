# Hello World

## Choosing a Compiler

There are many C++ compilers.

1. **GNU compiler collection (GCC)**: The standard C/C++ compiler provided on most Linux systems. Linux-only.
1. **Clang**: Clang provides various extensions that can be used to build custom compiler add-ons. Cross-platform.
   Standard on Mac.
1. **Microsoft Visual C++ (MSVC)**: The standard C/C++ compiler for Windows.
1. **Intel Compiler**: Sometimes used. Optimizations for intel products.
1. **MinGW**: Like gcc, except works on Windows.

Generally, we prioritize compiling for Linux systems. This means we typically focus on gcc and occasionally clang. Clang is a more modern compiler with many advanced features and better warnings and error messages. However, we generally focus on gcc.

## Introduction

In this example, we will demonstrate how print text to a terminal. One of the main use of printing is for debugging.
Tools such as [Google Logger](https://github.com/google/glog), are used to make print statements to help determine
where a program crashes, without having to use an expensive debugger all the time.

## Setup

```bash
cd ${SCS_TUTORIAL}/cpp_hello_world
```

## C++ Source File

Below is the code in `hello_world.cc`.

```cpp
#include <stdio.h>
#include <iostream>

int main() {
  printf("Hello world 0\n");
  std::cout << "hello world 1" << std::endl;
  return 0;
}
```

We will describe this step-by-step.

## C++ Header Files

```cpp
#include <stdio.h>
#include <iostream>
```

`#include` is used to instruct the C++ compiler where to find header files. In our case, the header files being included are
"`stdio.h`" and "`iostream`". Header files typically contain the definitions of functions. They have the same syntax as a source
file, but they don't typically have as much code logic.

To find header files, compilers will search a number of places. For example, "`/usr/include`" will typically contain "`stdio.h`"
and "`/usr/include/c++`" may contain iostream. These paths are subject to change depending on the gcc version and OS.

In our case, "`stdio.h`" is where printf is defined, and "`iostream`" is where `std::cout` is defined.

## Program start

```cpp
int main() {
  // code here...
}
```

The main function is required in order to execute a C++ program. When you launch a program, the main function is where
the code execution begins.

## Console output

```cpp
printf("Hello world 0\n");
std::cout << "Hello world 1" << std::endl;
```

1. Text is always in double quotes `""`
1. "`\n`" in "Hello world 0" means "new line". Analogous to hitting the <kbd>Enter</kbd> key on your keyboard in a text editor.
1. `std::cout` uses left shift operator (`<<`) to print to console
1. `std::endl` is equivalent to '`\n`'
1. `printf` takes the text as a function parameter

Both `printf` and `cout` are valid ways of printing. Typically `cout` is preferred in C++ programs, but you'll likely see
both in example programs.

## Program return

```cpp
int main() {
  // code here...
  return 0;
}
```

Main returns an integer "`int`". This indicates the success or failure of a program. Generally, a return value of "`0`" indicates
the program succeeded. Any other value indicates a failure and the reason for failure.

## Building

We will build this code manually using gcc. It is generally a bad idea to compile things manually, but the knowledge of how
the compiler is called will be helpful.

Here we will use gcc to compile the program "`hello_world.cc`".

```bash
g++ hello_world.cc -o hello_world
```

This will produce an executable file called "hello_world". To run the code:

```bash
./hello_world
```

The output will be:

```sh
hello world 0
hello world 1
```

To view the return code of the program in Linux:

```sh
$?
```

The output will be:

```sh
0
```

which is what we returned using the `return` statement.
