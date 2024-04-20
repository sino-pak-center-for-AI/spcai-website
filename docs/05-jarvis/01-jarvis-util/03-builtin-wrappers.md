# Built-in Wrappers

We have various wrappers to support much shell functionality. At this time, these have been built and tested for Linux. These codes inherit from the `Exec` class shown in Section 1. This way, they can be executed locally or in parallel.

## Creating + Deleting Directories

We provide various wrappers for filesystem commands.

```python
from jarvis_util.shell.filesystem import Mkdir
from jarvis_util.shell.filesystem import Rm

# Creates two directories "path1" and "path2"
Mkdir(['path1', 'path2'])
# Creates a single directory path3
Mkdir('path3')

# Remove two directories (including subdirectories + files)
Rm(['path1', 'path2'])
# Remove a single directory
Rm('path3')
```

## Killing Processes

We provide a wrapper for pkill, which can kill processes in parallel

```python
from jarvis_util.shell.process import Kill

# Kill all processes matching pattern
Kill('hermes')
```
