# Prefetcher

The objective of the **Prefetcher** is to promote and demote content which is
expected to be used in the near future or frequently. The prefetcher only
applies to data which is already staged within Hermes. In order to activate
prefetching, a Prefetcher Trait can be attached to a Tag (or Bucket)
to indicate that prefetching should be enabled and which kind of prefetching
should be applied.

## Usage (Configuration)

To enable prefetching with configuration.

## Usage (C++)

To enable prefetching, attach the Prefetcher trait to a tag (e.g., Bucket).
In this example, we attach the PrefetcherTrait with the kApriori prefetcher
constant to the SimulationBucket, which represents the data for
the simulation workload.

```cpp
auto bkt = HERMES->GetBucket("SimulationBucket");
TagId bkt_id = bkt.GetId();
hermes::TraitId apriori_trait =
    HERMES->RegisterTrait<hermes::PrefetcherTrait>(
      "apriori", hermes::PrefetcherType::kApriori);
TraitId trait_id = HERMES->GetTraitId("apriori");
bkt.AttachTrait(apriori_trait);
```

## Application Tracing

In order to support prefetching, we implement a tracing system within Hermes.
The tracer is called for every Put and Get operation within Hermes. It stores
the information called for the Put or Get internally within a multiple-producer
single-consumer (MPSC) shared-memory queue, which is asynchronously digested
by the prefetcher.

The tracer collects the following information:

1. Operation (Put or Get)
2. Blob Id
3. Bucket Id
4. Blob Size
5. Timestamp (from program start)
6. Rank (if MPI)

In the binary file, we store the following information:

1. Operation (Put or Get)
2. Blob Name (64-bit Hash)
3. Bucket Name (64-bit Hash)
4. Blob Size (64-bit)
5. Timestamp (from program start)
6. Rank (if MPI)

The trace can be analyzed live within the prefetcher or be stored in a
binary log (created using Cereal) and analyzed offline.

## Apriori Prefetcher

Currently, we implement the apriori prefetcher. Many applications exhibit
completely deterministic I/O patterns. Deep Learning applications for example
will have the same I/O pattern when the randomness seed is fixed and all other
paramters remain the same. Many HPC workloads are executed repeatedly with the
same parameters for reasons such as reproducability. This prefetcher assumes
that the user will supply a schema with the exact momements of when to
promote and demote content.

## Future Work

1. Live Prefetcher: Use some sort of short-term memory models to analyze I/O
   statistics generated live.
