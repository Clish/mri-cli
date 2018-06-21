This is a plugin of MRI project.

### MRI-CLI 开发计划

## 启动 ::-> mri dev ${theme}

## 测试环境编译 ::-> mri build ${theme}

## 生产环境编译 ::-> mri prod ${theme}

## 创建 component ::-> mri component ${component_name} [--path ${path}]

## 设置 ui (ant design less) 自定义 key ::-> mri ui ${key_name}

## 复制主题 ::-> mri clone ${theme}

## build electron :: mri electron ${theme}

## 新建项目 :: -> mri init


--

检查 ${theme} 是否存在
检查 theme 下的配置文件是否齐全


mri init -> 创建mri项目 （p4）
mri dev $theme (70% p4)
mri build $theme (70% p4)
mri prod $theme (50% p5) -> docker : staging
mri -V

mri component: .ts, .less, index.ts(解决高阶函数，IDE auto import 失效)， -p -w widget (p2)
mri theme -> 创建主题 （配置文件 config.js(umirc), ui.js, const, service, theme.config.ts, routes）(p1)
mri clone ${theme} (p3) (mac rename) (改名！！)
mri pages $theme (p3)
mri model (p4)

mri update （p3） (配合MRI大版本更新) （内嵌在 mri dev, build, prod中， 也可以单独）【可以批量 或 一定要update的内容】
mri ui (p5)
mri electron (p5) 打包桌面版（打包 chrome）创建包，打包


判断 theme 存在 等一系列安全校验 （p5）
配合 umi 的环境变量或webpack设置 定制开关 （p4）(持续) （编译慢 webpack4）


--==--
polyfill -> 适应配置 （polyfill.io browser user agent）
modern mode

