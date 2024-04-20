# Building With Spack

[Spack](https://github.com/spack/spack.git) is a system for installing packages for HPC centers. Spack
can be easily installed on supercomputers since it does not require root privileges. Spack works by
building code from source.

This section provides an overview of installing software with spack and some of the complexities of spack.
This is not a full documentation of spack, it just contains the things we see come up often. Read through
their [documentation](https://spack.readthedocs.io/en/latest/) to understand better how to use spack.

Spack is by no means perfect. It has plenty of bugs and nuances.

## Installing `spack`

The official install guide for `spack` is [here](https://spack-tutorial.readthedocs.io/en/latest/tutorial_basics.html).
Since the install is fairly simple, we'll just repeat here:

```bash
# Clone spack into your current directory
# This will clone spack v0.20
git clone --depth=100 --branch=releases/v0.20 https://github.com/spack/spack.git
# Setup the spack environment for this shell
# This will modify environment variables
cd spack
. share/spack/setup-env.sh
# Ensure that spack is loaded every time you reboot or start a new shell
# ~/.bashrc is called every time you login
echo ". ${PWD}/share/spack/setup-env.sh" >> ~/.bashrc
```

NOTE: `spack` creates a folder in your `HOME` directory for storing caches. The folder is located at `~/.spack`.

```bash
ls ~/.spack
```

## Uninstalling `spack`

```bash
# All packages will be installed under your cloned spack directory
rm -rf /path/to/spack
# Spack automatically creates ~/.spack for holding caches
rm -rf ~/.spack
# Remove ". ${PWD}/share/spack/setup-env.sh" from ~/.bashrc
```

## List packages provided by `spack`

To identify the set of packages that spack can install, use `spack list`.

```bash
# List every package spack has
spack list
# Will list all packages which have the word zlib
spack list zlib
```

Spack packages also have various properties:

1. Version: the available versions of a package
1. Variants: add, remove, or modify features of the package. For example, zlib provides a variants for enabling/disabling compiler optimization.
1. Dependencies: the software this package depends on.

```bash
# Will list the details of a package (versions, description, etc.)
spack info zlib
```

In our case, the output is:

```sh
Package:   zlib

Description:
    A free, general-purpose, legally unencumbered lossless data-compression
    library.

Homepage: https://zlib.net

Preferred version:
    1.2.12    https://zlib.net/fossils/zlib-1.2.12.tar.gz

Safe versions:
    1.2.12    https://zlib.net/fossils/zlib-1.2.12.tar.gz

Deprecated versions:
    1.2.11    https://zlib.net/fossils/zlib-1.2.11.tar.gz
    1.2.8     https://zlib.net/fossils/zlib-1.2.8.tar.gz
    1.2.3     https://zlib.net/fossils/zlib-1.2.3.tar.gz

Variants:
    Name [Default]    When    Allowed values    Description
    ==============    ====    ==============    ===================================================

    optimize [on]     --      on, off           Enable -O2 for a more optimized lib
    pic [on]          --      on, off           Produce position-independent code (for shared libs)
    shared [on]       --      on, off           Enables the build of shared libraries.

Build Dependencies:
    None

Link Dependencies:
    None

Run Dependencies:
    None
```

This output may change with different versions of `spack`.

## Install packages

There are many parameters that can be set when installing a package. However, the installation methods that come up most often are below:

```bash
# This will install the default tar package
spack install zlib
# This will install zlib version 1.2.12
# This should say zlib 1.2.12 is already installed
spack install zlib@1.2.12
# This will install zlib 1.2.11 without optimization
# The "-" in -optimize means subtract
spack install zlib@1.2.12 -optimize
# This will install zlib 1.2.11 with optimization
# The "+" in +optimize means add
# This will say that zlib is already installed,
# since +optimize is enabled by default
spack install zlib@1.2.12 +optimize
```

## List installed packages

### All installed packages

To find all installed packages, run:

```bash
spack find
```

### Particular package

To find a particluar package, run:

```bash
spack find zlib
```

Output:

```sh
==> 2 installed packages
-- linux-linuxmint20-zen2 / gcc@9.3.0 ---------------------------
zlib@1.2.12  zlib@1.2.12
```

This output is unhelpful since there are two different versions of `zlib` installed.

### Particular package with verbosity

To get a more verbose output to identify differences between packages, run:

```bash
spack find -f -v zlib
```

Output:

```sh
==> 2 installed packages
-- linux-linuxmint20-zen2 / gcc@9.3.0 ---------------------------
zlib@1.2.12%gcc ~optimize+pic+shared patches=0d38234  zlib@1.2.12%gcc +optimize+pic+shared patches=0d38234
```

## Load packages

In order to make use of a spack package, the package must be loaded. Spack primarily works by setting environment
variables, such as `PATH` and `LD_LIBRARY_PATH`.

To load the environment variables, do:

```bash
# Load the version of zlib with optimization
spack load zlib +optimize
```

Spack load must be executed every time you open a new shell or reboot your computer. You can add the spack load to your
`~/.bashrc` to avoid having to do this.

There are various caveats to know about spack load:

1. Spack packages for C++ libraries may use the `CMAKE_PREFIX_PATH` variable and not set any other environment variable.
   This means you really do need to use CMake when building C++ projects and using spack for installing things. CMake is
   discussed later, just be warned that some spack packages do this and building using methods alternative to CMake
   (e.g., building manually) will likely fail.
1. Sometimes calling spack load can cause conflict with system packages. Unless otherwise specified, spack will install
   everything -- even things which your system already has installed. This can cause programs to break. I notice that `vim`
   and `nano` sometimes segfault after spack load because it installs custom versions of software that vim and nano were not
   compiled with.
1. You should not run spack load for two different versions of the same package. This will almost definitely lead to correctness
   problems.

## Unload packages

To unload a package's changes to the current environment, run:

```bash
# Unloads every spack package
spack unload
# Unload the zlib package specifically
spack unload zlib
```

## Uninstall packages

To uninstall packages, run:

```bash
# Uninstall a specific package
# Will fail if more than one package matches query
spack uninstall zlib +optimize
# Uninstall all packages matching query
spack uninstall --all zlib
```

## What happens if `spack` fails?

Sometimes, you may find that a package fails to compile for some reason. These are the general steps to take when something goes wrong:

1. Check if the software version you're installing is compatible with your machine. If it's not easy to discover with Google or
   AI, then move on to step 2. It's likely a bug in the spack package
1. Try checking if there is a new stable release of spack. If so, try upgrading by switching to that version. You should be able to do
   this without destroying all of your packages by using `git checkout`
1. Try deleting your spack cache directory. `rm -rf ~/.spack` And then try reinstalling the package.
1. Try reinstalling spack by following 2.1.2 and 2.1.1 instructions
1. Submit an issue to the spack team. They aren't a very large team, so it may take time to address. You'll have to either find another
   package or install from scratch

Sometimes, spack may successfully install the package, but you may still find that your program doesn't compile or execute. If this is
the case, you'll have to do some research (Google, ChatGPT, etc.) to identify why this is happening. You may also find it helpful
to check exactly what spack installed. You can find where spack installed your package as follows:

```bash
# Find where the "zlib" package is installed
spack find --paths zlib
```
