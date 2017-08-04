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
