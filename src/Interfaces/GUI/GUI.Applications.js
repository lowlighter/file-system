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
