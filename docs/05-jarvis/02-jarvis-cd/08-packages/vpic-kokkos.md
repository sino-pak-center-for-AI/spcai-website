# VPIC Kokkos

## Installation

```bash
scspkg create vpic_kokkos
scspkg env prepend vpic_kokkos CPATH ${PWD}/include/kokkos
cd $(scspkg pkg root vpic_kokkos)/..
rm -rf vpic_kokkos
git clone --recursive git@github.com:lanl/vpic-kokkos.git vpic_kokkos
cd $(scspkg pkg root vpic_kokkos)
git submodule update --init --recursive
mkdir build
cd build
cmake ../ \
-DKokkos_ENABLE_OPENMP=ON \
-DENABLE_KOKKOS_CUDA=OFF \
-DBUILD_INTERNAL_KOKKOS=ON \
-DCMAKE_CXX_FLAGS="-g -O2 -rdynamic" \
-DCMAKE_INSTALL_PREFIX=$(scspkg pkg root vpic_kokkos)
make -j8
make install
module load vpic_kokkos
```

## The generic example

Compile:
```
vpic $(scspkg pkg root vpic_kokkos)/sample/generic
vpic $(scspkg pkg root vpic_kokkos)/test/integrated/energy_comparison/weibel.deck
vpic $(scspkg pkg root vpic_kokkos)/test/integrated/to_completion/dump.deck
```

Run:
```
mkdir mytests
cd mytests

mpirun -n 2 ../generic.Linux
mpirun -n 2 ../weibel.deck.Linux
mpirun -n 2 ../dump.deck.Linux
cd ../
```

NOTE: many of the sample decks don't work. The unit tests work, but aren't
really physically accurate and are just unit tests.
