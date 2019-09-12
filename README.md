## 调试信息输出

`$ RECORE_DEBUG=true create-recore-app`

## 执行过程

1. 获取最新的地址
2. 和本地缓存的地址进行比较
   - 如果相同，直接从缓存中获取
     - 如果缓存没有，进入 Step3
     - 如果存在，则进入 Step4
   - 如果不相同，进入 Step3
3. 下载 tgz 包并解压到临时文件夹（覆盖），同时修改本地记录为最新地址
4. 校验 tgz 包的 shasum
5. 移动必要文件到工程目录
6. 根据配置修改参数
7. 安装依赖
8. 结束

## 抽象类

TarballRecord => 处理 tarball 相关的记录

Tarball => 下载 解压 保存信息

NPM => 和 NPM 服务通信

Task => 协调各个部件
