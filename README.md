# 这是一个关于监视文件的包
### 1.当监视的文件发生变化的时候 会调用对应的回调函数
### 2.当监听的文件夹删除 增加时会调用对应的回调函数
### 3.取消监听
### 一共有六个api 'watch' 'watchSync' 'watchDirSync' 'watchDir' 'watchFile' 'watchFileSync'

#### watchFile watchFileSync参数(options)
  ```
  options = {
      poll=10, //每秒轮询几次默认值为10
      monitorTimeChange:false, //通过监听文件修改时间来判断文件是否发生变化(只要保存就调用回调函数)
      //默认值为false
  }
  ```

#### watchDir watchDirSync参数(options)
  ```
  options = {
      poll=10, //每秒轮询几次默认值为10
      monitorTimeChange:false, //通过监听文件修改时间来判断文件是否发生变化(只要保存就调用回调函数)
      //默认值为false
      deep:false//是否开启深度监视
  }
  ```

#### watchFile
 ```
 const watchAPI = require('watch-ysy')

 
 watchAPI.watchFile(path,function(data){
    //每次文件发生变化 删除 时会调用这个回调函数传入数据
     {
         type:Symbol('REDUCED')/*删除*/||Symbol('INCREASED')/*增加*/,
         //其他信息...
     }
       
 },options,function(cancel){
     //cancel可以取消监听
 })
```


#### watchFileSync
```
const cancel = watchAPI.watchFileSync(path,function(data){
     
},options)
//如果你想取消监听则执行cancel即可
```

#### watchDir

```
watchAPI.watchDir(pathDir,data=>{},options,cancel=>{})
```

#### watchDirSync
```
const cancel = watchAPI.watchDirSync(path,data=>{},options)
```

#### watch
```
watchAPI.watch(path,data=>{},options,cancel=>{})
//如果你想指定多个路径
watchAPI.watch(['./a','./b'],data=>{},options,cancel=>{})
//如果你想指定多个options
watchAPI.watch([
    {path:'./a',options:{deep:true},
    ...,
    {path:'./b',options:{deep:false}}
    ],
    data=>{},
    options,
    cancel=>{}
    )

```

#### watchSync
```
cancel = watchAPI.watchSync(path,data=>{},options)
//如果你想指定多个路径
cancel = watchAPI.watchSync(['./a','./b'],data=>{},options)
//如果你想指定多个options
cancel = watchAPI.watchSync([
    {path:'./a',options:{deep:true},
    ...,
    {path:'./b',options:{deep:false}}
    ],
    data=>{},
    options,
    )
```


