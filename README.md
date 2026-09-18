# InnerConnect Skill

设计一个可跨平台使用的 skill 插件，兼容 codex、zcode、claude code、kimi code、workbuddy 等桌面 agent 工具。核心功能：让 AI 通过 jumpServer 堡垒机连接公司内网服务器（用户提供堡垒机 id、secret、账号、域名），在对话框中直接连接对应项目的线上 Java 服务，实时查看滚动式在线日志以便排查问题。该 skill 需支持分享给同事，并提供一个简易管理界面：实时展示 AI 执行的命令及服务器返回结果（类似 jumpserver 的 Web 终端），支持日志滚动查看与操作记录留存。请评估可行性，并输出一份简洁的管理界面线框图或原型设计供参考。我现在需要设计这个插件的界面，你帮我设计

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ce572734-6201-4af1-89d9-fd2dac647b73).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
