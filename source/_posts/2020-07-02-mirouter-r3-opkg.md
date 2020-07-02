---
title: 为小米路由器3 配置 opkg
date: 2020-07-02 12:03:06
tags:
  - openwrt
  - 路由器
---

最近想在路由器上搭建一些简单的服务，于是开启了路由器的 ssh，发现自带的系统固件内没有 sftp，想着找找有没有别人编译好的。小米路由器的官网说系统固件是根据 openwrt 深度定制的，这时候有两种选择：一种是刷第三方固件（X-wrt 和 PandoraBox 之类）；另一种是在官方固件里面装 opkg 工具来使用 openwrt 的包管理。

<!--more-->

出于稳定性和功能完善度考虑，这里我选择第二种方式。要在官方固件使用 opkg，第一步肯定是开启 ssh 了，我的路由器固件版本是开发版2.27.120，按照 [官方教程](https://d.miwifi.com/rom/ssh) 或者尝试 openwrt官网给出的 [步骤](https://openwrt.org/toh/xiaomi/mir3#get_sshdropbear_access) ，解开ssh之后，查看内核版本为 2.6.36，CPU为 MT7620A (MIPS 24KEc)，根据 /etc/opkg.conf 里面的内容，固件可能是基于 openwrt 12.09 定制的。从谷歌检索了一下，发现了这篇文章：[[小米路由3安装opkg](https://www.ywlib.com/archives/102.html)](https://www.ywlib.com/archives/102.html) ，文章内用到的源是 openwrt 14.07 的，尝试一下发现 openssh-keygen 生成 ecdsa 类型密钥的时候 coredump 了，把源替换成 15.05.1 能完美运行。以下是一些详细步骤：

- 首先从[这个链接](https://archive.openwrt.org/chaos_calmer/15.05.1/ramips/mt7620/packages/base/opkg_9c97d5ecd795709c8584e972bfdf3aee3a5b846d-9_ramips_24kec.ipk) 获取到 opkg 的二进制文件，修改 /etc/opkg.conf 为以下内容：

  ```shell
  src/gz chaos_calmer_base http://archive.openwrt.org/chaos_calmer/15.05.1/ramips/mt7620/packages/base
  src/gz chaos_calmer_packages http://archive.openwrt.org/chaos_calmer/15.05.1/ramips/mt7620/packages/packages
  src/gz chaos_calmer_luci http://archive.openwrt.org/chaos_calmer/15.05.1/ramips/mt7620/packages/luci
  src/gz chaos_calmer_management http://archive.openwrt.org/chaos_calmer/15.05.1/ramips/mt7620/packages/management
  src/gz chaos_calmer_routing http://archive.openwrt.org/chaos_calmer/15.05.1/ramips/mt7620/packages/routing
  
  dest root /data
  dest ram /tmp
  lists_dir ext /data/var/opkg-lists
  option overlay_root /data
  arch all 100
  arch ramips 200
  arch ramips_24kec 300
  ```

- 修改 /etc/profile 中两个关键环境变量（动态链接库和二进制文件搜寻路径）：LD_LIBRARY_PATH 和 PATH，修改后记得让环境变量生效，以下是我的配置：

  ```shell
  export LD_LIBRARY_PATH=/data/usr/lib:/data/lib:/usr/lib:/lib
  export PATH=/data/usr/bin:/data/usr/sbin:/data/bin:/data/sbin:/bin:/sbin:/usr/bin:/usr/sbin
  ```

- `opkg update` 之后就可以安装软件了，这里遇到了和参考文章里面一样的情况，就是 libc 这个软件包虽然软件源里面有，但似乎没法直接 `opkg install libc` 安装，而很多源里面软件又需要 libc 状态为已安装。这里手动下载好[libc的安装包](https://archive.openwrt.org/chaos_calmer/15.05.1/ramips/mt7620/packages/base/libc_0.9.33.2-1_ramips_24kec.ipk) 安装即可。后面就可以愉快的玩耍了。

在配置安装的软件包时，也遇到了一些问题，其中有一点就是分区不可写入，挂载为读写之后提示分区没有剩余空间。小米路由器官方固件不知道分区是怎么挂载的，好像并没有用 overlayfs，可能是内核版本太旧不支持 overlayfs 的缘故，这里可以在 /data 目录下创建文件夹，例如用 `mount --bind /data/root /root` 把 /root 目录绑定到 /data/root 下。关于 openwrt 软件源兼容性这个，15.05.1这个版本后，libc 和 gcc 版本都发生变化，ABI很可能已经不兼容，编译后的二进制没法在官方固件运行。要使用最新的软件最保险的是刷第三方固件，下面的链接都会比较有帮助。



- 推荐阅读：

 1. [OpenWrt Project: Xiaomi Mi WiFi R3 (Mi Wifi Router 3 / MIR3 / MI3)](https://openwrt.org/toh/xiaomi/mir3)
 2. [OpenWrt Project: Extroot configuration](https://openwrt.org/docs/guide-user/additional-software/extroot_configuration)
 3. [OpenWrt Project: Fstab配置](https://openwrt.org/zh-cn/doc/uci/fstab)
 4. [OpenWrt Project: OPKG 软件包管理](https://openwrt.org/zh/docs/techref/opkg)

