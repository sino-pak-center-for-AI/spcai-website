# Gadget2

GADGET is a freely available code for cosmological N-body/SPH simulations on massively parallel computers with distributed memory. GADGET uses an explicit communication model that is implemented with the standardized MPI communication interface. The code can be run on essentially all supercomputer systems presently in use, including clusters of workstations or individual PCs.

GADGET computes gravitational forces with a hierarchical tree algorithm (optionally in combination with a particle-mesh scheme for long-range gravitational forces) and represents fluids by means of smoothed particle hydrodynamics (SPH). The code can be used for studies of isolated systems, or for simulations that include the cosmological expansion of space, both with or without periodic boundary conditions. In all these types of simulations, GADGET follows the evolution of a self-gravitating collisionless N-body system, and allows gas dynamics to be optionally included. Both the force computation and the time stepping of GADGET are fully adaptive, with a dynamic range which is, in principle, unlimited.

https://wwwmpa.mpa-garching.mpg.de/gadget/

## Dependencies

```bash
spack install hdf5@1.14.1 gsl@2.1 fftw@2+mpi
spack load hdf5@1.14.1 gsl@2.1 fftw@2+mpi
scspkg create gadget2
cd $(scspkg pkg src gadget2)
git clone https://github.com/lukemartinlogan/gadget2.git
cd gadget2
mkdir build
cd build
```

## NGenIC

NGenIC is the initial boundary condition generation code.
This can be used to generate any arbitrary initial condition file.

```bash
mpirun -n 8 build/bin/NGenIC N-GenIC/ics.param
```

## Manual Gassphere Example

Compile:
```bash
cmake ../ \
-DPEANOHILBERT=ON \
-DWALLCLOCK=ON \
-DSYNCHRONIZATION=ON
make -j8
```

Run:
```bash
cd ../
mkdir gassphere
build/bin/Gadget2 Gadget2/parameterfiles/gassphere.param
```
