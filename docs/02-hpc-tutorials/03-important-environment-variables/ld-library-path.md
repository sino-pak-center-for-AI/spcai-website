# `LD_LIBRARY_PATH`

`LD_LIBRARY_PATH` is used by Linux to locate shared objects at runtime (as opposed to compile-time).
Shared objects need to be found all over again when starting your program.

`LD_LIBRARY_PATH` is organized as a colon-separated list.

```bash
export LD_LIBRARY_PATH="/path1:/path2:/path3"
```

`LD_LIBRARY_PATH` contains three paths in this example.
