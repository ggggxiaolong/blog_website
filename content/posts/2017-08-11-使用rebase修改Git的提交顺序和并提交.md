---
title: 使用 rebase 修改 Git 的提交顺序和并提交
date: "2017-08-11T01:00:00.000Z"
template: "post"
draft: false
slug: "/posts/git_reabase/"
category: "Git"
tags:
    - "Git"
description: "在使用Git提交文件的时候,有时会不注意提交一些临时的代码,或者修改一些提交的描述,或者合并一些提交,删除一些提交历史.通过rebase指令完成这些操作"
---

#### 先说问题 >
一次性修改了很多文件，这些文件分布在不同的文件夹里面，在提交的过程中遗漏了一个文件夹的文件，但是发现的时候已经提交了其他的文件（不能用 ```git commit -amend```）。但是还想把遗漏的文件和并到文件夹的那次提交中。

![提交过程](http://upload-images.jianshu.io/upload_images/1419533-414d00af5c860d8d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 解决方案 >
* 正常提交这个文件，这样会生成一条提交历史(需要将倒数第一条[最上面]和并到倒数第四条中)

![提交历史](http://upload-images.jianshu.io/upload_images/1419533-5f5c296a21ab3fdd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* 使用git rebase -i HEAD~4(会进入rebase的编辑界面，我的是vim编辑器)

![rebase交互界面](http://upload-images.jianshu.io/upload_images/1419533-a54aedfe2c0f5a65.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* 修改提交的历史
  *  将第四条移动到第一条 dd删除p粘贴
  *  将pick修改为f


![修改之后的情况](http://upload-images.jianshu.io/upload_images/1419533-a87ee22e0def68f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* 保存推出
* 查看提交历史```git log --stat```


![提交历史](http://upload-images.jianshu.io/upload_images/1419533-e60e8d7023e8080e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)