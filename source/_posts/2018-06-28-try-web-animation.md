---
title: 网页端的音乐可视化
date: 2018-06-28 09:41:56
updated: 2019-08-11 15:03:01
tags:
  - Javascript
---

- 更新于 2019-08-11

去年 (2018)，因为对 JavaScript 比较感兴趣，加上学校在教前端的内容，所以做了一个简单的音乐可视化网页。然而因为没有系统的学过 JS，所以编码时候遇到了内存泄露还有一些奇怪的问题没有解决，直到今天才把文章给补完。
<!--more-->
很多年以前，还在用着诺基亚塞班手机的时候，我非常喜欢一款播放器，名字叫 [LCG Jukebox](http://www.lonelycatgames.com/?app=lcgjukebox) ，界面大概长这样

{% asset_img jukebox.jpg LCG Jukebox %}

右上角会有一个简单的波形分析器，波形会根据音乐的内容而变化。所以想在网页播放音乐时也能展示出类似的效果。查阅一些资料之后，发现了一个名为 p5.js 的 JavaScript库，使用 p5.js 可以方便地处理视音频和绘图，其中 p5 的音频库能很好地实现波形效果，p5.js 的官网提供了一个很好的范例 [Oscillator Frequency](https://p5js.org/zh-Hans/examples/sound-oscillator-frequency.html) 要实现音乐文件作为音频输入，通过 `loadSound()`

```js
let music

function preload() {
	music = loadSound("path_to_music_file")
}

function setup() {
	music.play()
}
```

有了音频源之后，使用 [p5.FFT](https://p5js.org/reference/#/p5.FFT "快速傅里叶变换") 提供的 [waveform()](https://p5js.org/reference/#/p5.FFT/waveform) 方法分析出波形数据，然后在屏幕上画出波形动画：

```js
let fft

function setup() {
	let cnv = createCanvas(150, 50)
	noFill()
	cnv.parent('vz')
	fft = new p5.FFT()
	frameRate(30)
}

function draw() {
	let waveform = fft.waveform()
	// white line
	stroke(255, 255, 255)
	strokeWeight(2)
	beginShape()
	for (let i = 0; i < waveform.length; i++) {
		let x = map(i, 0, waveform.length, 0, width)
		let y = map(waveform[i], -1, 1, 0, height)
		vertex(x, y)
	}
	endShape()
}
```
到这里基本就完成了。由于网页上有多个音乐文件，加上没有暂停音乐的功能，于是优化一下，在点击波形动画区域来实现播放/暂停，这里需要引入 [p5.dom](https://p5js.org/reference/#/libraries/p5.dom) 这个库：

```js
function setup() {
	let cnv = createCanvas(150, 50)
	// ...
	cnv.mouseClicked(togglePlay)
	// ...
}

function togglePlay() {
	if (song.isPlaying()) {
		song.pause()
	} else {
		song.play()
	}
}
```

在音乐正在播放时，切换到下一首，有时即使利用 `song.stop()` 也会出现同时播放两首音乐的问题。这个问题困扰了我很久，后来仔细阅读文档，发现是音频默认的 `sustain` 播放模式造成的，修改为 `restart` 模式即可解决：

```js
const music = [loadSound("music_file1"), loadSound("music_file2"),
               loadSound("music_file3")]

function play_music(id) {
	let next = music[id]

	if (song != next) {
		song.stop()
		song = next
	}

	song.playMode('restart')
	song.play()
}
```

为网页所写的代码在这里 [andytimes / web2018](https://github.com/andytimes/web2018/blob/master/js/sketch.js) ，然后访问 [2018.andytimes.xyz](https://2018.andytimes.xyz) 能看到最终效果，网页只是歌手 Alan Walker [官网](http://alanwalker.no/) 的仿制版，其中还擅自使用了一些图片和音频素材：

{% asset_img visualizer.png %}

在利用 p5.js  绘图的页面，内存占用挺高的，而且似乎还存在着内存泄露的问题，我也找过别的解决方案，比如这种更原生一些的方法: [基于Web Audio API实现音频可视化效果](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API) ，然而内存泄露的问题更加严重，也许是我的水平不够吧 hhh，希望以后还有机会继续了解更多 Web端的知识。

