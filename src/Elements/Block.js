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
