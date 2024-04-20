# Topology

The `TopologyManager` is responsible for maintaining sets of `Target`s
as metadata.

## API

```c++
  - std::vector<TargetID> GetTop(size_t num_targets, Critera criteria)
```

### Requirements

- O(1) insert
- Fast find.

## Scoring System

## Pre-built Partitions

- Remaining Capacity
  - Global
  - Neighborhood
  - Local
- Bandwidth
  - Global
  - Neighborhood
  - Local
