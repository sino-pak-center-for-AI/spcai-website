# Nyx

https://amrex-astro.github.io/Nyx/

Nyx code solves equations of compressible hydrodynamics on an adaptive grid hierarchy coupled with an N-body treatment of dark matter. The gas dynamics in Nyx uses a finite volume methodology on a set of 3-D Eulerian grids; dark matter is represented as discrete particles moving under the influence of gravity. Particles are evolved via a particle-mesh method, using Cloud-in-Cell deposition/interpolation scheme. Both baryonic and dark matter contribute to the gravitational field. In addition, Nyx includes physics needed to accurately model the intergalactic medium: in optically thin limit and assuming ionization equilibrium, the code calculates heating and cooling processes of the primordial-composition gas in an ionizing ultraviolet background radiation field. Additional physics capabilities are under development

## Installation

1. Dependencies: MPI and "parallel hdf5"

2. Install ARMex

```
git clone https://github.com/AMReX-Codes/amrex.git
mkdir amrex/build && cd amrex/build
cmake .. -DAMReX_HDF5=ON -DAMReX_PARTICLES=ON -DAMReX_PIC=ON -DBUILD_SHARED_LIBS=ON -DCMAKE_INSTALL_PREFIX=$HOME/amrex/install
make -j 8
make install
```

2. Install Nyx

```
git clone https://github.com/AMReX-astro/Nyx.git
cd Nyx
mkdir build && cd build
cmake .. -DCMAKE_PREFIX_PATH=$HOME/amrex/install/ -DAMReX_DIR=$HOME/amrex/install/Tools/CMake/ -DNyx_SINGLE_PRECISION_PARTICLES=OFF -DNyx_OMP=OFF
make -j 8
```

## Usage

The Nyx executable reads run-time information from an “inputs” file which you designate on the command line. Most executable directories have an "inputs" file. Nyx has several different executables. Here I only show how to run the **LyA** example.

### Configure the "inputs" file under **LyA** directory

1. By default, Nyx doesn't output HDF5 files. To enable Nyx to write HDF5 files, adding `nyx.write_hdf5 = 1` to the "inputs" file. For example:

```
# ------------------  INPUTS TO MAIN PROGRAM  -------------------
max_step = 200

nyx.ppm_type         = 1
nyx.use_colglaz      = 0
nyx.corner_coupling  = 1
nyx.write_hdf5       = 1  # add this line
nyx.strang_split     = 0
nyx.sdc_split        = 1
nyx.add_ext_src      = 0
nyx.heat_cool_type   = 11
```

2. Set the `nyx.initial_z` and `nyx.final_z`, z corresponds to time, but it is negative. `nyx.initial_z` is larger than `nyx.final_z`. For example:

```
nyx.initial_z = 190.0
nyx.final_z = 170.0
```

3. Nyx needs to initialize binary particles. I want it to read from a binary file. By default, there is a binary file `64sssss_20mpc.nyx` in LyA directory. Here are some related parameters:

```
# >>>>>>>>>>>>>  PARTICLE INIT OPTIONS <<<<<<<<<<<<<<<<
nyx.particle_init_type = BinaryFile
nyx.binary_particle_file = 64sssss_20mpc.nyx
particles.nparts_per_read = 2097152
```

Note: If `64sssss_20mpc.nyx` is located in a different directory, you need to use the absolute path of the file.

3. Nyx will generate two kinds of files: “plotfiles” and “checkpoint” files. The "plotfiles" are used for visualization and the "checkpoint" files for restarting the code. The "plotfiles" are written in AMReX plotfile binary format by default. You can tell Nyx to output HDF5 file by adding `nyx.write_hdf5 = 1`

3.1 Set "plotfiles" related parameters

```
# PLOTFILES
amr.plot_files_output = 1
amr.plot_file       = /mnt/ssd/jye20/LyA_test/plt
amr.plot_int        = -1
nyx.plot_z_values   = 188.0 184.0 182.0

amr.plot_vars        = density xmom ymom zmom rho_e Temp phi_grav
#amr.derive_plot_vars = particle_mass_density particle_count
```

amr.plot_files_output: This is set to 1 to enable plot files. If you don't want to output plot files, set it to 0.

amr.plot_file: This is the base name for the plotfile, e.g. plt. If you set it to be `/mnt/ssd/jye20/LyA_test/plt`, `/mnt/ssd/jye20/LyA_test` is the output directory.

nyx.plot_z_values: Specify a list of z values for which Nyx will save a snapshot.

amr.plot_vars: Specify the name of state variables to include in plotfiles

amr.derive_plot_vars: Specify name of derived variables to include in plotfiles

3.2 Set checkpoint file parameters

```
# CHECKPOINT FILES
amr.checkpoint_files_output = 1
amr.check_file        = /mnt/ssd/jye20/LyA_test/chk
amr.check_int         = 100
amr.checkpoint_nfiles = 64
```

4. Resolution related parameters

```
amr.n_cell           =  64  64  64
amr.max_grid_size    = 32
```

Reference: [Nyx document](https://amrex-astro.github.io/Nyx/docs_html/NyxInputs.html#examples-of-usage-2)

## Run the Nyx Application

1. Enter into the **LyA** executable directory

```
./nyx_LyA ./inputs
```
