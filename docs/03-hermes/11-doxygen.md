# Doxygen

The [Doxygen](https://www.doxygen.nl/index.html) portion of the Hermes documentation can be built as follows:

```bash
cmake -D <Other Hermes CMake build options> -DHERMES_ENABLE_DOXYGEN=ON ../
make dox
```

The HTML version of the documentation will be placed into the `_build/html` subfolder of the build directory.

An online version for the latest release is available at [https://hdfgroup.github.io/hermes/html/](https://hdfgroup.github.io/hermes/html/).

The official version for the stable release is available at [https://docs.hdfgroup.org/hermes/](https://docs.hdfgroup.org/hermes/).
