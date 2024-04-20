# CPATH

GCC and Clang search each path in `CPATH` and sometimes `INCLUDE_PATH` for header files.
`CPATH` is more reliable from what I've seen.

`CPATH` is organized as a colon-separated list.

```bash
export CPATH="/path1:/path2:/path3"
```

`CPATH` contains three paths in this example.
