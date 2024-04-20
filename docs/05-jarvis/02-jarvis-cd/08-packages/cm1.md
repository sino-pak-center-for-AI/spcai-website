# CM1

## Dependencies

```bash
spack install intel-oneapi-compilers
spack load intel-oneapi-compilers
spack compilers add
spack install h5z-zfp%intel
```

## Compiling/Installing

```bash
git clone git@github.com:lukemartinlogan/cm1r19.8-LOFS.git
cd cm1r19.8-LOFS
# COREX * COREY is the number of cores you intend to use on the system
# They do not need to be 2 and 2 here, but this is how our configurations are compiled for now
COREX=2 COREY=2 bash buildCM1-spack.sh
export PATH=${PWD}/run:${PATH}
export CM1_PATH=${PWD}
```

## General Usage

```bash
mpirun -n [COREX * COREY] ${CM1_PATH}/run/cm1.exe [namelist.input] [output_dir] [filename_base] [restart_dir]
```

- output_dir: the directory where simulation output goes
- filename_base: the name of the simulation file to generate
- restart_dir: a directory to store checkpoints for a restart (I believe)

## Brief overview of `namelist.input`

The following variables define the dimensions of a 3D grid

```
nx           =      16,
ny           =      16,
nz           =      16,
```

I set them lower to reduce extreme memory consumption in single-node cases.

These variables must be set relatively to COREX and COREY.

```
 nodex        =       2, !nuke
 nodey        =       2, !nuke
 rankx        =       2,
 ranky        =       2,
```

You must satisfy the following constraints when setting these:

1. rankx _ ranky = COREX _ COREY
2. rankx > corex and ranky > corey

## Radiative Convective Equilibrium

```bash
cd ${CM1_PATH}/run/config_files/cpm_RadConvEquil
mkdir output
mpirun -n 4 ${CM1_PATH}/run/cm1.exe  ${CM1_PATH}/run/namelist.input.nssl3 output ex output
```

## Near Future

Make a jarvis-cd package to automate all of these odd constraints for benchmarking and deployment
