# Runtime

Hermes is built as a plugin to the Hermes Runtime, a distributed task processing framework
capable of scheduling, replicating, distributing, processing, monitoring, and
load balancing arbitrary tasks. Tasks define various properties which provide
control over scheduling decisions, memory management, and concurrency.
This section will discuss the design of the Hermes Runtime and how to develop
custom tasks.

## Task Repos and Task Libraries

The Hermes Runtime is used for executing arbitrary tasks. Developers can create
new tasks and release them using a decentralized package management design,
similar to spack. This is accomplished through **task repos**.

A task repo is a directory which contains a set of **task libraries**. A
task library (or lib) provides the functionality to submit and execute tasks.
Task libs follow the single responsibility principle. Multiple task libs should
be created to separate unrelated or loosely related functionality.

For example, the Hermes Runtime has a task repo named "tasks_required" located under the hrun directory of the Hermes repo.

```
tasks_required
├── CMakeLists.txt
├── hrun_admin
│   ├── CMakeLists.txt
│   ├── include
│   └── src
├── proc_queue
│   ├── CMakeLists.txt
│   ├── include
│   └── src
├── remote_queue
│   ├── CMakeLists.txt
│   ├── include
│   └── src
├── small_message
│   ├── CMakeLists.txt
│   ├── include
│   └── src
├── TASK_NAME
│   ├── CMakeLists.txt
│   ├── include
│   └── src
├── worch_proc_round_robin
│   ├── CMakeLists.txt
│   ├── include
│   └── src
└── worch_queue_round_robin
    ├── CMakeLists.txt
    ├── include
    └── src
```

The tasks_required directory contains tasks which are required for the Hermes Runtime to function. These tasks are non-negotiable and will always be registered automatically by the runtime.

## Bootstrapping a Task Library

A Task Library implements the following concepts:

1. **Task**: A struct containing the parameters to execute
2. **Task Server**: A class responsible for executing tasks. This is
   released as a shared object.
3. **Task Client**: A class responsible for submitting tasks to the hermes runtime. This is released as a header file, which is included by the client program.

To easily bootstrap a task lib, Hermes provides a python-based code generator called make_task. This script assumes a Linux system at this time (Windows has a different pathing system). Let's say you want to create a new task lib named "compress" for creating a factory of compression libraries. The task lib is located in the task repo `${HOME}/my_task_repo`.

```bash
codegen/make_task ${HOME}/my_task_repo/compress
```

This will create a task lib with the following directory structure:

```bash
compress
├── CMakeLists.txt
├── include
│   └── compress
│       ├── compress.h
│       ├── compress_lib_exec.h
│       ├── compress_methods.h
│       ├── compress_methods.yaml
│       └── compress_tasks.h
└── src
    ├── CMakeLists.txt
    └── compress.cc
```

The main files to edit:

1. `include/compress/compress.h`:
   This is the **Task Client**. User applications (e.g., VPIC, WRF) include this file and use it to submit tasks to the Hermes Runtime.
2. `include/compress/compress_methods.yaml`:
   Defines the name of all methods that will be implemented in the **Task Server**. This file will be converted into an enumeration.
3. `include/compress/compress_tasks.h`:
   Defines the **Tasks** that can be constructed. Tasks are implemented as structs that are compatible with shared memory.
   Tasks will only implement methods to serialize and copy the task. The actual function of the task is implemented
   in the Task Server.
4. `src/compress/compress.cc`:
   This is the **Task Server**. This file will be compiled into a shared object that can be dynamically loaded by the runtime. The task server must include handlers which take as input a task struct and then run a function over it.

Files that are automatically generated:

1. `include/compress/compress_lib_exec.h`:
   This is included in `compress.cc` automatically.
   This is an internal file not meant to be included anywhere else.
   This file produces code to route tasks to functions in compress.cc.
2. `include/compress/compress_methods.h`:
   This defines an enumeration containing all methods defined
   in compress_methods.yaml. It is included automatically by `compress_tasks.h`

### Overview of Bootstrapped Code

The bootstrap method will create a task library with the following methods: Create, Destruct, and Custom. Create and Destruct are required
by all Task Libraries and should not be removed. Custom is optional and provides an overview of the methods available to you for creating custom tasks. The code generated can be compiled immediately by adding it as a subdirectory to the root CMake of the task repo.

### CreateTask

CreateTask is responsible for initially registering a task state in the Hermes Runtime. This is analgous to class constructors.

#### Task Struct

In `include/compress/compress_tasks.h`

```cpp
using hrun::Admin::CreateTaskStateTask;
struct ConstructTask : public CreateTaskStateTask {
  /** SHM default constructor */
  HSHM_ALWAYS_INLINE explicit
  ConstructTask(hipc::Allocator *alloc)
  : CreateTaskStateTask(alloc) {}

  /** Emplace constructor */
  HSHM_ALWAYS_INLINE explicit
  ConstructTask(hipc::Allocator *alloc,
                const TaskNode &task_node,
                const DomainId &domain_id,
                const std::string &state_name,
                const TaskStateId &id,
                const std::vector<PriorityInfo> &queue_info)
      : CreateTaskStateTask(alloc, task_node, domain_id, state_name,
                            "compress", id, queue_info) {
    // Custom params
  }

  HSHM_ALWAYS_INLINE
  ~ConstructTask() {
    // Custom params
  }
};
```

This file defines the task struct that will be communicated between clients and the runtime. This task must always include a minimum of the above parameters. The order of parameters
should not be changed. Any additional parameters should be appended after queue_info.

- `alloc`: The shared-memory allocator the task was allocated with
- `task_node`: Tasks can spawn subtasks. This ability we refer to as Task Graphs. TaskNode stores the root of the Task Graph and the depth of this task in the Task Graph. For "Root" tasks, the TaskNode will be the unique ID of the task with a depth of 0.
- `domain_id`: Tasks can be scheduled or replicated over a domain of nodes. A domain is analogous to an MPI communicator. However, domains theoretically support dynamic node registration, unlike MPI.
- `state_name`: This is a semantic, unique, user-defined name to give the state. The state can be queried using this name in the future.
- `state_id`: This is a unique integer ID to give the state. This is an optional parameter that can be equal to null. When null, the state id is allocated automatically by the runtime and returned as the `id_` parameter in the base class CreateTaskStateTask.
- `queue_info`: Provides control over the queue to spawn to interact with this state. Each task state

#### Task Client

In `include/compress/compress.h`:

```cpp
/** Async create a task state */
HSHM_ALWAYS_INLINE
LPointer<ConstructTask> AsyncCreate(const TaskNode &task_node,
                                    const DomainId &domain_id,
                                    const std::string &state_name) {
  id_ = TaskStateId::GetNull();
  QueueManagerInfo &qm = HRUN_CLIENT->server_config_.queue_manager_;
  std::vector<PriorityInfo> queue_info = {
      {1, 1, qm.queue_depth_, 0},
      {1, 1, qm.queue_depth_, QUEUE_LONG_RUNNING},
      {qm.max_lanes_, qm.max_lanes_, qm.queue_depth_, QUEUE_LOW_LATENCY}
  };
  return HRUN_ADMIN->AsyncCreateTaskState<ConstructTask>(
      task_node, domain_id, state_name, id_, queue_info);
}
HRUN_TASK_NODE_ROOT(AsyncCreate)
template<typename ...Args>
HSHM_ALWAYS_INLINE
void CreateRoot(Args&& ...args) {
  LPointer<ConstructTask> task =
      AsyncCreateRoot(std::forward<Args>(args)...);
  task->Wait();
  id_ = task->id_;
  queue_id_ = QueueId(id_);
  HRUN_CLIENT->DelTask(task);
}
```

This code is called in client programs, such as VPIC, HACC, etc. `CreateRoot` calls `AsyncCreateRoot`, which will allocate, construct, and enqueue the CreateTask. `HRUN_TASK_NODE_ROOT` is a macro that creates the
AsyncCreateRoot method. The "Root" suffix implies that the method
is going to spawn a task that represents the root of a Task Graph.
This distinction is needed for avoiding potential deadlocks and
consistency problems.

#### Task Server

In `src/compress.cc`:

```cpp
void Construct(ConstructTask *task, RunContext &rctx) {
  task->SetModuleComplete();
}
```

This is the method that the ConstructTask will be routed to.

### DestructTask

The destruct task is responsible for releasing the Task State when the runtime is shutting down or when the user intentionally frees it. The DestructTask defined in `compress_tasks.h` should never be modified, and is the same across all tasks. It should not take additional parameters since the runtime shutdown process will fail.

## Overview of Task Submission and Queueing

Communication with the Hermes Runtime is accomplished through queueing.
The data structure is termed MultiQueue. The MultiQueue is a shared-memory, lock-free, concurrent priority queue. For each Task State,
an associated MultiQueue will be created. MultiQueues are defined
by a vector of PriorityInfo structs.

```cpp
struct PriorityInfo {
  u32 max_lanes_;       /**< Maximum number of lanes in the queue */
  u32 num_lanes_;       /**< Current number of lanes in use */
  u32 depth_;           /**< The maximum depth of individual lanes */
  bitfield32_t flags_;  /**< Scheduling hints for the queue */
};
```

A lane is a multiple-producer, single-consumer lock-free shared memory
queue. Each lane is scheduled on workers independently. A lane represents
the unit of concurrency in the Hermes Runtime.

In `include/compress/compress.h`:

```cpp
/** Async create a task state */
HSHM_ALWAYS_INLINE
LPointer<ConstructTask> AsyncCreate(const TaskNode &task_node,
                                    const DomainId &domain_id,
                                    const std::string &state_name) {
  id_ = TaskStateId::GetNull();
  QueueManagerInfo &qm = HRUN_CLIENT->server_config_.queue_manager_;
  std::vector<PriorityInfo> queue_info = {
      {1, 1, qm.queue_depth_, 0},
      {1, 1, qm.queue_depth_, QUEUE_LONG_RUNNING},
      {qm.max_lanes_, qm.max_lanes_, qm.queue_depth_, QUEUE_LOW_LATENCY}
  };
  return HRUN_ADMIN->AsyncCreateTaskState<ConstructTask>(
      task_node, domain_id, state_name, id_, queue_info);
}
```

This will create a MultiQueue with three priorities. Each element of
the vector is a Priority. Priority 0 will contain a single lane with
the user-configured default queue depth. Priority 1 will also
be a single lane, but with QUEUE_LONG_RUNNING flag. Tasks in these
lanes will be scheduled on diferent workers for QUEUE_LOW_LATENCY
lanes for performance reasons.

## Creating Custom Tasks

Now that the task library has been bootstrapped, this section will go over how to add new tasks.

### Modify `compress_methods.yaml`

Initially, the file contains:

```yaml
kCustom: 0
```

For compression, let's say we want to have two methods: Compress and
Decompress. We would modify this file to contain the following:

```yaml
kCompress: 0
kDecompress: 1
```

We then need to refresh the methods in this repo. This will autogenerate
code needed by the runtime to route tasks to these functions. This
is accomplished through the refresh_methods code generator:

```bash
codegen/refresh_methods ${HOME}/my_task_repo
```

This will refresh all methods in the my_task_repo. This should be
a very fast operation, so it just does it for all tasks in the
directory to avoid specifying a specific task library.

### Modify `compress_tasks.h`

Let's add the following task for representing the compression method.

```cpp
struct CompressTask : public Task, TaskFlags<TF_SRL_SYM> {
  IN int compress_method_;
  IN hipc::ShmArchive<hipc::string> data_;

  /** SHM default constructor */
  HSHM_ALWAYS_INLINE explicit
  CompressTask(hipc::Allocator *alloc) : Task(alloc) {}

  /** Emplace constructor */
  HSHM_ALWAYS_INLINE explicit
  CompressTask(hipc::Allocator *alloc,
             const TaskNode &task_node,
             const DomainId &domain_id,
             const TaskStateId &state_id,
             int compress_method,
             const std::string &data) : Task(alloc) {
    // Initialize task
    task_node_ = task_node;
    lane_hash_ = 0;
    prio_ = TaskPrio::kLowLatency;
    task_state_ = state_id;
    method_ = Method::kCustom;
    task_flags_.SetBits(TASK_UNORDERED | TASK_LANE_ANY);
    domain_id_ = domain_id;

    // Custom params
    compress_method_ = compress_method;
    HSHM_MAKE_AR(data_, alloc, data);
  }

  /** (De)serialize message call */
  template<typename Ar>
  void SerializeStart(Ar &ar) {
    task_serialize<Ar>(ar);
    ar(compress_method_, data_);
  }

  /** (De)serialize message return */
  template<typename Ar>
  void SerializeEnd(u32 replica, Ar &ar) {
  }

  /** Create group */
  HSHM_ALWAYS_INLINE
  u32 GetGroup(hshm::charbuf &group) {
    return TASK_UNORDERED;
  }
};
```

#### The `TaskFlags` base class

The CompressTask inherits from TaskFlags, which defines compile-time
properties of the task -- particularly the class methods.

```cpp
struct CompressTask : public Task, TaskFlags<TF_SRL_SYM> {
// };
```

Here, the TaskFlags has the parameter TF_SRL_SYM. This constant implies
the task supports serialization methods. These methods will be called
internally when a task gets dispersed to remote nodes.

SerializeStart is called when a task is being shipped to a remote
node for execution. SerializeEnd is called when returning from
the remote node. In this way, the task can store both the input
and output of the operation performed. This avoids having a separate
completion queue.

There are a few kinds of tasks:

1. TF_LOCAL: tasks that execute only on the local node. They cannot
   be shipped to remote nodes and they cannot be replicated.
2. TF_SRL_SYM: tasks that execute potentially on a remote node. They
   cannot be replicated. Must implement SerializeStart and SerializeEnd.
3. TF_SRL_SYM | TF_REPLICA: tasks that can be shipped to a remote node
   and support replication. Must implement ReplicateStart, ReplicateEnd, Dup, DupEnd.
4. TF_SRL_ASYM_START: task has asymmetric serialization and deserialization methods for input variables (SaveStart, LoadStart instead of SerializeStart)
5. TF_SRL_ASYM_END: task has asymmetric serialization and deserialization methods for output variables (SaveEnd, LoadEnd instead of SerializeEnd)

TODO: explain what each candidate method does

#### Task Constructor

We will provide a brief overview of an example implementaion of CompressTask. DecompressTask looks similar, so we don't repeat.

```cpp
/** Emplace constructor */
HSHM_ALWAYS_INLINE explicit
CompressTask(hipc::Allocator *alloc,
           const TaskNode &task_node,
           const DomainId &domain_id,
           const TaskStateId &state_id,
           int compress_method,
           const std::string &data) : Task(alloc) {
  // Initialize task
  task_node_ = task_node;
  lane_hash_ = 0;
  prio_ = TaskPrio::kLowLatency;
  task_state_ = state_id;
  method_ = Method::kCustom;
  task_flags_.SetBits(TASK_UNORDERED | TASK_LANE_ANY);
  domain_id_ = domain_id;

  // Custom params
  compress_method_ = compress_method;
  HSHM_MAKE_AR(data_, alloc, data);
}
```

- `lane_hash_`: The lane of the MultiQueue a request is keyed to if
  TASK_LANE_ANY is not set under the task flags. This gives concurrency control. Tasks in
  the same lane will be executed sequentially if necessary.
- `prio_`: The priority of the task. KLowLatency is priority 2.
- `method_`: The method the task will be routed to by the runtime
- `task_flags_`: Various flags that can improve performance

### Modify `compress.cc`

```cpp
void Compress(CompressTask *task, RunContext &rctx) {
  task->SetModuleComplete();
}

void Decompress(DecompressTask *task, RunContext &rctx) {
  task->SetModuleComplete();
}
```

Create the callback functions in the task server.
task->SetModuleComplete() indicates that the task is completely finished.
Long-running tasks should not use this function.

### Modify `compress.h`

```cpp
HSHM_ALWAYS_INLINE
void AsyncCompressConstruct(CompressTask *task,
                          const TaskNode &task_node,
                          const DomainId &domain_id,
                          int compress_method,
                          const std::string &data) {
  HRUN_CLIENT->ConstructTask<CompressTask>>(
      task, task_node, domain_id, id_, compress_method, data);
}
HSHM_ALWAYS_INLINE
void CompressRoot(const DomainId &domain_id,
                  int compress_method,
                  const std::string &data) {
  LPointer<hrunpq::TypedPushTask<CompressTask>> task = AsyncCompressRoot(domain_id);
  task.ptr_->Wait();
}
HRUN_TASK_NODE_PUSH_ROOT(Compress);
```

CompressRoot will be called by clients directly.
HRUN_TASK_NODE_PUSH_ROOT will create various helper methods that
eventually call AsyncCompressConstruct. LPointer is a struct that
contains a shared-memory pointer to a task and its corresponding
private-memory pointer.

hrunpq::TypedPushTask represents a task that is stored inside of the
**process queue**. The process queue is a single-priority queue that
connects clients to the Hermes runtime. Tasks in this queue are keyed
to lanes based on standard thread ID. This ensures that all tasks
originating from the same thread are in the same lane. This helps
give consistency guarantees for I/O operations.

### Task Methods

The task methods will be discussed in sections 6, 7, and 8.

## Registering a Task Library

After creating a new task library, it must be registered with
the Hermes Runtime. This can be done either programmatically or
through configuration.

Through configuration, you must edit the Hermes runtime configuration.
An example configuration is stored in `${HERMES_ROOT}/config/hermes_server_default.yaml`.

```yaml
task_registry:
  [
    "hermes_mdm",
    "hermes_blob_mdm",
    "hermes_bucket_mdm",
    "hermes_data_op",
    "data_stager",
    "posix_bdev",
    "ram_bdev",
    "compress",
  ]
```

This can be passed to the Hermes runtime using the HERMES_CONF environment
variable.

## Task Grouping, Worker Polling, and Deadlock Prevention

This section will provide more insight on how queues are polled
and processed in the Hermes Runtime to provide fine-grained control
over scheduling and concurrency.

Tasks must all implement a function called `GetGroup`. Task groups are used to enable look-ahead capabilities with safety. A **Task Group** represents a collection of tasks that modify the same metadata structure and need to be sequentially executed. For example, the Bucket ID is
used as the group for calling the bucket methods GetSize and UpdateSize.
This ensures that GetSize and UpdateSize will be executed in sequence when
made to the same bucket. Certain operations do not require any synchronization (e.g., stateless methods) and can return a group of TASK_UNORDERED.

A **Task Node** represents the location of a task in the overall
task graph. There is no Task Graph data structure, it's a concept.
When a task spawns a subtask, it can be conceptually be considered
as a task graph. Tasks apart of the same task graph will be executed
simultaneously --regardless of group -- to prevent deadlocks in the
case where two tasks from the same graph are keyed to the same queue and lane.

## Building a Replicatable Task

To make a task support replication, set the TF_REPLICA flag. This
will indicate that a task implements the replication methods.

```cpp
struct CompressTask : public Task, TaskFlags<TF_SRL_SYM | TF_REPLICA> {
  IN compress_type_;
  IN hipc::ShmArchive<hipc::string> data_;
  OUT hipc::ShmArchive<hipc::vector<size_t>> sizes_;
  OUT size_t final_size_;

  /** (De)serialize message call */
  template<typename Ar>
  void SerializeStart(Ar &ar) {
    task_serialize<Ar>(ar);
    ar(compress_type_, data_);
  }

  /** (De)serialize message return */
  template<typename Ar>
  void SerializeEnd(u32 replica, Ar &ar) {
    ar(sizes_, final_size_);
  }

  /** Duplicate message */
  void Dup(hipc::Allocator *alloc, CustomTask &other) {
    task_dup(other);
    compress_type_ = other.compress_type_;
    HSHM_MAKE_AR(data_, alloc, other.data_);
  }

  /** Process duplicate message output */
  void DupEnd(u32 replica, CustomTask &dup_task) {
    (*sizes_)[repclica] = other.size_;
  }

  /** Begin replication */
  void ReplicateStart(u32 count) {
    size_->resize(count);
  }

  /** Finalize replication */
  void ReplicateEnd() {
    size_t final_size_ = std::numeric_limits<size_t>::min();
    for (size_t &size : sizes_) {
      if (final_size_ > size) {
        final_size_ = size;
      }
    }
  }
};
```

- `SerializeStart`: Will serialize and deserialize the _input_ parameters of the task. So anything labeled IN or INOUT.
- `SerializeEnd`: Will serialize and deserialize the _output_
  parameters of the task. So anything labeled OUT or INOUT.
- `Dup`: Analogous to a copy constructor. Will make a local
  copy of this task (no serialization involved).
- `DupEnd`: Will store the output of a replica in the original
  task the duplicates were spawned from.
- `ReplicateStart`: Used to allocate data structures in the task
  to account for the replication
- `ReplicateEnd`: Called after all replicas have returned. Can
  aggregate replica otuput.

## Building a Data-Intensive, RDMA-Capable Task

TODO: Make example based on PutBlob and GetBlob.
