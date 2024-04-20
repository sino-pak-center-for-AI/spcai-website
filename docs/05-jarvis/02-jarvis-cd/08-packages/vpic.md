# VPIC

## Installation

```bash
scspkg create vpic
cd $(scspkg pkg root vpic)/..
rm -rf vpic
git clone --recursive https://github.com/lanl/vpic.git vpic
cd vpic
mkdir build
cd build
cmake ../ \
  -DCMAKE_BUILD_TYPE=Debug \
  -DENABLE_INTEGRATED_TESTS=ON \
  -DENABLE_UNIT_TESTS=ON \
  -DCMAKE_C_FLAGS="-rdynamic" \
  -DCMAKE_CXX_FLAGS="-rdynamic" \
  -DCMAKE_INSTALL_PREFIX=$(scspkg pkg root vpic)
make -j8
make install
module load vpic
```

## The generic example

Compile:
```
vpic $(scspkg pkg root vpic)/sample/harris
```

Run:
```
./harris.Linux
```
