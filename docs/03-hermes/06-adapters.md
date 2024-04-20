# Adapters

![Hermes Ecosystem](images/Hermes_Ecosystem.jpg)

Instead of the [Hermes primitives](07-programming.md), existing applications
use I/O libraries and middleware such as the C standard I/O library,
MPI-IO, or HDF5. Since Hermes is intended to be a seamless I/O
buffering solution, a set of _adapters_ is provided in the form of
`LD_PRELOAD`-able shared libraries. These adapters perform the task of
mapping between the application view of I/O primitives (e.g., files)
and the Hermes primitives. An exemplary discussion of such mappings
can be found in [Enosis: Bridging the Semantic Gap between File-based
and Object-based Data Models](http://www.cs.iit.edu/~scs/assets/files/Enosis.pdf) and [Syndesis: Mapping Objects to Files for a Unified Data Access
System](http://www.cs.iit.edu/~scs/assets/files/Syndesis.pdf).

Another important task of Hermes adapters is to collect I/O profiling
that supports the detection of I/O patterns.

## Filesystem Base Class (FSBC)

The Filesystem Base Class (FSBC) is used by all filesystem-based APIs. This
includes STDIO, POSIX, and MPIIO. The FSBC implements all necessary APIs for
buffering files within Hermes.

The FSBC provides basic filesystem overrides, including:

- Opening a file
- Writing to a file
- Reading from a file
- Getting the size of a file
- Removing a file

Currently, we have four filesystem adapters:

1. STDIO
2. POSIX
3. MPI-IO
4. HDF5 VFD

### Design

When reading/writing to a file, the FSBC will divide the I/O request into
fixed-size pages. This is a configurable value, but the default is 1MB.

As opposed to locking, Hermes uses queuing to ensure that I/O to the same regions
of a file are strongly consistent. I/O to the same blob will be placed in the
same queue, ensuring sequencing.

### VFD

The HDF5 VFD is used to interface HDF5 with Hermes natively. To use the Hermes
VFD in HDF5, you must define the following environment variables:

```bash
export HDF5_PLUGIN_PATH=/path/to/hermes/lib
export HDF5_DRIVER=hdf5_hermes_vfd
```

HDF5_PLUGIN_PATH indicates the directory to search for the HDF5_DRIVER. In
this case, HDF5 will search for libhdf5_hermes_vfd.so.

## PubSub Adapter

The PubSub adapter for Hermes stands a bit different from other adapters due to the diverse nature of pub/sub APIs on the market. For example, here are two examples of starting programs for two different queue/broker systems.

A simple example of, one of, the ZeroMQ C++ API.

```cpp
#include <string>
#include <zmq.hpp>
int main()
{
   zmq::context_t ctx;
   zmq::socket_t sock(ctx, zmq::socket_type::push);
   sock.bind("inproc://test");
   const std::string_view m = "Hello, world";
   sock.send(zmq::buffer(m), zmq::send_flags::dontwait);
}
```

And an example of the Kafka C++ API.

```cpp
#include "kafka/KafkaProducer.h"
#include <iostream>
#include <string>
int main(int argc, char **argv)
{
  std::string brokers = argv[1];
  kafka::Topic topic  = argv[2];
  string line'

  kafka::Properties props({
    {"bootstrap.servers", brokers},
    {"enable.idempotence", "true"},
  });
  kafka::KafkaSyncProducer producer(props);
  std::cin >> line;
  auto record = kafka::ProducerRecord(topic, kafka::NullKey, kafka::Value(line.c_str(), line.size()));
  kafka::Producer::RecordMetadata metadata = producer.send(record);
}
```

Both examples highlight the diversity of APIs present on the pub/sub market.
As such, the adapter API is intended to present a common and sharable lower interface to Hermes to which all other used API can be intercepted and redirected.

### Suported API

In all functions `hapi` stands for objects under the `hermes::api` namespace.

#### `connect`

```cpp
hapi::Status connect(const std::string &config_file);
hapi::Status connect();
    - Connects to the Hermes instance
    - One option accepts, config_file: Path to the config file of Hermes
    - The other, assumes that path is loaded into an environment variable defined in constants.h under kHermesConf
```

#### `attach`

```cpp
hapi::Status attach(const std::string& topic);
    - Attaches to a topic, creating it if it doesn't exist
    - topic: The name of the topic
```

#### `detach`

```cpp
hapi::Status detach(const std::string& topic);
    - Detaches from the topic cleaning up all client-local metadata
    - topic: The name of the topic
    - Note, detaching doesn't delete the topic
```

#### `publish`

```cpp
hapi::Status publish(const std::string& topic,  const std::vector<unsigned char>& message);
    - Puts a message to a topic
    - topic: The name of the topic
    - message: the data buffer
    - Note, the function uses std::vector<unsigned char> which is equivalent to hermes::api::Blob
```

#### `subscribe`

```cpp
 std::pair<std::vector<unsigned char>, hapi::Status> subscribe( const std::string& topic);
    - Retrieves the next message from the topic
    - topic: The name of the topic
    - returns: a pair of the return code/status and, if successful, the subscribed message.
```

## Current Limitations

- Currently on Hermes, Blob deletions causes the latest Blob to be placed in it's place, this is intended to save memory space and provide an O(1) deletion complexity. Nevertheless, this destroys the ordering of messages expected but the pub/sub API, as such, message/Blob deletions is not possible, currently.
- Multi-threaded support of the API has not been fully tested. All tests have been performed under multi-process, MPI-driven tests.

## Future Work

- Current work is being focused in expanding the library to support the use of traits to support in-transit transformations of the data

## References

- [GOTCHA is a library for wrapping function calls in shared libraries](https://github.com/LLNL/GOTCHA)
