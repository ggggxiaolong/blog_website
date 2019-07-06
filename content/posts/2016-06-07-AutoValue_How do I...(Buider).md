---
title: AutoValue How do I…(Builder)
date: "2016-06-07T01:00:00.000Z"
template: "post"
draft: false
slug: "/posts/autovalue_builder/"
category: "AutoValue"
tags:
    - "Android"
    - "AutoValue"
    - "翻译"
description: "AutoValue是一个由谷歌出品的自动生成代码的库,可以通过AutoValue生成一些通用的代码(比如JavaBean)可以结合谷歌的另外一个库(Gson)使用.生成TypeAdapter从而避免反射.类似的库还有Immutable和Loobook"
---

##How do I ... (Builder edition)
----
这一页是一些通用问题的答案，这些问题可能在使用**带有构建者选项**AutoValue 中遇到，在此之前你应该首先阅读[AutoValue with builders](https://github.com/google/auto/blob/master/value/userguide/builders.md) 

如果你没有使用构建者模式，请查看[AutoValue 介绍](https://github.com/google/auto/blob/master/value/userguide/index.md)和[How do I...](https://github.com/google/auto/blob/master/value/userguide/howto.md)

###内容
----
我怎么...
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

### ...使用（或不使用）set 前缀？
---
就像在value class中你可以使用JavaBean获取属性名那样的样式（getFoo() 而不是 foo()）那样,你可以将setter设置成同样的样式 构造者中也是一样（setFoo(value) 而不是 foo(value)）。对于getter方法，你必须保证所有前缀的一致（全用或者全不用）。

使用<code>get/is</code>做为getter前缀，或者使用<code>set</code>做为setter前缀可以单独控制。例如：在所有的构建者setter方法中使用<code>set</code>前缀，但是在所有getter不使用<code>get/is</code>前缀。

这里有一个使用<code>get</code>和<code>set</code>前缀的<code>Animal</code>例子：

    @AutoValue
    abstract class Animal {
        abstract String getName();
        abstract int getNumberOfLegs();
    
        static Builder builder() {
            return new AutoValue_Animal.Builder();
        }
    
        @AutoValue.Builder
        abstract static class Builder {
            abstract Builder setName (String value);
            abstract Builder setNumberOfLegs (int value);
            abstract Animal build (int value);
        }
    }
###...使用除builder()/Builder/build()之外的不同名字?
---
你使用什么名字，AutoValue其实并不关心。（我们还是建议你使用常规的名字）
###...为一个属性制定默认值？
---
当一个调用者在调用<code>build</code>之前没有为属性提供值将会发生什么？如果这个属性是[nullable](https://github.com/google/auto/blob/master/value/userguide/howto.md#nullable),它就会想你希望的那样被设置一个默认的null值。如果它是 [Optional](https://github.com/google/auto/blob/master/value/userguide/builders-howto.md#optional)那么它将默认设置成空<code>Optional</code>。但是如果不是这些情况（如果它是一个不可以为空的原始属性），那么<code>build()</code>方法将抛出unchecked异常。

但是这是一个问题，构造者的主要优势之一就是调用者只需要指定他们关心的属性。

解决方案就是对那些属性提供一个默认的值，幸运的是这很简单：只需要<code>builder()</code>方法返回新的构造器实例之前指定他们。

这里有一个<code>Animal</code>例子，设置腿的个数默认为4：

    @AutoValue
    abstract class Animal {
        abstract String name();
        abstract int numberOfLegs();
    
        static Builder builder() {
            return new AutoValue_Animal.Builder()
                .numberOfLegs(4);
        }
    
        @AutoValue.Builder
        abstract static class Builder {
            abstract Builder name(String value);
            abstract Builder numberOfLegs(int value);
            abstract Animal build();
        }
    }
有时你也许需要提供一个默认值，但是那仅仅在属性不是明确的情况下。属性被正常化时会被覆盖。
###...使用一个现有的value 实例的值初始化一个构建者？
---
假设你的调用着拥有了一个已经存在的实例（由你的value class类生成），并且想要修改其中的一两个值。当然，它是不可变的。但是如果能提供一个基于实例的构造者是很方便的（构造器已经初始化了和实例相同的属性），调用者通过提供的构造器修改值并且生成一个新的实例。

为了提供这种实现，只需要在你的value class 内部添加一个<code>toBuilder</code>的抽象方法并返回你的抽象构造者。AutoValue就会实现它。

    public abstract Builder toBuilder();
###...在value class内部包含<code>with-</code>方法，来生成一个略微修改的实例？
---
这是不可变类中比较常见的模式，你不能包含setter，但是你可以拥有一个类似setter的方法返回一个改变一个属性的新不可变实例。

如果你已经使用了构建者选项，你可以手动添加这些代码：

    @AutoValue
    public abstract class Animal {
        public abstratc String name ();
        public abstract int numberOfLegs();
    
        public static Builder builder() {
            return new AutoValue_Animal.Builder();
        }
    
        abstarct Builder toBuilder();
    
        public Animal withName (String name) {
            return toBuilder().name(name).build();
        }
    
        @AutoValue.Builder
        public abstract static class Builder {
            public abstract Builder name (String value);
            public abstract Builder numberOfLegs(int value);
            public Animal build();
        }
    }
将那个方法设置为public是你的自由（<code>toBuilder</code>,<code>withName</code>,全不设置，全部设置）。
###...验证属性的值？
---
在构造器中验证属性与[无构造者情况](https://github.com/google/auto/blob/master/value/userguide/howto.md#validate)相比没有那么直接。

你需要做的是把“build”方法拆分成两个方法：
* AutoValue实现的抽象不可访问方法
* 可访问的具体方法，调用自动生成的方法并执行验证

推荐将这些方法的名称命名为<code>autoBuild</code>和<code>build</code>（其他的命名也没有问题），修改之后的代码就像这样：

    @AutoValue
    public abstract class Animal {
        public abstratc String name();
        public abstratc int numberOfLegs();
    
        public static Builder builder () {
            return new AutoValue_Animal.Builder();
        }
    
        @AutoValue.Builder
        public abstract static class Builder {
            public abstract Builder name(String value);
            public abstract Builder numberOfLegs(int value);
    
            abstract Animal autoBuild();    // not public
    
            public Animal build() {
                Animal animal = autoBuild();
                Preconditions.checkState(animal.numberOfLegs() >= 0, "Negative Legs");
                return animal;
            }
        }
    }
###...在构建时正常化（修改）属性的值？
---
假如你想将animal的名字转化成小写。
你需要在你的构造者里面添加一个*getter*，就像下面这样(内部类Builder的name方法)：

    @AutoValue
    public abstract class Animal {
        public abstratc String name();
        public abstratc int numberOfLegs();
    
        public static Builder builder () {
            return new AutoValue_Animal.Builder();
        }
    
        @AutoValue.Builder
        public abstract static class Builder {
            public abstract Builder setName(String value);
            public abstract Builder setNumberOfLegs(int value);
    
            abstract String name();  // 和Animal类里面的方法匹配
    
            abstract Animal autoBuild();    // not public
    
            public Animal build() {
                setName(name().toLowerCase());
                return autoBuild();
            }
        }
    }
在构造者里面的getter必须和抽象类里面的方法签名一致，它将返回你在<code>Builder</code>里面设置的值，如果获取的值不能为空并且未被设置将抛出<code>IllegalStateException</code>。

getter一般只用在<code>Builder</code>内部所以它不应该是设置为public。

同样作为可以返回属性值的方法，这个构造者内部的getter可以返回一个被<code>Optional</code>包装的类型。这样就可以在属性未被设置的情况下用来提供一个默认的值。例如，你想在Animal未设置名字的情况下提供一个类似“4-legge creature”的名字，“4”来自于<code>numberOfLegs()</code>。你可以这样写：

    @AutoValue
    public abstract class Animal {
        public abstract String name();
        public abstract int numberOfLegs();
    
        public static Builder builder() {
            return new AutoValue_Animal.Builder();
        }
    
        @AutoValue.Builder
        public static abstract class Builder {
            public abstract Builder setName(String value);
            public abstract Builder setNumberOfLegs(int value);
    
            abstarct Option<String> name();
            abstract int numberOfLegs();
    
            abstract Animal autoBuild(); // not public
    
            public Anima build() {
                if(!name().isPresent()) {
                    setName(numberOfLegs() + "-legged creature");
                }
                return autoBuild();
            }
        }
    }
注意在<code>numberOfLegs</code>属性未被设置的情况下将抛出<code>IllegalStateException</code>

这个包装的Optional属性可以是抽象类里面的任何属性，如果是<code>int</code>将自动包装为<code>Optional<Integer></code>或者<code>OptionalInt</code>,对于<code>long</code>和<code>double</code>也是一样。
###...同时暴露构造器和工厂方法？
---
如果你使用构建者（builder），AutoValue将不会为具体的value class生成一个可访问的构造器（constructor）。如果必须要为调用者同事提供工厂方法和构造者，那么你的工厂方法就需要自己调用构造者来实现。
###...处理<code>Optional</code>属性？
---
<code>Optional</code>类型的属性得益于它自身的特殊处理。如果你有一个属性是<code>Optional<String></code>,那么它默认就会被设置成空<code>Optional</code>而不需要特殊处理。并且如果你的方法是<code>setFoo(Optional<String>)</code>那你同样也拥有了<code>setFoo(String)</code>方法，并且<code>setFoo(s)</code>等同于<code>setFoo(Option.of(s))</code>。

这个<code>Optional</code>可以是[java.util.Optional
](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html)（Java 8+）也可以是[com.google.common.base.Optional
](http://google.github.io/guava/releases/snapshot/api/docs/com/google/common/base/Optional.html) （Guava）。Java 8还同样推出了关联的<code>java.util</code>类[OptionalInt
](https://docs.oracle.com/javase/8/docs/api/java/util/OptionalInt.html), [OptionalLong
](https://docs.oracle.com/javase/8/docs/api/java/util/OptionalLong.html), 和[OptionalDouble
](https://docs.oracle.com/javase/8/docs/api/java/util/OptionalDouble.html)。你也可以使用他们。例如：<code>OptionInt</code>的默认值为<code>OptionalInt.empty()</code>,你可以通过<code>setFoo(OptionalInt)</code>或者<code>setFoo(int)</code>来设置。
###...使用一个集合属性？
---
值对象应该是不可变的，所以如果对象含有一个集合属性，那么这个集合属性也应该是不可变的。我们推荐使用Guava的[immutable collections](https://github.com/google/guava/wiki/ImmutableCollectionsExplained)。AutoValue的构造者通过一些特殊的安排来使这些变得方便。

在例子中我们使用了<code>ImmutableSet</code>，但是这些规则同样适用于Guava的不可变集合类型，比如：<code>ImmutableList</code>，<code>ImmutableMultimap</code>...

我们推荐使用不可变类型（像<code>ImmutableSet<String></code>）来作为你的属性类型。然而，对于类的调用者而言这将是一个痛点：总是要构建一个<code>ImmutableSet<String></code>实例来传给构造者。所以AutoValue允许你的构造者方法接受一个<code>ImmutableSet.copyOf</code>可以处理的参数。

如果<code>Animal</code>本身需要一个<code>ImmutableSet<String></code>，那么<code>Set<String></code>，<code>Collection<String></code>，<code>Iterable<String></code>，<code>String[]</code>或者任何符合的类型都可以用于设置这个值，你甚至可以提供多种选择，就像下面这样：

    @AutoValue
    public abstract class Animal {
        public abstract String name();
        public anstract int numberOfLegs();
        public abstract ImmutableSet<String> countries();
    
        public static Builder builder() {
            return new AutoValue_Animal.Builder();
        }
    
        @AutoValue.Builder
        public abstract static class Builder {
            public abstract Builder name(String value);
            public abstract Builder numberOfLegs(int value);
            public abstract Builder countries(Set<String> value); //这里
            public abstract Builder countries(String... value); //这里
            public abstract Animal build();
        }
    }
###...让构建者累积一个集合属性的值（而不是一次全部给出）？
除了为不可变集合<code>foos</code>定义一个setter，你也可以定义一个<code>foosBuilder()</code>方法为这个集合返回关联的构建构建类型。这个例子中我们使用了<code>ImmutableSet<String></code>可以通过<code>IcountriesBuilder()</code>方法构建：

    @AutoValue
    public abstract class Animal {
        public abstract String name();
        public abstract int numberOfLegs();
        public abstract ImmutableSet<String> countries();
    
        public static Builder builder() {
            return new AutoValue_Animal.Builder();
        }
    
        @AutoValue.Builder
        public static abstract class Builder {
            public abstract Builder name(String value);
            public abstract Builder numberOfLegs(int value);
            public abstract Immutable.Builder<String> countrisBuilder();
            public abstract Animal build();
        }
    }
你可能注意到这个例子中的一个小问题:调用者不能链式调用生成实例了：

    // This DOES NOT work!
    Animal dog = Animal.builder()
        .name("dog")
        .numberOfLegs(4)
        .countriesBuilder()
            .add("Guam")
            .add("Laos")
        .build();
我们不得不通过持有builder来创建对象：

    // This DOES work... but we have to "break the chain!"
    Animal.Builder builder = Animal.builde()
        .name("dog")
        .numberOfLegs(4);
    builder.countriesBuilder()
        .add("Guam")
        .add("Laos");
    Animal dog = builder.build();
解决这个问题的方法就在下面。
###...在不打破链式调用的前提下累积集合的值？
另一个选择就是保证这个<code>countriesBuilder()</code>自身非public，只用他来实现一个public的<code>addCountry</code>方法：

    @AutoValue
    public abstract class Animal {
        public abstract String name();
        public abstract int numberOfLegs();
        public abstract ImmutableSet<String> countries();
    
        public static Builder builder() {
            return new AutoValue_Animal.Builder();
        }
    
        @AutoValue.Builder
        public abstract static class Builder {
            public abstract Builder name(String value);
            public abstract Builder numberOfLegs(int vaue);
    
            abstarct Immutable.Builder<String> coutriesBuilder();
            public Builder addCountry(String value) {
                countriesBuilder().add(value);
                return this;
            }
            
            public Animal build();
        }
    }
现在你就可以这样做了：

    // this DOES work!
    Animal dog = Animal.builder()
        .name("dog")
        .numberOfLegs(4)
        .addCountry("Guam")
        .addCountry("Laos")
        .build();
###...对于同一个集合属性提供设置值的两种方式（一次性提供和累积提供）？
你可以这样做。如果调用者在<code>foosBuilder</code>之后调用<code>setFoos</code>将会引发unchecked异常。