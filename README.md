# File System
This library is an implementation of an "homemade" File System, similar to [FAT](https://en.wikipedia.org/wiki/File_Allocation_Table).
It's based on [steganography](https://en.wikipedia.org/wiki/Steganography) so data can be stored and loaded from a supported image file
*(Image must be drawable with [CanvasRenderingContext2D.drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage))*.
A [GUI](https://en.wikipedia.org/wiki/Graphical_user_interface) is also included with multiples applications.

* [Live demo](https://lowlighter.github.io/file-system/demo/)
* [Documentation](https://lowlighter.github.io/file-system/docs/)
* [About](https://lowlight.fr/en/blog/file-system/)

![Image of file system](https://github.com/lowlighter/file-system/raw/master/demo/imgs/demo.gif)

# Features
* **Configurable** Image disk
  * **size** : change image size
  * **table size** : change max entries *(folders and files)* number
  * **block size** : change block size
  * **entry name length** : change number of bytes allocated to entries names
  * **table extended** : choose if creation and last edition dates and permissions should be stored in FAT

* **Graphical user interface** (GUI) included with the following applications :
  * **File Explorer** : navigate through the disk easily
    * **Create**, **delete** and **edit** files and folders
    * Show **file** and **disk** properties**
    * Support **hidden** entries
  * **Command-line interface** : use powerful commands
  * **User sessions** : manage sessions
  * **Image loader** : load existing image
  * **Disk dissembler (using steganography)** : hide data on an existing image
  * **Disk encrypter/decrypter*** : protect data with a passphrase
  * **Text editor** : Create and edit text files
  * **Image displayer** : Display Base64 encoded image files
  * **Audio player** : Play Base64 encoded audio files
  * **Script interpreter** : Expand functionnality yourself thanks to the JavaScript interpreter

## Getting Started
First of all, you'll need to include the library :
```html
    <script src="./bin/lowlight.fs.js"></script>
```

You may include the minified library instead :
```html
    <script src="./bin/lowlight.fs.min.js"></script>
```

Then you may create alias for convenience :
```javascript
    let GUI = Lowlight.FileSystem.GUI
    let Image = Lowlight.FileSystem.Image
```

Note that [jQuery](https://jquery.com/) is used by this library and must be loaded first :
```html
    <script src="./path/to/jquery.js"></script>
```

## Setup

The following html structure is required :
```html
    <canvas class="app-view" width="400" height="400">
    <div class="app-controller"></div>
```

Then add the following code snippet :
```javascript
    $("<img>").attr("src", "/src/file-system/demo/image.png").on("load", function () {
        //Draw initial image
            $(".app-view canvas").get(0).getContext("2d").drawImage($(this).get(0), 0, 0)
        //Create interface
            new GUI(
                Image.open($(".app-view canvas").get(0).getContext("2d")),
                $(".app-controller").get(0)
            )
    })
```

You may also add the stylesheet and pictures from `/demo` to have a nice GUI visual render.

If you're a developper and want to expand library, you may want to read [documentation](https://lowlighter.github.io/file-system/docs/)
to understand how this project has been coded.

Don't forget to check and update `src/Interfaces/GUI/Gui.static.js` to update text and icons.

## Commands list

GUI is pretty intuitive but if you want to use command-line interface instead, you can use the following commands.
Note that's the only way to create a new disk.

### Applications
|            |                             |
| ---------- | --------------------------- |
| **help** [command=help] | Display help for a given command |
| **explorer** [path=pwd]   | Open a new instance of file explorer        |
| **terminal**  | Open a new command-line interface     |

### Entries management
|            |                             |
| ---------- | --------------------------- |
| **rm** <path> [-r] | Remove an entry (add **-r** to remove recursively a folder) |
| **mv** <path> <target> [-f] | Move an entry (add **-f** to target folders) and can also be used to rename an entry  |
| **stat** <path>  | Display an entry properties (add **-f** to target folders) |
| **chmod** [-r&vert;+r] [-w&vert;+w] [-x&vert;+x] [-d&vert;+d] [-R&vert;+R] [-W&vert;+W] [-X&vert;+X] [-D&vert;+D] [-f] | Edit entries permissions (add **+r**, **+w**, **+x**, **+d** to add read, write, execution and deletion rights and **-r**, **-w**, **-x**, **-d** to remove them. In lowercase for the owner and uppercase for the others. Add **-f** to target folders) |
| **chown** <path> <user> [-f] | Change the owner of an entry (add **-f** to target folders) |

### Folders management
|            |                             |
| ---------- | --------------------------- |
| **cd** [path=/home] | Change current directory |
| **mkdir** <path> | Create a new directory |
| **ls** [path=pwd] [-a] [-l] [-type=ALL&vert;FOLDER&vert;FILE] | List entries of directory (add **-a** to show hidden entries, **-l** to display properties of each entries and **-type** to filter entries types) |
| **tree** [path=pwd] [-a]| Display directory tree (add **-a** to show hidden entries) |

### Files management
|            |                             |
| ---------- | --------------------------- |
| **mkfile** <path> | Create a new file |
| **edit** <path> | Open a file as a text file |
| **display** <path> | Open a file as an image file |
| **play** <path> | Open a file as an audio file |
| **exec** <path> | Open a file as a script file |

### Users management
|            |                             |
| ---------- | --------------------------- |
| **su** <user> [password] | Login with another user account |
| **adduser** <user> [password] | Create a new user account |
| **deluser** <user> <password> | Delete an existing user account |
| **users** | Display users list |
| **whoami** | Display current user account name |

### Encryption and decryption
|            |                             |
| ---------- | --------------------------- |
| **encrypt** <key> | Encrypt disk data |
| **decrypt** <key> | Decrypt disk data |

### System
|            |                             |
| ---------- | --------------------------- |
| **pwd** | Display path working directory |
| **env** | Display environnment variables |
| **dstat** | Display disk properties |

### Disk image
|            |                             |
| ---------- | --------------------------- |
| **dload** | Open disk loader |
| **dformat** [-size=400x400] [-table-size=512] [-block-size=256] [-entry-name-length=8&vert;16&vert;24&vert;32] [-table-extended=y&vert;n] | Create a new image (will reload interface after creation) |

## Project content
|            |                             |
| ---------- | --------------------------- |
| **/bin**   | Live and dev scrripts files |
| **/src**   | Source files                |
| **/demo**  | Demo and codes examples     |
| **/docs**  | Documentation               |

## Rebuild project and expanding the library
You'll need to run the following command the first time to install dependencies.
```shell
npm install
```

Then to rebuild project, just run the following command :
```shell
npm run build
```

This will update `/bin` files with included `/src` files.
Although `package.json` (which contains `"source" and "output"` paths) are preconfigured, you may need to reconfigure them if you're planning to expand this library.

To include a file just use the following syntax in the `"source"` file :
```javascript
    /* #include <path/to/file.js> */
```

* File minification is performed with [Babel minify](https://github.com/babel/minify).
* Documentation is generated with [JSDoc 3](https://github.com/jsdoc3/jsdoc).

Although `package.json` (which contains `"jsdoc_source", "jsdoc_output", "jsdoc_config" and "jsdoc_readme"`) and `docs/categories.json` are preconfigured, you may need to reconfigure them if you're planning to expand this library.

## License
This project is licensed under the MIT License.

See [LICENSE.md](https://github.com/lowlighter/file-system/blob/master/LICENSE.md) file for details.
