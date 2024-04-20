# OpenFOAM
## Installation
## On Ares
When you are on Ares, you should ideally find the openfoam application already installed as a module. To see if there is an openfoam module in ares run the below command:

```linux
module spider openfoam
#module -r spider '.*openfoam*.'
```
To load the module use. (Note that this loads the default openfoam version)
```linux
module load openfoam
```
## Using spack
You can view the openfoam in list of provided packages in spack using:
```linux
spack list openfoam
```
To list the details of openfoam(version, description, dependencies, etc.)
```linux
spack info openfoam
```
 To install openfoam with adios2 dependency using spack
```linux
spack install openfoam^adios2
```
## Building from source
You can download the source and the documentation as a tarball
```linux
mkdir OpenFOAM
cd OpenFOAM
wget https://dl.openfoam.com/source/v2306/OpenFOAM-v2306.tgz
tar xzvf OpenFOAM-v2306.tgz
```
Now change the directory to the OpenFOAM distribution directory that just got uncompressed
```linux
cd OpenFOAM-v2306/
```

Prior to building, ensure that the system requirements are satisfied and source the correct OpenFOAM environment. For example, for the OpenFOAM-v2306 version:
```linux
source ~/OpenFOAM/OpenFOAM-v2306/etc/bashrc
```
There are the necessary minimum system requirements for installing OpenFOAM
```
gcc : 7.5.0
cmake: 3.8
```
You can check your versions using:
```linux
gcc --version
cmake --version
```
Test the system readiness, use:
```linux
foamSystemCheck
```
If your system is ready, you would get the following:
```
System check: PASS
==================
Can continue to OpenFOAM installation.
```
You should be able to see the ```Allwmake``` file in the OpenFOAM directory. To compile OpenFOAM, run:
```linux
./Allwmake -j -s -q -l
#This compiles with all cores (-j), reduced output (-s, -silent), with queuing (-q, -queue) and logs (-l, -log) the output to a file
```
