---
id: pythonpath
---

# `PYTHONPATH`

Python uses `PYTHONPATH` to specify directories where Python modules may be located.
Spack sets this environment variable if installing python packages.

`PYTHONPATH` is organized as a colon-separated list.

```bash
export PYTHONPATH="/path1:/path2:/path3"
```

`PYTHONPATH` contains three paths in this example.
