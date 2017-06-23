## homepage

https://nowa-webpack.github.io/

## articles

* https://segmentfault.com/blog/uxcore
* https://segmentfault.com/a/1190000009088343

## usage

* https://nowa-webpack.github.io/nowa/
* https://nowa-webpack.github.io/docs/

## images

<img src="https://raw.githubusercontent.com/nowa-webpack/nowa-gui/master/doc/detailp.png" width="600" />
<br/>
<img src="https://raw.githubusercontent.com/nowa-webpack/nowa-gui/master/doc/newp.png" width="600"/>
<br/>
<img src="https://raw.githubusercontent.com/nowa-webpack/nowa-gui/master/doc/pkg.png" width="600"/>
<br/>
<img src="https://raw.githubusercontent.com/nowa-webpack/nowa-gui/master/doc/set1.png" width="600"/>
<br/>


## setup

```bash
npm install -r http://registry.npm.taobao.org
<<<<<<< HEAD
=======

>>>>>>> v6
```

in another terminal

if you firstly run this project, please run it at first.

```bash
npm run dev:dll
<<<<<<< HEAD
=======
```

don't forget to modify the file `node_modules/rc/index.js`:

```
// if(!module.parent) {
//   console.log(
//     JSON.stringify(module.exports(process.argv[2]), false, 2)
//   )
// }
>>>>>>> v6
```

then run

```bash
npm run dev:renderer
npm run dev:main
npm start


```

## pack app

```bash
npm run build

```

* in mac 

```bash
npm run packer:mac
```

* in windows

```bash
npm run packer:win
```

* in linux
<<<<<<< HEAD

```bash
npm run packer:linux
```

=======
>>>>>>> v6

```bash
npm run packer:linux

```
