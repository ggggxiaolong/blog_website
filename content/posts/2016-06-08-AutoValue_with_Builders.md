---
title: AutoValue with Builders
date: "2016-06-08T01:00:00.000Z"
template: "post"
draft: false
slug: "/posts/autovalue_with_builders/"
category: "AutoValue"
tags:
    - "Android"
    - "AutoValue"
    - "翻译"
description: "AutoValue是一个由谷歌出品的自动生成代码的库,可以通过AutoValue生成一些通用的代码(比如JavaBean)可以结合谷歌的另外一个库(Gson)使用.生成TypeAdapter从而避免反射.类似的库还有Immutable和Loobook"
---

[原文](https://github.com/google/auto/blob/master/value/userguide/builders.md)

###AutoValue 的 构建者
----
[AutoValue的介绍](https://github.com/google/auto/blob/master/value/userguide/index.md)   ([简单翻译](http://www.jianshu.com/p/d52d98cd6f6c))中已经包含了基本的使用，使用静态工厂作为你的公共API。但是在大部分情况（such as those laid out in *Effective Java, 2nd Edition* Item 2），你可能更倾向于让你的调用者使用一个构建者生成实例对象。

幸运的是，AutoValue可以也可以生成带有构建者的类。这一页介绍了怎么做。但是我们还是建议你先阅读并理解AutoValue的基本使用，[AutoValue的介绍](https://github.com/google/auto/blob/master/value/userguide/index.md) 。
###怎么使用带有构建者的AutoValue
----
就像在介绍里面说的那样，AutoValue的概念就是**写一个抽象的value class，AutoValue实现它**。构建者的生成也是一样的方法：制造一个抽象的构造者类，并把它包含在抽象类里面，然后AutoValue就会生成他们的实现。
####在<code>Animal.java</code>中

    import com.google.auto.value.AutoValue;
    
    @AutoValue
    abstract class Animal {
        abstract String name();
        abstract int numberOfLegs();
    
        static Builder builder() {
            return new AutoValue_Animal.Builder();
        }
    
        @AutoValue.Builder
        abstract static class Builder {
            abstract Builder name(String value);
            abstract Builder numberOfLegs(int value);
            abstract Animal build();
        }
    }
在实际应用中，一些类和方法可能是public的并且带有**Javadoc**，为了保证例子的简洁我们去掉了这些。
####使用

    public void testAnimal() {
        Animal dog = Animal.builder().name("dog").numberOfLegs(4).build();
        assertEquals("dog", dog.name());
        assertEquals(4, dog.numberOfLegs());
    
        //You probably don't need to write assertions like; just illustrating.
        assertTrue(Animal.builder().name("dog").numberogLegs(4).build().equals(dog));
        assertFalse(Animal.builder().name("cat").numberogLegs(4).build().equals(dog));
        assertFalse(Animal.builder().name("dog").numberogLegs(2).build().equals(dog));
    
        assertEquals("Animal{name=dog, numberOfLegs=4}", dog.toString());
    }
[AutoValue 生成的代码](https://github.com/google/auto/blob/master/value/userguide/generated-builder-example.md)
####警告
----
确保把这个静态<code>builder()</code>方法直接放在你的value class 内部（e.g.,<code>Animal</code>），而不是内部抽象<code>Builder</code>类。确保这个<code>Animal</code>类在<code>Builder</code>之前初始化。否则你可能遇到初始化顺序问题。
#### 我怎么...   &nbsp;  [简单翻译](http://www.jianshu.com/p/0bb889781ac2)/ &nbsp; [原文](https://github.com/google/auto/blob/master/value/userguide/builders-howto.md)
----
* ...使用（或不使用）<code>set</code>前缀？
* ...使用不同**命名**除了<code>builder()</code>/<code>Builder</code><code>build()</code>?
* ...为一个属性制定默认值？
* ...使用一个现有的 value 实例的值初始化一个构建者？
* ...在value class内部包含<code>with-</code>方法，来生成一个略微修改的实例？
* ...验证属性的值？
* ...在构建时正常化（修改）属性的值？
* ...同时暴露构造器和工厂方法？
* ...处理<code>Optional</code>属性？
* ...使用一个集合属性？
 * ...让构建者累积一个集合属性的值（而不是一次全部给出）？
 * ...在不打破链式调用的前提下累积集合的值？
 * ...对于同一个集合属性提供设置值的两种方式（一次性提供和累积提供）？