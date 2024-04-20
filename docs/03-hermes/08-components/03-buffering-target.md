# Buffering Target

A buffering target represents a logical target of data placement, i.e.,
parts of or a full BLOB can be placed there by the DPE. Buffering
targets are logical constructs that are statically mapped by Hermes to
underlying physical resources.

## Terminology

A buffering target consists of two components:

### Virtual Device

This represents a way to get to the actual storage. It could be a file handle and an offset, a memory address, a partition of a drive, etc.

### NodeID

The identifier of the node that is responsible for the virtual device.

**Tiers** are the partitions of a partitioned set of targets order by a
score, which is calculated based on a set of prioritized
characteristics. Tier 1 represents the "best" targets according to the
prioritized characteristics, and the tiers get "worse" as the tier
number increases. For example, tier 1 might be a local RAM target when
bandwidth is the ordering characteristic, but it might be a burst buffer
target when remaining capacity is prioritized.

When the DPE runs, it is given an appropriate list of targets. If a
placement fails, it can request an extended list of targets
(neighborhood or global).

For now we map 1 `TargetID` to 1 (NodeID, VirtualDevice) pair, but the
option is open for 1 to _n_ and _n_ to _m_.

---

The set of targets can be partitioned in the form of _topologies_. In
some cases, the aggregate characteristics of such partitions can be
defined based on the characteristics of the underlying targets.

---

## User View

Buffering targets are exposed in the [[Hermes Configuration]] file as the variables `num_targets` and `num_devices`. Currently, the number of targets must equal the number of devices.

## Goals

- Provide a way for the DPE to operate on a reduced (or custom) set of
  resources.
- Remove certain resources from DPE consideration.
- Create orderings of resources based on characteristics (i.e., tiered
  groups).

## Charateristics

Each buffering target has the following characteristics.

- Targets $`d_i, i=1,\ldots,D`$
  - Target configuration/specs.
    - $`Cap[d_i]`$ - the total capacity of target $`d_i`$
    - $`Wbw[d_i]`$ - the HW max. write bandwidth of target $`d_i`$
    - $`Rbw[d_i]`$ - the HW max. read bandwidth of target $`d_i`$
    - $`Alat[d_i]`$ - the average HW access latency of target
      $`d_i`$ (measured as time)
    - $`Pwr[d_i]`$ - the energy consumption of target $`d_i`$
      (measured in Watts)
    - $`Concy[d_i]`$ - the HW concurrency of target $`d_i`$
      (measured in lane count)
    - $`End[d_i]`$ - the endurance (wear and tear) of target
      $`d_i`$ (measured as percentage of the expected storage
      cycles over the life time)
    - $`Rrat[d_i]`$ - the reliability rating of target $`d_i`$
      (measured as test-retest reliability)
    - $`Speed[d_i]`$ - the average I/O speed of target $`d_i`$
      (measured as MB/s)
  - Variables
    - $`Avail[d_i]`$ - the availability of target $`d_i`$
      (Boolean)
    - $`Rem[d_i]`$ - the remaining capacity of target $`d_i`$
    - $`Load[d_i]`$ - the expected completion time of outstanding
      requests on target $`d_i`$

## Example

Assume a system with 3 nodes, each with three targets (RAM, NVMe, and
burst buffer). Assume a neighborhood is any 2 of the three nodes. This
means a local target list will consist of 3 targets, a neighborhood target list of
6, and the global target list of 9.

## Kitchen Sink

<table>
   <tbody>
      <tr class="odd">
         <td>
            <p>From the <a href="https://www.cut.ac.cy/digitalAssets/122/122275_100sigmod.pdf">OctopusFS paper</a>:</p>
            <ul>
               <li>Tiers <span class="math inline"><em>T</em><sub>1</sub>, …, <em>T</em><sub><em>k</em></sub></span></li>
               <li>
                  Media <span class="math inline"><em>m</em><sub><em>i</em></sub></span>
                  <ul>
                     <li><span class="math inline"><em>T</em><em>i</em><em>e</em><em>r</em>[<em>m</em><sub><em>i</em></sub>]</span> - the tier of medium <span class="math inline"><em>m</em><sub><em>i</em></sub></span></li>
                     <li><span class="math inline"><em>C</em><em>a</em><em>p</em>[<em>m</em><sub><em>i</em></sub>]</span> - the total capacity of medium <span class="math inline"><em>m</em><sub><em>i</em></sub></span></li>
                     <li><span class="math inline"><em>R</em><em>e</em><em>m</em>[<em>m</em><sub><em>i</em></sub>]</span> - the remaining capacity of medium <span class="math inline"><em>m</em><sub><em>i</em></sub></span></li>
                     <li><span class="math inline"><em>N</em><em>r</em><em>C</em><em>o</em><em>n</em><em>n</em>[<em>m</em><sub><em>i</em></sub>]</span> - the number of active I/O connections to medium <span class="math inline"><em>m</em><sub><em>i</em></sub></span></li>
                     <li><span class="math inline"><em>W</em><em>T</em><em>h</em><em>r</em><em>u</em>[<em>m</em><sub><em>i</em></sub>]</span> - the sustained write throughput of medium <span class="math inline"><em>m</em><sub><em>i</em></sub></span></li>
                     <li><span class="math inline"><em>R</em><em>T</em><em>h</em><em>r</em><em>u</em>[<em>m</em><sub><em>i</em></sub>]</span> - the sustained read throughput of medium <span class="math inline"><em>m</em><sub><em>i</em></sub></span></li>
                  </ul>
               </li>
               <li>
                  Workers <span class="math inline"><em>W</em><sub>1</sub>, …, <em>W</em><sub><em>n</em></sub></span>
                  <ul>
                     <li>
                        Slightly different concept
                        <ul>
                           <li>Stores and manages file blocks on storage media</li>
                           <li>Serves read and write requests from clients</li>
                           <li>Block creation, deletion, replication (instructed by name nodes HDFS...)</li>
                        </ul>
                     </li>
                  </ul>
               </li>
            </ul>
         </td>
         <td>
            <p>From <a href="https://www.wrike.com/open.htm?id=416733774">Wrike</a>:</p>
            <ul>
               <li><span class="math inline"><em>W</em><sub><em>i</em></sub> =  &lt; <em>n</em><em>o</em><em>d</em><em>e</em>, <em>t</em><em>i</em><em>e</em><em>r</em>&gt;</span></li>
               <li>Workers are a dedicated thread per tier available on the node</li>
               <li>
                  Worker characteristics:
                  <ul>
                     <li>Capacity</li>
                     <li>BW</li>
                     <li>Latency</li>
                     <li>Energy consumption</li>
                     <li>Concurrency (expressed as the number of lanes of the bus e.g., PCIex8 or SATA)</li>
                     <li>
                        Queue pressure (outstanding requests)
                        <ul>
                           <li>Aggregate data size in queue</li>
                           <li>Number of pending requests</li>
                        </ul>
                     </li>
                  </ul>
               </li>
            </ul>
         </td>
      </tr>
   </tbody>
</table>
