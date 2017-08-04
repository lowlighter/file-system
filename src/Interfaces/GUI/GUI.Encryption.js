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
