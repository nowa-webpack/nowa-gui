## setup

```bash
npm install
npm run dev

```

in another terminal

```bash
npm start

```


## packer app

```bash
npm run build

```

* in mac 

```bash
npm run packer:mac
```

* in windows

1. 
```bash
npm run packer:win
cd release/NowaGUI-win32-ia32/resources
asar pack app app.asar
rd /S /Q app
```

2. then modify setup.iss adapt to your file paths.

3. use * Inno Setup Compile * to pack setup.exe.



