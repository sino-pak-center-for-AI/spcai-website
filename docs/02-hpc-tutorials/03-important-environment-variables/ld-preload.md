# `LD_PRELOAD`

`LD_PRELOAD` is used by Linux to intercept functions in a program and replace their
implementation with a custom implementation. One use case that comes up in HPC is
the interception of I/O interfaces such as POSIX and routing their I/O commands to
a custom filesystem.

`LD_PRELOAD` is organized as a colon-separated list.

```bash
export LD_PRELOAD="/path1:/path2:/path3"
```

`LD_PRELOAD` contains three paths in this example.
