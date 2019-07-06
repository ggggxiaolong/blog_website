---
title: MotionLayout 介绍 (第四章)
date: "2019-05-28T00:00:00.000Z"
template: "post"
draft: false
slug: "/posts/motionlayout_part_04"
category: "Android"
tags:
    - "Android"
    - "MotionLayout"
    - "翻译"
description: "MotionLayout  是 ConstrainLayout 2.0 库中被引入的一个新类，帮助安卓开发者关联手势和组件动画。接下来的文章将介绍会如何在应用中添加和使用 MotionLayout."
---
# MotionLayout 介绍 (Part4)

MotionLayout 的动画系统是通过计算两个状态之间的插值（通常是组件的位置，大小）工作的。这些值可以使用 ConstraintLayout 的 Constraint 属性指定，也可以使用组件自己的属性。两个状态之间的转换可以由滑动事件驱动，事件系统一般会给你比较直观的感受。

另外 MotionLayout 还可以指定关键帧（在第二章有简短的介绍）我们将在本章详细介绍。请注意，虽然关键帧很棒，它绝对是一个更专业的工具; 尽管你可能不需要，或者只是偶尔需要的。

通过使用关键帧你可以让 MotionLayout  做更多的有趣的事，如你所见，他有很多的属性：

* [*Keyframes*](https://medium.com/p/6095b874d37#b4c1)
* [*Position Keyframes*](https://medium.com/p/6095b874d37#f83f)
* [*Arc Motion*](https://medium.com/p/6095b874d37#cba6)
* [*Easing*](https://medium.com/p/6095b874d37#cc03)
* [*Attributes Keyframes*](https://medium.com/p/6095b874d37#7574)
* Cycle Keyframes & TimeCycle Keyframes (将在第5章介绍)

### 关键帧： 时间日期

使用关键帧你可以指定一个特定的改变，在两个状态改变之间指定一个时间点。

![image](https://res.cloudinary.com/xiaolong/image/upload/v1558950161/img/1_PYOByy271vItozskVYc0SQ_ymxbqm.png)

MotionLayout 支持以下几种关键帧：

* 位置关键帧： `KeyPosition`
* 属性关键帧： `KeyAttribute`
* 循环关键帧： `KeyCycle`
* 时间循环关键帧： `KeyTimeCycle`

> 注意：关键帧都是独立的，不需要在同一点定义所有的关键帧 ( 不能对同一类型在同一点定义不同的关键帧 )

### 通用的属性

所有的关键帧（位置，属性，循环，时间循环）都共用的属性：

* `motion:framePosition` : 在过渡中关键帧何时应用(0-100)
* `motion:target` : 哪个组件应用这个关键帧
* `motion:transitionEasing` : 使用哪种缓和曲线
* `motion:curveFit` : 样条曲线（默认）或线性 -- 关键帧使用哪种插值曲线。默认值是单调样条曲线，使过渡平缓，但是也可以使用线性插值。

### 位置关键帧

位置关键帧应该是最常用的关键帧，它可以改变组件在屏幕中的位置。例如，通过 MotionLayout 只用一个组件实现下面的动画：

![img](https://res.cloudinary.com/xiaolong/image/upload/v1558950172/img/1_xwpXn3Fb5nIBC2M33etVGQ_v2hwfb.gif)

从左下开始到右上结束，并且动画过程使用线性插值，移动路径是一条直线。

![img](https://res.cloudinary.com/xiaolong/image/upload/v1558950617/img/1_99FK6pyGVTOTVxEfSGpeCg_ncyiqw.png)

通过引入位置关键帧，我们可以将运动路径更改为弯曲运动.

![img](https://res.cloudinary.com/xiaolong/image/upload/v1558950200/img/1_2xVlsmlMCmw2Og0QGolJOw_skvdlh.png)

![img](https://res.cloudinary.com/xiaolong/image/upload/v1558950209/img/1_WCfPiF_-LeP9_XSB6rxbPA_ehdyu9.gif)



添加更多的关键帧可以创建更复杂的移动路径：

![img](https://res.cloudinary.com/xiaolong/image/upload/v1558950220/img/1_Vz8gNx1AMzM780vBcLiygQ_bwuoco.gif)

```xml
<KeyFrameSet>
    <KeyPosition
        motion:keyPositionType="pathRelative"
        motion:percentX="0.75"
        motion:percentY="-0.3"
        motion:framePosition="25"
        motion:target="@id/button"/>
    <KeyPosition
        motion:keyPositionType="pathRelative"
        motion:percentY="-0.4"
        motion:framePosition="50"
        motion:target="@id/button"/>
    <KeyPosition
        motion:keyPositionType="pathRelative"
        motion:percentX="0.25"
        motion:percentY="-0.3"
        motion:framePosition="75"
        motion:target="@id/button"/>
</KeyFrameSet>
```

### 为什么使用位置关键帧：

你可能会问如果使用 ConstrainSet 已经可以实现复杂的布局为什么还要使用位置关键帧？这里有一些解释：

* 关键帧表示是一个短暂的修改，而 ContraintSet 是一个最终的状态
* 关键帧的计算比 ConstraintSet 更轻量级
* 位置关键帧可以控制组件的移动路径， 而 ConstraintSet 指定组件想对于其他组件的位置。