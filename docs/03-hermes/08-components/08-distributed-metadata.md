# Distributed Metadata

Metadata is stored in a distributed hash map. In each Hermes Daemon, we
initialize an `hipc::unordered_map`. The main metadata structures we store
are as follows: Tag Map (note, Buckets are represented as Tags), Blob Map,
and Trait Map. These maps typically map an integer ID to an
information structure. For example, the Blob Map maps a `BlobId` (a 96-bit int)
to a `BlobInfo` struct. In addition, we have separate maps for mapping semantic
strings to integer IDs. For example, we have a map from a `hipc::string` to
a `BlobId`.

At this time, metadata is not replicated on nodes and we assume that metadata
doesn't grow so large that it exceeds the bounds of main memory.

## User View

Metadata (e.g., Blobs and Tags) can be given semantic names using hipc::strings
or std::strings. hipc::string is what is eventually stored in Hermes, since it's
compatible with shared memory.

## System View

User primitives are referred to by unsigned 96-bit integers (IDs).

Each ID encodes the data it needs to access its metadata.

## UniqueId

TagIds, BlobIds, and TraitIds all are instances of a UniqueId. UniqueIds are
represented as follows:

- Node ID: The identifier of the node the metadata is on (32-bit)
- Unique: The unique number of the metadata object (64-bit)

The unique field is a 64-bit integer which is atomically incremented every time
the program creates a new metadata object. 64-bit is large enough that the
program should never be able to use all 2^64 combos.

## Storage Method

## Maps and ID Lists

All metadata is distributed among nodes by first hashing the key to
determine the node, then hashing again to determine the slot.

### Pros

- Better load balancing

### Cons

- May require extra RPC calls. Initial tests show that this
  indirection should be avoided. **TODO:** We need to revisit this.

## Walkthrough of `Bucket.Put()`

1\. Create a new `BlobID`. The ID's node index (top 32 bits) is created
by hashing the blob name, and the ID's offset to a list of `BufferID`s
(bottom 32 bits) is allocated from the MDM shared memory segment on the
target node.

2\. Add the new `BlobID` to the **IdMap**. This could be local, or an
RPC.

3\. Add the `BlobID` to the `Bucket`'s list of blobs.

## Walkthrough of `Bucket.Get()`

1\. Hash the blob name to get the `BlobID`.

2\. Get the list of `BufferID`s from the `BlobID`.

3\. Read each `BufferID`'s data into a user buffer.

## Limits

There can be a total of 2^64 unique metadata objects. I.e., there can be
a total of 2^64 Tags, Buckets, and Traits.
