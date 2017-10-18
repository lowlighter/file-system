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
        
class Block {
    /**
     * <pre>
     * Block manager.
     * </pre>
     * @param {Image} image - Associated Image instance
     * @param {Number} id - Id
     * @param {Number} n - Block index
     * @param {Object} [data] - Data to write
     * @category elements
     */
        constructor(image, id, n, data) {
            /**
             * Associated Image instance.
             * @private
             * @readonly
             * @type {Image}
             */
                this.image = image

            /**
             * Id
             * @readonly
             * @type {Number}
             */
                this.id = id

            /**
             * Index of first byte in image.
             * @private
             * @readonly
             * @type {Number}
             */
                this.n = n

            //Data sync
                this.data = data
        }

    /**
     * Shortcut to set properties with an object structure
     * @type {Object}
     */
        set data(data) {
            for (let i in data) { if (i in this) { this[i] = data[i] } }
        }

    /**
     * <pre>
     * Tell if block is used.
     * 1 bit.
     * </pre>
     * @type {Boolean}
     */
        set used(v) {
            if (!v) { this.end = 1 }
            this.image.write(this.n, v, 0b00100000)
        }
        get used() { return this.image.read(this.n, 0b00100000) }

    /**
     * <pre>
     * Tell if block is end block.
     * 1 bit.
     * </pre>
     * @type {Boolean}
     */
        set end(v) { this.image.write(this.n, v, 0b00010000) }
        get end() { return this.image.read(this.n, 0b00010000) }

    /**
     * <pre>
     * Next block id.
     * 20 bits.
     * </pre>
     * @type {Number|Block}
     */
        set next(v) { this.image.write(this.n, [v >> 16, v >> 8, v], [0x0F, 0xFF, 0xFF]) }
        get next() {
            let id = this.image.read(this.n, [0x0F, 0xFF, 0xFF]).reduce((w, v, i, a) => { return w + (v << ((a.length-1-i)*8)) }, 0)
            return (id === Entry.NONE) ? {id} : this.image.block(id)
        }

    /**
     * <pre>
     * Block content.
     * </pre>
     * <div class="alert info
     * For conveniency, this member will accept argument larger than it can stores but will truncate it.
     * </div>
     * <div class="alert warning">
     * This member does <span class="bold">not</span> encode string. Please use [Utf8.encode]{@link Utf8#encode}.
     * </div>
     * @type {Number[]}
     */
        set content(v) { this.image.write(this.n+3, v.slice(0, this.image.block_size-3)) }
        get content() { return this.image.read([this.n+3, this.n+this.image.block_size-1]) }
}

        
class Entry {
    /**
     * <pre>
     * Entry manager.
     * Default size for table entries is 44 bits (6 bytes, with 4 unused bits)
     * If extended table entries data is enabled, Entry if 120 bits (15 bytes).
     * Add 8, 16, 24 or 32 bytes for file name.
     * </pre>
     * @param {Image} image - Associated Image instance
     * @param {Number} id - Id
     * @param {Number} n - File index
     * @param {Object} [data] - Data to write
     * @category elements
     */
        constructor(image, id, n, data) {
            /**
             * Associated Image instance.
             * @private
             * @readonly
             * @type {Image}
             */
                this.image = image

            /**
             * Id
             * @readonly
             * @type {Number}
             */
                this.id = id

            /**
             * Index of first byte in image.
             * @private
             * @readonly
             * @type {Number}
             */
                this.n = n

            //Data sync
                this.data = data
        }


    /**
     * <pre>
     * Shortcut to set properties with an object structure.
     * If table extended entries data option isn't set, property will silently fail.
     * </pre>
     * @type {Object}
     */
        set data(data) {
            for (let i in data) {
                if (i in this) {
                    try { this[i] = data[i] } catch (e) {}
                }
            }
        }

    /**
     * <pre>
     * Entry type (file or folder).
     * 1 bit.
     * </pre>
     * @type {Boolean}
     */
        set type(v) { this.image.write(this.n, v, 0b10000000) }
        get type() { return this.image.read(this.n, 0b10000000) }

    /**
     * <pre>
     * Entry visibility.
     * 1 bit.
     * </pre>
     * @type {Boolean}
     */
        set visibility(v) { this.image.write(this.n, v, 0b01000000) }
        get visibility() { return this.image.read(this.n, 0b01000000) }

    /**
     * <pre>
     * Unique owner id.
     * Max users : 2**6 - 1 = 63
     * 6 bits.
     * </pre>
     * @type {Number}
     */
        set owner(v) { this.image.write(this.n, v, 0b00111111) }
        get owner() { return this.image.read(this.n, 0b00111111) }

    /**
     * <pre>
     * Unique parent folder id.
     * Max entries : 2**16 - 2 = 65534
     * 16 bits.
     * </pre>
     * @type {Number|File}
     */
        set parent(v) { this.image.write(this.n+1, [v >> 8, v], [0xFF, 0xFF]) }
        get parent() {
            let id = this.image.read(this.n+1, [0xFF, 0xFF]).reduce((w, v, i, a) => { return w + (v << ((a.length-1-i)*8)) }, 0)
            return (id === Entry.ROOT)||(id === Entry.BLANK) ? {root:(id === Entry.ROOT), path:"/", name:"/", id} : this.image.entry(id)
        }

    /**
     * <pre>
     * First block id.
     * Max blocks : 2**20-1 = 1048574
     * 20 bits.
     * </pre>
     * @type {Number|Block}
     */
        set block(v) { this.image.write(this.n+3, [v >> 12, v >> 4, v], [0xFF, 0xFF, 0xF0]) }
        get block() {
            let id = this.image.read(this.n+3, [0xFF, 0xFF, 0xF0]).reduce((w, v, i, a) => { return w + (v << [12, 4, 0][i]) }, 0)
            return (id === Entry.NONE) ? {id} : this.image.block(id)
        }

    /**
     * <pre>
     * List of used blocks.
     * </pre>
     * @type {Block[]}
     */
        get blocks() {
            let b = this.block, blocks = []
            if (b.id === Entry.NONE) { return blocks }
            while (1) {
                blocks.push(b)
                if ((b.end)||(b.id === Entry.NONE)) { break }
                b = b.next
            }
            return blocks
        }

    /**
     * <pre>
     * Entry creation date.
     * 8 bits | Year (2255 > x, min 2000)
     * 4 bits | Month (16 > 12)
     * 5 bits | Day (32 > 31)
     * 5 bits | Hour (32 > 24)
     * 6 bits | Minute (64 > 60)
     * 6 bits | Second (64 > 60)
     * 34 bits.
     * </pre>
     * @type {Object}
     * @throws {Error} Table extended entries data option must be set
     */
        set creation(v) {
            if (!this.image.table_extended) { throw new Error("Table extended entries data option must be set") }
            if (v.y) { v.y %= Entry.DATE_OFFSET ; this.image.write(this.n+5, [v.y >> 4, v.y], [0b00001111, 0b11110000]) }
            if (v.m) { this.image.write(this.n+6, v.m, 0b00001111) }
            if (v.d) { this.image.write(this.n+7, v.d, 0b11111000) }
            if (v.h) { this.image.write(this.n+7, [v.h >> 2, v.h], [0b00000111, 0b11000000]) }
            if (v.i) { this.image.write(this.n+8, v.i, 0b00111111) }
            if (v.s) { this.image.write(this.n+9, v.s, 0b11111100) }
        }
        get creation() {
            if (!this.image.table_extended) { throw new Error("Table extended entries data option must be set") }
            return {
                y:Entry.DATE_OFFSET + (this.image.read(this.n+5, 0b00001111) << 4) + this.image.read(this.n+6, 0b11110000),
                m:this.image.read(this.n+6, 0b00001111),
                d:this.image.read(this.n+7, 0b11111000),
                h:(this.image.read(this.n+7, 0b00000111) << 2) + this.image.read(this.n+8, 0b11000000),
                i:this.image.read(this.n+8, 0b00111111),
                s:this.image.read(this.n+9, 0b11111100)
            }
        }

    /**
     * <pre>
     * Entry edition date.
     * 8 bits | Year (2255 > x, min 2000)
     * 4 bits | Month (16 > 12)
     * 5 bits | Day (32 > 31)
     * 5 bits | Hour (32 > 24)
     * 6 bits | Minute (64 > 60)
     * 6 bits | Second (64 > 60)
     * 34 bits.
     * </pre>
     * @type {Object}
     * @throws {Error} Table extended entries data option must be set
     */
        set edition(v) {
            if (!this.image.table_extended) { throw new Error("Table extended entries data option must be set") }
            if (v.y) { v.y %= Entry.DATE_OFFSET ; this.image.write(this.n+9, [v.y >> 6, v.y], [0b00000011, 0b11111100]) }
            if (v.m) { this.image.write(this.n+10, [v.m >> 2, v.m], [0b00000011, 0b11000000]) }
            if (v.d) { this.image.write(this.n+11, v.d, 0b00111110) }
            if (v.h) { this.image.write(this.n+11, [v.h >> 4, v.h], [0b00000001, 0b11110000]) }
            if (v.i) { this.image.write(this.n+12, [v.i >> 2, v.i], [0b00001111, 0b11000000]) }
            if (v.s) { this.image.write(this.n+13, v.s, 0b00111111) }
        }
        get edition() {
            if (!this.image.table_extended) { throw new Error("Table extended entries data option must be set") }
            return {
                y:Entry.DATE_OFFSET + (this.image.read(this.n+9, 0b00000011) << 6) + this.image.read(this.n+10, 0b11111100),
                m:(this.image.read(this.n+10, 0b00000011) << 2) + this.image.read(this.n+11, 0b11000000),
                d:this.image.read(this.n+11, 0b00111110),
                h:(this.image.read(this.n+11, 0b00000001) << 4) + this.image.read(this.n+12, 0b11110000),
                i:(this.image.read(this.n+12, 0b00001111) << 2) + this.image.read(this.n+13, 0b11000000),
                s:this.image.read(this.n+13, 0b00111111)
            }
        }

    /**
     * <pre>
     * Permissions file (Read/Write/eXecute/Delete).
     * Note that only two sets are defined : User (owner) and Others.
     * 8 bits.
     * </pre>
     * @type {Object}
     * @throws {Error} Table extended entries data option must be set
     */
        set permissions(v) {
            if (!this.image.table_extended) { throw new Error("Table extended entries data option must be set") }
            let byte = 0
            if (v.u) {
                if (v.u.r) { byte |= 0b10000000 }
                if (v.u.w) { byte |= 0b01000000 }
                if (v.u.x) { byte |= 0b00100000 }
                if (v.u.d) { byte |= 0b00010000 }
            }
            if (v.o) {
                if (v.o.r) { byte |= 0b00001000 }
                if (v.o.w) { byte |= 0b00000100 }
                if (v.o.x) { byte |= 0b00000010 }
                if (v.o.d) { byte |= 0b00000001 }
            }
            this.image.write(this.n+14, byte)
        }
        get permissions() {
            if (!this.image.table_extended) { throw new Error("Table extended entries data option must be set") }
            let byte = this.image.read(this.n+14)
            return {
                u:{r:!!(byte & 0b10000000), w:!!(byte & 0b01000000), x:!!(byte & 0b00100000), d:!!(byte & 0b00010000)},
                o:{r:!!(byte & 0b00001000), w:!!(byte & 0b00000100), x:!!(byte & 0b00000010), d:!!(byte & 0b00000001)}
            }
        }

    /**
     * <pre>
     * File name.
     * Between 64 and 256 bits (8 and 32 bytes)
     * </pre>
     * @type {String}
     * @throws {Error} File name too long
     */
        set name(v) {
            let bytes = Utf8.encode(v.trim())
            if (bytes.length > this.image.entry_name) { throw new Error(`File name too long (${bytes.length} > ${this.image.entry_name})`) }
            this.image.write(this.n+(this.image.table_extended ? Entry.EXTENDED : Entry.REDUCED), Utf8.encode("\0".repeat(this.image.entry_name)))
            this.image.write(this.n+(this.image.table_extended ? Entry.EXTENDED : Entry.REDUCED), bytes)
        }
        get name() {
            let n = this.n+(this.image.table_extended ? Entry.EXTENDED : Entry.REDUCED)
            let bytes = this.image.read([n, n+this.image.entry_name-1])
            for (let i = bytes.length-1; i >= 0; i--) {
                if (bytes[i] === 0) { bytes.pop() } else { break }
            }
            return Utf8.decode(bytes).trim()
        }

    /**
     * Entry content (revelent only for files).
     * @type {?String}
     */
        set content(v) {
            //Initialization
                if (this.folder) { return } else { this.image.sync(false) }
                let bytes = Utf8.encode(v), ii = this.image.block_size-3
                this.erase()
                let b = this.image.block_unused
                this.block = b.id
            //Writing content
                for (let i = 0; i < bytes.length; i+=ii) {
                    b.content = Utf8.encode("\0".repeat(this.image.block_size-3))
                    b.content = bytes.slice(i, i+ii)
                    b.used = 1; b.end = 0; b.next = this.image.block_unused.id
                    if (i+ii >= bytes.length) { b.end = 1 ; break }
                    b = b.next
                }
            //Enable auto-sync
                this.image.sync(true)
                this.image.sync(0, true)
        }
        get content() {
            //Initialization
                if (this.folder) { return null } else { this.image.sync(false) }
                this.image.sync(1, true)
                let b = this.block, bytes = []
            //Reading content
                if (b.id === Entry.NONE) { return "" }
                while (1) {
                    bytes.push(...b.content)
                    if ((b.end)||(b.id === Entry.NONE)) { break }
                    b = b.next
                }
            //Trimming content
                for (let i = bytes.length-1; i >= 0; i--) {
                    if (bytes[i] === 0) { bytes.pop() } else { break }
                }
            //Enable auto-sync
                this.image.sync(true)
                return Utf8.decode(bytes)
        }

    /**
     * Erase all content by freeing all used blocks and clearing content.
     * No effect on folders.
     */
        erase() {
            if (this.folder) { return }
            this.image.sync(1, true)
            this.blocks.map(b => b.used = 0)
            this.image.sync(0, true)
        }

    /**
     * Tell if entry is a file.
     * @type {Boolean}
     */
        get file() { return this.type === Entry.FILE }

    /**
     * Tell if entry is a folder.
     * @type {Boolean}
     */
        get folder() { return this.type === Entry.FOLDER }

    /**
     * Tell if entry is visible.
     * @type {Boolean}
     */
        get visible() { return this.visibility === Entry.VISIBLE }

    /**
     * Tell if entry is hidden.
     * @type {Boolean}
     */
        get hidden() { return this.visibility === Entry.HIDDEN }

    /**
     * Tell if entry is blank.
     * @type {Boolean}
     */
        get blank() { return this.parent.id === Entry.BLANK }
        set blank(v) {
            if (v) {
                this.erase()
                this.parent = Entry.BLANK
                this.visibility = Entry.HIDDEN
                this.block = Entry.NONE
            } else {
                this.parent = Entry.ROOT
                this.visibility = Entry.VISIBLE
            }
        }

    /**
     * Entry's path.
     * @type {String}
     */
        get path() {
            let path = this.name, dir = this.parent
            while (!dir.root) {
                path = `${dir.name}/${path}`
                dir = dir.parent
            }
            return `/${path}`
        }
}

/**
 * Root id. An entry with this id as parent will be considered as child of root directory.
 * @memberof Entry
 * @static
 * @const
 * @type {Number}
 * @default 0
 */
    Entry.ROOT = 0

/**
 * Blank id. An entry with this id as parent will be considered as blank and unused.
 * @memberof Entry
 * @static
 * @const
 * @type {Number}
 * @default 65535
 */
    Entry.BLANK = 65535

/**
 * File entry type value.
 * @memberof Entry
 * @static
 * @const
 * @type {Number}
 * @default 1
 */
    Entry.FILE = 1

/**
 * Folder entry type value.
 * @memberof Entry
 * @static
 * @const
 * @type {Number}
 * @default 0
 */
    Entry.FOLDER = 0

/**
 * Visible status value.
 * @memberof Entry
 * @static
 * @const
 * @type {Number}
 * @default 1
 */
    Entry.VISIBLE = 1

/**
 * Hidden visibility status value.
 * @memberof Entry
 * @static
 * @const
 * @type {Number}
 * @default 0
 */
    Entry.HIDDEN = 0

/**
 * Block null value. An entry or a block with this value in their first block (or next block) will be considered as having none.
 * @memberof Entry
 * @static
 * @const
 * @type {Number}
 * @default 1
 */
    Entry.NONE = 0

/**
 * Date offset.
 * @memberof Entry
 * @static
 * @const
 * @type {Number}
 * @default 2000
 */
    Entry.DATE_OFFSET = 2000


/**
 * Entry header size (when table is extended).
 * @memberof Entry
 * @static
 * @const
 * @type {Number}
 * @default 15
 */
    Entry.EXTENDED = 15

/**
 * Entry header size (when table is not extended).
 * @memberof Entry
 * @static
 * @const
 * @type {Number}
 * @default 2000
 */
    Entry.REDUCED = 6

/**
 * Available entry name length (specify 4 values at most).
 * @memberof Entry
 * @static
 * @const
 * @type {Number[]}
 * @default [8, 16, 24, 32]
 */
    Entry.NAME = [8, 16, 24, 32]

        
/**
 * Utilitary methods to encode and decode strings in utf-8 format.
 * @class
 * @category elements
 */
    class Utf8 {
        /**
         * Encode a string into an array of bytes.
         * This method use the fact that URI escape special characters by using the following format '%XX' where 'XX' is a utf-8 byte.
         * @param {String} str - String to encode
         * @return {Number[]} Array of bytes
         */
            static encode(str) {
                let bytes = []
                ;([...str]).map(char => bytes.push(...[...Utf8._encode(char)].map(c => c.charCodeAt(0))))
                return bytes
            }

        /**
         * Encode utilitary method.
         * @private
         * @ignore
         */
            static _encode(char) { return unescape(encodeURIComponent(char)) }

        /**
         * Decode bytes into a string.
         * This method use the fact that URI escape special characters by using the following format '%XX' where 'XX' is a utf-8 byte.
         * @param {Number[]} [bytes=[]] - Array of bytes
         * @return {String} Decoded string
         */
            static decode(bytes = []) {
                let str = ""
                for (let i = 0; i < bytes.length; i++) {
                         if ((bytes[i] & 0b10000000) === 0b00000000) { str += Utf8._decode(String.fromCharCode(bytes[i])) }
                    else if ((bytes[i] & 0b11100000) === 0b11000000) { str += Utf8._decode(String.fromCharCode(bytes[i], bytes[++i])) }
                    else if ((bytes[i] & 0b11110000) === 0b11100000) { str += Utf8._decode(String.fromCharCode(bytes[i], bytes[++i], bytes[++i])) }
                    else if ((bytes[i] & 0b11111000) === 0b11110000) { str += Utf8._decode(String.fromCharCode(bytes[i], bytes[++i], bytes[++i], bytes[++i])) }
                }
                return str
            }

        /**
         * Decode utilitary method.
         * @private
         * @ignore
         */
            static _decode(byte) { try { return decodeURIComponent(escape(byte)) } catch (e) { return "�" } }
    }


        
class Image {
    /**
     * <pre>
     * Image data structure.
     * It allows to easily manipulate bytes on a image to store data on it.
     * This is intended to work together with a basic interface as a file system.
     * </pre>
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {Object} [data=null] - Format data (leave blank if you're loading an existing image)
     * @category images
     */
        constructor(context, data = null) {
            //Initialization
                this.context = context
                this.sync(1, true)

            //Saving data
                this.format(data)
        }

    /**
     * Constructor name (unaccessible otherwise because of minification).
     * @type {String}
     * @const
     * @private
     * @override
     */
        get image_type() { return "Image" }

    /**
     * <pre>
     * Format image.
     * This should only be called once and only by constructor.
     * If called while null is given, no formatting will be done.
     * </pre>
     * @private
     * @param {?Object} data - Format data
     */
        format(data) {
            //Disable auto-sync
                this.sync(false)

            //Format
                if (data !== null) {
                    //Remove channel alpha
                        for (let i = 3; i < this.image.data.length; i+=4) { this.image.data[i] = 0xFF }

                    //Saving data
                        if (this.image_type === "Image") { this.size = this._size * 0.75 }
                        this.signature = Image.SIGNATURE[this.image_type.toLocaleUpperCase()]||Image.SIGNATURE.UNKNOWN
                        this.crypted = data.crypted
                        this.entry_name = data.name
                        this.table_size = data.table
                        this.table_extended = data.extended
                        this.block_size = data.block

                    //Initializing entries and blocks
                        for (let i = 1; i <= this.table_size; i++) { this.entry(i).blank = true }
                        for (let i = 1; i <= this.block_number; i++) { this.block(i).used = false }
                }

            //Enable auto-sync
                this.sync(0, true)
                this.sync(true)
        }

    /**
     * <pre>
     * Signature.
     * This value can only be edited upon image formatting.
     * 4 bits.
     * </pre>
     * @readonly
     * @type {Number}
     */
        set signature(v) { this.write(0, v, 0b11110000) }
        get signature() { return Image.SIGNATURE[this.read(0, 0b11110000)] }

    /**
     * <pre>
     * Entry name max length.
     * This value can only be edited upon image formatting.
     * 11 | 32 bytes
     * 10 | 24 bytes
     * 01 | 16 bytes
     * 00 | 8 bytes
     * 2 bits.
     * @readonly
     * @type {Number}
     */
        set entry_name(v) {
            if (!~Entry.NAME.indexOf(v)) { throw new Error(`Entry name max length ${v} is not supported`) }
            this.write(0, Entry.NAME.indexOf(v), 0b00001100)
        }
        get entry_name() { return Entry.NAME[this.read(0, 0b00001100)] }

    /**
     * <pre>
     * Encryption status.
     * If enabled, this means that image data is encrypted.
     * This value can only be edited upon image formatting.
     * 1 bit.
     * </pre>
     * @readonly
     * @type {Boolean}
     */
        set crypted(v) { this.write(0, v, 0b00000010) }
        get crypted() { return !!this.read(0, 0b00000010) }

    /**
     * <pre>
     * Table entries extended data option.
     * If enabled, creation date, edition date and permissions will be added to each table entry.
     * 1 bit.
     * </pre>
     * @readonly
     * @type {Boolean}
     */
        set table_extended(v) { this.write(0, v, 0b00000001) }
        get table_extended() { return !!this.read(0, 0b00000001) }

    /**
     * <pre>
     * Size.
     * Max size : 2**24 = 16777216 oct = 16.78 Mo
     * Min size : (Image header size) + (1 Table entry) + (1 Cluster min size) = 8*8 + 15*8+32 + 2*8 = 57 bytes, round to 64
     * 24 bits.
     * </pre>
     * @readonly
     * @type {Number}
     */
        set size(v) {
            v = Math.floor(v)
            if ((v < 64)||(v > 16777215)) { throw new Error(`Image size must be between 64 and 16777215, ${v} given`) }
            this.write(1, [v >> 16, v >> 8, v], [0xFF, 0xFF, 0xFF])
        }
        get size() { return this.read(1, [0xFF, 0xFF, 0xFF]).reduce((w, v, i, a) => { return w + (v << (a.length-1-i)*8)}, 0) }

    /**
     * Physical size.
     * @type {Number}
     * @private
     * @ignore
     */
        get _size() { return this.data.length }

    /**
     * <pre>
     * Table size. As max entries is 65534 (see [Entry]{@link Entry}), 2 bytes are required.
     * 16 bits.
     * </pre>
     * @readonly
     * @type {Number}
     */
        set table_size(v) {
            if ((v < 1)||(v > 65534)) { throw new Error(`Table size must be between 1 and 65534, ${v} given`) }
            this.write(4, [v >> 8, v], [0xFF, 0xFF])
        }
        get table_size() { return this.read(4, [0xFF, 0xFF]).reduce((w, v, i, a) => { return w + (v << (a.length-1-i)*8)}, 0) }

    /**
     * <pre>
     * Size (in bytes) of a table entry (include its name size).
     * </pre>
     * @readonly
     * @type {Number}
     */
        get table_entry() { return this.entry_name + (this.table_extended ? Entry.EXTENDED : Entry.REDUCED) }

    /**
     * <pre>
     * Block size.
     * Min block size : (Block reserved area) + (1 byte content) = 3*8 + 1*8 = 32 bits = 4 bytes
     * Max block size : 2 ** 16 = 65535
     * 16 bits.
     * </pre>
     * @readonly
     * @type {Number}
     */
        set block_size(v) {
            if ((v < 32)||(v > 65535)) { throw new Error(`Block size must be between 32 and 65535, ${v} given`) }
            this.write(6, [v >> 8, v], [0xFF, 0xFF])
        }
        get block_size() { return this.read(6, [0xFF, 0xFF]).reduce((w, v, i, a) => { return w + (v << (a.length-1-i)*8)}, 0) }

    /**
     * Number of block available.
     * @type {Number}
     */
        get block_number() {
            if (!this._block_number_cached) { this._block_number_cached = Math.floor((this.size - Image.HEADER - this.table_size*this.table_entry)/this.block_size) }
            return this._block_number_cached
        }

    /**
     * Returns first unused block.
     * @readonly
     * @type {Block}
     * @throws {Error} No more block available
     */
        get block_unused() {
            for (let i = 1; i <= this.block_number; i++) { if (!this.block(i).used) { return this.block(i) } }
            throw new Error("No more block available")
        }

    /**
     * Returns free space depending on available blocks.
     * @readonly
     * @type {Number}
     */
        get free() {
            let used = 0
            this.sync(1)
            this.sync(false)
            for (let i = 1; i <= this.block_number; i++) { used += this.block(i).used }
            this.sync(true)
            return (this.block_number - used) * (this.block_size-3)
        }

    /**
     * <pre>
     * Read (and write if second argument is given) into a specific table entry.
     * You should always use this method to edit entries in image.
     * </pre>
     * <div class="alert danger">
     * Entry are indexed started from 1 (0 is reserved for root directory) !
     * </div>
     * @param {Number} n - Entry index
     * @param {Object} [data] - Data to write
     * @return {Entry} Table entry
     * @throws {Error} Entry out of bounds
     */
        entry(n, data) {
            if ((n < 1)||(n > this.table_size)) { throw new Error(`Entry ${n} out of bounds`) }
            return new Entry(this, n, Image.HEADER+(n-1)*this.table_entry, data)
        }

    /**
     * Returns first unused entry.
     * @readonly
     * @type {Entry}
     * @throws {Error} No more entry available
     */
        get entry_unused() {
            for (let i = 1; i <= this.table_size; i++) { if (this.entry(i).blank) { return this.entry(i) } }
            throw new Error("No more entry available")
        }

    /**
     * <pre>
     * Read (and write if second argument is given) into a specific block.
     * You should always use this method to edit blocks in image.
     * </pre>
     * @param {Number} n - Block index
     * @param {Object} [data] - Data to write
     * @return {Entry} Block
     * @throws {Error} Block out of bounds
     */
        block(n, data) {
            if (n < 1) { throw new Error(`Block ${n} out of bounds`) }
            return new Block(this, n, Image.HEADER+this.table_size*this.table_entry+(n-1)*this.block_size, data)
        }

    /**
     * Canvas width.
     * @protected
     * @type {Number}
     */
        get width() { return this.context.canvas.width }

    /**
     * Canvas height.
     * @protected
     * @type {Number}
     */
        get height() { return this.context.canvas.height }

    /**
     * Canvas image data.
     * @protected
     * @type {Number}
     */
        get data() { return this.image.data }

    /**
     * Returns writing index in ImageData instance (avoid alpha channel).
     * @param {Number} n - Byte index
     * @return {Number} ImageData index
     * @throws {Error} Index out of bounds
     */
        index(n) {
            n = Math.floor(4*n/3)
            if ((n < 0)||(n >= this._size)) { throw new Error(`Index ${n} out of bounds (size ${this._size})`) }
            return n
        }

    /**
     * <pre>
     * Synchronize data between Canvas image and ImageData.
     * If configured in output (direction = 0), ImageData will erase Canvas image.
     * If configured in input (direction = 1), Canvas image will erase ImageData.
     * If a boolean is given, it enables or disabled automatic synchronization during write and read operations.
     * </pre>
     * @param {Number|Boolean} [direction=0] - Direction or status
     * @param {Boolean} [force=false] - Force synchronization
     */
        sync(direction = 0, force = false) {
            //State
                if (typeof arguments[0] === "boolean") { this.sync_state = arguments[0] }
                if ((!this.sync_state)&&(!force)) { return }
            //Sync
                if (direction === 0) {
                    this.context.clearRect(0, 0, this.width, this.height)
                    this.context.putImageData(this.image, 0, 0)
                } else if (direction === 1) {
                    this.image = this.context.getImageData(0, 0, this.width, this.height)
                }
        }

    /**
     * Write bytes in ImageData.
     * @param {Number} n - Start index
     * @param {Number|Number[]} bytes - Byte(s) to write
     * @param {?(Number|Number[])} [masks=0xFF] - Binary mask(s)
     * @throws {Error} Index out of bounds
     */
        write(n, bytes, masks = 0xFF) {
            //Compatibility
                if (!Array.isArray(bytes)) { bytes = [bytes] }
                if (!Array.isArray(masks)) { masks = [masks] }

            //Writing
                bytes.map((byte, offset) => {
                    let mask = masks[offset]||0xFF
                    this.data[this.index(n+offset)] &= ~(mask)
                    this.data[this.index(n+offset)] |= (byte << Image.fset(mask)) & mask
                })

            //Synchronization
                this.sync(0)
        }

    /**
     * Read bytes on ImageData.
     * @param {Number|Number[]} n - Start index. May be specified as an array <span class="bold">[start, end (included)]</span>.
     * @param {?(Number|Number[])} [masks=0xFF] - Binary mask(s)
     * @throws {Error} Index out of bounds
     */
        read(n, masks = 0xFF) {
            //Synchronization
                this.sync(1)

            //Compatibility
                if (!Array.isArray(n)) { n = [n, Array.isArray(masks) ? n+masks.length-1 : n] }
                if (!Array.isArray(masks)) { masks = [masks] }

            //Reading
                let read = []
                for (let i = n[0]; i <= n[1]; i++) {
                    let mask = masks[i-n[0]]||0xFF
                    read.push((this.data[this.index(i)] & mask) >> Image.fset(mask))
                }
                return read.length === 1 ? read[0] : read
        }

    /**
     * Returns index of first set bit.
     * @param {Number} byte - Byte to test
     * @return {?Number} First set bit index (starting from LSB)
     */
        static fset(byte) {
            for (let i = 0; i < 8; i++) { if (byte & (1 << i)) { return i } }
            return null
        }

    /**
     * Check if image is an Image.
     * @param {Uint8ClampedArray} data - Image data
     * @return {Boolean} True if signature match
     */
        static isImage(data) {
            let index = Image.prototype.index.bind({_size:Infinity})
            return (data[index(0)] & 0b11110000) >> 4 === Image.SIGNATURE.IMAGE
        }

    /**
     * Open an image file according to its signature.
     * @param {CanvasRenderingContext2D} context - Context where image data is available
     * @return {Image} Instance of Image or its children
     */
        static open(context) {
            let data = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data
            if (PictureImage && Image.isPictureImage(data)) { return new PictureImage(context) }
            if (Image.isImage(data)) { return new Image(context) }
            return new Image(context)
        }
}

/**
 * List of signatures.
 * @memberof Image
 * @static
 * @const
 * @type {Number}
 */
    Image.SIGNATURE = {
        IMAGE:0b1100,
        PICTUREIMAGE:0b1101,
        UNKNOWN:0b1111,
        "0":$(".text-unimplemented").text(),
        "1":$(".text-unimplemented").text(),
        "2":$(".text-unimplemented").text(),
        "3":$(".text-unimplemented").text(),
        "4":$(".text-unimplemented").text(),
        "5":$(".text-unimplemented").text(),
        "6":$(".text-unimplemented").text(),
        "7":$(".text-unimplemented").text(),
        "8":$(".text-unimplemented").text(),
        "9":$(".text-unimplemented").text(),
        "10":$(".text-unimplemented").text(),
        "11":$(".text-unimplemented").text(),
        "12":$(".text-image").text(),
        "13":$(".text-picture").text(),
        "14":$(".text-unimplemented").text(),
        "15":$(".text-unknown").text(),
    }

/**
 * Image header size.
 * @memberof Image
 * @static
 * @const
 * @type {Number}
 * @default 8
 */
    Image.HEADER = 8

        
/**
 * Perform unit test.
 * @memberof {Image}
 */
    Image.prototype.test = function (data) {
        //Disable auto-sync
            this.sync(false)

        //General
            console.assert(this.size === this.width * this.height * 3, "Size mismatch", ` : expected ${this._size} instead of ${this.size}`)
            console.assert(this.crypted == data.crypted, "Crypted bit mismatch", ` : expected ${this.crypted} instead of ${data.crypted}`)
            console.assert(this.entry_name === data.name, "Entry name length mismatch", ` : expected ${this.entry_name} instead of ${data.name}`)
            console.assert(this.table_size === data.table, "Table size mismatch", ` : expected ${this.table_size} instead of ${data.table}`)
            console.assert(this.table_extended == data.extended, "Extended table option mismatch", ` : expected ${this.table_extended} instead of ${data.extended}`)
            console.assert(this.block_size === data.block, "Block size mismatch", ` : expected ${this.block_size} instead of ${data.block}`)

        //Unuses tests
            console.assert(this.entry_unused.id === 1, "First unused entry mismatch", ` : expected ${1} instead of ${this.entry_unused.id}`)
            console.assert(this.block_unused.id === 1, "First unused block mismatch", ` : expected ${1} instead of ${this.block_unused.id}`)

        //Entries
            for (let i = 1; i <= this.table_size; i++) {
                let f = this.entry(i)
                //Reduced set tests
                    console.assert(f.blank, `Entry ${i} status mismatch`, ` : expected ${true} instead of ${f.blank}`)
                    console.assert(f.type === Entry.FOLDER, `Entry ${i} type mismatch`, ` : expected ${Entry.FOLDER} instead of ${f.type}`)
                    console.assert(f.folder, `Entry ${i} type mismatch`, ` : expected ${true} instead of ${f.folder}`)
                    console.assert(!f.file, `Entry ${i} type mismatch`, ` : expected ${true} instead of ${!f.file}`)
                    console.assert(f.visibility === Entry.HIDDEN, `Entry ${i} visibility mismatch`, ` : expected ${Entry.HIDDEN} instead of ${f.visibility}`)
                    console.assert(f.hidden, `Entry ${i} visibility mismatch`, ` : expected ${true} instead of ${f.hidden}`)
                    console.assert(!f.visible, `Entry ${i} visibility mismatch`, ` : expected ${true} instead of ${!f.visible}`)
                    console.assert(f.owner === 0, `Entry ${i} owner mismatch`, ` : expected ${0} instead of ${f.owner}`)
                    console.assert(f.parent.id === Entry.BLANK, `Entry ${i} parent mismatch`, ` : expected ${Entry.BLANK} instead of ${f.parent}`)
                    console.assert(f.block.id === 0, `Entry ${i} block mismatch`, ` : expected ${0} instead of ${f.block}`)
                //Extended set tests
                    if (this.table_extended) {
                        console.assert(f.creation.y === Entry.DATE_OFFSET, `Entry ${i} creation date mismatch`, ` : expected ${Entry.DATE_OFFSET} instead of ${f.creation.y}`)
                        console.assert(f.creation.m === 0, `Entry ${i} creation date mismatch`, ` : expected ${0} instead of ${f.creation.m}`)
                        console.assert(f.creation.d === 0, `Entry ${i} creation date mismatch`, ` : expected ${0} instead of ${f.creation.d}`)
                        console.assert(f.creation.h === 0, `Entry ${i} creation date mismatch`, ` : expected ${0} instead of ${f.creation.h}`)
                        console.assert(f.creation.i === 0, `Entry ${i} creation date mismatch`, ` : expected ${0} instead of ${f.creation.i}`)
                        console.assert(f.creation.s === 0, `Entry ${i} creation date mismatch`, ` : expected ${0} instead of ${f.creation.s}`)
                        console.assert(f.edition.y === Entry.DATE_OFFSET, `Entry ${i} edition date mismatch`, ` : expected ${Entry.DATE_OFFSET} instead of ${f.edition.y}`)
                        console.assert(f.edition.m === 0, `Entry ${i} edition date mismatch`, ` : expected ${0} instead of ${f.edition.m}`)
                        console.assert(f.edition.d === 0, `Entry ${i} edition date mismatch`, ` : expected ${0} instead of ${f.edition.d}`)
                        console.assert(f.edition.h === 0, `Entry ${i} edition date mismatch`, ` : expected ${0} instead of ${f.edition.h}`)
                        console.assert(f.edition.i === 0, `Entry ${i} edition date mismatch`, ` : expected ${0} instead of ${f.edition.i}`)
                        console.assert(f.edition.s === 0, `Entry ${i} edition date mismatch`, ` : expected ${0} instead of ${f.edition.s}`)
                        console.assert(f.permissions.u.r == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.u.r}`)
                        console.assert(f.permissions.u.w == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.u.w}`)
                        console.assert(f.permissions.u.x == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.u.x}`)
                        console.assert(f.permissions.u.d == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.u.d}`)
                        console.assert(f.permissions.o.r == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.r}`)
                        console.assert(f.permissions.o.w == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.w}`)
                        console.assert(f.permissions.o.x == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.x}`)
                        console.assert(f.permissions.o.d == 0, `Entry ${i} permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.d}`)
                    }
                //Name and content tests
                    console.assert(f.name.length === 0, `Entry ${i} name mismatch`, ` : expected ${0} instead of ${f.name.length}`)
                    console.assert(f.content === null, `Entry ${i} content mismatch`, ` : expected ${null} instead of ${f.content}`)
            }

        //Blocks
            for (let i = 1; i <= this.block_number; i++) {
                let b = this.block(i)
                console.assert(!b.used, `Block ${i} status mismatch`, ` : expected ${true} instead of ${!b.used}`)
                console.assert(b.next.id === 0, `Block ${i} next mismatch`, ` : expected ${0} instead of ${b.next.id}`)
                console.assert(b.end === 1, `Block ${i} end mismatch`, ` : expected ${1} instead of ${b.end}`)
                console.assert(b.content.length === this.block_size-3, `Block ${i} content mismatch`, ` : expected ${this.block_size-3} instead of ${b.content.length}`)
            }

        //Entry tests
            let lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".substr(-this.block_size*4)
            let f = this.entry_unused, b = this.block_unused
            f.type = Entry.FILE
            f.visibility = Entry.VISIBLE
            f.owner = 0b011111
            f.parent = Entry.ROOT
            f.name = "X".repeat(this.entry_name)
            f.content = lorem
            if (this.table_extended) {
                f.creation = {y:2255, m:12, d:31, h:23, i:59, s:59}
                f.edition = {y:2001, m:1, d:1, h:1, i:1, s:1}
                f.permissions = {u:{r:1, w:1, x:1, d:0}, o:{r:1, w:0, x:0, d:1}}
            }

        //Reduced set tests
            console.assert(!f.blank, `Entry test status mismatch`, ` : expected ${false} instead of ${!f.blank}`)
            console.assert(f.file, `Entry test type mismatch`, ` : expected ${true} instead of ${f.file}`)
            console.assert(f.visible, `Entry test visibility mismatch`, ` : expected ${true} instead of ${f.visible}`)
            console.assert(f.owner === 0b011111, `Entry test owner mismatch`, ` : expected ${0b011111} instead of ${f.owner}`)
            console.assert(f.parent.root, `Entry test parent mismatch`, ` : expected ${true} instead of ${f.parent.root}`)
            console.assert(f.block.id === b.id, `Entry test block mismatch`, ` : expected ${b.id} instead of ${f.block.id}`)

        //Name and content tests
            console.assert(f.name.length === this.entry_name, `Entry test name length mismatch`, ` : expected ${this.entry_name} instead of ${f.name.length}`)
            console.assert(f.content === lorem, `Entry test content mismatch`, ` : expected ${lorem} instead of ${f.content}`)
            console.assert(this.entry_unused.id !== f.id, `First unused entry mismatch`, ` : expected ${this.entry_unused.id} different of ${f.id}`)
            console.assert(this.block_unused.id !== b.id, `First unused block mismatch`, ` : expected ${this.block_unused.id} different of ${b.id}`)

        //Extended set tests
            if (this.table_extended) {
                console.assert(f.creation.y === 2255, `Entry test creation date mismatch`, ` : expected ${2255} instead of ${f.creation.y}`)
                console.assert(f.creation.m === 12, `Entry test creation date mismatch`, ` : expected ${12} instead of ${f.creation.m}`)
                console.assert(f.creation.d === 31, `Entry test creation date mismatch`, ` : expected ${31} instead of ${f.creation.d}`)
                console.assert(f.creation.h === 23, `Entry test creation date mismatch`, ` : expected ${23} instead of ${f.creation.h}`)
                console.assert(f.creation.i === 59, `Entry test creation date mismatch`, ` : expected ${59} instead of ${f.creation.i}`)
                console.assert(f.creation.s === 59, `Entry test creation date mismatch`, ` : expected ${59} instead of ${f.creation.s}`)
                console.assert(f.edition.y === 2001, `Entry test edition date mismatch`, ` : expected ${1001} instead of ${f.edition.y}`)
                console.assert(f.edition.m === 1, `Entry test edition date mismatch`, ` : expected ${1} instead of ${f.edition.m}`)
                console.assert(f.edition.d === 1, `Entry test edition date mismatch`, ` : expected ${1} instead of ${f.edition.d}`)
                console.assert(f.edition.h === 1, `Entry test edition date mismatch`, ` : expected ${1} instead of ${f.edition.h}`)
                console.assert(f.edition.i === 1, `Entry test edition date mismatch`, ` : expected ${1} instead of ${f.edition.i}`)
                console.assert(f.edition.s === 1, `Entry test edition date mismatch`, ` : expected ${1} instead of ${f.edition.s}`)
                console.assert(f.permissions.u.r == 1, `Entry test permissions mismatch`, ` : expected ${1} instead of ${f.permissions.u.r}`)
                console.assert(f.permissions.u.w == 1, `Entry test permissions mismatch`, ` : expected ${1} instead of ${f.permissions.u.w}`)
                console.assert(f.permissions.u.x == 1, `Entry test permissions mismatch`, ` : expected ${1} instead of ${f.permissions.u.x}`)
                console.assert(f.permissions.u.d == 0, `Entry test permissions mismatch`, ` : expected ${0} instead of ${f.permissions.u.d}`)
                console.assert(f.permissions.o.r == 1, `Entry test permissions mismatch`, ` : expected ${1} instead of ${f.permissions.o.r}`)
                console.assert(f.permissions.o.w == 0, `Entry test permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.w}`)
                console.assert(f.permissions.o.x == 0, `Entry test permissions mismatch`, ` : expected ${0} instead of ${f.permissions.o.x}`)
                console.assert(f.permissions.o.d == 1, `Entry test permissions mismatch`, ` : expected ${1} instead of ${f.permissions.o.d}`)
            }

        //Second file test
            let g = this.entry_unused
            let fox = "The quick brown fox jumps over the lazy dog."
            g.data = {type:Entry.FILE, blank:false}
            g.content = fox
            console.assert(g.content === fox, `Entry test content mismatch`, ` : expected ${fox} instead of ${g.content}`)
            console.assert(f.content === lorem, `Entry test content mismatch`, ` : expected ${lorem} instead of ${f.content}`)


        //Deletition test
            f.blank = true
            console.assert(f.blank, `Entry test status mismatch`, ` : expected ${false} instead of ${f.blank}`)
            console.assert(this.entry_unused.id === f.id, `First unused entry mismatch`, ` : expected ${this.entry_unused.id} equal to ${f.id}`)
            console.assert(this.block_unused.id === b.id, `First unused block mismatch`, ` : expected ${this.block_unused.id} equal to ${b.id}`)

        //Enable auto-sync
            this.sync(true)
    }

        
class PictureImage extends Image {
    /**
     * <pre>
     * Image data structure.
     * It allows to easily manipulate bytes on a image to store data on it.
     * This is intended to work together with a basic interface as a file system.
     *
     * Unlike [Image]{@link Image}, this one can be used on top of an existing picture to achieve steganography.
     * </pre>
     * @param {CanvasRenderingContext2D} context - Canvas context
     * @param {Object} [data=null] - Format data (leave blank if you're loading an existing image)
     * @category images
     */
        constructor(context, data = null) {
            //Initialization
                super(context, data)
        }

    /**
     * Constructor name (unaccessible otherwise because of minification).
     * @type {String}
     * @const
     * @private
     * @override
     */
        get image_type() { return "PictureImage" }

    /**
     * <pre>
     * Format image.
     * This should only be called once and only by constructor.
     * If called while null is given, no formatting will be done.
     * </pre>
     * @private
     * @param {?Object} data - Format data
     */
        format(data) {
            //Disable auto-sync
                this.sync(false)
            //Format
                if (data !== null) {
                    //Clean used bits and save size
                        for (let i = 0; i < this.image.data.length; i++) { this.image.data[i] &= 0b11111100 }
                        if (this.image_type === "PictureImage") { this.size = this._size * 0.75 * 0.25 }
                }
            super.format(data)
        }

   /**
    * Returns writing index in ImageData instance (avoid alpha channel).
    * @param {Number} n - Byte index
    * @param {Boolean} [bits=false] - Byte's bits indexes
    * @return {Number|Set} ImageData index(es)
    * @throws {Error} Index out of bounds
    */
        index(n, bits = false, show) {
            //Byte index
                n =  Math.floor(16*n/3)
                if ((n < 0)||(n >= this._size)) { throw new Error(`Index ${n} out of bounds`) }
            //Bits index
                if (bits) {
                    let ix = new Set()
                    for (let i = n; ix.size < 4; i++) { ix.add(super.index(Math.floor((3*(i-1) + 5)/4))) }
                    return Array.from(ix).sort()
                }
            return n
        }

    /**
     * <pre>
     * Write bytes in ImageData.
     * This method has been adpated to write only of two LSB from each byte.
     * </pre>
     * @param {Number} n - Start index
     * @param {Number|Number[]} bytes - Byte(s) to write
     * @param {?(Number|Number[])} [masks=0xFF] - Binary mask(s)
     * @throws {Error} Index out of bounds
     * @override
     */
        write(n, bytes, masks = 0xFF) {
            //Compatibility
                if (!Array.isArray(bytes)) { bytes = [bytes] }
                if (!Array.isArray(masks)) { masks = [masks] }

            //Writing
                bytes.map((byte, offset) => {
                    let mask = masks[offset]||0xFF
                    byte = (byte << Image.fset(mask)) & mask
                    //Write on two LSB
                        this.index(n+offset, true).map((i, j) => {
                            let bits = (byte & (0b00000011 << (2*j))) >> (2*j)
                            let mskb = (mask & (0b00000011 << (2*j))) >> (2*j)
                            this.data[i] &= ~(mskb)
                            this.data[i] |= bits & mskb
                        })
                })

            //Synchronization
                this.sync(0)
        }

    /**
     * <pre>
     * Read bytes on ImageData.
     * This method has been adpated to write only of two LSB from each byte.
     * </pre>
     * @param {Number|Number[]} n - Start index. May be specified as an array <span class="bold">[start, end (included)]</span>.
     * @param {?(Number|Number[])} [masks=0xFF] - Binary mask(s)
     * @throws {Error} Index out of bounds
     * @override
     */
        read(n, masks = 0xFF) {
            //Synchronization
                this.sync(1)

            //Compatibility
                if (!Array.isArray(n)) { n = [n, Array.isArray(masks) ? n+masks.length-1 : n] }
                if (!Array.isArray(masks)) { masks = [masks] }

            //Reading
                let read = []
                for (let k = n[0]; k <= n[1]; k++) {
                    let mask = masks[k-n[0]]||0xFF, tmp = 0
                    this.index(k, true).map((i, j) => { tmp += (this.data[i] & 0b00000011) << (2*j) })
                    read.push((tmp & mask) >> Image.fset(mask))
                }
                return read.length === 1 ? read[0] : read
        }






        debug() {
            let img = new ImageData(this.width, this.height)
            for (let i = 0; i < this.data.length; i++) { img.data[i] = [0x00, 0xFF, 0xFF, 0xFF][this.data[i] & 0b00000011] }
            this.context.clearRect(0, 0, this.width, this.height)
            this.context.putImageData(img, 0, 0)
        }

    /**
     * Create a PictureImage from an Image. May be truncated if Image is bigger.
     * @param {Image} image - Original image
     */
        static fromImage(image) {
                image.sync(false)
            //Instantiate new image
                let picture = new PictureImage(image.context, {
                    crypted:image.crypted,
                    name:image.entry_name,
                    table:image.table_size,
                    extended:image.table_extended,
                    block:image.block_size
                })

            //Copying data
                picture.sync(false)
                picture.write(0, image.read(0, 0b00001111), 0b00001111)
                try { for (let n = 4; n < image.size; n++) { picture.write(n, image.read(n)) } } catch (e) {}
                picture.sync(0, true)
            return picture
        }
}

/**
 * Check if image is a PictureImage.
 * @param {Uint8ClampedArray} data - Image data
 * @return {Boolean} True if signature match
 * @memberof Image
 */
    Image.isPictureImage = function(data) {
        let index = PictureImage.prototype.index.bind({_size:Infinity}), tmp = 0
        index(0, true).map((i, j) => { tmp += (data[i] & 0b00000011) << (2*j) })
        return (tmp & 0b11110000) >> 4 === Image.SIGNATURE.PICTUREIMAGE
    }


        
class Interface {
    /**
     * Create an user interface to handle Image disks.
     * @param {Image} image - Used image disk
     * @param {DOMElement} context - Context
     * @param {Boolean} [init=false] - Initialize image with default files
     * @category interfaces
     */
        constructor(image, context, init = false) {
            this.context = $(context)
            this.image = image
            if (init) { this.init() }
            Interface.LAST_INSTANCE = this
        }

    /**
     * List entries in folder.
     * @param {Number} folder - Folder id
     * @return {Entry[]} Entries contained in folder
     */
        entries(folder) {
            this.image.sync(1)
            this.image.sync(false)
            let files = []
            for (let i = 1; i <= this.image.table_size; i++) {
                let f = this.image.entry(i)
                if ((!f.blank)&&(f.parent.id === folder)) { files.push(f) }
            }
            this.image.sync(true)
            return files
        }

    /**
     * Create a new entry.
     * @param {Object} entry - Entry data
     * @return {Number} Created entry id
     */
        create(entry) {
            //Initialization
                let f = this.image.entry_unused
                f.blank = false
            //Update dates and permissions
                if (this.image.table_extended) {
                    let d = new Date()
                    f.edition = f.creation = {y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate(), h:d.getHours(), i:d.getMinutes(), s:d.getSeconds()}
                    f.permissions =  {u:{r:1, w:1, x:1, d:1}, o:{r:1, w:0, x:1, d:0}}
                }
            //Sync data
                f.data = entry
                return f.id
        }

    /**
     * <pre>
     * Parse a path into an entry identifiant.
     * </pre>
     * @param {String} path - Path to parse
     * @param {Boolean} [type=Entry.FOLDER] Type of entry to get at the end
     * @param {String} [pwd=""] - Current directory path
     * @return {Number} Entry id
     * @throws {Error} ENOENT
     */
        path(path, type = Entry.FOLDER, pwd = "") {
            //Initialization
                let dir = Entry.ROOT
                if (/^\.\//.test(path)) { path = `/${pwd}/${path.replace(/^\.\//, "")}/` }
                let seg = `${path.charAt(0) === "/" ? "" : pwd}/${path}`.split("/").filter(p => p.length)
                this.image.sync(1)
                this.image.sync(false)
            //Parse path
                for (let i = 0; i < seg.length; i++) {
                    //Moving up
                        if (seg[i] === "..") {
                            if (dir !== Entry.ROOT) { dir = this.image.entry(dir).parent.id }
                            continue
                        }
                    //Search entry name in current directory
                        let entries = this.entries(dir).filter(entry => ((i < seg.length-1)&&(entry.folder))||((i === seg.length-1)&&(entry.type === type)))
                        let names = entries.map(entry => entry.name), j = names.indexOf(seg[i])
                    //Moving down
                        if (j >= 0) { dir = entries[j].id } else { throw new Error(`ENOENT : ${path.charAt(0) === "/" ? "" : pwd}/${path}`) }
                }
                this.image.sync(true)
                return dir
        }

    /**
     * Parse file content into a variables object.
     * @param {String} file - File path
     * @param {Boolean} [list=false] - If enabled, return an array containing list of parameters
     * @return {Object} Variables
     */
        parse(file, list = false) { try {
                let content = this.image.entry(this.path(file, Entry.FILE)).content, vars = list ? [] : {}
                ;(content.match(/.+$/gm)||[]).map(l => l.trim()).filter(l => (l.charAt(0) !== "#")).map(v => {
                    let splitted = v.match(/(.*?)=(.*)/)
                    if (splitted === null) { return }
                    if (list) { vars.push(splitted[1]) } else { vars[splitted[1]] = splitted[2] }
                })
                return vars
            } catch (e) { return list ? [] : {} }
        }

    /**
     * Update a parsable file content.
     * @param {String} file - File path
     * @param {Object} data - New variables values (will be created if non existant)
     */
        update_parsable(file, data) {
            file = this.image.entry(this.path(file, Entry.FILE))
            for (let i in data) {
                let reg = new RegExp("^"+i+"=.*?\n", "im")
                if (reg.test(file.content)) { file.content = file.content.replace(reg, data[i] === null ? "" : `${i}=${data[i]}\n`) }
                else { file.content += `${i}=${data[i]}\n` }
            }
        }

    /**
     * Path working directory as stored in env.conf.
     * @type {String}
     */
        get pwd() { return this.env.PWD||"/" }

    /**
     * List of environment variables.
     * @type {Object}
     */
        get env() { return this.parse(Interface.ENV) }

    /**
     * List of registered users along with their password.
     * @type {Object}
     */
        get users() { return this.parse(Interface.USERS) }

    /**
     * List of registered users.
     * @type {String[]}
     */
        get users_list() { return this.parse(Interface.USERS, true) }

    /**
     * Logged user id.
     * @type {Number}
     */
        get user() { return this.users_list.indexOf(this.env.USER) }


    /**
     * Create base folders and configurations files.
     */
        init() {
            //System folder
                let sys = this.create({
                    name:"system",
                    type:Entry.FOLDER,
                    owner:0,
                    parent:Entry.ROOT
                })

            //Env.conf
                this.create({
                    name:"env.conf",
                    type:Entry.FILE,
                    owner:0,
                    parent:sys,
                    content:"# Path working directory\nPWD=/home\n# Logged user\nUSER=guest\n# Home directory\nHOME=/home",
                })
            //Users.conf
                this.create({
                    name:"users.conf",
                    type:Entry.FILE,
                    owner:0,
                    parent:sys,
                    content:"root=alpine\nguest=\n",
                })
            //Home directory
                let home = this.create({
                    name:"home",
                    type:Entry.FOLDER,
                    owner:0,
                    parent:Entry.ROOT
                })
        }

    /**
     * <pre>
     * Eval a string.
     * </pre>
     * <div class="alert info">
     * Although <span class="bold">window</span> (global scope) is shadowed for first level code, it's actually still accessible by closures.
     * </div>
     * @param {String} str - String to be evalued
     * @param {undefined} [window] - Shadow window
     */
        static eval(str, window) {
            return eval(str)
        }

    /**
     * Format number of bytes.
     * @param {Number} n - Number of bytes
     * @return {String} Formatted output
     */
        static bytes_format(n) {
            let m = n.toExponential(2).match(/([.0-9]+)e(.+)$/)
            return `${(parseFloat(m[1])*100).toString().substr(0, 3)} ${["", "k", "M", "G", "T"][Math.floor((parseInt(m[2])-2)/3)]||""}B`
        }

    /**
     * Check privileges and throws an error if they're aren't enough.
     * @param {Entry} entry - Entry to check
     * @param {String} [p="r"] - Right to check (r, w, x or d)
     * @return {Interface} Self
     * @throws {Error} Not enough privileges to perform action
     */
        privileges(entry, p = "r") {
            if (typeof entry === "number") {
                if (entry === 0) { return this } else { entry = this.image.entry(entry) }
            }
            if ((this.admin_mode)||(!(entry instanceof Entry))) { return this }
            if (this.image.table_extended) {
                if (!entry.permissions[entry.owner === this.user ? "u" : "o"][p]) { throw new Error("Not enough privileges to perform action") }
            }
            return this
        }
}

/**
 * Env file default path.
 * @memberof Interface
 * @static
 * @const
 * @type {String}
 * @default "system/env.conf"
 */
    Interface.ENV = "system/env.conf"

/**
 * Users file default path.
 * @memberof Interface
 * @static
 * @const
 * @type {String}
 * @default "system/users.conf"
 */
    Interface.USERS = "system/users.conf"

/**
 * Home folder default path.
 * @memberof Interface
 * @static
 * @const
 * @type {String}
 * @default "home"
 */
    Interface.HOME = "home"

/**
 * Reference to last instance of Interface created.
 * @memberof Interface
 * @static
 * @type {Interface}
 */
    Interface.LAST_INSTANCE = null


        class GUI extends Interface {
            
/**
 * Create an graphic user interface to handle Image disks.
 * @param {Image} image - Used image disk
 * @param {DOMElement} context - Context
 * @param {Boolean} [init=false] - Initialize image with default files
 * @category interfaces
 */
    constructor(image, context, init) {
        super(image, context, init)
        //Context menu removal
            this.context.click(() => this.context.find(".context").remove()).contextmenu((ev) => ev.preventDefault())
        //Show desktop and open explorer
            this.gui_desktop()
            this.gui_list("/")
            this._gui_window_dragging()
    }

/**
 * Display Graphic User Interface desktop.
 */
    gui_desktop() {
        this._gui_icon("explorer", GUI.TEXT.EXPLORER).appendTo(this.context).click(() => this.gui_list("/"))
        this.gui_cmd()
        this.context.append("<br />")
        this.gui_sessions()
        this.gui_config()
        this.context.append("<br />")
        this.gui_image_manager()
        this.gui_image_steganography()
        this.context.append("<br />")
        this.gui_encrypt()

        this.context.contextmenu((ev) => {
            if ((ev.target.isSameNode($(this.context).get(0)))&&(!$(".app-controller .app-clippy").length)) {
                $(`<div class="app-clippy context"><div>${GUI.TEXT.CLIPPY}</div></div>`).hide().appendTo(this.context).fadeIn("fast")
            }
        })
    }

            
/**
 * Display an image.
 * @param {String} path - Path
 * @param {String} src - Source
 */
    gui_display(path, src) { try {
            let context = this.gui_window(path).addClass("app-windows-image").find(".app-windows-content")
            $(`<img>`).appendTo(context).on("error", () => { this.gui_error(new Error("An error occured when trying to open this file as an image file.")) }).attr("src", src)
        } catch (e) { this.gui_error(e) }
    }

/**
 * Edit a file content.
 * @param {String} path - Path
 * @param {String} content - Entry content
 */
    gui_edit(path, content) { try {
        //Content sync
            let context = this.gui_window(path).addClass("app-windows-editor")
            context.find(".app-windows-content").html(`${content.trim().replace(/\n/g, "<br>")}`).prop("contenteditable", true).keypress((ev) => {
                if(ev.which === 13) { ev.preventDefault() ; if (window.getSelection) {
                    let sel = window.getSelection() ; let range = sel.getRangeAt(0), br = document.createElement("br"), text = document.createTextNode("\u00a0")
                    range.deleteContents() ; range.insertNode(br); range.collapse(false)
                    range.insertNode(text); range.selectNodeContents(text)
                    sel.removeAllRanges(); sel.addRange(range)
                    return false
            }   }   })
        //Save event
            let save = $(`<div class="app-windows-save"><img src="${GUI.ICONS.SAVE}"></div>`).appendTo(context.find(".app-windows-bar"))
            save.click(() => { try {
                let txt = $("<div></div>").html(context.find(".app-windows-content").html().replace(/<br\s*[\/]?>/gi, "\n")).text()
                let entry = this.image.entry(this.path(path, Entry.FILE))
                this.privileges(entry, "w")
                entry.content = txt
            } catch (e) { this.gui_error(e) } })
        } catch (e) { this.gui_error(e) }
    }

/**
 * Play an audio file.
 * @param {String} path - Path
 * @param {String} src - Source
 */
    gui_play(path, src) { try {
            let content = this.gui_window(path).addClass("app-windows-audio").find(".app-windows-content")
            $(`<audio autoplay controls>${$(".text-no-audio").text()}</audio>`).appendTo(content)
            .on("error", () => { this.gui_error(new Error("An error occured when trying to open this file as an audio file.")) }).attr("src", src)
        } catch (e) { this.gui_error(e) }
    }

/**
 * Execute a script file.
 * @param {String} str - String to be evalued
 */
    gui_execute(str) { try {
            return Interface.eval.call(this, str)
        } catch (e) { this.gui_error(e) }
    }

            
/**
 * Display encryption tool interface.
 */
    gui_encrypt() {
        //Icon
            this._gui_icon("encryption", GUI.TEXT.ENCRYPTION).appendTo(this.context).click(() => {
                //Check status
                    if (!Lowlight.Random) { return this.gui_error(new Error("This feature isn't available (Missing script)")) }
                    if ($(".app-encryption-key").length) { return }
                //Encryption tool
                    let content = this.gui_window(GUI.TEXT.ENCRYPTION_TOOL).addClass("app-input").find(".app-windows-content")
                    content.append(`<table>
                        <tr><td>${GUI.TEXT.ENCRYPTION_KEY}</td><td class="app-encryption-key" contenteditable="true"></td></tr>
                        <tr><td colspan="2" class="app-encryption-msg"></td></tr>
                        <tr><td colspan="2">
                            <button class="app-encryption-encrypt">${GUI.TEXT.ENCRYPTION_ENCRYPT}</button>
                            <button class="app-encryption-decrypt">${GUI.TEXT.ENCRYPTION_DECRYPT}</button>
                        </td></tr>
                    </table>`)
                //Add user inputs
                    content.find(this.image.crypted ? ".app-encryption-encrypt" : ".app-encryption-decrypt").hide()
                    content.find(".app-encryption-encrypt").click(() => $(".app-encryption-msg").text(this._gui_encrypt($(".app-encryption-key").text(), +1)))
                    content.find(".app-encryption-decrypt").click(() => $(".app-encryption-msg").text(this._gui_encrypt($(".app-encryption-key").text(), -1)))
            })
    }

/**
 * Utilitary method to encrypt/decrypt an imafe
 * @param {String} key - Encryption/Decryption key
 * @param {Number} [sign=1] - Encryption order
 * @private
 */
    _gui_encrypt(key, sign = 1) { try {
            //Retrieving key
                $(".app-encryption-msg").empty()
                if (!key.length) { return GUI.TEXT.ENCRYPTION_MISSING_KEY }
            //Encrypt data
                let gen = new Lowlight.Random.Distribution.Uniform(0, 256).seed(key)
                this.image.sync(false) ; this.image.sync(1, true)
            //Draw image on context
                let ctx = this.image.context
                ctx.fillStyle = 0
                ctx.fillRect(0, 0, this.width, this.height)
                for (let i = 4; i < this.image.size; i++) {
                    this.image.write(i, (((this.image.read(i) + sign * Math.floor(gen.next()))%256)+256)%256)
                }
                this.image.crypted = sign > 0
                this.image.sync(0, true) ; this.image.sync(true)
                $(".app-encryption-encrypt, .app-encryption-decrypt").toggle()
                return this.image.crypted ? GUI.TEXT.ENCRYPTION_SUCCESS : GUI.TEXT.DECRYPTION_SUCCESS
        } catch (e) { this.gui_error(e) }
    }

            
/**
 * Remove an rentry.
 * @param {Entry} entry - Entry to remove
 * @param {DOMElement} figure - Associated icon
 */
    gui_delete(entry, figure) { try {
        //Iterative removal of folders and subfolders
            this.cmd_remove(entry)
            figure.remove()
        } catch (e) { this.gui_error(e) }
    }

/**
 * Allow user to rename an entry.
 * @param {Entry} entry - Entry to rename
 * @param {DOMElement} figure - Icon associated to current entry
 * @param {DOMElement} context - Current context
 */
    gui_rename(entry, figure, context) { try {
            let name = figure.find("figcaption").text()
            if (entry.name === name) { return }
            entry.name = name
            figure.remove()
            this.gui_icon(entry, context)
        } catch (e) { this.gui_error(e) }
    }

/**
 * Create a new folder.
 * @param {String} path - Folder to remove
 * @param {DOMElement} context - Associated context (current window)
 */
    gui_mkdir(path, context) { try {
            let id = this.cmd_mkentry(`${path}/${$(".text-new-folder").text()}`, "", Entry.FOLDER)
            this.gui_icon(this.image.entry(id), context)
        } catch (e) { this.gui_error(e) }
    }

/**
 * Create a new file.
 * @param {String} path - Path to where create new file
 * @param {DOMElement} context - Current context
 */
    gui_mkfile(path, context) { try {
            //Prepare new file
                let name = $(".text-new-file").text(), parent = this.path(path), id = null
            //Check if files already exists
                try { this.path(`${path}/${name}`, Entry.FILE) } catch (e) { id = this.create({name, parent, type:Entry.FILE, owner:this.user}) }
                if (id !== null) { this.gui_icon(this.image.entry(id), context) ; return id }
                else { throw new Error(`Couldn't create file ${path}/${name}`) }
        } catch (e) { this.gui_error(e) }
    }

/**
 * Move entry to another folder.
 * @param {Entry} entry - Entry to move
 * @param {DOMElement} figure - Icon associated to current entry
 * @param {DOMElement} context - Current context (allows to know pwd and to refresh icon)
 */
    gui_move(entry, figure, context) {
        //Entry mover manager
            let content = this.gui_window($(".text-move-to").text()).addClass("app-input").find(".app-windows-content")
            content.append(`<table>
                <tr><td>${GUI.TEXT.MOVE_TO}</td><td class="app-move-to-path" contenteditable="true"></td></tr>
                <tr><td colspan="2" class="app-move-to-msg"></td></tr>
                <tr><td colspan="2"><button class="app-move-to-validate">${GUI.TEXT.VALIDATE}</button></td></tr>
            </table>`)
        //Add user inputs
            content.find(".app-move-to-validate").click(() => { try {
                    //Resolve path (check if path already exists)
                        let path = content.find(".app-move-to-path").text().trim(), pwd = context.find(".app-windows-title").text()+"/"
                        if (/^\.\//.test(path)) { path = path.replace(/^\.\//, pwd) } else { path = "/"+path }
                        try { this.path(path, entry.type, pwd) }
                    //Move entry into new path
                        catch (ee) { this._gui_move(path, entry, figure, content, context) }
                        content.find(".app-move-to-msg").text(GUI.TEXT.INVALID_PATH)
                } catch (e) { this.gui_error(e) }
            })
    }

/**
 * Move entry to another folder.
 * <div class="alert warning">
 * Originally, it was inside [gui_move]{@link GUI#gui_move} method but Babili seems to have problems with multiple nested try-catch statements (resulting in "identifier has already been declared")
 * </div>
 * @param {String} path - Path
 * @param {Entry} entry - Entry to move
 * @param {DOMElement} figure - Icon associated to current entry
 * @param {DOMElement} content - Context content div
 * @param {DOMElement} context - Current context (allows to know pwd and to refresh icon)
 * @private
 */
    _gui_move(path, entry, figure, content, context) {
        let name = path.match(/\/([a-zA-Z.0-9]+)$/)[1]
        try {
            let parent = this.path(path.replace(new RegExp(name+"$"), "") )
            entry.name = name ; entry.parent = parent
            content.parent().remove() ; figure.remove()
            if (this.path(pwd) === parent) { this.gui_icon(entry, context) }
        } catch (ee) { }
    }

            
/**
 * <pre>
 * Create a new icon for an entry.
 * Display according icon depending on its extension and create associated callbacks.
 * Also create context menu for it.
 * </pre>
 * @param {Entry} entry - Entry which need a new icon
 * @param {DOMElement} context - Context where to add icon
 */
    gui_icon(entry, context) { try {
        //DOM element
            let figure = this._gui_icon("file-misc", entry.name).appendTo(context.find(".app-windows-content"))
            if (entry.hidden) { figure.addClass("app-entry-hidden") }

        //File extension app link
            if (entry.file) {
                if (/\.(?:jpeg|jpg|gif|png|apng|svg|bmp|ico)$/.test(entry.name)) {
                    figure.find("img").attr("src", GUI.ICONS.IMG)
                    figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry).gui_display(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                } else
                if (/\.(?:mp3|mpeg|ogg|wav)$/.test(entry.name)) {
                    figure.find("img").attr("src", GUI.ICONS.AUDIO)
                    figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry).gui_play(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                } else
                if (/\.txt$/.test(entry.name)) {
                    figure.find("img").attr("src", GUI.ICONS.TEXT)
                    figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry).gui_edit(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                } else
                if (/\.conf$/.test(entry.name)) {
                    figure.find("img").attr("src", GUI.ICONS.CONF)
                    figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry).gui_edit(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                }
                if (/\.cmd$/.test(entry.name)) {
                    figure.find("img").attr("src", GUI.ICONS.CMD)
                    figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry, "x").gui_execute(entry.content) } catch (e) { this.gui_error(e) } })
                }
        //Folder link
            } else if (entry.folder) {
                figure.find("img").attr("src", this.entries(entry.id).length ? GUI.ICONS.FOLDER_FILES : GUI.ICONS.FOLDER_EMPTY)
                figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry, "r").gui_list(entry.path, context) } catch (e) { this.gui_error(e) } })
            }

        //Add context menu
            figure.contextmenu((ev) => {
                //Add context menu and remove old ones
                    ev.preventDefault()
                    ev.stopPropagation()
                    this.context.click()
                    let local = {x:parseInt(ev.pageX - this.context.offset().left), y:parseInt(ev.pageY - this.context.offset().top)}
                    let menu = $(`<ul class="context">
                        <li>${GUI.TEXT.OPEN_WITH}</li>
                        <li>${GUI.TEXT.RENAME}</li>
                        <li>${GUI.TEXT.REMOVE}</li>
                        <li>${GUI.TEXT.MOVE_TO}</li>
                        <li>${GUI.TEXT.PROPERTIES}</li>
                    </ul>`).appendTo(this.context)
                    if (local.x > GUI.WIDTH*GUI.INVERT_CONTEXT) { menu.css("right", GUI.WIDTH-local.x) } else { menu.css("left", local.x) }
                    if (local.y > GUI.HEIGHT*GUI.INVERT_CONTEXT) { menu.css("bottom", GUI.HEIGHT-local.y) } else { menu.css("top", local.y) }
                //Open process (altered for files)
                    if (entry.folder) {
                        menu.find("li:nth-child(1)").text($(".text-open-directory").text()).click(() => figure.click())
                    } else {
                        menu.find("li:nth-child(1)").hover(() => {
                            let submenu = $(`<ul class="context subcontext">
                                <li>${GUI.TEXT.OPEN_WITH_TEXT}</<li>
                                <li>${GUI.TEXT.OPEN_WITH_IMAGE}</<li>
                                <li>${GUI.TEXT.OPEN_WITH_AUDIO}</<li>
                                <li>${GUI.TEXT.OPEN_WITH_CMD}</<li>
                            </ul>`).appendTo(menu.find("li:nth-child(1)")).css("top", 0).css("left", menu.width())
                            submenu.find("li:nth-child(1)").click((ev) => { try { this.privileges(entry).gui_edit(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                            submenu.find("li:nth-child(2)").click((ev) => { try { this.privileges(entry).gui_display(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                            submenu.find("li:nth-child(3)").click((ev) => { try { this.privileges(entry).gui_play(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                            submenu.find("li:nth-child(4)").click((ev) => { try { this.privileges(entry).gui_execute(entry.content) } catch (e) { this.gui_error(e) } })
                        }, () => $("ul.context.subcontext").remove())
                    }
                //Rename process
                    menu.find("li:nth-child(2)").click(() => { try {
                        //Figcaption edition
                            this.privileges(entry, "w")
                            let caption = figure.find("figcaption")
                            caption.focusout(() => { caption.prop("contenteditable", false), this.gui_rename(entry, figure, context) })
                                   .keypress((ev) => { if (ev.which === 13) { caption.focusout() } })
                                   .prop("contenteditable", true).focus()
                        //Selection range
                            let range = document.createRange() ; range.selectNodeContents(caption.get(0))
                            let sel = window.getSelection() ; sel.removeAllRanges() ; sel.addRange(range)
                    } catch (e) { this.gui_error(e) } })
                //File deletion, move, properties processes
                    menu.find("li:nth-child(3)").click((ev) => { try { this.privileges(entry, "d").gui_delete(entry, figure) } catch (e) { this.gui_error(e) } })
                    menu.find("li:nth-child(4)").click((ev) => { try { this.privileges(entry, "w").gui_move(entry, figure, context) } catch (e) { this.gui_error(e) } })
                    menu.find("li:nth-child(5)").click((ev) => { try { this.gui_properties(entry) } catch (e) { this.gui_error(e) } })
            })
            return figure
        } catch (e) { this.gui_error(e) }
    }


/**
 * <pre>
 * Create a new DOM Element icon without events.
 * Not directly added to DOM, needs to be done manually.
 * </pre>
 * @param {String} src - Icon source
 * @param {String} title - Figcaption content
 * @private
 */
    _gui_icon(src, title) { return $(`
        <figure>
            <img src="${GUI.ICONS._DIR}${src}.png">
            <figcaption>${title}</figcaption>
        </figure>`)
    }


/**
 * <pre>
 * List entries of a directory.
 * Will display interactive icons of each entry.
 * Also update contextual menu for current window.
 * </pre>
 * @param {String} [path=this.pwd] - Path to directory
 * @param {DOMElement} [context] - Current context (window). If not defined, a new one will be created
 */
    gui_list(path = this.pwd, context) { try {
            if (this.image.crypted) { throw new Error("Image is encrypted") }
        //Retrieving directory id
            let folder = this.path(path, Entry.FOLDER)
        //Retrieving context
            if (context === undefined) {
                //Create a new context window
                    context = this.gui_window(path).attr("data-path", path)
                    context.find(".app-windows-content").contextmenu((ev) => {
                        //Add context menu and remove old ones
                            ev.preventDefault()
                            this.context.click()
                            let local = {x:parseInt(ev.pageX - this.context.offset().left), y:parseInt(ev.pageY - this.context.offset().top)}
                            let menu = $(`
                                <ul class="context">
                                    <li>${GUI.TEXT.MK_NEW_FILE}</li>
                                    <li>${GUI.TEXT.MK_NEW_FOLDER}</li>
                                    <li>${GUI.TEXT.SHOW_HIDDEN}</li>
                                    <li>${GUI.TEXT.PROPERTIES}</li>
                                </ul>
                            `).appendTo(this.context)
                            if (local.x > GUI.WIDTH*GUI.INVERT_CONTEXT) { menu.css("right", GUI.WIDTH-local.x) } else { menu.css("left", local.x) }
                            if (local.y > GUI.HEIGHT*GUI.INVERT_CONTEXT) { menu.css("bottom", GUI.HEIGHT-local.y) } else { menu.css("top", local.y) }
                        //Add user events
                            let lpath = context.attr("data-path"), npath = this.path(lpath)
                            menu.find("li:nth-child(1)").click((ev) => { try { this.privileges(npath, "w").gui_mkfile(lpath, context) } catch (e) { this.gui_error(e) } })
                            menu.find("li:nth-child(2)").click((ev) => { try { this.privileges(npath, "w").gui_mkdir(lpath, context) } catch (e) { this.gui_error(e) } })
                            menu.find("li:nth-child(3)").click((ev) => { context.attr("data-hidden", context.attr("data-hidden") == "show" ? "hidden" : "show") })
                            menu.find("li:nth-child(4)").click((ev) => { try { this.gui_properties(this.image.entry(npath)) } catch (e) { this.gui_error(e) } })
                            if (npath == 0) { menu.find("li:nth-child(4)").remove() }
                    })
            }
        //Update path directory and clean icons
            let content = context.attr("data-path", path).find(".app-windows-title").text(path).end().find("figure").remove().end().find(".app-windows-content")
        //Add entries icons (and parent directory if not root)
            let entries = this.entries(folder)
            if (folder !== Entry.ROOT) { this._gui_icon("folder-parent", "../").appendTo(content).click(() => { try { this.gui_list(this.image.entry(folder).parent.path, context) } catch (e) { this.gui_error(e) } }) }
            entries.sort((a, b) => {
                if ((a.folder)&&(!b.folder)) { return -1 }
                if ((!a.folder)&&(b.folder)) { return +1 }
                return a.name > b.name
            })
            entries.map(entry => this.gui_icon(entry, context))
        } catch (e) { this.gui_error(e) }
    }

            
/**
 * Allow users to upload their own image.
 */
    gui_image_manager() {
        //Prepare input
            let input = $(`<input type="file" name="app-load-image" />`).attr("data-app-icon", "dload").appendTo(this.context)
            input.on("change", (ev) => this._gui_load_image(ev, () => Image.open($(".app-view canvas").get(0).getContext("2d"))))

        //Icon
            this._gui_icon("image-manager", GUI.TEXT.IMAGE_MANAGER).appendTo(this.context).click((ev) => { ev.stopPropagation() ; input.click() })
    }

/**
 * Allow users to create an image with steganography.
 */
    gui_image_steganography() {
        //Prepare input
            let input = $(`<input type="file" name="app-load-image" />`).appendTo(this.context)
            input.on("change", (ev) => this._gui_load_image(ev, (img) => PictureImage.fromImage(this.image)))

        //Icon
            let icon = this._gui_icon("image-steganography", GUI.TEXT.IMAGE_MANAGER_STEGANO).appendTo(this.context).click((ev) => { ev.stopPropagation()
                if ($(".app-steganography").length) { return }
            //Steganography tool
                let content = this.gui_alert(GUI.TEXT.STEGANOGRAPHY_TOOL, GUI.TEXT.STEGANOGRAPHY_INFO, () => { input.click() }).addClass("app-steganography")
            })
    }


/**
 * Utilitary method to help loading user uploaded images.
 * @param {Event} ev - Event data
 * @param {Function} callback - Callback when uploaded file is available
 * @private
 */
    _gui_load_image(ev, callback) { try {
            let open = (img) => {
                //Draw image on context
                    let ctx = this.image.context
                    ctx.canvas.width = img.width ; ctx.canvas.height = img.height
                    ctx.fillStyle = 0 ; ctx.fillRect(0, 0, img.width, img.height) ; ctx.drawImage(img, 0, 0)
                //Callback
                    let image = callback()
                //Reset interface
                    this.context.empty()
                    new GUI(image, $(".app-controller").get(0))
            }
        //Retrieve uploaded file
            let file = $(ev.target).get(0).files[0]
            if (file.size > 2000000) { throw new Error("Image too big") }
            if ((FileReader)&&(file)) {
                let fr = new FileReader()
                fr.onload = () => { let img = $("<img>").attr("src", fr.result).on("load", () => open(img.get(0))) }
                fr.readAsDataURL(file)
            } else { throw new Error("Invalid file or missing FileReader") }
        } catch (e) { this.gui_error(e) }
    }

            
/**
 * Display entry's properties in a new window.
 * @param {Entry} entry - Entry
 */
    gui_properties(entry) { try {
        //Basic properties
            let table = $(`<table>
                <tr><td>${GUI.TEXT.NAME}</td><td>${entry.name}</td></tr>
                <tr><td>${GUI.TEXT.PARENT}</td><td>${entry.parent.name}</td></tr>
                <tr><td>${GUI.TEXT.BLOCK}</td><td>${entry.block.id}</td></tr>
                <tr><td>${GUI.TEXT.SIZE}</td><td>${entry.file ? Interface.bytes_format(entry.blocks.length * this.image.block_size) : "-"}</td></tr>
                <tr><td>${GUI.TEXT.TYPE}</td><td>${entry.file ? GUI.TEXT.FILE : GUI.TEXT.FOLDER }</td></tr>
                <tr><td>${GUI.TEXT.VISIBILITY}</td><td>${entry.visible ? GUI.TEXT.VISIBLE : GUI.TEXT.HIDDEN}</td></tr>
                <tr><td>${GUI.TEXT.OWNER}</td><td>${this.users_list[entry.owner]}</td></tr>
            </table>`)

        //Extended properties
            if (this.image.table_extended) {
                let creation = entry.creation, edition = entry.edition, permissions = entry.permissions
                table.append(`
                    <tr><td>${GUI.TEXT.CREATION}</td><td>${`${creation.d}/${creation.m}/${creation.y}, ${creation.h}:${creation.m}:${creation.s}`}</td></tr>
                    <tr><td>${GUI.TEXT.EDITION}</td><td>${`${edition.d}/${edition.m}/${edition.y}, ${edition.h}:${edition.m}:${edition.s}`}</td></tr>
                    <tr><td colspan="2"><table class="app-entry-properties-permissions">
                        <tr><th>${GUI.TEXT.PERMISSIONS}</th><th>${GUI.TEXT.PERMISSIONS_OWNER}</th><th>${GUI.TEXT.PERMISSIONS_OTHERS}</th></tr>
                        <tr><td>${GUI.TEXT.PERMISSIONS_R}</td>
                            <td>${permissions.u.r ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td>
                            <td>${permissions.o.r ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td></tr>
                        <tr><td>${GUI.TEXT.PERMISSIONS_W}</td>
                            <td>${permissions.u.w ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td>
                            <td>${permissions.o.w ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td></tr>
                        <tr><td>${GUI.TEXT.PERMISSIONS_X}</td>
                            <td>${permissions.u.x ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td>
                            <td>${permissions.o.x ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td></tr>
                        <tr><td>${GUI.TEXT.PERMISSIONS_D}</td>
                            <td>${permissions.u.d ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td>
                            <td>${permissions.o.d ? GUI.TEXT.PERMISSIONS_Y : GUI.TEXT.PERMISSIONS_N}</td></tr>
                    </table></td></tr>`)
            }
            //Create properties window
                this.gui_window(GUI.TEXT.PROPERTIES).addClass("app-entry-properties").find(".app-windows-content").append(table)
        } catch (e) { throw e; this.gui_error(e) }
    }

/**
 * Display image properties.
 */
    gui_config() {
        //Icon
            let config = this._gui_icon("config", GUI.TEXT.CONFIG).attr("data-app-icon", "dstat").appendTo(this.context)

        //Create properties window
            config.click(() => { try {
                if ($(".app-disk-properties").length) { return }
                let table = $(`<table>
                    <tr><td>${GUI.TEXT.CONFIG_SIGNATURE}</td>
                        <td>${this.image.signature}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_CRYPTED}</td>
                        <td>${this.image.crypted ? GUI.TEXT.CONFIG_Y : GUI.TEXT.CONFIG_N}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_SIZE}</td>
                        <td>${Interface.bytes_format(this.image.size)}</td></tr>
                </table>`)

                //Append window
                    this.gui_window(GUI.TEXT.PROPERTIES).addClass("app-disk-properties").find(".app-windows-content").append(table)

                if (!this.image.crypted) {
                    $(`<tr><td>${GUI.TEXT.CONFIG_USED}</td>
                        <td>${Interface.bytes_format(this.image.size - this.image.free)}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_FREE}</td>
                        <td>${Interface.bytes_format(this.image.free)}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_WIDTH}</td>
                        <td>${this.image.width}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_HEIGHT}</td>
                        <td>${this.image.height}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_TABLE_SIZE}</td>
                        <td>${this.image.table_size}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_TABLE_EXTENDED}</td>
                        <td>${this.image.table_extended ? GUI.TEXT.CONFIG_Y : GUI.TEXT.CONFIG_N}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_ENTRY_NAME}</td>
                        <td>${this.image.entry_name}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_BLOCK_SIZE}</td>
                        <td>${Interface.bytes_format(this.image.block_size)}</td></tr>
                    <tr><td>${GUI.TEXT.CONFIG_BLOCK_NUMBER}</td>
                        <td>${this.image.block_number}</td></tr>`).appendTo(table)
                }
         } catch (e) { this.gui_error(e) } })
    }

            
/**
 * Create sessions manager interface.
 */
    gui_sessions() {
        //Sessions icon
            let sessions = this._gui_icon("sessions", GUI.TEXT.SESSIONS).appendTo(this.context)
        //Sessions opening
            sessions.click(() => {
                //Create session windows
                    if ($(".app-sessions").length) { return }
                    try {
                        let content = this.gui_window(GUI.TEXT.SESSIONS).addClass("app-sessions").find(".app-windows-content")
                        content.append(`<table>
                            <tr><td colspan="2">${GUI.TEXT.LOGGED_AS.replace("%s", this.env.USER)}</td></tr>
                            <tr><td>${GUI.TEXT.SESSIONS_USER}</td><td class="app-sessions-user" contenteditable="true"></td></tr>
                            <tr><td class="app-sessions-">${GUI.TEXT.SESSIONS_PASSWORD}</td><td class="app-sessions-password" contenteditable="true"></td></tr>
                            <tr><td colspan="2" class="app-sessions-msg"></td></tr>
                            <tr><td colspan="2">
                                <button class="app-sessions-remove">${GUI.TEXT.SESSIONS_REMOVE}</button>
                                <button class="app-sessions-create">${GUI.TEXT.SESSIONS_CREATE}</button>
                                <button class="app-sessions-login">${GUI.TEXT.SESSIONS_LOGIN}</button>
                            </td></tr></table>`)
                //User input events
                    $(".app-sessions-remove, .app-sessions-login, .app-sessions-create").hide()
                    content.find(".app-sessions-user, .app-sessions-password").keyup((ev) => this._gui_sessions((user) => {
                        //Check user
                            this.image.sync(false)
                            if (this.users_list.indexOf(user) >= 0) {
                                $(".app-sessions-remove, .app-sessions-login").addClass("disabled").show()
                                if (this.users[user] === $(".app-sessions-password").text()) { $(".app-sessions-remove, .app-sessions-login").removeClass("disabled") }
                            } else { $(".app-sessions-create").show() }
                            this.image.sync(true)
                    }))

                //User removal
                    content.find(".app-sessions-remove").click(() => this._gui_sessions((user) => {
                        //Remove user from text file
                            let users = this.image.entry(this.path(Interface.USERS, Entry.FILE))
                            users.content = users.content.replace(new RegExp(`${user}=.*?\n`, "i"), "")
                    }, "remove"))
                //User creation
                    content.find(".app-sessions-create").click(() => this._gui_sessions((user) => {
                            //Create user
                                this.image.entry(this.path(Interface.USERS, Entry.FILE)).content += `${user}=${$(".app-sessions-password").text()}\n`
                    }, "create"))
                //User login
                    content.find(".app-sessions-login").click(() => this._gui_sessions((user) => {
                        //Update env files
                            if ((this.users_list.indexOf(user) >= 0)&&(this.users[user] === $(".app-sessions-password").text())) {
                                    let env = this.image.entry(this.path(Interface.ENV, Entry.FILE))
                                    env.content = env.content.replace(/USER=.*?\n/i, `USER=${user}\n`)
                            }
                    }, "login"))
                } catch (e) { this.gui_error(e) }
            })
    }

/**
 * Execute session manager command sequence.
 * @ignore
 * @param {Function} callback - Body method
 * @param {String} [action] - Action name
 * @private
 */
    _gui_sessions(callback, action) { try {
        //Check user infos
            let user = $(".app-sessions-user").text().trim()
            if (user.length == 0) { return }
        //Refresh interface
            $(".app-sessions-remove, .app-sessions-login, .app-sessions-create").hide()
            callback(user)
        //Show result
            if (action) {
                $(".app-sessions-msg").text(GUI.TEXT[`SESSIONS_${action}_DONE`].replace("%s", user))
                $(".app-sessions-user, .app-sessions-password").empty()
            } else { $(".app-sessions-msg").empty() }
       } catch (e) { this.gui_error(e) }
    }

/**
 * Tell if logged user is admin.
 * @type {Boolean} 
 */
    get admin_mode() {
        return this.user === 0
    }

            
/**
 * Evaluate a command.
 * @param {String} line - User input
 * @param {DOMElement} ul - Unordered List
 * @private
 */
    _gui_cmd_eval(line, ul) {
        let args = line.split(" ").filter(a => a.length), li = $("<li></li>"), tmp, id, text, entry, type, ext, p, txt, name, parent, all, size, ctx
        try {
            switch (args[0]) {
                //System
                    case "pwd": li.text(this.pwd); break
                    case "env": li.text(this.image.entry(this.path(Interface.ENV, Entry.FILE)).content); break
                    case "whoami": li.text(`${this.env.USER} (user n° ${this.user})`); break
                //Application
                    case "explorer": this.gui_list(args[1]||this.pwd); break
                    case "terminal": $(".app-controller [data-app-icon=cmd]").click(); break
                    case "edit": this.gui_edit(args[1], this.image.entry(this.path(args[1], Entry.FILE, this.pwd)).content); break
                    case "play": this.gui_play(args[1], this.image.entry(this.path(args[1], Entry.FILE, this.pwd)).content); break
                    case "display": this.gui_display(args[1], this.image.entry(this.path(args[1], Entry.FILE, this.pwd)).content); break
                    case "exec": this.gui_execute(this.image.entry(this.path(args[1], Entry.FILE, this.pwd)).content); break
                //Simple entry update
                    case "cd": id = this.path(args[1]||this.env.HOME, Entry.FOLDER, this.pwd) ; this.update_parsable(Interface.ENV, {PWD:id < 1 ? "/" : this.image.entry(id).path}); break
                    case "mkdir": this.cmd_mkentry(args[1], this.pwd, Entry.FOLDER); break
                    case "mkfile": this.cmd_mkentry(args[1], this.pwd, Entry.FILE); break
                    case "rm": tmp = args.filter(a => a.charAt(0) !== "-"); this.cmd_remove(this.image.entry(this.path(tmp[1], args.indexOf("-r") > 0 ? Entry.FOLDER : Entry.FILE, this.pwd)));  break
                    case "chown": tmp = args.filter(a => a.charAt(0) !== "-");
                        this.image.entry(this.path(tmp[1], args.indexOf("-f") > 0 ? Entry.FOLDER : Entry.FILE, this.pwd)).owner = Math.max(0, this.users_list.indexOf(tmp[2])); break
                    case "stat": tmp = args.filter(a => a.charAt(0) !== "-"); entry = this.image.entry(this.path(tmp[1], args.indexOf("-f") > 0 ? Entry.FOLDER : Entry.FILE, this.pwd))
                        this.gui_properties(entry); break
                //Advanced entry update
                    case "chmod": tmp = args.filter(a => (a.charAt(0) !== "-")&&(a.charAt(0) !== "+")); entry = this.image.entry(this.path(tmp[1], args.indexOf("-f") > 0 ? Entry.FOLDER : Entry.FILE, this.pwd))
                        tmp = entry.permissions ;
                        if (args.indexOf("-r") > 0) { tmp.u.r = false } else if (args.indexOf("+r") > 0) { tmp.u.r = true }
                        if (args.indexOf("-w") > 0) { tmp.u.w = false } else if (args.indexOf("+w") > 0) { tmp.u.w = true }
                        if (args.indexOf("-x") > 0) { tmp.u.x = false } else if (args.indexOf("+x") > 0) { tmp.u.x = true }
                        if (args.indexOf("-d") > 0) { tmp.u.d = false } else if (args.indexOf("+d") > 0) { tmp.u.d = true }
                        if (args.indexOf("-R") > 0) { tmp.o.r = false } else if (args.indexOf("+R") > 0) { tmp.o.r = true }
                        if (args.indexOf("-W") > 0) { tmp.o.w = false } else if (args.indexOf("+W") > 0) { tmp.o.w = true }
                        if (args.indexOf("-X") > 0) { tmp.o.x = false } else if (args.indexOf("+X") > 0) { tmp.o.x = true }
                        if (args.indexOf("-D") > 0) { tmp.o.d = false } else if (args.indexOf("+D") > 0) { tmp.o.d = true }
                        entry.permissions = tmp
                        break;
                    case "mv": tmp = args.filter(a => a.charAt(0) !== "-"); entry = this.image.entry(this.path(tmp[1], args.indexOf("-f") > 0 ? Entry.FOLDER : Entry.FILE, this.pwd))
                        try { this.path(path, entry.type, this.pwd) }
                        catch (e) {
                            name = (tmp[2].match(/\/([a-zA-Z.0-9]+)$/)||[, tmp[2]])[1]
                            parent = this.path(tmp[2].replace(new RegExp(name+"$"), ""), Entry.FOLDER, this.pwd); entry.name = name ; entry.parent = parent
                        }
                    break
                //LS
                    case "ls": tmp = args.filter(a => a.charAt(0) !== "-"); tmp = this.entries(this.path(tmp[1]||this.pwd, Entry.FOLDER, this.pwd))
                        type = (line.match(/-type=(FILE|FOLDER)/)||[, "ALL"])[1]
                        if (type !== "ALL") { if (type === "FILE") { tmp = tmp.filter(e => e.file) } if (type === "FOLDER") { tmp = tmp.filter(e => e.folder) } }
                        if (args.indexOf("-a") === -1) { tmp = tmp.filter(e => e.visible) }
                        if (args.indexOf("-l") > 0) { ext = this.image.table_extended ; text = tmp.map(e => { txt = (e.folder ? "f" : "-")
                            if (ext) {
                                p = e.permissions
                                txt += `${p.u.r ? "r" : "-"}${p.u.w ? "w" : "-"}${p.u.x ? "x" : "-"}${p.u.d ? "d" : "-"}`
                                txt += `${p.o.r ? "r" : "-"}${p.o.w ? "w" : "-"}${p.o.x ? "x" : "-"}${p.o.d ? "d" : "-"}`
                            }
                            txt += `\u00a0${((this.users_list[e.owner]||"")+"\u00a0".repeat("6")).substr(0, 6)}`
                            if (ext) { txt += `\u00a0${`${e.edition.d}/${e.edition.m}/${e.edition.y}`}` }
                            txt += `\u00a0${((e.name||"")+"\u00a0".repeat("18")).substr(0, 18)}`

                            return txt
                        }).join("\n") } else { text = tmp.map(e => e.name).join("\n") }
                        li.text(text)
                        break
                    case "tree": tmp = args.filter(a => a.charAt(0) !== "-"); tmp = this.entries(this.path(tmp[1]||this.pwd, Entry.FOLDER, this.pwd)); txt = ""
                        all = (args.indexOf("-a") > 0)
                        let recursion = (es, lv = 0) => {
                            es.map(e => {
                                if ((e.hidden)&&(!all)) { return }
                                txt += `${"\u00a0".repeat(2*lv)+"└─"}${e.name}\n`
                                if (e.folder) { recursion(this.entries(e.id), lv+1) }
                            })
                        }
                        recursion(tmp)
                        li.text(txt)
                        break
                //Encryption
                    case "encrypt": if (this.image.crypted) { throw new Error("Image already encrypted") } li.text(this._gui_encrypt(args[1], +1)); break
                    case "decrypt": if (!this.image.crypted) { throw new Error("Image already decrypted") } li.text(this._gui_encrypt(args[1], +1)); break
                //Sessions
                    case "adduser": args[2] = args[2]||"" ;
                        if (this.users_list.indexOf(args[1]) > 0) { throw new Error("User already exists") } tmp = {} ; tmp[args[1]] = args[2]||"" ;
                        this.update_parsable(Interface.USERS, tmp);
                        $("li:last-child div").text(args[2].length ? line.replace(new RegExp(args[2]+"\s*$"), "****") : `${line} ****`); break
                    case "deluser": args[2] = args[2]||"" ;
                        if (this.users[args[1]] !== args[2]) { throw new Error("Wrong username/password") } if (this.env.USER === args[1]) { throw new Error("Can't delete yourself") } tmp = {} ; tmp[args[1]] = null ;
                        this.update_parsable(Interface.USERS, tmp);
                        $("li:last-child div").text(args[2].length ? line.replace(new RegExp(args[2]+"\s*$"), "****") : `${line} ****`); break
                    case "su" : args[2] = args[2]||"" ;
                        if (this.users[args[1]] !== args[2]) { throw new Error("Wrong username/password") }
                        this.update_parsable(Interface.ENV, {USER:args[1]});
                        $("li:last-child div").text(args[2].length ? line.replace(new RegExp(args[2]+"\s*$"), "****") : `${line} ****`); break
                    case "users": li.text(this.users_list.join("\n")); break;
                //Disk format
                    case "dstat": $(".app-controller [data-app-icon=dstat]").click(); break
                    case "dload": $(".app-controller [data-app-icon=dload]").click(); break
                //Disk formatting
                    case "dformat":
                        //Size
                            size = line.match(/-size=(\d+)x(\d+)/)||[,400, 400]
                        //Clean context
                            ctx = this.image.context
                            ctx.canvas.width = parseInt(size[1]) ; ctx.canvas.height = parseInt(size[2])
                            ctx.fillStyle = 0 ; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                            this.context.empty()
                        //New GUI
                            if (new GUI( new Image(this.image.context, {
                                crypted:0,
                                table:parseInt((line.match(/-table-size=(\d+)/)||[,512])[1]),
                                block:parseInt((line.match(/-block-size=(\d+)/)||[,256])[1]),
                                name:parseInt((line.match(/-entry-name-length=(\d+)/)||[,32])[1]),
                                extended:(line.match(/-table-extended=(y|n)/)||[,"y"])[1] === "y" ? 1 : 0,
                            }), this.context)) { return }
                    case "help": li.text($(`[data-app-help=${args[1]||"help"}]`).text().trim()); break;
                default:
                    throw new Error(`Unknown command ${args[0]}`)
            }
        } catch (e) { li.text(`${e.name} : ${e.message}`).addClass("app-cmd-error") }

        if (li.text().length) { li.html(li.text().replace(/\n/g, "<br>")).appendTo(ul) }
        this._gui_cmd_new_line(ul)
    }

/**
 * Add gui terminal icon to desktop and add its trigger.
 */
    gui_cmd() {
        //Icon
            let icon = this._gui_icon("terminal", GUI.TEXT.TERMINAL).attr("data-app-icon", "cmd").appendTo(this.context)
        //Event
            icon.click(() => {
                let content = this.gui_window(GUI.TEXT.TERMINAL_FULL).addClass("app-windows-terminal").find(".app-windows-content")
                let ul = $(`<ul></ul>`).appendTo(content)
                this._gui_cmd_new_line(ul)
                content.click(() => ul.find("li:last-child div").focus())
            })
    }

/**
 * Create a new line into an instance of gui terminal.
 * @param {DOMElement} ul - Unordered List
 * @private
 */
    _gui_cmd_new_line(ul) {
        //Disable last line
            ul.find("li:last-child div").prop("contenteditable", false).off("keypress").off("keydown")
        //Create new line
            $(`<li>${this.env.USER||""} - ${this.pwd}: <div></div></li>`).appendTo(ul).find("div").prop("contenteditable", true).keypress((ev) => {
                //Enter : eval command
                    if (ev.which === 13) {
                        ev.preventDefault()
                        this._gui_cmd_eval($(ev.target).text().trim(), ul)
                        ul.parent().click()
                    }
            }).keydown(ev => {
                //Tab : complete command
                    if (ev.which === 9) {
                        ev.preventDefault()
                        this._gui_cmd_autocomplete($(ev.target).text().trim(), $(ev.target))
                    }
            }).focus()
    }

/**
 * <pre>
 * Autocompletition helper.
 * Parse user input and :
 * - If it's first argument, it will try to complete command name
 * - If it's second or more, it will either try to complete options name or path
 * Input is completed only if there is only one possibility.
 * </pre>
 * @param {String} line - User input
 * @param {DOMElement} li - User input field
 */
    _gui_cmd_autocomplete (line, li) {
        let auto = []
        let args = line.split(" ").filter(a => a.length)
        if (args.length === 1) { auto = GUI.COMMANDS } else if (args.length > 1) {
            switch (args[1]) {
                case "deluser", "su": auto = this.users_list ; break
                case "dformat": auto = ["-size=", "-table-size=", "-block-size=", "-entry-name-length=", "-table-extended="]; break
                case "help": auto = GUI.COMMANDS ; break
                case "pwd", "env", "whoami", "users", "dstat", "dload", "encrypt", "decrypt": break
                default:
                    let tmpath = args[args.length-1].replace(/\/\w+?$/, "/")
                    try { auto = this.entries(this.path(tmpath, Entry.FILE, this.pwd)).map(e => e.path) } catch (e) {
                        try { auto = this.entries(this.path(tmpath, Entry.FOLDER, this.pwd)).map(e => e.path) } catch (e) {
                            auto = []
                        }
                    }
            }
        }
        let regex = new RegExp("^"+args[args.length-1], "i")
        let filtered = auto.filter(a => regex.test(a))
        if (filtered.length === 1) {
            li.text(line.replace(new RegExp(args[args.length-1]+"\s*$"), filtered[0]))
            //Set caret at end
            let range, sel
            range = document.createRange(); range.selectNodeContents(li.get(0)); range.collapse(false)
            sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range)
        }
    }

/**
 * Create a new folder.
 * @param {String} path - Folder to remove
 * @param {String} [pwd=""] - Path working directory
 * @param {Number} [type="Entry.FOLDER"] - Entry type
 */
    cmd_mkentry(path, pwd = "", type=Entry.FOLDER) {
        let name = (path.match(/\/([a-zA-Z.0-9]+)$/)||[, path])[1]
        let parent = this.path(path.replace(new RegExp(name+"$"), ""), Entry.FOLDER, pwd)
        try { this.path(path, type, pwd) } catch (e) {
            return this.create({
                name, parent, type,
                owner:this.user
            })
        }
    }

/**
 * Remove an entry.
 * @param {Entry} entry - Entry to remove
 */
    cmd_remove(entry) {
        if (entry.folder) {
            let stack = [entry]
            while (stack.length) {
                let folder = stack.pop()
                let entries = this.entries(folder)
                entries.map(entry => (entry.folder ? stack.push(entry) : entry.blank = true))
                folder.blank = true
            }
        } else { entry.blank = true }
    }

            
/**
 * Open a new window which can display content.
 * @param {String} [title=""] - Window title
 * @param {Boolean} [content=false] - If enabled, returns content instead of window
 * @return {jQueryCollection} Created window (or window content)
 */
    gui_window(title = "", content = false) {
        //Windows structure
            let offset = {top:parseInt($(".app-controller .app-windows:last-of-type").css("top"))||GUI.OFFSET.TOP.MIN, left:parseInt($(".app-controller .app-windows:last-of-type").css("left"))||GUI.OFFSET.LEFT.MIN}
            let context = $(`
                <div class="app-windows">
                    <div class="app-windows-bar">
                        <div class="app-windows-title">${title}</div>
                        <div class="app-windows-close">X</div>
                    </div>
                    <div class="app-windows-content">
                    </div>
                </div>`).appendTo(this.context)
        //New window offset
            offset = {
                top:Math.max(0, Math.min(offset.top + GUI.OFFSET.TOP.VAL, GUI.HEIGHT-context.height()-5)),
                left:Math.max(0, Math.min(offset.left + GUI.OFFSET.LEFT.VAL, GUI.WIDTH-context.width()-5))
            }
            context.css("left", offset.left).css("top", offset.top).click(() => { $(".app-windows").removeClass("active"); context.addClass("active") }).addClass("active")
        //Add draggable attribute
            context.find(".app-windows-bar").mousedown((ev) => GUI.DRAGGING = {x:ev.pageX, y:ev.pageY, context})

        //Close event
            context.find(".app-windows-close").click(() => context.remove())
            return content ? context.find(".app-windows-content") : context
    }

/**
 * Init GUI windows dragging.
 */
    _gui_window_dragging() {
        $(".app-controller").mouseup(() => GUI.DRAGGING = false)
            .mousemove(ev => this._gui_window_dragged(ev))
    }

/**
 * Callback when a gui window is dragged.
 * @param {Event} ev - Event data
 */
    _gui_window_dragged (ev) {
        if (GUI.DRAGGING) {
            let dragging =  GUI.DRAGGING, context = dragging.context
            let local = {x:parseInt(context.css("left")) + ev.pageX-dragging.x, y:parseInt(context.css("top")) + ev.pageY-dragging.y}
            GUI.DRAGGING = {x:ev.pageX, y:ev.pageY, context}
            context.css("left", Math.max(0, Math.min(local.x,  GUI.WIDTH-context.width()-5))).css("top", Math.max(0, Math.min(local.y, GUI.HEIGHT-context.height()-5)))
        }
    }

/**
 * Display an error message.
 * @param {Error} e - Error
 */
    gui_error(e) {
        this.gui_window(e.name).addClass("app-windows-error").find(".app-windows-content").append(`<table><tr><td><img src="${GUI.ICONS.ERROR}" /></td><td>${e.message}</td></tr></table>`)
    }

/**
 * Display an alert text.
 * @param {String} title - Title
 * @param {String} text - Text
 * @param {Function} callback - Callback called when button is called
 */
    gui_alert(title, text, callback) {
        //Show alert
            let content = this.gui_window(title).addClass("app-input").find(".app-windows-content")
            content.append(`<table>
                <tr><td class="app-alert-msg">${text}</td></tr>
                <tr><td><button>${GUI.TEXT.VALIDATE}</button></td></tr>
            </table>`)
        //Link callback
            if (callback) { content.find("button").click(() => { callback() }) } else { content.find("button").click(() => { content.parent().remove() }) }
            return content
    }

        }
        
//Invert direction context once % is reached
    GUI.INVERT_CONTEXT = 0.7
//New contxt offset
    GUI.OFFSET = {}
    GUI.OFFSET.TOP = {VAL:10, MIN:40}
    GUI.OFFSET.LEFT = {VAL:10, MIN:60}

//Dimensions
    Object.defineProperty(GUI, "WIDTH", {get() { return $(".app-controller").width() } })
    Object.defineProperty(GUI, "HEIGHT", {get() { return $(".app-controller").height() } })
    GUI.WINDOW_WIDTH  = 300
    GUI.WINDOW_HEIGHT  = 250

//Set of available commands (used for [Autocompletition]{@link GUI#_gui_cmd_autocomplete}).
    GUI.COMMANDS = ["pwd", "env", "whoami", "users", "dstat", "dload", "encrypt", "decrypt", "adduser", "deluser", "su", "explorer", "terminal", "edit", "play", "display", "exec", "cd", "mkdir", "mkfile", "dformat", "help", "rm", "chown", "stat", "chmod", "mv", "ls", "tree"]


/**
 * Texts.
 * @type {Object}
 * @memberof GUI
 */
    GUI.TEXT = {
        MK_NEW_FILE:$(".text-mk-new-file").text(),
        MK_NEW_FOLDER:$(".text-mk-new-folder").text(),
        PROPERTIES:$(".text-properties").text(),
        NAME:$(".text-name").text(),
        PARENT:$(".text-parent").text(),
        BLOCK:$(".text-block").text(),
        SIZE:$(".text-size").text(),
        TYPE:$(".text-type").text(),
        FILE:$(".text-type-file").text(),
        FOLDER:$(".text-type-folder").text(),
        VISIBILITY:$(".text-visibility").text(),
        VISIBLE:$(".text-visibility-visible").text(),
        HIDDEN:$(".text-visibility-hidden").text(),
        OWNER:$(".text-owner").text(),
        CREATION:$(".text-date-creation").text(),
        EDITION:$(".text-date-edition").text(),
        PERMISSIONS:$(".text-permissions").text(),
        PERMISSIONS_OWNER:$(".text-permissions-owner").text(),
        PERMISSIONS_OTHERS:$(".text-permissions-others").text(),
        PERMISSIONS_R:$(".text-permissions-r").text(),
        PERMISSIONS_W:$(".text-permissions-w").text(),
        PERMISSIONS_X:$(".text-permissions-x").text(),
        PERMISSIONS_D:$(".text-permissions-d").text(),
        PERMISSIONS_Y:$(".text-permissions-yes").text(),
        PERMISSIONS_N:$(".text-permissions-no").text(),
        TERMINAL:$(".text-terminal").text(),
        TERMINAL_FULL:$(".text-terminal-full").text(),
        SESSIONS:$(".text-sessions").text(),
        LOGGED_AS:$(".text-sessions-logged-as").text(),
        SESSIONS_USER:$(".text-sessions-user").text(),
        SESSIONS_PASSWORD:$(".text-sessions-password").text(),
        SESSIONS_REMOVE:$(".text-sessions-remove").text(),
        SESSIONS_CREATE:$(".text-sessions-create").text(),
        SESSIONS_LOGIN:$(".text-sessions-login").text(),
        MOVE_TO:$(".text-move-to").text(),
        VALIDATE:$(".text-validate").text(),
        INVALID_PATH:$(".text-move-to-invalid-path").text(),
        IMAGE_MANAGER:$(".text-image-manager").text(),
        CONFIG:$(".text-config").text(),
        CONFIG_Y:$(".text-config-yes").text(),
        CONFIG_N:$(".text-config-no").text(),
        CONFIG_SIGNATURE:$(".text-config-signature").text(),
        CONFIG_CRYPTED:$(".text-config-crypted").text(),
        CONFIG_SIZE:$(".text-config-size").text(),
        CONFIG_USED:$(".text-config-used").text(),
        CONFIG_FREE:$(".text-config-free").text(),
        CONFIG_WIDTH:$(".text-config-width").text(),
        CONFIG_HEIGHT:$(".text-config-height").text(),
        CONFIG_TABLE_SIZE:$(".text-config-table-size").text(),
        CONFIG_TABLE_EXTENDED:$(".text-config-extended").text(),
        CONFIG_ENTRY_NAME:$(".text-config-entry-name").text(),
        CONFIG_BLOCK_SIZE:$(".text-config-block-size").text(),
        CONFIG_BLOCK_NUMBER:$(".text-config-block-number").text(),
        ENCRYPTION:$(".text-encryption").text(),
        ENCRYPTION_TOOL:$(".text-encryption-tool").text(),
        ENCRYPTION_KEY:$(".text-encryption-key").text(),
        ENCRYPTION_ENCRYPT:$(".text-encryption-encrypt").text(),
        ENCRYPTION_DECRYPT:$(".text-encryption-decrypt").text(),
        ENCRYPTION_MISSING_KEY:$(".text-encryption-missing-key").text(),
        ENCRYPTION_SUCCESS:$(".text-encryption-success").text(),
        DECRYPTION_SUCCESS:$(".text-decryption-success").text(),
        SESSIONS_create_DONE:$(".text-sessions-create-done").text(),
        SESSIONS_remove_DONE:$(".text-sessions-remove-done").text(),
        SESSIONS_login_DONE:$(".text-sessions-login-done").text(),
        IMAGE_MANAGER_STEGANO:$(".text-image-manager-stegano").text(),
        EXPLORER:$(".text-explorer").text(),
        STEGANOGRAPHY_TOOL:$(".text-steganography-tool").text(),
        OPEN_WITH:$(".text-open-with").text(),
        RENAME:$(".text-rename").text(),
        REMOVE:$(".text-remove").text(),
        OPEN_WITH_TEXT:$(".text-open-with-text").text(),
        OPEN_WITH_IMAGE:$(".text-open-with-image").text(),
        OPEN_WITH_AUDIO:$(".text-open-with-audio").text(),
        OPEN_WITH_CMD:$(".text-open-with-cmd").text(),
        STEGANOGRAPHY_INFO:$(".text-steganography-info").text(),
        SCRIPT:$(".text-script-msg").text(),
        SHOW_HIDDEN:$(".text-show-hidden").text(),
        CLIPPY:$(".text-clippy-msg").text()
    }

/**
 * Paths to icons.
 * @type {Object}
 * @memberof GUI
 */
    GUI.ICONS = {
        _DIR:"gui/",
        SAVE:"gui/save.png",
        IMG:"gui/file-img.png",
        AUDIO:"gui/file-audio.png",
        TEXT:"gui/file-text.png",
        CONF:"gui/file-conf.png",
        CMD:"gui/file-cmd.png",
        ERROR:"gui/error.png",
        FOLDER_EMPTY:"gui/folder-empty.png",
        FOLDER_FILES:"gui/folder-files.png"
    }


        global.Lowlight.FileSystem = {Block, Entry, Utf8, Image, PictureImage, Interface, GUI}
})(typeof window !== "undefined" ? window : this)
