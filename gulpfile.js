const {src, dest, task, series, parallel} = require('gulp')
const webpack = require('webpack-stream')
const concat = require('gulp-concat')
const less = require('gulp-less')
const autoprefix = require('gulp-autoprefixer')
const uglify = require('gulp-uglify')
const minifyCSS = require('gulp-csso')
const zip = require('gulp-zip')
const rename = require('gulp-rename')
const clean = require('gulp-clean')
const path = require('path')
const execSync = require('child_process').execSync
const fs = require('fs')
const resolve = (name) => path.resolve(__dirname, name)
const cssPath = './assets/css'
const jsPath = './assets/js'
const distPath = './dist'
const devModel = process.env.npm_config_devel
const version = process.env.npm_config_tag

if (devModel) {
  console.log('> 开发模式')
}
version && console.log(`> 发布版本：${version}`)

task('clean', () => {
  return src([cssPath, jsPath, distPath], {
    read: false,
    allowEmpty: true,
  }).pipe(
    clean({
      force: true,
    })
  )
})

task('version', (done) => {
  if (version == null) {
    console.log('[Version] No \'--tag\' parameters are specified')
    done()
    return
  }
  const themePath = 'theme.yaml'
  const packagePath = 'package.json'
  const themeData = fs.readFileSync(themePath, 'utf8')
    .replace(/^version:\s+[^\s]+$/m, 'version: ' + version)
  fs.writeFileSync(themePath, themeData)
  let packageData = fs.readFileSync(packagePath, 'utf8')
    .replace(/"version":\s*"[^"]+"/, `"version": "${version}"`)
  fs.writeFileSync(packagePath, packageData)
  done()
})

task('css', () => {
  const ignoreFiles = [].map((file) => `./src/css/${file}.less`)

  let gw = src(['./src/css/**/*.less', './templates/modules/**/*.less'], {
    ignore: ignoreFiles,
  })
    .pipe(less())
    .pipe(
      autoprefix({
        overrideBrowserslist: ['> 2%', 'last 2 versions', 'not ie 6-9'],
        cascade: false,
      })
    )
    .pipe(concat('main.css'))
  if (!devModel) {
    gw = gw.pipe(minifyCSS())
  }

  return gw.pipe(
    rename({
      suffix: '.min',
    })
  ).pipe(dest(cssPath))
})

task('js', () => {
  const ignoreFiles = [].map((file) => `./src/js/${file}.js`)

  let gw = src(['./src/js/**/*.js', './templates/modules/**/*.js'], {
    ignore: ignoreFiles,
  })
    .pipe(concat('main.js'))

  if (!devModel) {
    gw = gw.pipe(uglify())
  }

  return gw.pipe(
    rename({
      suffix: '.min',
    })
  )
    .pipe(dest(jsPath))
})

task('zip', () => {
  const target = ['./assets/**', './templates/**', './*.yaml', 'README.md', 'screenshot.png', 'LICENSE']
  return src(target, {base: '.', ignore: ['./templates/modules/**/*.less', './templates/modules/**/*.js'],})
    .pipe(zip('aurora-theme-default.zip'))
    .pipe(dest(distPath))
})

task('publish', (done) => {
  // 需要将tag标签内容置为 latest
  process.env.npm_config_tag = 'latest'
  console.log(execSync('npm publish').toString())
  done()
})

// 默认模式
task('default', series('clean', parallel('css', 'js'), 'zip'))

// release模式，需要使用--tag参数指定版本号
task('release', series('clean', 'version', parallel('css', 'js'), 'zip'))

// push模式，需要使用--tag参数指定版本号
task('push', series('clean', 'version', parallel('css', 'js'), 'zip', 'publish'))
