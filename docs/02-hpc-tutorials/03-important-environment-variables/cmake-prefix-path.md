# `CMAKE_PREFIX_PATH`

`CMAKE_PREFIX_PATH` is used by CMake to identify the location of CMake package configurations.
It has a similar purpose to `LIBRARY_PATH` and `CPATH`. It is used to locate packages and headers
at compile time.

`CMAKE_PREFIX_PATH` is organized as a colon-separated list.

```bash
export CMAKE_PREFIX_PATH="/path1:/path2:/path3"
```

`CMAKE_PREFIX_PATH` contains three paths in this example.
