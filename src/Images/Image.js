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
                        if (this.constructor.name === "Image") { this.size = this._size * 0.75 }
                        this.signature = Image.SIGNATURE[this.constructor.name.toLocaleUpperCase()]||Image.SIGNATURE.UNKNOWN
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
