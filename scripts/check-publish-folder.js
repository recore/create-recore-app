/**
 * 检查是否是发布 build 目录下的文件
 */

const chalk = require('chalk');

const publishConfigArgv = JSON.parse(process.env.npm_config_argv);
if (publishConfigArgv.original[1] !== 'build') {
  console.error(chalk.red('Please add the folder: build. Input like this below'));
  publishConfigArgv.original.splice(1, 0, 'build');
  console.info(chalk.green(`$ npm ${publishConfigArgv.original.join(' ')}\n`));
  process.exit(1);
}
