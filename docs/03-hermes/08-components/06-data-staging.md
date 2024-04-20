# Data Staging

Stage-in is the ability to load **external** datasets into Hermes.
Stage-out is the ability export data out of Hermes.

## Use Case

Data Staging is frequently used for extracting information from large datasets during scientific simulations and workflows.
This approach shifts the burden of synchronization, aggregation, validation, cleaning, and processing from the PFS and main memory to the high-performance staging area. I/O stalls are reduced by overlapping compute phases with asynchronous I/O, utilizing the high-performance compute network, and leveraging storage tiering.

## Current Status

Currently, stage-in and stage-out can be applied to POSIX files. Stage-in/stage-out can be used to load directories, specific files, or fractions of files into Hermes to be processed by the application.
Note: The ability to stage-in and stage-out HDF5 datasets (as opposed to the entire HDF5 file) is currently under development.

## Utility Script

The stage-in / stage-out utility scripts provide the following API:

```bash
./stage-in [url] [offset] [size] [dpe]
./stage-out [url]
```

The [url] parameter for now is just a POSIX path (e.g., "/home/user/hi.txt"). When [size] is 0, the size of the file will be determined automatically. In the future, this parameter could represent an HDF5 dataset using a different schema (e.g., "hdf5::/[dataset-group1]/[dataset-name1]").

An example of a typical stage-in / stage-out workflow is as follows:

```bash
# Create a 4GB file (1GB / proc)
mpirun -n 4 ior -w -k -b 1048576 -o /tmp/hi.txt
# Start the Hermes Daemon
mpirun -n 1 ${HERMES_INSTALL}/hermes_daemon
# Stage-in the entire 4GB file
mpirun -n 4 ${HERMES_INSTALL}/stage_in /tmp/hi.txt 0 0 kRoundRobin
# Read the 4GB file in IOR
mpirun -n 4 \
-genv HERMES_CONF=${HERMES_CONF} \
-genv LD_PRELOAD "${HERMES_INSTALL}/libhermes_posix.so" \
-genv HERMES_STOP_DAEMON 0 \
-genv ADAPTER_MODE WORKFLOW \
-genv HERMES_CLIENT 1 \
-genv HERMES_PAGE_SIZE 1048576 \
ior -r -b 1048576 -o /tmp/hi.txt
# Stage the file back out
mpirun -n 4 ${HERMES_INSTALL/stage_out /tmp/hi.txt
```

## Native API

Stage-in / stage-out can also be applied in a native Hermes program.

```cpp
#include <hermes/staging.h>

int main(int argc, char **argv) {
  auto stager = DataStagerFactory::Get(url);
  stager->StageIn(url, PlacementEngine::kRoundRobin);
  stager->StageOut(url);
}
```
