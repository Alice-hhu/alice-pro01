'use strict';

// 创建一个全局变量，定义项目目录结构
var app = {
	srcPath:'src/',
	devPath:'build/',
	proPath:'dist/'
}
// 项目名称
var proName = "myPro";

// 加载Gulp模块
var gulp = require('gulp');
// 加载gulp-load-plugins 动态模块加载组件，通过package.json代码进行自动获取和加载已安装的组件，最后的()不可以少
	// 即不需要手动一个一个地加载各个组件，通过此组件可自动加载，直接使用 .组件名 调用即可 --> 只适用于以 gulp- 为前缀的组件
	// var gulpLoadPlugins = require('gulp-load-plugins');
	// var plugins = gulpLoadPlugins();
var $ = require('gulp-load-plugins')();
// 加载 浏览器同步 模块, 并进行创建
var browserSync = require('browser-sync').create();

// html的压缩
gulp.task('html',function(){
	gulp.src(app.srcPath+'**/*.html')
		// gulp-plumber 是使gulp异常不会中断 监视，并对gupl的异常进行封装 封装为error
		.pipe($.plumber())
		// 拷贝到 build构建 目录下
		.pipe(gulp.dest(app.devPath))
		// 通过动态加载组件模块 加载组件功能
		.pipe($.htmlmin({
			collapseWhitespace:true,//去除HTML中的空白区域
			removeComments:true,//删除html中的注释
			collapseBooleanAttributes:true,//删除html 中 boolean 类型的属性值
			removeEmptyAttributes:true,//删除html 标签中的 空属性  值为“”
			removeScriptTypeAttributes:true,//删除Script 标签的type属性
			removeStyleLinkTypeAttributes:true//删除Style 和 Link标签的type属性
		}))
		// 将压缩过的文件放到 dist项目 目录下
		.pipe(gulp.dest(app.proPath))
		// 同步到浏览器
		.pipe(browserSync.stream());
});

// less的编译 和 css的压缩
gulp.task('less',function(){
	gulp.src(app.srcPath+'less/**/*.less')
		.pipe($.plumber())
		.pipe($.less())
		//为css属性添加浏览器匹配前缀
			// 指定添加规则
		.pipe($.autoprefixer({
			browsers:['last 20 versions'], // 使css属性兼容主流浏览器的最新的20个版本
			cascode:false // 是否美化属性值，默认是true
		}))
		.pipe(gulp.dest(app.devPath+'css'))
		// .pipe($.cssmin())
		.pipe(gulp.dest(app.proPath+'css'))
		.pipe($.cssmin())
		// 对写入文件进行重新命名
		.pipe($.rename({
			suffix:".min", // 后缀
			extname:".css" // 扩展名
		}))
		.pipe(gulp.dest(app.proPath+'css'))
		/*	css不使用该同步方式，会有问题，修改的元素会复制多一个
		--> 使用浏览器强制重载的方式 --> 在default中添加一个监视器
			// 同步到浏览器 
			// 这边浏览器只同步之前最后一步修改的文件，所以
					// 要么 html中 引用同步语句之前最后一步修改的css文件
					// 要么，将浏览器同步语句放到 html中引用的css文件的修改语句之后
		.pipe(browserSync.stream());
		*/
});

// js的合并 混淆和压缩
gulp.task("js",function(){
	gulp.src(app.srcPath+'js/**/*.js')
		.pipe($.plumber())
		.pipe($.concat(proName+".js"))
		.pipe(gulp.dest(app.devPath+'js'))
		.pipe(gulp.dest(app.proPath+'js'))
		.pipe($.uglify())
		.pipe($.rename({
			suffix:".min", // 后缀
			extname:".js" // 扩展名
		}))
		.pipe(gulp.dest(app.proPath+"js"))
		// 同步到浏览器
		.pipe(browserSync.stream());
});

// clean 清除指定目录下的文件
gulp.task("clean",function(){
	gulp.src([app.devPath,app.proPath])
		.pipe($.clean())
		
		// .pipe(browserSync.stream()); // 同步到浏览器 --> 不起作用
});

// image 压缩
gulp.task("image",function(){
	gulp.src(app.srcPath+'images/**/*')
		.pipe($.plumber())
		.pipe(gulp.dest(app.devPath+'images'))
		.pipe($.imagemin())
		.pipe(gulp.dest(app.proPath+"images"));
});

// 监视器
gulp.task('watch',function(){
	gulp.watch(app.srcPath+"**/*.html",['html']);
	gulp.watch(app.srcPath+"less/**/*.less",['less']);
	gulp.watch(app.srcPath+"js/**/*.js",['js']);
});


// default 任务是一个特殊的任务， 是gulp 默认启动任务，直接命令 gulp 即可执行
// 数组参数指定 哪个任务被调用 需要去同步浏览器
gulp.task('default',['html','less','js','image','watch'],function(){
	browserSync.init({
		server:{
			baseDir:app.proPath
		}
	});
	// 添加一个监视器，用于监视固定的文件变动
	// 如果文件发生变化，执行browserSync组件的强制页面重载
	gulp.watch(app.proPath+"css/**/*.css").on("change",browserSync.reload);
	gulp.watch(app.proPath).on("change",browserSync.reload);
});





