# Developer Guide

Hermes can be complicated to debug due to its distributed and asynchronous
nature. Faults can happen in the client program, or in the Hermes daemon.
The first step when encountering problems is to compile in Debug mode.

```cmake
cmake .. -DCMAKE_BUILD_TYPE=Debug
```

The Debug mode will increase the number of logging statements the program
uses to give you a stronger hint as to where the problem occurs. These
statements are typically compiled out for performance reasons.

Secondly, make sure to use an IDE which supports visual debugging. Debugging
using a terminal with gdb can be very cumbersome, especially when multi-process cases come along.

## Hermes Repo Structure

The Hermes repo is organized as follows:
1. ``hrun`` is the Hermes runtime and contains all source files / includes for it. This includes queuing and network code.
1. ``tasks`` contains the majority of Hermes implementation. These are tasks that execute in the Hermes runtime
1. ``src`` contains a single source file that is used to construct the Hermes library object that applications link to. Very little code is here, as most implementation is executed in the runtime.
1. ``codegen`` contains python code to help with generating and maintaining hrun tasks.
1. ``hermes_adapters`` includes all code relating to the adapters, such as  POSIX, STDIO, and MPI-IO interception
1. ``config`` contains default configurations of Hermes.
1. ``docker`` contains dockerfiles for building Hermes container.
1. ``wrapper`` contains all code for binding Hermes to other languages.
1. ``external`` contains git submodules of repos external to Hermes.
1. ``test`` includes all unit tests
1. ``benchmark`` includes some performance benchmark kernels
1. ``ci`` includes all code for continuous integration

## Preparing Pull Request (PR)

Please run these two steps and remove all warnings.

```bash
make dox
make lint
```

## PR Check Failure

We use the [deps.Dockerfile](https://github.com/HDFGroup/hermes/blob/master/docker/deps.Dockerfile)
to avoid reinstalling packages in the github action. While github has a cache action,
we find it somewhat cumbersome. This way, we get the benefit of both a maintained
dockerfile and a fast github action.

## Containerized Hermes

As a developer, it may be beneficial to use Hermes inside of a container to
avoid differences in machines.

First, cd into your Hermes directory:
```bash
cd /path/to/hermes
```

Then either build the container from scratch or pull (but not both):

From scratch:
```bash
docker build -t lukemartinlogan/hermes_deps . -f docker/deps.Dockerfile
```

Pull:
```bash
docker pull lukemartinlogan/hermes_deps:latest
```

Then, run the container. This command will mount the Hermes directory
as /hermes. It will make it so that the container has 4GB of memory and
4GB of shared memory. By default, containers don't have shared memory, but
Hermes requires it. We then also forward ports 4000 and 4001 to support remote
debugging from those ports.
```bash
docker run -it --mount src=${PWD},target=/hermes,type=bind \
--name hermes_deps_c \
--network host \
--memory=8G \
--shm-size=8G \
-p 4000:4000 \
-p 4001:4001 \
lukemartinlogan/hermes_deps
```

To run the github action:
```bash
bash /hermes/ci/build_hermes.sh
```

Within the container, build Hermes:
```bash
# Load spack and other modules
. /module_load.sh
. "${SPACK_DIR}/share/spack/setup-env.sh"
# Load hermes_shm
spack load hermes_shm
# Build hermes
cd /hermes
mkdir build
cd build
cmake ../
make -j8
```

If you make changes to the dependencies container:
```bash
docker commit hermes_deps_c lukemartinlogan/hermes_deps
docker push lukemartinlogan/hermes_deps
docker stop /hermes_deps_c
docker rm /hermes_deps_c
```

## Remote Debugging

At some point, you may have to do a remote debug. The following code will
forward SSH connections so that you can remotely connect a debugger.

Let's say that you are running Hermes on a machine myusername@myip.org on
port 4000. You can connect to that by forwarding a local port to that address.
A debugger would connect to localhost:4000, which will then be routed to
myusername@myip.org:4000.

```bash
remote_machine_login=myusername@myip.org

local_port=4000
remote_port=4000
ssh -L ${local_port}:localhost:${remote_port} -fN ${ares_node}

local_port=4001
remote_port=4001
ssh -L ${local_port}:localhost:${remote_port} -fN ${ares_node}
```

To shutdown this forwarding, you kill all routed SSH connections as follows:
```bash
pkill -f "ssh -L"
```

If the machine you are running Hermes on has a head/login node, you
will have to forward the connection from your head node to the node actually
running the code (the compute nodes). If this is the case, just repeat the
above steps on the head node, replacing remote_machine_login with the address
of the compute node.

## Preparing For Release

1. Create a GitHub Project for the _next_ release
1. Update the `HERMES_VERSION_*` variables in `CMakeLists.txt`
1. Update `PROJECT_NUMBER` in `Doxyfile.in`.
1. To make release note generation as automated as possible, make sure
   relevant pull requests that are part of the release have proper labels and and
   titles, as that information will show up directly in the generated release
   notes in the next step.
1. Draft a release on Github. Click `auto-generate release notes` and edit
   the result as necessary. Fill in the new tag, and select "Create new tag x.x.x
   on publish" so that Github will automatically tag the release when it is
   published.
1. The docker containers will be automatically built and pushed to docker hub
   whenever a new tag is added. Check the CI actions to make sure there were no
   errors.
1. Copy/move ideas to the project for the next release
1. Close and archive the project for the _current_ release
1. Merge the latest release branch (if one exists) of the wiki into the `master` branch.
1. Make an announcement in the Hermes topic of the HDF forum.
1. Send Lori a note for the next HDF5 newsletter.

## Introduction to our Continuous Integration (CI)

We are primarily using Python for managing for running unit tests. Under
[our root CMakeList](https://github.com/HDFGroup/hermes/blob/master/CMakeLists.txt), we implement a
CMake function called jarvis_test, which uses [Jarvis](https://github.com/grc-iit/jarvis-cd.git)
and its [pipelines](https://github.com/HDFGroup/hermes/tree/master/test/unit/pipelines) concept.

## Adding a New Adapter

1. Create a new directory under the `adapter` directory.
