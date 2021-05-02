---
title: 在 VMware 中运行物理机的 Linux，多启动的一次尝试
date: 2021-05-02 15:17:21
tags:
  - VMware
  - Virtualization
---

最近开发多在 Windows 上进行，硬盘上的另一个操作系统 Fedora 就很久没启动过了。但有时又难免要用到 Fedora 里面自行编译的程序和定制的脚本，关机进到 Fedora 里跑一遍显得过于麻烦。恰好那时听到基友用 HyperV 把自己的 ArchLinux 做成了多启动，既可以在需要 GPU 的时候进入真机，又可以在别的场景下从 Windows 环境操作 HyperV 启动的 ArchLinux，这样可以完美解决以上的问题。

<!--more-->

但是，鉴于微软的 HyperV 没有对 Linux 提供良好的图形驱动支持，加上还有各种奇葩问题存在（看 Windows 自身的状况就可知...），我怎么可能用 HyperV 呢。网上搜索一番心目中 Windows 最强软件 VMware 的多启动案例之后，发现它果然可以做到多启动，之前没有用好这个功能确实是惭愧。V2EX 一位大神在[一篇主题-3楼](https://v2ex.com/t/636570)下提供了这样的思路：在 VMware 中创建好引导分区（efi 和 boot），用分区Label的方式引导物理机上 Linux 所在分区的系统即可。这给我带来了很大的启发。又得益于 VMware 把 Linux 下用于增强虚拟机体验的 VMware Tools（用于自由缩放，图形驱动，剪贴板共享等）开源为 [open-vm-tools](https://github.com/vmware/open-vm-tools) 项目，多数 Linux 发行版已经预装了相关软件包（没有在包管理中自行安装即可），所以虚拟化后的体验很好。

整个虚拟化的流程很简单：
  1. 准备好和物理机 Linux 尽量一致 LiveCD，在 VMware 中用 "自定义(高级)" 选项新建虚拟机
  2. 新建的虚拟机重点是两块磁盘：
    a. 新建一块虚拟磁盘用于建立 EFI （默认为 BIOS 启动，在创建虚拟机后，修改虚拟机的固件类型为 UEFI）和 boot 分区
    b. 将物理磁盘的根分区连接到虚拟机
  3. 用 LiveCD 建立好 efi 和 boot 分区（需要掌握 chroot 和 UEFI环境安装 grub）
  4. 改写 fstab，用 Label 方式引导系统，我会把自己的 fstab 放在文末供参考

由于我的物理机没有将 boot 分区独立，新增进 fstab 引导 VMware boot 分区的条目，会导致真机启动失败，需要加上超时参数 x-systemd.device-timeout=3s （3秒后超时）在真机启动时跳过独立的 boot 分区。由此，虚拟化好了的 Linux 运行起来，既可以享受到 Linux 的高效简洁，也可以同时享受 Windows 上的~~影音娱乐~~顺畅开发。

{% asset_img fedora32_on_vmware.png %}

附：
  * /etc/fstab
```shell
#
# /etc/fstab
# Created by anaconda on Fri Oct  2 12:04:56 2015
#
# Accessible filesystems, by reference, are maintained under '/dev/disk'
# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
#

# UEFI partation
LABEL=EFI	/boot/efi	vfat	noatime	0	0

# VMware boot partation
LABEL=fedora-boot	/boot	ext4	noatime,x-systemd.device-timeout=1s 0	0

LABEL=fedora /	ext4	noatime,errors=remount-ro,discard	0	1
#/swapfile	none	swap	sw	0	0
tmpfs	/tmp	tmpfs	size=4G,nosuid,noatime	0	0
```
