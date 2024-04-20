# Resource Graph

A resource graph contains a snapshot of the state of a cluster. This
normalizes machine-specific information which common across jarvis
repos. Resource graphs provide query interfaces which avoid having to
repeat the same paths all over the place. This section describes the
contents of a resource graph and the API available to Jarvis repos.

## Resource Graph Contents

The resource graph contains information about the cluster hardware:

1. Block devices
2. Device partitions
3. Filesystem mount points
4. Capacities
5. Network protocols

NOTE: The resource-graph utility command depends on:

- fi_info
- lsblk
- df

If libfabric is installed through spack, please load it before continuing.

```bash
spack load libfabric
```

## Building a Resource Graph Automatically

Most of the information regarding resource graphs can be introspected.
The main things that are not automatic:

1. Hostfile: which machines are we introspecting?
2. What is the per-user mount point of the storage devices?

If you want jarvis to execute distributed programs, provide a hostfile.
This is optional for local programs.

```bash
jarvis hostfile set /path/to/hostfile
```

Build the resource graph

```bash
jarvis resource-graph build +walkthrough
```

The resource graph will be stored under `${JARVIS_ROOT}/config/resource_graph.yaml`

## Storage Graph

The following command lists all block devices, their type, and their mount points:

```bash
lsblk -o NAME,SIZE,MODEL,TRAN,MOUNTPOINT
```

The following command lists all mounted filesystems and their capacities:

```bash
df -h
```

The following command lists all SPDK nvmes:

```bash
spdk_nvme list -c
```

NOTE: SPDK is not currently implemented

The storage resource graph parses these commands automatically.

## Network Graph

To build the network graph, we collect the outputs from the following command:

```bash
fi_info
```

This will store the network information available per host.

## CPU Graph

CPU information can be helpful for determining information such as the number
of threads to use for a metadata service.

TODO.

## Memory Graph

Memory information can be useful for determining things like cache sizes.

TODO.

## Querying the Resource Graph

The resource graph can be queried for network and storage info.

```python
from jarvis_util import *

rg = ResourceGraph()
rg.find_storage(shared=True, condense=True)
```

## Future Ideas

- What if we have a smart NIC?
- What if we have FPGAs and ASICs?
