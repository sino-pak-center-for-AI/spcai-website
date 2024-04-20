# `CMAKE_MODULE_PATH`

`CMAKE_MODULE_PATH` is used by CMake to identify the location of CMake modules.
It has a similar purpose to `LIBRARY_PATH` and `CPATH`. It is used to locate packages
and headers at compile time.

`CMAKE_MODULE_PATH` is organized as a colon-separated list.

```bash
export CMAKE_MODULE_PATH="/path1:/path2:/path3"
```

`CMAKE_MODULE_PATH` contains three paths in this example.
