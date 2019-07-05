---
layout:     post
title:      Okhttp
subtitle:   Okhttp_Calls
date:       2016-05-31
author:     mrtan
header-img: img/post-bg-home.webp
catalog: true
tags:
    - Android
    - Okhttp
    - 翻译
---
[wiki](https://github.com/square/okhttp/wiki/Calls)翻译

##Calls
HTTP客户端的工作是接收你的request然后返回response。理论虽然简单的但是在实际应用中却很困难。
###请求（Request）
每一个HTTP请求都包含一个URL，一个请求方法（例如GET，POST），和多个的请求头。可能包含一个请求体（一个特殊组织形式的数据流）。
###应答（Response）
请求的应答包含响应码（例如：200代表成功，404代表资源未找到），响应头和响应体（可选）。
###重写Request
当用OkHttp发送一个HTTP请求时，你会在更高的层面描述Request：“用这些请求头去抓取这个*URL*”。为了高效且精确，OkHttp会在发送前重写你的Request。
OkHttp会添加原始Request中没有的请求头，这些请求头包括：<code>Content-Length</code>,<code>Transfer-Encoding</code>,<code>User-Agent</code>,<code>Host</code>,<code>Connection</code>，和<code>Content-Type</code>。为了透明的Response它将添加<code>Accept-Encoding</code>除非它（<code>Accept-Encoding</code>）已经包含在请求头里面了。OkHttp还会添加<code>Cookie</code>请求头。

一些request包含一个缓存的Response,当这个缓存的Response过期时OkHttp发送一次有条件的GET请求，如果它是新的那么旧的缓存将被替换，这些需要添加类似<code>If-Modified</code>或<code>If-None-Match</code>的请求头。
###重写Response
如果透明压缩被使用，OkHttp将丢弃<code>Content-Encoding</code>或者<code>Content-Length</code>响应头，因为它们不适用于解压缩的请求体。
如果一个有条件的GET请求成功了，从网络获取的响应和缓存将会按照指示的规范合并。
###Follow-up Requests
当你请求的URL改动时，服务器将会返回一个响应码（302）来重定向这个文件的新URL。OkHttp将会根据重定向的URL取回最终的Response。
如果Response返回授权改变，OkHttp将会查询 [Authenticator
](http://square.github.io/okhttp/3.x/okhttp/okhttp3/Authenticator.html)来满足这个改变（如果配置）。如果Authenticator制订了一个凭证，那么这个凭证也会包含在请求中。
###Request 重试
不管是连接池过时导致的连接失败还是服务器本身不能访问导致的失败。OkHttp都会从另一个地址重新请求（当前地址不可达）。
###[Calls](http://square.github.io/okhttp/3.x/okhttp/okhttp3/Call.html)
在rewrites, redirects, Follow-up和retries之后，你的request可能已经产生了大量的request和response。OkHttp 通过<code>Call</code>模块化任务来满足你的请求，这可能会产生必要的中间request和response。一般来讲不会很多。但欣慰的是它使你的代码正常工作即使你的URL被重定向或者IP地址故障需要转移到另外一个。
Calls有两种执行模式：
* 同步：在请求响应之前会阻塞线程
* 异步：在任意线程将request入队，请求响应时在其他线程执行回调

Calls 也可以从任意线程被取消，这将取消还没完成的Call。当Call被取消时，向请求体写内容的代码和从响应体读内容的代码会报<code>IOException</code>
###调度
对于同步执行的Call，使用自定义的线程你就要管理这些同步请求。同步连接越多使用资源也越多，网络延时越低。
对于异步执行的Call，调度器的实现了最大同步请求的策略，你可以设置每个IP的最大请求（默认是5）和所有请求的最大数（默认是64）。