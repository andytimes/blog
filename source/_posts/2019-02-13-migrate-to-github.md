---
title: 迁移到 Github
date: 2019-02-13 20:45:06
updated: 2022-03-27 02:33:39
tags:
  - hexo
---

今天无意间打开了博客，发现访问速度慢得让人无法接受。博客托管在 Coding Pages 上，这段时间 Coding Pages 的服务似乎劣化了，原本不想这么麻烦去迁移，后来发现 Github Pages 在国内的访问速度挺不错的，于是开始了迁移工作。

<!--more-->

Github Pages 提供的服务并不如 Coding Pages 那么全面，不过够用即可，利用 Travis-CI 可以让日后的博客的部署工作更加便利。比如，在 Github 上在线编辑一份 markdown 格式的文章，Travis-CI 便会在 commit 后生成对应的静态网页文件，省去了手动生成再部署的步骤。

~~网上搜索到了一篇关于用 Travis-CI 部署 hexo 博客的文章，写的挺不错的： [使用 Travis CI 自动部署 Hexo 博客](https://blessing.studio/deploy-hexo-blog-automatically-with-travis-ci/)~~

2022-03-27: 上面的博客已挂，Travis-CI 目前已收费，建议使用 GitHub Action，相关教程网上也有很多。

依照上述步骤，顺利的完成了迁移工作，下面是博客和博客主题的源码：

 - https://github.com/andytimes/blog
 - https://github.com/andytimes/hexo-theme-next

不得不说 Travis-CI 是个好工具
