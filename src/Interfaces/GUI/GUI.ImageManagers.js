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
