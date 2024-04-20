# Deploying Hermes

## Configuring + Deploying Hermes

The Hermes daemon is responsible for tracking various metadata, and it is
required to be launched before your application. There should only be
one Hermes daemon per node. We recommend
[Jarvis](https://github.com/grc-iit/jarvis-cd.git) for deploying Hermes.
Jarvis is a framework that configures and deploys complex applications and
services. Jarvis will automatically set various environment variables
that Hermes expects in order for applications to be deployed. We have
also integrated several applications into Jarvis that can be seamlessly
deployed with Hermes.

### Install Jarvis

To install jarvis, do the following:

```bash
export JARVIS_PATH=${PWD}/jarvis-cd
git clone https://github.com/grc-iit/jarvis-cd.git ${JARVIS_PATH}
cd ${JARVIS_PATH}
pip install -e .
```

### Initialize Jarvis

After installing, Jarvis MUST be configured for your specific system. The first
step is to define places for storing Jarvis configuration data. Note that large data
objects are **never** intended to be stored in these directories.

There are three places where configuration data is stored:

- **CONFIG_DIR:** A directory where jarvis metadata for pkgs and pipelines are stored. This
  directory can be anywhere that the current user can access. ``${HOME}/jarvis_config`` would be an example.
- **PRIVATE_DIR:** A directory which is common across all machines, but stores data locally to the
  machine. Some jarvis pkgs require certain data to be stored per-machine. ``/tmp/jarvis_priv`` would be an example.
- **SHARED_DIR:** A directory which is common across all machines, where each machine has the same
  view of data in the directory. In a supercomputing site, this would typically be
  in your home directory. For example ``${HOME}/jarvis_shared``

Make sure that all these paths are absolute paths. Environment variables can be used to make absolute paths less cumbersome. This command will automatically create the directories if they don't exist.
```bash
jarvis init [CONFIG_DIR] [PRIVATE_DIR] [SHARED_DIR]
```

This above command produces the jarvis configuration and store it here:
```bash
${JARVIS_PATH}/config/jarvis_config.yaml
```

### Build a Resource Graph

A resource graph contains the storage and networking configuration
of the machines you intend to deploy Hermes on.

#### Bootstrapping from an existing machine

We have several resource graphs for different machines, located under
`${JARVIS_PATH}/builtin/resource_graph`. There are resource graphs
for different machines spanning IIT, PNNL, and Argonne. To view the
set of preconfigured machines, run:

```bash
ls ${JARVIS_PATH}/builtin/resource_graph
```

If one of your machines is there, then do:

```bash
jarvis bootstrap from [MY_MACHINE]
```

For example, ares is one of the machines:

```bash
jarvis bootstrap from ares
```

#### Building a new resource graph

If a resource graph for your machine is not available, you will have to
define one manually.

The resource graph **must** be created at exactly the following path:

```bash
${JARVIS_PATH}/config/resource_graph.yaml
```

For storage devices, the required parameters are as follows:

```yaml
fs:
  - avail: 500G # Available capacity of the device (Suffix: K,G,T,P)
    dev_type: ssd # Type of storage hardware (hdd, ssd, nvme, pmem)
    mount: /mnt/ssd/${USER} # Where to place data on the device
    shared: false # Is this shared across nodes (e.g., a PFS?)
```

For networks, the parameters are as follows:

```yaml
net:
  - domain: lo # Domain of network. Can be null.
    fabric: 127.0.0.1/32
    provider: tcp;ofi_rxm
    shared: false # Is this network shared across nodes. E.g., localhost is not
    speed: 40G
```

This information can be discovered using tools such as ``fi_info`` provided by libfabric. The fi_info tool is extremely verbose and requires some expertise to understand. fi_info outputs several networks -- most of which are irrelevant. Many networks printed may only function in single-node cases -- or not at all.
* The most important information to determine a relevant network is domain, fabric, and provider.
* Networks with the **lo** domain or with fabrics equivalent to 127.0.0.1 will only function in single-node cases.
* Fabrics ending with the format \*.0.0.0 will **NOT** work. These are *network* addresses, not *host* addreses. For example, 127.0.0.0 comes up sometimes in the fi_info output.
* Networks where the fabric is not a number are generally irrelevant and will not function when used. For example:
```yaml
# This provider is not relevant
provider: UDP
fabric: UDP-IP
domain: udp
version: 1.1
type: FI_EP_DGRAM
protocol: FI_PROTO_UDP
```
* One way to filter out dysfunctional fi_info outputs is to use ``ip addr show`` (or ``fi_info | grep fabric``) to list available IP addresses. Do this on two separate machines, compare their output, and then look at only the IP addresses that are similar between the machines. If you can ssh between the machines using these IP addresses, then you should focus on only those fabrics matching their pattern in the fi_info output
* Be careful about the providers. It has come up plenty of times where a provider is listed, but doesn't actually work. Verbs, for example, may fail if your Hermes installation was not correctly configured to support RDMA. This is a guess-and-check game. TCP and Sockets are generally a safe bet. It may be of benefit to try just these providers and get a distributed deployment of Hermes functioning before moving on to verbs.

### Building an Environment

We will now load all necessary environment variables and build a
Jarvis environment named hermes_env:

```bash
spack load hermes
jarvis env build hermes_env
```

hermes_env will store all important environment variables, including PATH,
LD_LIBRARY_PATH, etc. in a YAML file. This will make it so that you do not
need to repeatedly run spack load and module load if the machine is broken.

### Set the active Hostfile

The hostfile contains the set of nodes that the pipeline will run over.
This is structured the same way as a traditional MPI hostfile.

An example hostfile:

```txt
ares-comp-20
ares-comp-[21-25]
```

To set the active hostfile, run:

```bash
jarvis hostfile set /path/to/hostfile
```

Note that every time you change the hostfile, you will need to update the
pipeline. Jarvis does not automatically detect changes to this file.

```bash
jarvis pipeline update
```

#### Create an empty pipeline

```bash
jarvis pipeline create hermes
```

hermes is the name of the pipeline. It doesn't need to be hermes,
it can be any name.

#### Copy the environment cache

```bash
jarvis pipeline env copy hermes_env
```

This will use the hermes_env environment that was previously created in

#### Add Hermes runtime

```bash
jarvis pipeline append hermes_run
jarvis pkg configure hermes_run \
sleep=5 \
include=${HOME}/ior_data
```

Jarvis will automatically produce a Hermes client and server configuration that
contains all storage devices and fastest available network defined in the
resource graph. These configurations will be located in:

```bash
$(jarvis path +shared)/hermes_run/hermes_server.yaml
$(jarvis path +shared)/hermes_run/hermes_client.yaml
```

To view all parameters of the Hermes package, you can run:
```bash
jarvis pkg help hermes_run
```

### Starting + Stopping Hermes

To start Hermes:

```bash
jarvis pipeline start
```

### Stopping and Killing Hermes

To gracefully stop Hermes and flush data back to the PFS:

```bash
jarvis pipeline stop
```

To kill a Hermes deployment that isn't stopping gracefully:

```bash
jarvis pipeline kill
```

### Cleanup

To erase data produced by the pipeline:

```bash
jarvis pipeline clean
```

To destroy the pipeline:

```bash
jarvis pipeline destroy
```

## Configuring + Deploying Hermes with an Application

As previously stated, Jarvis can be used to deploy and application
with Hermes. This will automatically set environment variables
(e.g., LD_PRELOAD) that will be necessary for the application to
run.

### Build an Environment

We will now load all necessary environment variables and build a
Jarvis environment named hermes_env:

```bash
spack load hermes
spack load ior
jarvis env build hermes_ior_env
```

hermes_ior_env will store all important environment variables, including PATH,
LD_LIBRARY_PATH, etc. in a YAML file.

### Create an empty pipeline

```bash
jarvis pipeline create hermes_ior
```

### Copy the environment cache

```bash
jarvis pipeline env copy hermes_ior_env
```

### Set the active hostfile

```bash
jarvis hostfile set /path/to/hostfile
```

### Add Hermes runtime

```bash
jarvis pipeline append hermes_run
jarvis pkg configure hermes_run \
sleep=5 \
include=${HOME}/ior_data
```

This will ensure that if a Hermes interceptor is used, it will intercept
all paths in `${HOME}/ior_data`.

### Add Hermes MPI-IO interceptor

```bash
jarvis pipeline append hermes_api
jarvis pkg configure hermes_api +mpi
```

This will automatically locate the interceptor library by
traversing various environment variables. This will ensure
that MPI-IO is intercepted by Hermes.

hermes_api includes other interceptors that can be used: posix, stdio, vfd. To view the set of options:
```bash
jarvis pkg help hermes_run
```

### Add IOR

```bash
jarvis pipeline append ior
jarvis pkg configure ior \
xfer=1m \
block=1g \
nprocs=64 \
ppn=16 \
+write +read \
out=${HOME}/ior_data/ior.bin \
api=mpiio
```

This IOR will perform 1GB of I/O per-process (block) in units of 1m (xfer) and
produce a single output file `${HOME}/ior_data/ior.bin`(out) using MPI-IO
(api). The total amount of I/O performed will be 64GB spread across 4 nodes.

### Run the Pipeline

To run the pipeline:

```bash
jarvis pipeline run
```

This will launch Hermes, execute IOR, and then stop Hermes. It is equivalent
to:

```bash
jarvis pipeline start
jarvis pipeline stop
```

### Cleanup

The following will delete intermediate data generated by Hermes + IOR:

```bash
jarvis pipeline clean
```

## Why is my application hanging?

### Resource Graph Misconfiguration

Commonly, the cause is a misconfiguration in the resource graph, specifically
with the network section. If the resource graph is misconfigured, Hermes may
crash with a ``mercury->fatal`` error and ultimately cause the program to stall
forever. Make sure that the domain, provider, and fabric are valid. To view the
Hermes configuration to see which network was selected from your resource graph,
you can run:

```bash
cat $(jarvis path)/hermes_run/hermes_server.yaml
```

### Dependency Problems

If you are using the MPI-IO interceptor, make sure that the MPI that Hermes
compiled with is equivalent to the one your application was compiled with.
You may have multiple versions of MPI installed and if you didn't specify
which one when installing Hermes and your program -- they may be different.

If you are using the VFD, make sure the VFD was compiled with the same HDF5
as the application.

To view the dependencies of your installed Hermes, run:
```
spack find -c -d hermes
```

### Machine Misconfiguration

We have found certain instances where using semantic hostnames in the hostfile
has resulted in incorrect behavior. If the machine is misconfigured, it is
possible that a hostname maps to a different network domain on different nodes.
To verify this, you can try using exact IP addresses in your hostfile.

To view your machine's IP addresses, you can run
``ip addr show`` or ``fi_info | grep fabric``

### Permissions Problems

If you cannot SSH between machines or if your known_hosts file is outdated,
it is possible that Hermes will fail to launch due to permissions problems
on the network. Make sure that you can SSH between machines without error.
