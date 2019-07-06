---
title: Okhttp Okhttp_Connections
date: "2016-06-01T00:00:00.000Z"
template: "post"
draft: false
slug: "/posts/okhttp_okhttp_connections/"
category: "Okhttp"
tags:
    - "Android"
    - "Okhttp"
    - "翻译"
description: "安卓开发中使用最多的网络请求库,通过翻译官方的文档来系统的学习一下.了解更多okhttp的功能,在使用这个库的时候能够更加的顺手,遇到问题的时候方便排查."
---

##Connections
尽管你只提供了URL，OkHttp还是会使用3种方式连接到你的服务器：URL，Adress，和Route。
###[URLs](http://square.github.io/okhttp/3.x/okhttp/okhttp3/HttpUrl.html)
URL（比如 https://github.com/square/okhttp ）是HTTP和网络的基础。另外它也是普遍的互联网分散式命名方案，它也规定了如何访问一个互联网资源。

URL是抽象的：
* 它规定了访问是明文（http）还是密文（https），但是却没有规定使用哪种加密算法，怎么验证其他网站的可靠性（ [主机名验证](http://developer.android.com/reference/javax/net/ssl/HostnameVerifier.html)）和那些证书是可信的（[SSLSocketFactory](http://developer.android.com/reference/org/apache/http/conn/ssl/SSLSocketFactory.html)）

* 它没有规定是否使用特别的代理服务器和怎么通过代理服务器的用户验证。

每个URL都指定了具体的访问路径（例如：/square/okhttp）和查询请求（例如：？q=sharks$lang=en）。每个服务器都包含了大量的URL。
###[Addresses](http://square.github.io/okhttp/3.x/okhttp/okhttp3/Address.html)
地址指定了一个服务器（例如:github.com）和访问服务器所必须的静态配置：端口，和网络协议（HTTP/2或者SPDY）。

使用相同地址的URL很可能使用相同的底层TCP套接字连接。共享连接有如下好处：更低的网络延时，更高的吞吐量（源于[TCP的慢启动](http://www.igvita.com/2011/10/20/faster-web-vs-tcp-slow-start/)），更省电。OkHttp使用[连接池](http://square.github.io/okhttp/3.x/okhttp/okhttp3/ConnectionPool.html)自动重用HTTP/1.X连接和复用HTTP/2与SPDY连接。

OkHttp中地址的字段一部分来自于URL（scheme，主机名，端口）其他的来自于 [OkHttpClient](http://square.github.io/okhttp/3.x/okhttp/okhttp3/OkHttpClient.html)。
###[Routes](http://square.github.io/okhttp/3.x/okhttp/okhttp3/Route.html)
Routes提供了连接到具体服务器所必须的动态的信息。IP地址（通过DNS查询获取），代理服务（通过使用的[ProxySelector](http://developer.android.com/reference/java/net/ProxySelector.html)获取）和所使用的TLS版本（用于HTTPS连接）。

对于一个地址可能有很多Routes。例如一个服务器托管在多个数据中心在它的DNS响应中可能包含多个IP地址。
###[Connections](http://square.github.io/okhttp/3.x/okhttp/okhttp3/Connection.html)
当你使用OkHttp访问一个URL时，OkHttp将做如下的事情：
1. 使用URL，配置OkHttpClient来创建一个**address**，这个address规定了如何连接到服务器。
2. 试图从连接池获取这个address的连接
3. 如果在连接池中没有找到连接，选择一个route连接，这通常意味着通过DNS请求服务器的IP地址，在必要的情况下选择TLS版本和代理服务器。
4. 如果这是一个新route，它既可以通过一个套接字直连，一个TLS通道（用于HTTP上的HTTPS代理）也可以通过TLS直连必要时进行TLS握手。
5. 发送HTTP请求，获取响应。

如果在建立连接时遇到问题，OkHttp尝试选择另外一个route连接。OkHttp将释放服务器地址无法访问的连接。这对那些已经缓存的过时连接或者不支持的TLS版本同样起作用（将无效的连接释放）。

一旦接收response，连接就会被连接池收集用于接下来的连接（复用），连接池会释放闲置的连接。