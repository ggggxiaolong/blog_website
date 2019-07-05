---
layout:     post
title:      合理的使用Http Cache
subtitle:    
date:       2016-08-11
author:     mrtan
header-img: img/post-bg-home.webp
catalog: true
tags:
    - Android
    - Okhttp
    - Cache
---

#####啰嗦一下
正在做一个关于天气的小项目，使用的是百度的公共[API接口](http://apistore.baidu.com/apiworks/servicedetail/478.html)（接口调用限制6000/次），其实就是[和风天气](http://www.heweather.com/documents/api)（接口调用限制3000/次）。为了节约访问次数（我知道并不用这么做）考虑到使用缓存，于是就有了两种选择：
* 将网络请求转换成本地实体，然后进行持久化。需要解决的问题：需要判断数据的有效性
* 使用http cache进行缓存，问题：需要服务器返回相应的cache字段

当然我选了第二种，因为使用了[Okhttp](https://github.com/square/okhttp)支持设置缓存，又可以通过Interceptor修改返回的response（是的这两个api的返回都没有添加cache）。
###复习一下HTTP的缓存
科学上网的同学直接阅读[HTTP缓存](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching?hl=zh-cn)
#####两个字段
* Cache-Control 用于缓存控制
* ETag 用于校验资源是否过期

#####Cache-Control字段的值

* no-cache 和 no-store
  no-cache表示必须先与服务器确认返回的响应是否被更改，然后才能使用该响应来满足后续对同一个网址的请求。因此，如果存在合适的验证令牌 (ETag)，no-cache 会发起往返通信来验证缓存的响应，如果资源未被更改，可以避免下载。
  相比之下，no-store更加简单，直接禁止浏览器和所有中继缓存存储返回的任何版本的响应 - 例如：一个包含个人隐私数据或银行数据的响应。每次用户请求该资源时，都会向服务器发送一个请求，每次都会下载完整的响应。

![no-cache.png](http://upload-images.jianshu.io/upload_images/1419533-f535efd5c89a98ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* public和 private
  如果响应被标记为public，即使有关联的 HTTP 认证，甚至响应状态码无法正常缓存，响应也可以被缓存。大多数情况下，public不是必须的，因为明确的缓存信息（例如max-age）已表示 响应可以被缓存。
  相比之下，浏览器可以缓存private响应，但是通常只为单个用户缓存，因此，不允许任何中继缓存对其进行缓存 - 例如，用户浏览器可以缓存包含用户私人信息的 HTML 网页，但是 CDN 不能缓存。

* max-age
  该指令指定从当前请求开始，允许获取的响应被重用的最长时间（单位为秒） - 例如：max-age=60
  表示响应可以再缓存和重用 60 秒。

拿图片来解释一下：
![第一次请求服务器](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/images/http-request.png)
这是客户端的第一次请求，可以看到服务器的返回头里面Cache-Control字段为mac-age=120，ETag为x234dff。如果客户端在120秒内再次请求这个资源，会直接读取缓存的数据而不是请求服务器（这一步是浏览器自动处理的）。
![第二次请求服务器](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/images/http-cache-control.png)
如果客户端在120后请求这个资源并携带上一次返回的ETag的话，服务器会通过这个ETag检查资源是否更新如果更新返回新的资源，如果没有更新返回304，表示资源没有过期，就像上面图片那样。表示可以继续使用cache的资源并且在120秒内这个资源是有效的。
####编码
首先写一个修改response的Interceptor

    import java.io.IOException;
    import okhttp3.Interceptor;
    import okhttp3.Request;
    import okhttp3.Response;
    
    public class CacheInterceptor implements Interceptor{
        @Override    
        public Response intercept(Chain chain) throws IOException {
                Request originRequest = chain.request();
                Request.Builder request = originRequest.newBuilder();
                Response response = chain.proceed(request.build());
                return response.newBuilder()
                              .removeHeader("Cache-Control")
                              .header("Cache-Control", "public, max-age=5400")//1.5*60*60 一个半小时
                              .build();    
        }
    }

然后设置okhttpClient的cache和Interceptor

    public OkHttpClient provideClient(File cacheDir, CacheInterceptor interceptor){
            final OkHttpClient.Builder okHttpBuilder = new OkHttpClient.Builder();
            Cache cache = new Cache(cacheDir, 20*1024*1024);
            okHttpBuilder.cache(cache);
            okHttpBuilder.interceptors().add(interceptor);     
            return okHttpBuilder.build();
    }