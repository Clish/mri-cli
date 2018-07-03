This is a plugin of MRI project.

## How to use it

```
>npm install mri-cli -g
```

## Change log

#### V0.1.3
- 增加命令方式安装和升级依赖包
```
mri upgrade [-r|--reinstall] [packageNames]
```
> - `[-r|--reinstall]`: 删除`node_modules`目录并重新安装
> - `[packageNames]`: 针对给定包名更新

#### V0.1.2
- 增加生成文件头部注释
> - 注释中增加玩具功能`天气信息`
> - 用户信息请在项目下的`.git/config`文件中添加`[user]`信息
> ```vim
> [user]
> 	name  = nickname
> 	email = nickname@demo.com
> ```
> 效果样例如下:
> ```
> /**
>  * Component of Test
>  *
>  * @author      nickname
>  * @email       nickname@demo.com
>  * @create_time 2018/06/27 11:31:51
>  * @weather     多云 西南风 阴晴之间，谨防紫外线侵扰
>  */
> ```

#### V0.1.1
支持命令方式创建component|widget
```
>mri component componentName [-w|--widget] [targetPath]
```
> - componentName : 组件名称
> - [-w|--widget] : 创建为widget, 可选.
> - [targetPath]  : 组件目标路径, 可选. 默认为('./src/components').