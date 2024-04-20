# Gadget

GADGET-4 is a massively parallel code for N-body/hydrodynamical cosmological
simulations. It is a flexible code that can be applied to a variety of different
types of simulations, offering a number of sophisticated simulation algorithms.
An account of the numerical algorithms employed by the code is given in the
original code paper, subsequent publications, and this documentation.

GADGET-4 was written mainly by Volker Springel, with important contributions and
suggestions being made by numerous people, including Ruediger Pakmor, Oliver
Zier, and Martin Reinecke.

https://wwwmpa.mpa-garching.mpg.de/gadget4/

## Dependencies

```bash
spack install hdf5@1.14.1 gsl@2.1 fftw@3+mpi
spack load hdf5@1.14.1 gsl@2.1 fftw@3+mpi
scspkg create gadget4
cd $(scspkg pkg src gadget4)
git clone https://gitlab.mpcdf.mpg.de/vrs/gadget4
cd gadget4
mkdir build
cd build

```
