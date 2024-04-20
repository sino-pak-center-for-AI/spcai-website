# `PATH`

The `PATH` variable is used to locate executable objects. For example:

```bash
touch hi.txt
tar hi.txt
```

Where does the terminal know where "tar" is? It searches each path in `PATH` and determines
the first location where the file tar exists.

`PATH` is organized as a colon-separated list.

```bash
export PATH="/path1:/path2:/path3:${PATH}"
```

The above example prepends three paths to the `PATH` variable.
