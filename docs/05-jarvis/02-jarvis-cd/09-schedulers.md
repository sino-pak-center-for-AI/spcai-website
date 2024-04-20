# Schedulers

Jarvis-CD provides native support for two popular job scheduling systems: SLURM and PBS. This documentation aims to guide users on how to utilize both schedulers through Jarvis-CD.

## SLURM Scheduler

Jarvis-CD integrates with the SLURM scheduler through the pipeline sbatch menu. You can specify job parameters using the following options:

- **job_name** (required): Name of the job.
- **nnodes** (required): Number of nodes to execute the pipeline on.
- ppn: Number of processes per node.
- cpus_per_task: Number of processors required per task.
- time: Maximum time allotted to the job.
- partition: The partition in which to allocate nodes (default is compute).
- mail_type: When to email users about the job status. Choices include: NONE, BEGIN, END, FAIL, REQUEUE, ALL.
- mail_user: Email address for job notifications.
- output_file: File path to write all output messages.
- error_file: File path to write all error messages.
- memory: Amount of memory to request for the job.
- gres: List of generic consumable resources (like GPUs).
- exclusive: Request nodes exclusively (default is True).

To run a job using SLURM:

```bash
jarvis pipeline sbatch job_name=test nnodes=4
```

## PBS Scheduler

Jarvis-CD also supports the PBS scheduler through the pipeline pbs menu. The following options are available:

- **nnodes** (required): Number of nodes to execute the pipeline on (default is 1).
- system: Type of system to allocate the nodes on (default is polaris).
- filesystems: Filesystem to be used, e.g., home:grand (default is home:grand).
- walltime: Maximum time allotted to the job (default is 00:10:00).
- account: Account used for job submission (default is VeloC).
- queue: Queue in which to submit the job (default is debug-scaling).
- interactive: Submit the job in interactive mode (default is False).
- env_vars: Environmental variables to pass through PBS. Format: comma-separated list of strings like variable or variable=value.

To run a job using PBS:

```bash
jarvis pipeline pbs nnodes=2 system=other_system
```
