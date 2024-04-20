# WRF

## Installation

### System Check

Create a Test folder

```bash
mkdir TESTS
cd TESTS
```

Download the test cases and start tests, the output of tests should include SUCCESS

```bash
wget https://www2.mmm.ucar.edu/wrf/OnLineTutorial/compile_tutorial/tar_files/Fortran_C_tests.tar
tar -xf Fortran_C_tests.tar
gfortran TEST_1_fortran_only_fixed.f
./a.out
gfortran TEST_2_fortran_only_free.f90
./a.out
gcc TEST_3_c_only.c
./a.out
gcc -c -m64 TEST_4_fortran+c_c.c
gfortran -c -m64 TEST_4_fortran+c_f.f90
gfortran -m64 TEST_4_fortran+c_f.o TEST_4_fortran+c_c.o
./a.out
./TEST_csh.csh
./TEST_perl.pl
./TEST_sh.sh
```

### Create a library folder and install the library

```bash
mkdir Build_WRF
cd Build_WRF
mkdir LIBRARIES
cd LIBRARIES
```

Download and unzip the required libraries.

1. nedcdf-c-4.9.2

```bash
wget -c https://downloads.unidata.ucar.edu/netcdf-c/4.9.2/netcdf-c-4.9.2.tar.gz
tar xzvf netcdf-c-4.9.2.tar.gz
```

2. hdf5(you can also install the newest version)

```bash
wget -c https://support.hdfgroup.org/ftp/HDF5/releases/hdf5-1.12/hdf5-1.12.2/src/hdf5-1.12.2.tar.gz
tar xzvf hdf5-1.12.2.tar.gz
```

3. zlib(1.2.11)

```bash
wget -c https://www2.mmm.ucar.edu/wrf/OnLineTutorial/compile_tutorial/tar_files/zlib-1.2.11.tar.gz
tar xzvf zlib-1.2.11.tar.gz
```

4. NETCDF-Fortran(4.6.1)

```bash
wget https://downloads.unidata.ucar.edu/netcdf-fortran/4.6.1/netcdf-fortran-4.6.1.tar.gz
tar xzvf netcdf-fortran-4.6.1.tar.gz
```

5. PnetCDF(1.12.3)

```bash
wget https://parallel-netcdf.github.io/Release/pnetcdf-1.12.3.tar.gz
tar xzvf pnetcdf-1.12.3.tar.gz
```

6. LibPNG

```bash
wget -c https://www2.mmm.ucar.edu/wrf/OnLineTutorial/compile_tutorial/tar_files/libpng-1.2.50.tar.gz
tar xzvf libpng-1.2.50.tar.gz
```

7. MPICH
   when load the adios2, mpi is automatically loaded in PATH

```bash
module load adios2/2.9.1-6fh7kh2
```

### Choice 1: Install the library(with the HDF5 support and without PnetCDF support)

Set the environment variables

```bash
export DIR=/PATH/TO/Build_WRF/LIBRARIES
export CC=gcc
export CXX=g++
export FC=gfortran
export F77=gfortran
module load libxml2
```

1. Install the zlib

```bash
cd zlib-1.2.11/
./configure --prefix=$DIR
make
make install
```

2. Install the hdf5

```bash
cd hdf5-1.12.2/
./configure --prefix=$DIR --with-zlib=$DIR --enable-hl --enable-fortran
make check
make install
export HDF5=$DIR
export LD_LIBRARY_PATH=$DIR/lib:$LD_LIBRARY_PATH
```

3. Build NETCDF-C

```bash
cd netcdf-c-4.9.2
export CPPFLAGS=-I$DIR/include
export LDFLAGS=-L$DIR/lib
 ./configure --prefix=$DIR --disable-dap
make check
make install
export PATH=$DIR/bin:$PATH
export NETCDF=$DIR
```

4. Build NetCDF fortran library links with NETCDF-C, after successful installation,
   netcdf.inc will be `${NETCDF}/include` file.
   For sometimes, it will show C compiler stop working, Please check the environment variable in
   LIBS="-lnetcdf -lhdf5_hl -lhdf5 -lz", make sure netcdf and hdf5 path in the environment variables.

```bash
export LD_LIBRARY_PATH=$DIR/lib:$LD_LIBRARY_PATH
export CPPFLAGS="-I${DIR}/include -I/usr/include"
export LDFLAGS="-L${DIR}/lib -L/usr/lib"
export LIBS="-lnetcdf -lhdf5_hl -lhdf5 -lz"
./configure --prefix=$DIR --disable-shared
make check
make install
```

Library Compatibility Tests( the result should show SUCCESS)

```bash
mkdir LibTests
cd libTests
wget https://www2.mmm.ucar.edu/wrf/OnLineTutorial/compile_tutorial/tar_files/Fortran_C_NETCDF_MPI_tests.tar
tar -xf Fortran_C_NETCDF_MPI_tests.tar
cp ${NETCDF}/include/netcdf.inc .
gfortran -c 01_fortran+c+netcdf_f.f
gcc -c 01_fortran+c+netcdf_c.c
gfortran 01_fortran+c+netcdf_f.o 01_fortran+c+netcdf_c.o \
     -L${NETCDF}/lib -lnetcdff -lnetcdf
./a.out
```

5. Install the WRF
   The adios2 need to be installed with c-blocs, mpi, and hdf5.

```Bash
cd ..
wget https://github.com/wrf-model/WRF/releases/download/v4.5.1/v4.5.1.tar.gz
tar xvzf v4.5.1.tar.gz
cd WRFV4.5.1
module load adios2/2.9.1-6fh7kh2
export ADIOS2="/mnt/repo/software/spack/spack/opt/spack/linux-ubuntu22.04-skylake_avx512/gcc-11.3.0/adios2-2.9.1-6fh7kh2v3tombadg56kmop72sjhf23dg"
export HDF5=$DIR
export NETCDF=$DIR
export NETCDF_classic=1
./configure
```

Please select from among the following Linux x86_64 options:
Choose 34(dmpar),
Compile for nesting?
choose 1.
If configure is done, you can see a configure.wrf file in the folder.

```bash
./compile em_real
 #./compile em_real >& log.compile
export WRF_DIR=PATH/to/WRFV4.5.1
```

You can see the following information shows the installation is successful.

```bash
--->                  Executables successfully built                  <---
 -rwxrwxr-x 1 hxu40 hxu40 51667784 Sep 15 12:21 main/ndown.exe
 -rwxrwxr-x 1 hxu40 hxu40 51794800 Sep 15 12:21 main/real.exe
 -rwxrwxr-x 1 hxu40 hxu40 50930720 Sep 15 12:21 main/tc.exe
 -rwxrwxr-x 1 hxu40 hxu40 59885752 Sep 15 12:21 main/wrf.exe

==========================================================================
```

To check check whether it was successful

```bash
ls -ls main/*.exe
```

If you compiled a real case, you should see:

```bash
wrf.exe (model executable)
real.exe (real data initialization)
ndown.exe (one-way nesting)
tc.exe (for tc bogusing--serial only)
```

### Choice 2: Install the libarary(with both HDF5 support and PnetCDF support)

TBD, Looks like not necessary for this case

### Install WPS

Download and install required library

```bash
cd $DIR
wget https://www2.mmm.ucar.edu/wrf/OnLineTutorial/compile_tutorial/tar_files/libpng-1.2.50.tar.gz
tar xzvf libpng-1.2.50.tar.gz
cd libpng-1.2.50
./configure --prefix=$DIR/grib2
make
make install
cd ..
wget https://www2.mmm.ucar.edu/wrf/OnLineTutorial/compile_tutorial/tar_files/jasper-1.900.1.tar.gz
tar xzvf jasper-1.900.1.tar.gz
cd jasper-1.900.1
./configure --prefix=$DIR/grib2
make
make install
cd ..
cd $DIR
cd zlib_1.22.1
./configure --prefix=$DIR/grib2
make
make install
export JASPERLIB=$DIR/grib2/lib
export JASPERINC=$DIR/grib2/include
```

Download WPS and install

```bash
#go to WRF folder
mkdir WPS
wget https://github.com/wrf-model/WPS/archive/v4.5.tar.gz
tar -xvzf v4.5.tar.gz
cd WPS-4.5
export JASPERLIB=$DIR/grib2/lib
export JASPERINC=$DIR/grib2/include
./configure --build-grib2-libs #Option 3 for gfortran and distributed memory
./compile
```

IF you see this message after ./configure, please ignore

````bash
Testing for NetCDF, C and Fortran compiler
This installation NetCDF is 64-bit
C compiler is 64-bit
Fortran compiler is 64-bit
Your versions of Fortran and NETCDF are not consistent.
```bash

If the compile successfully,
there should be 3 executables in the WPS top-level directory, that are linked to their corresponding src/ directories:
```bash
geogrid.exe -> geogrid/src/geogrid.exe
ungrib.exe -> ungrib/src/ungrib.exe
metgrid.exe -> metgrid/src/metgrid.exe
````

## Usage

1. Download the benchmark dataset, here is the website for dataset:
   https://www2.mmm.ucar.edu/wrf/users/benchmark/v44/benchdata_v44.html
   Choose one of them for testing.
   Unzip the file.
   copy the wrfbdy_d01, wrfinput_d01 and namelist.input file to WRF/test/em_real file.

```
change the namelist.input file
The ADIOS2 I/O option for history and/or restart file is enabled by setting one of the following:
io_form_history = 14
io_form_restart = 14
frames_per_outfile   = 1000000,
history_outname      = '/Path/to/output/wrfout_d<domain>_<date>' (this part also can be changed in WRF/Register/register.io_bipartitie file)
Do not change the wrfout_d<domain>_<date>
```

Run wrf with adios2
add adios2.xml file in the same folder(wrf/test/em_real)
Here is the example of adios2.xml file:

```bash
<?xml version="1.0"?>
<adios-config>

  <!-- <io name="/Path/to/wrfout_d01_2018-06-17_00:00:00"> -->
  <io name="/Path/to/wrfout_d01_2019-11-26_12:00:00">

    <!-- <engine type="BP4"> -->
    <!-- </engine> -->

    <engine type="BP4">
      <parameter key="RendezvousReaderCount" value="0"/>
      <parameter key="QueueLimit" value="1"/>
      <parameter key="QueueFullPolicy" value="Discard"/>
      <parameter key="OpenTimeoutSecs" value="30.0"/>
    </engine>

    <!-- <engine type="BP4"> -->
      <!-- <parameter key="AggregatorRatio" value="18"/> -->
      <!-- <parameter key="NumAggregators" value="36"/> -->
      <!-- <parameter key="BurstBufferPath" value="/mnt/local/mike"/> -->
      <!-- <parameter key="BurstBufferDrain" value="Off"/> -->
      <!-- <parameter key="BurstBufferVerbose" value="1"/> -->
    <!-- </engine> -->
  </io>
</adios-config>

```

```bash
module load adios2/2.9.1-6fh7kh2
export DIR=~/Build_WRF/LIBRARIES
export CC=gcc
export CXX=g++
export FC=gfortran
export F77=gfortran
export HDF5=$DIR
export LD_LIBRARY_PATH=$DIR/lib:$LD_LIBRARY_PATH
export NETCDF=$DIR
export PATH=$DIR/bin:$PATH
export LD_LIBRARY_PATH=/mnt/repo/software/spack/spack/opt/spack/linux-ubuntu22.04-skylake_avx512/gcc-11.3.0/adios2-2.9.1-6fh7kh2v3tombadg56kmop72sjhf23dg/lib:$LD_LIBRARY_PATH
./wrf.exe or(mpirun -np <number of process> ./wrf.exe
```

The BP5 output will have mmd.0 file and the BP4 does not have mmd.0 file
THe output file has the same name for different machine: "wrfout_d01_2019-11-26_12:00:00"

## Post Processing

Here is the python script. Then add the same adios2.xml file into the same folder with python

```bash
import argparse
import adios2                               # pylint: disable=import-error
import numpy as np                          # pylint: disable=import-error
import matplotlib.pyplot as plt             # pylint: disable=import-error
import matplotlib.gridspec as gridspec      # pylint: disable=import-error
from mpi4py import MPI                      # pylint: disable=import-error
import cartopy.crs as ccrs                  # pylint: disable=import-error
import cartopy.feature as cfeature          # pylint: disable=import-error
from mpl_toolkits.axes_grid1 import make_axes_locatable # pylint: disable=import-error
#
#
def setup_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--instream", "-i", help="Name of the input stream", default="wrfout_d01_2019-11-26_23:00:00")
    parser.add_argument("--outfile", "-o", help="Name of the output file", default="screen")
    parser.add_argument("--varname", "-v", help="Name of variable read", default="T2")
    args = parser.parse_args()
    return args

def plot_var(var, fr_step):

    lccproj = ccrs.LambertConformal(central_longitude=-74.5, central_latitude=38.8)
    fig, ax = plt.subplots(figsize=(15, 18), subplot_kw=dict(projection=lccproj))
    plt.subplots_adjust(right=0.88)  # adjust the right margin of the plot
    title = fr_step.read_string("Times")
    plt.title("WRF-ADIOS2 Demo \n {}".format(title[0]), fontsize=17)

     # format the spacing of the colorbar
    divider = make_axes_locatable(ax)
    cax = divider.new_horizontal(size='5%', pad=0.1, axes_class=plt.Axes)
    fig.add_axes(cax)

    displaysec = 0.5
    cur_step = fr_step.current_step()
    x = fr_step.read("XLONG")
    y = fr_step.read("XLAT")
    data = fr_step.read(var)
    print(data)
    data = data * 9 / 5 - 459.67 #convert from K to F

    # define the limits for the model to subset and plot
    # model_lims = dict(minlon=-80, maxlon=-69, minlat=35, maxlat=43)

    # # create boolean indices where lat/lon are within defined boundaries
    # lon_ind = np.logical_and(x > model_lims['minlon'], x < model_lims['maxlon'])
    # lat_ind = np.logical_and(y > model_lims['minlat'], y < model_lims['maxlat'])
    # # find i and j indices of lon/lat in boundaries
    # ind = np.where(np.logical_and(lon_ind, lat_ind))

    # data = np.squeeze(data)[range(np.min(ind[0]), np.max(ind[0]) + 1),
    #                 range(np.min(ind[1]), np.max(ind[1]) + 1)]

    h = ax.pcolormesh(x, y, data, vmin=-20, vmax=110,
                      cmap='jet', transform=ccrs.PlateCarree())

    cb = plt.colorbar(h, cax=cax)
    cb.set_label(label="Temperature [F]", fontsize=14)  # add the label on the colorbar
    cb.ax.tick_params(labelsize=12)  # format the size of the tick labels

    # add contours
    contour_list = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]  # define contour levels
    cs = ax.contour(x, y, data, contour_list, colors='black',
                    linewidths=.5, transform=ccrs.PlateCarree())
    ax.clabel(cs, inline=True, fontsize=10.5, fmt='%d')

    # add the latitude and longitude gridlines
    gl = ax.gridlines(draw_labels=True, linewidth=1, color='gray', alpha=0.5,
                      linestyle='dotted', x_inline=False)
    gl.top_labels = False
    gl.right_labels = False
    gl.xlabel_style = {'size': 13}
    gl.ylabel_style = {'size': 13}

     # add map features
    land = cfeature.NaturalEarthFeature('physical', 'land', '10m')
    ax.add_feature(land, zorder=5, edgecolor='black', facecolor='none')

    state_lines = cfeature.NaturalEarthFeature(
        category='cultural',
        name='admin_1_states_provinces_lines',
        scale='10m',
        facecolor='none')

    ax.add_feature(cfeature.BORDERS, zorder=6)
    ax.add_feature(state_lines, zorder=7, edgecolor='black')

    #plt.title(title)

    # plt.ion()
    #plt.show()
    # plt.pause(displaysec)
    # #clear_output()
    # plt.clf()

    imgfile = "image"+"{0:0>5}.png".format(cur_step)
    plt.savefig(imgfile)
    plt.clf()

if __name__ == "__main__":
    args = setup_args()
    fr = adios2.open(args.instream, "r", MPI.COMM_WORLD, "adios2.xml", "wrfout_d01_2019-11-26_23:00:00")

    for fr_step in fr:
        plot_var(args.varname, fr_step)

    fr.close()

```

Run this python script with adios2.xml file in the same folder.
