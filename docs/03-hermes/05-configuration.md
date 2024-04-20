# Configuration

Before deploying an application, you need to configure Hermes. Hermes has two types of configurations: server configuration and client configuration. They
are represented as YAML files. We will describe the contents of these YAML
files here.

## Server Configuration

The server configuration is primarily used to initialize the daemon.
Clients also parse the server config to get the basic information needed
to connect to the Hermes daemons.

Technically, the server configuration
is optional. However, the default configuration is more for just setting
things up. You do have to configure things like mount points manually
at this time.

The default server configuration can be found
[here](https://github.com/HDFGroup/hermes/blob/master/config/hermes_server_default.yaml).

### Defining Storage Targets

The most important property in the configuration is defining where Hermes
buffers data. This is done under the "devices" entry.
In the default configuration, we have the following:

```yaml
devices:
  ram:
    mount_point: ""
    capacity: 50MB
    block_size: 4KB
    slab_sizes: [ 4KB, 16KB, 64KB, 1MB ]
    bandwidth: 6000MBps
    latency: 15us
    is_shared_device: false
    borg_capacity_thresh: [0.0, 1.0]

  nvme:
    mount_point: "./"
    capacity: 100MB
    block_size: 4KB
    slab_sizes: [ 4KB, 16KB, 64KB, 1MB ]
    bandwidth: 1GBps
    latency: 600us
    is_shared_device: false
    borg_capacity_thresh: [ 0.0, 1.0 ]

   ssd:
     mount_point: "./"
     capacity: 100MB
     block_size: 4KB
     slab_sizes: [ 4KB, 16KB, 64KB, 1MB ]
     bandwidth: 500MBps
     latency: 1200us
     is_shared_device: false
     borg_capacity_thresh: [ 0.0, 1.0 ]

   pfs:
     mount_point: "./"
     capacity: 100MB
     block_size: 64KB
     slab_sizes: [ 4KB, 16KB, 64KB, 1MB ]
     bandwidth: 100MBps
     latency: 200ms
     is_shared_device: true
     borg_capacity_thresh: [ 0.0, 1.0 ]
```

### Device Names

In the above configuration, we have four unique devices: ram, nvme, ssd,
and pfs. These names are for the ease of the user, and have no meaning
to Hermes. In other words, these names can be anything. The following
configuration would be effectively equivalent to the one above:

```yaml
devices:
  dev1:
    mount_point: ""
    capacity: 50MB
    ...

  dev2:
    mount_point: "./"
    capacity: 100MB
    ...

   dev3:
     mount_point: "./"
     capacity: 100MB
     ...

   dev4:
     mount_point: "./"
     capacity: 100MB
     ...
```

### `mount_point`

The mount point parameter is used to indicate which directory Hermes
should place data in, if the device has a filesystem.

```yaml
ram:
  mount_point: ""

nvme:
  mount_point: "./"
```

In the default config, for example, we look at ram and nvme. nvme is mounted
in the current working directory. Hermes will create a file called
"./slab_nvme". It will create equivalent files for hdd, ssd, and pfs.

For ram, we set the mount point to "". This indicates that the device
has no mount point.

### `capacity`

This variable implies the amount of capacity to use for buffering.
This parameter is a "size variable", which supports various suffixes:

```yaml
capacity: 100    # 100 bytes
capacity: 100k   # 100 KB
capacity: 100kb  # 100 KB
capacity: 100KB  # 100 KB
capacity: 100m   # 100 MB
capacity: 100mb  # 100 MB
capacity: 100MB  # 100 MB
capacity: 100g   # 100 GB
capacity: 100gb  # 100 GB
capacity: 100GB  # 100 GB
capacity: 100T   # 100 TB
capacity: 100tb  # 100 TB
capacity: 100TB  # 100 TB
```

There cannot be spaces between the number and the suffix. For example,

```yaml
capacity: 100 tb #NOT VALID
```

### `block_size`

```yaml
block_size: 64KB
```

This is the amount of I/O that the physical block device supports.
RAM, for example, generally sees data in units of 4KB because this is
the page size of the system. HDDs, NVMes, and SSDs generally have block
sizes of 4KB as well. Generally, this parameter doesn't need to be changed.

### `slab_sizes`

```yaml
slab_sizes: [4KB, 16KB, 64KB, 1MB]
```

This parameter is important to performance and resource utilization. The slab sizes dictates the I/O patterns produced in Hermes. When Hermes wants to
write a 16MB blob, how does this blob actually get mapped to storage?
It gets fragmented into buffers, where the size of a buffer is equivalent
to the best-fitting slab size.

- A 16MB blob will be placed as 16 1MB buffers.
- A 6KB blob will be placed as 2 4KB buffers
- A 33KB blob will be placed as a single 64KB buffer

You should decide the buffer sizes based on the characteristics of your
program. If unsure, the default slab sizes generally have worked well
in the workloads we've tried. However, if you're finding Hermes runs
out of space, this parameter may be the culprit.

### `bandwidth`, `latency`

```yaml
bandwidth: 1GBps
latency: 600us
```

These are properties of the storage device which are used by data placement
algorithms to decide where to buffer data.

- Acceptable suffixes for bandwidth (case doesn't matter):
- Acceptable suffixes for latency (case doesn't matter): s, ms, us, ns.

### `is_shared_device`

```yaml
is_shared_device: true
```

This indicates whether or not the device provides a shared view of
data across nodes. For example, a PFS is a shared device, whereas
a single hard drive is not a shared device. This parameter is not
really used at this time, but you do need to define it.

### `borg_capacity_thresh`

```yaml
borg_capacity_thresh: [0.0, 1.0]
```

This parameter is used to trigger the buffer organizer (BORG). When a
device is either really low on capacity (or high on capacity) BORG
will be triggered to shuffle content around.

The first entry indicates how much space is too little space. In this
case if capacity falls below 0% (i.e., never), BORG will be triggered.

The second entry indicates how mcuh space is too much space. In this
case if capacity grows beyone 100% (i.e., never), BORG will be triggered.

In other words, this example, shows how to disable BORG.

## Buffer Organizer (BORG)

```yaml
buffer_organizer:
  num_threads: 1
  flush_period: 1024
  blob_reorg_period: 1024
  recency_min: 0
  recency_max: 60
  freq_max: 15
  freq_min: 0
```

The BORG contains threads for reorganizing buffers in Hermes. The number
of threads is indicated by "num_threads". The amount of time (in ms) to
re-scan for blobs to reorganize is given by "flush_period".

receny_max is the amount of time (in seconds) when the score of a blob
becomes 0. recency_min is the amount of time for the blob to have a score
of 1.

freq_max is the minimum number of times a blob needs to be accessed in the
flushing period for the score to be equal to one. freq_min is the maximum number of times a blob can be accessed before its score becomes larger than 0.

The buffer organizer is only triggered when there are space constraints
that need to be met at this time. If you want the BORG extremely active,
change the borg_capacity_thresh variable.

## Prefetcher

```yaml
prefetch:
  enabled: false
  apriori_schema_path: ""
  epoch_ms: 50
  is_mpi: false
```

These parameters dictate properties of the prefetcher.

- **enabled**: whether to turn prefetcher on
- **apriori_schema_path**: internally used by apriori prefetcher
- **epoch_ms**: how often to call the prefetcher thread
- **is_mpi**: whether the program is an MPI program so that clients
  send their ranks to the daemon during prefetching.

For now, prefetching is only available to the native API, not the adapters.

## Traits

```yaml
traits:
  - "hermes_posix_io_client"
  - "hermes_stdio_io_client"
  - "hermes_mpiio_io_client"
  - "hermes_example_trait"
  - "hermes_prefetcher_trait"
```

The traits category lists the set of traits that Hermes searches for
in the LD_LIBRARY_PATH and HERMES_TRAIT_PATH environment variables.
It will search each directory specified in those environment variables
for shared objects matching these names. For example, libhermes_posix_io_client.so will be searched for.

Unless you are adding custom traits, this can be left as default.

## Shared Memory

```yaml
shmem_name: "/hermes_shm_"
```

This is the name of the shared memory segment hermes will create. In order
to make this unique across users (since shared memory can be used to
share memory across users), we append the name of the user to this key.

This generally can be left as the default value.

## System View State

This parameter is unused for now, so no need to set it.

## Bounding Memory Utilization

When running Hermes in a limited environment, ensuring that Hermes is not over-utilizing memory is necessary. It is possible to receive "Bus Error" messages due to the OS complaining that too many pages have been allocated. We find that this happens in Docker containers frequently since they have more limited memory constraints by default.

There are a few parameters which cause Hermes to utilize memory.

### Using RAM as a buffering device

Hermes can be configured to use RAM as a buffering device.

```yaml
devices:
  ram:
    mount_point: ""
    capacity: 1g
```

In this case, Hermes will reserve up to 1GB of space to use for buffering.

### Hashtables for storing blobs + buckets

Hermes will reserve space for hashtables for blobs, buckets, and traits.
These parameters can be configured as follows:

```yaml
mdm:
  # This represents the number of blobs and buckets before collisions start
  # to happen in the unordered_map tables.
  est_blob_count: 100000
  est_bucket_count: 100000
  est_num_traits: 256
```

You can set these to lower values if memory is over-utilized.
These values should be set to roughly the number of blobs and buckets the program creates to avoid collisions in the hashtables.

### Bounding Non-Buffering Tasks

You can set a maximum boundary on the amount of memory to use for non-buffering tasks, such as reserving space for the blob + bucket hashtables.

```yaml
# Define the maximum amount of memory Hermes can use for non-buffering tasks.
# This includes metadata management and memory allocations.
# This memory will not be preallocated, so if you don't know, 0 indicates
# any amount of memory
max_memory: 0g
```

0g indicates infinity. Non-zero values can be set to put a boundary here.

### Calculating Total Amount of Memory

The total amount of memory Hermes can use before an hshm::Error or Bus Error is thrown can be calculated as follows:

```bash
RAM used for Buffering (3.1.7.1) + RAM used for Non-Buffering (3.1.7.3)
```

## Client Configuration

The default client configuration can be found
[here](https://github.com/HDFGroup/hermes/blob/master/config/hermes_client_default.yaml).

The client configuration currently only contains parameters used by
adapters.

```yaml
stop_daemon: false
path_inclusions: ["/tmp/test_hermes"]
path_exclusions: ["/"]
file_page_size: 1024KB
base_adapter_mode: kDefault
flushing_mode: kAsync
file_adapter_configs:
  - path: "/"
    page_size: 1MB
    mode: kDefault
```

- **stop_daemon**: stop the daemon when adapters exit. Generally, leave
  this false and stop the daemon using finalize_daemon script. Will likely
  be removed in the near future.
- **file_page_size**: The page size used to fragment files into blobs in
  Hermes.

### Path Inclusion / Exclusion

```yaml
path_inclusions: ["/tmp/test_hermes"]
path_exclusions: ["/"]
```

- **path_inclusions**: Which paths to buffer? In this case, everything which
  is a child of /tmp/test_hermes.
- **path_exclusions**: Which paths to ignore? In this case, everything which
  is a child of the root directory. Technically everything on the system.

We prioritize paths in inclusions and exclusions depending on how
specific the path is. In other words, we sort the paths by the length
of the path. For example, in this case, /tmp/test_hermes will be included
since it has a longer path than "/". Everything other than /tmp/test_hermes
will be excluded.

### Adapter Mode

The adapter mode determines how Hermes buffers adapter data by default.
There are three adapter modes:

1. kDefault: Hermes will buffer data and then flush to the PFS eventually
2. kScratch: Hermes will buffer data, but never flush
3. kBypass: Hermes will never buffer data, and always flush to the PFS

kDefault is the real use case of Hermes, the other two are for benchmarking
and testing purposes.

This parameter can also be set by an environment variable. The
environment variable is prioritized.

```bash
HERMES_ADAPTER_MODE=kDefault \
./myhermesapp
```

### File Page Size

```yaml
file_page_size: 1024KB
```

This parameter dictates how adapters convert files into blobs.
By default, files are divided into 1024KB (1MB) blobs. Setting
this parameter appropriately can have impacts on
write and read amplification and metadata overhead.

For workloads which perform 4KB reads to a large file, each read
will be amplified to 1MB unless the page size is reset.

For the same workload, setting a file page size equal to 4KB may
result in a significant increase in metadata being stored in the
metadata manager.

In other words, this parameter is worth tuning.

This parameter can also be set using an environment variable. The
environment variable is prioritized.

```yaml
HERMES_PAGE_SIZE=1024KB \
./myhermesapp
```

### Flushing Mode

The flushing mode indicates how Hermes should flush data to the PFS.
Currently there are two modes provided:

1. kAsync: Flush data asynchronously in a background thread
2. kSync: Flush data synchronously

kAsync is recommended. kSync is used only in unit tests since it has
low performance.

### Adapter Config

```yaml
file_adapter_configs:
  - path: "/"
    page_size: 1MB
    mode: kDefault
```

Contains file-specific overrides to the default adapter variables defined
above. You can modify the adapter mode (3.2.2) and file page size for each

## Provided Configurations

We also provide Hermes configurations we use with a few systems to which you
might have access:

- [Ares (IIT)](https://github.com/HDFGroup/hermes/blob/master/test/data/ares.yaml)
- [Frontera (TACC)](https://github.com/HDFGroup/hermes/tree/master/test/data) (Coming soon.)

Bear in mind that a suitable Hermes configuration also depends on
applications' I/O workload and not just the configuration of the
underlying machine.

## How To Avoid Repeating the Default Configurations

Many parameters in Hermes can be left as default. Any parameters which
you would like to leave as default can be removed from your configuration
file completely. Hermes will fill in missing values based on the values
in our default configurations.
