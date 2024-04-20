# Building From Scratch

When `spack` fails, there aren't many options but to build the code from scratch. This is typically an arduous,
poorly documented, and often times frustrating process. Here will provide some simple examples of how to build
various HPC programs from scratch.

## Setup

```bash
mkdir ${SCS_TUTORIAL}/2.2.1.scratch
cd ${SCS_TUTORIAL}/2.2.1.scratch
mkdir src
mkdir install
```

- `src`: will contain the source code of the programs we're building
- `install`: will contain the compiled code of the programs

## Overview of Build Systems

There are many build systems you may encounter when building from source

1. Autotools
1. Make
1. CMake
1. Ninja
1. Meson

## Example: Zlib

Zlib is foundational to nearly every package in HPC. Zlib is a compression library. Zlib uses Autotools as its build system.

### Download + Decompress

First we will download and decompress the zlib package.

```bash
wget https://www.zlib.net/zlib-1.3.tar.gz
tar -xzf zlib-1.3.tar.gz
```

### Configure

Next we will configure Zlib to the particular machine.

```bash
cd zlib-1.2.13
./configure --prefix=${SCS_TUTORIAL}/2.2.1.scratch/install
```

The output of ./configure is a Makefile.

`--prefix` tells the Autotools configurator where to install compiled code after building. If left unset, this will default to `/usr`.

To see a full list of configure options, do

```bash
./configure -h
```

### Make

After running configure, we will use the machine-specific Makefile to actually compile the code. This is done as follows:

```bash
make -j8
```

`-j` indicates the amount of parallelism to use when building the progam. In our case we use 8 threads. Don't use more threads than
you have cores on your machine.

### Install

Lastly, we install using:

```bash
make install
```

This will populate the install directory with the compiled data.
