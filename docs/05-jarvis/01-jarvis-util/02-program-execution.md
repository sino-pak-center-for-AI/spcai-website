# Program Execution

```python
from jarvis_util.shell.exec import Exec
```

`Exec` is used to execute a binary program as a subprocess in Python. `Exec` can be used for local, remote, or parallel execution of code. Exec is currently a wrapper around the following libraries:

1. Subprocess: executes a program locally on a machine. We use shell=True here. The intention is to be equivalent to a bash script.
2. SSH: executes a program remotely using SSH. This has only been tested on Linux. It is equivalent to executing "ssh" in the terminal.
3. Parallel SSH (PSSH): executes a program on multiple remote hosts. Relies upon the SSH module.
4. Message Passing Interface (MPI): executes a program in parallel using MPI. Only tested over MPICH at this time.

`Exec` has a simple syntax. It takes as input a command (cmd) and how the command should be executed (`exec_info`). For example, `exec_info` can be used to represent executing the command in parallel using MPI or locally on a machine using subprocess.

```python
from jarvis_util.shell.exec import Exec
Exec(cmd, exec_info)
```

Exec can be called with only specifying "cmd". In this case, the command will be executed locally. It's output will be printed to the terminal.

```python
from jarvis_util.shell.exec import Exec
Exec(cmd)
```

## `ExecInfo`

`ExecInfo` stores all information which may be needed to execute a command with a particular protocol. This includes information such as the location of private/public keys, hostfiles, environment variables. `ExecInfo` also includes parameters for collecting output from commands.

```python
ExecInfo(exec_type=ExecType.LOCAL, nprocs=None, ppn=None,
         user=None, pkey=None, port=None, hostfile=None, env=None,
         sleep_ms=0, sudo=False, cwd=None, hosts=None,
         collect_output=None, pipe_stdout=None, pipe_stderr=None,
         hide_output=None, exec_async=False, stdin=None)
```

### Specifying execution method (e.g., SSH vs MPI)

There are many ways to execute a command: Subprocess, SSH, etc. To specify this, there is an enum with all currently supported methods. The supported methods are:

1. `ExecType.LOCAL`
2. `ExecType.SSH`
3. `ExecType.PSSH`
4. `ExecType.MPI`

Setting `exec_type` will spawn the command using the particular approach. By default, `exec_type` is `ExecType.LOCAL`.

### Managing output from commands

ExecInfo has three parameters for collecting output from commands:

1. `collect_output`: Whether to store the output from the command in a buffer in Python. Will impact memory utilization if the command has large output. This is `False` by default.
2. `pipe_stdout`: Store stdout in a file. By default, this is `None`.
3. `pipe_stderr`: Store stderr in a file. By default, this is `None`.
4. `hide_output`: Don't print output.

Unlike typical subprocess, you can perform any combination of these. Output can be collected at the same time it's being printed. This is particularly useful if you have a long-running process you want to collect output from AND ensure is still progressing. This is accomplished by spawning two threads: one for collecting stderr, and another for collecting stdout.

### Asynchronous execution

ExecInfo enables the ability to execute a command asynchronously. This is particularly useful for running a daemon. For example, deploying a storage system requires the storage system to run as a service. This can cause the program to block forever unless asynchronous execution is enabled. Async execution is specified using the `exec_async=True`.

## `LocalExec`

```python
from jarvis_util.shell.exec import Exec
from jarvis_util.shell.local_exec import LocalExecInfo
```

The simplest way to execute a program locally is as follows:

```python
from jarvis_util.shell.exec import Exec
node = Exec('echo hello')
```

This will print "hello" to the console.

However, if more control is needed, a `LocalExecInfo` contains many helpful paramters.
The following demonstrates various examples of outputs:

```python
from jarvis_util.shell.exec import Exec
from jarvis_util.shell.local_exec import LocalExecInfo

# Will ONLY print to the terminal
node = Exec('echo hello', LocalExecInfo(collect_output=False))
# Will collect AND print to the terminal
node = Exec('echo hello', LocalExecInfo(collect_output=True))
# Will collect BUT NOT print to the terminal
node = Exec('echo hello', LocalExecInfo(collect_output=True,
                                        hide_output=True))
# Will collect, pipe to file, and print to terminal
node = Exec('echo hello', LocalExecInfo(collect_output=True,
                                        pipe_stdout='/tmp/stdout.txt',
                                        pipe_stderr='/tmp/stderr.txt'))
```

To execute a program asynchronously, one can do:

```python
from jarvis_util.shell.exec import Exec
from jarvis_util.shell.local_exec import LocalExecInfo

node = Exec('echo hello', LocalExecInfo(exec_async=True))
node.wait()
```

## `SshExec`

The following code will execute the "hostname" command on the local host using SSH.

```python
from jarvis_util.shell.exec import Exec
from jarvis_util.shell.ssh_exec import SshExecInfo

node = Exec('hostname', SshExecInfo(hosts='localhost'))
```

## `PsshExec`

The following code will execute the "hostname" command on all machines in the hostfile

```python
from jarvis_util.shell.exec import Exec
from jarvis_util.shell.pssh_exec import PsshExecInfo

node = Exec('hostname', PsshExecInfo(hostfile="/tmp/hostfile.txt"))
```

## `MpiExec`

The following code will execute the "hostname" command on the local machine 24 times using MPI.

```python
from jarvis_util.shell.exec import Exec
from jarvis_util.shell.mpi_exec import MpiExecInfo

node = Exec('hostname', MpiExecInfo(hostfile=None,
                                    nprocs=24,
                                    ppn=None))
```

The following code will execute the "hostname" command on 4 nodes (specified in hostfile) using MPI.
"ppn" stands for processes per node.

```python
from jarvis_util.shell.exec import Exec
from jarvis_util.shell.mpi_exec import MpiExecInfo

node = Exec('hostname', MpiExecInfo(hostfile="/tmp/hostfile.txt",
                                    nprocs=4,
                                    ppn=1))
```
