/**
 * Copyright 2017, Lecoq Simon (lowlight.fr)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function (global) {
    //Registering
        if (typeof global.Lowlight === "undefined") { global.Lowlight = {} }
        if ((typeof module === "object")&&(typeof module.exports === "object")) { module.exports = global.Lowlight }

    //Includes
        /* #include <Elements/Block.js> */
        /* #include <Elements/Entry.js> */
        /* #include <Elements/Utf8.js> */

        /* #include <Images/Image.js> */
        /* #include <Images/Image.test.js> */
        /* #include <Images/PictureImage.js> */

        /* #include <Interfaces/Interface.js> */

        class GUI extends Interface {
            /* #include <Interfaces/GUI.js> */
            /* #include <Interfaces/GUI/GUI.Applications.js> */
            /* #include <Interfaces/GUI/GUI.Encryption.js> */
            /* #include <Interfaces/GUI/GUI.EntryManagers.js> */
            /* #include <Interfaces/GUI/GUI.Explorer.js> */
            /* #include <Interfaces/GUI/GUI.ImageManagers.js> */
            /* #include <Interfaces/GUI/GUI.Infos.js> */
            /* #include <Interfaces/GUI/GUI.Sessions.js> */
            /* #include <Interfaces/GUI/GUI.Terminal.js> */
            /* #include <Interfaces/GUI/GUI.Windows.js> */
        }
        /* #include <Interfaces/GUI/GUI.static.js> */

        global.Lowlight.FileSystem = {Block, Entry, Utf8, Image, PictureImage, Interface, GUI}
})(typeof window !== "undefined" ? window : this)
