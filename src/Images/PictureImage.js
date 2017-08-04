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
                        if (this.constructor.name === "PictureImage") { this.size = this._size * 0.75 * 0.25 }
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
