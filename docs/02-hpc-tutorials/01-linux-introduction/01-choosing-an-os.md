# Choosing an OS

## Which distro?

There are many Linux distributions out there, and they all have different quirks. The following is a list of distros
which are currently being used, or we expect may eventually be used.

- [Ubuntu](https://ubuntu.com/download/desktop): We use Ubuntu currently in our cluster. It's not widely used in HPC, but it's a mature, well-maintained distro.
  There are many ubuntu-like systems (e.g., Linux Mint), feel free to use any of them. We recommend using an ubuntu-like system for the purposes of our research.
- [Centos7/8](https://www.centos.org/download/): CentOS 7 and 8 are used pretty commonly in HPC. However, they have been discontinued. We don't recommend
  using them for your main OS, but you should be aware you may have to deal with them for software portability.
- [Rocky](https://rockylinux.org/): A replacement to CentOS, and is a potential candidate for HPC systems.
- [Alma](https://almalinux.org/): Another CentOS-like system, which is also a potential candidate for HPC systems.

## What if I have Windows?

Microsoft Windows has the Windows Subsystem for Linux (WSL). It's competent for the majority of Linux development. If you
don't want to kill your current windows installation, WSL should be sufficient for most cases of our research. WSL provides
an Ubuntu installation. Follow [Microsoft's instructions](https://learn.microsoft.com/en-us/windows/wsl/install) on how to
enable WSL.

## What if I have a Mac?

Macs are a bit tricky. Mac and Linux are NOT the same thing. Generally speaking, we highly recommend developing on a Linux distribution which is similar to what
is used in HPC. Unfortunately, Macs don't have something like WSL. We recommend using either a container (e.g., Docker/Singularity) or a virtual machine
(VirtualBox/Qemu) for development. Generally, containers are much faster than VMs by default. We recommend using a container for Ubuntu. We describe Docker
[here](https://github.com/scs-lab/scs-tutorial/wiki/5.1.-Docker-Basics).
