# Building Hermes

## Dependencies

* A C++ compiler that supports C++ 17. GCC 9.4 is the minimum version of GCC that Hermes was tested with.
* [Thallium](https://mochi.readthedocs.io/en/latest/installing.html) - RPC library for HPC. Use a version greater than `0.5` for RoCE support.
* [yaml-cpp](https://github.com/jbeder/yaml-cpp) - YAML file parser
* [hermes_shm](https://github.com/lukemartinlogan/hermes_shm): A library containing shared-memory data structures, configuration parsing, and various helper utilities
* HDF5 1.14.0 if compiling with VFD
* MPI-IO adapter only tested with MPICH and OpenMPI.

## Bootstrapping Spack

[Spack](https://spack.io/) is the easiest way to get Hermes and all its dependencies installed.

First, add the Hermes spack repo:
```bash
git clone https://github.com/HDFGroup/hermes
cd hermes
git submodule update --init --recursive
spack repo add ci/hermes
```

Second, introspect your machine to ensure that spack considers software already present on your machine. If there are modulefiles, make sure all relevant modulefiles have been loaded before executing this command.
You should ensure that any modules relating to networking (e.g., libfabric or UCX) and MPI are loaded, since they are likely specialized to your machine:
```bash
spack external find
```

Third, ensure that a recent compiler is added in spack. Hermes and some of its dependencies use the full C++17 feature set and require a compiler suitable of handling this:
```bash
spack compiler add
spack compiler list
```

<a id="installing-hermes"></a>
## Installing Hermes on a new machine with Spack

Before installing, you may want to verify that spack is going to
install Hermes with the correct dependencies.
```bash
spack spec -I hermes@master
```

Some questions you may want to ask yourself:
1. Is the correct MPI version being used?
2. Is the correct libfabric being used?

To install the default Hermes:
```bash
spack install hermes@master
```

Hermes additionally has variants for intercepting MPI-IO and HDF5. They
can be installed as follows:
```bash
spack install hermes+vfd+mpiio@master
```

If you intend to use high-performance networks such as verbs,
you will need to have knowledge of your specific system. This step is highly dependent on the machine, and you may need to consult your machine's documentation or sysadmin to determine what kind of network you use. If your machine uses infiniband, libfabric+verbs is probably for you. Libfabric does not come preinstalled with verbs support in spack.
```
spack install hermes@master ^ libfabric fabrics=rxm,sockets,tcp,udp,verbs
```

### Why is my spack installation failing?

While spack automates the installation of most dependencies, it is under active development and by no means perfect. We have identified several situations that have caused difficulty when installing Hermes across HPC sites. These issues are not necessarily related to Hermes itself, rather spack in general.

If Hermes fails to install use debug mode to get more information:
```bash
spack -d install hermes@master
```

#### Environment errors

Your machine may have specific expectations on certain dependencies.
By default, spack installs everything from scratch. However, if your
machine has software installed as modulefiles, spack will not see
these until explicitly told to.

We have found several instances of users installing Hermes before adding relevant modulefiles on their machine to spack. Probably the most important modules are MPI installations and networking libraries (e.g., libfabric, UCX, etc). This is because they are installed and configured specifically by the sysadmin for the particular machine. When installing Hermes, make sure any modulefile that you would typically use to build software is loaded and then run:

```bash
spack external find
```

To view the set of external packages discovered, run:
```bash
cat ~/.spack/packages.yaml
```

Spack external is not by any means perfect. You may find that some
modules you intend to use have not been automatically discovered.
In this situation, you can edit the packages.yaml file manually
to add the packages. The format of the yaml file is straightforward.

#### Dependency conflicts

There may be multiple versions of the same software installed at the
same time. To determine what dependencies Hermes will be using, run:
```bash
spack spec -I hermes@master
```

You may find that some dependencies are not the ones you had intended.
For example, maybe you have both MPICH 3.3.2 and 3.4.3 installed.
You can choose a specific version of a dependency using ``^``. Below
is an example of installing with mpich@3.3.2

```bash
spack install hermes@master ^ mpich@3.3.2
```

#### Compilation errors

Hermes and some of its dependencies (e.g., thallium) require C++17 support. Not all compilers support this -- even if they say they do.
GCC 8.5.0, for example, has partial C++17 support, but does not have the full feature set. Many HPC sites have old compilers loaded by default.
Ensure that a recent C++ compiler is used when compiling Hermes. As a guideline, GCC 9.4 is the earliest GCC version we have tested successfully on Hermes.

```bash
spack compiler add
```

In order to ensure that spack uses the correct compiler, you can
use the ``%`` symbol:
```bash
spack install hermes@master%gcc@9.4
```

#### Fetcher errors

A fetcher error occurs when a package fails to download. There are three reasons this may occur:
1. You lost internet connection when downloading. Ensure you are actually connected to the internet by pinging a well-known website such as google.
2. You are running on a restricted network and your proxy is misconfigured. In this case, you must contact your sysadmins to resolve the issue.
3. The spackage is outdated and contains a broken URL. Either contact the maintainers of the package or visit their documentation to make a custom installation.

#### Corruption

Spack can become corrupted if a package's installation is cutoff prematurely. There's not much that can be done here outside of reinstalling spack and the Hermes dependencies

To effectively uninstall spack:
```bash
# remove the spack metadata files
rm -rf ~/.spack
# remove the cloned spack repo
rm -rf /path/to/spack
```

## Building Hermes with CMake

For those developing Hermes, uninstalling and reinstalling from spack
is extremely cumbersome. As an alternative to spack, Hermes can be
installed manually with a combination of spack and CMake.

### Install Dependencies

#### Hermes
Install Hermes as you typically would following the instructrions
in [Section 1](#installing-hermes). While the Hermes version itself
is not useful, the installation process will install all dependencies
which will make life much easier for a manual Hermes build. To save
some time, you could choose to install ``hermes_shm`` instead, which contains the same dependencies and variants as Hermes itself.

#### (Optional) SCSPKG
To help with managing the organization of manually-built software, we created a tool called [SCSPKG](https://github.com/grc-iit/scspkg) that helps automate the construction of modulefiles.

```bash
git clone https://github.com/grc-iit/scspkg.git
cd scspkg
pip install -e . --user
echo "module use $(scspkg module dir)" >> ~/.bashrc
scspkg init False
```

### Build Hermes

#### Load Hermes dependencies
First, load all Hermes dependencies. Hermes_shm is a spackage that
contains the same exact dependencies as the full Hermes code:
```bash
spack load hermes_shm
```

#### (Optional) Create a Hermes SCSPKG repo

An SCSPKG repo for Hermes can be created as follows:
```bash
scspkg create hermes_run
```

This will do three things:
1. Create the **source** directory, which is where uncompiled source code is stored. Hermes, for example, could be cloned in this directory -- **although this is not required**. This directory is created to help developers organize and prevent cluttering their home directory.
2. Create the **root** directory, which is where compiled code is installed to. I.e., this is the directory CMAKE_INSTALL_PREFIX will point to.
3. Create a modulefile containing most relevant environment variables needed for building HPC software (PATH, LD_LIBRARY_PATH, etc.). The modulefile will contain the root directory.

The path to the source directory is given by the command:
```bash
scspkg pkg src hermes_run
```

The path to the root directory is given by the command:
```bash
scspkg pkg root hermes_run
```

To view the modulefile, run:
```bash
module show hermes_run
```

#### Compile and Install
After this, the local installation can be created as follows:
```bash
mkdir build
cd build
cmake ../ -DCMAKE_INSTALL_PREFIX=$(scspkg pkg root hermes_run)
make -j32 install
```

To compile with MPI-IO and VFD interceptors:
```bash
cmake ../ \
-DHERMES_ENABLE_MPIIO_ADAPTER=ON \
-DHERMES_ENABLE_VFD=ON \
-DCMAKE_INSTALL_PREFIX=$(scspkg pkg root hermes_run)
```

There are several options provided in the root Hermes [CMake](https://github.com/HDFGroup/hermes/blob/master/CMakeLists.txt). To view these
options, one can run run:
```bash
ccmake ../
```
