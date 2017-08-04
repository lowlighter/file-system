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
                    figure.find("img").attr("src", "/src/file-system/gui/file-img.png")
                    figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry).gui_display(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                } else
                if (/\.(?:mp3|mpeg|ogg|wav)$/.test(entry.name)) {
                    figure.find("img").attr("src", "/src/file-system/gui/file-audio.png")
                    figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry).gui_play(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                } else
                if (/\.txt$/.test(entry.name)) {
                    figure.find("img").attr("src", "/src/file-system/gui/file-text.png")
                    figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry).gui_edit(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                } else
                if (/\.conf$/.test(entry.name)) {
                    figure.find("img").attr("src", "/src/file-system/gui/file-conf.png")
                    figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry).gui_edit(entry.path, entry.content) } catch (e) { this.gui_error(e) } })
                }
                if (/\.cmd$/.test(entry.name)) {
                    figure.find("img").attr("src", "/src/file-system/gui/file-cmd.png")
                    figure.click((ev) => { ev.stopPropagation() ; try { this.privileges(entry, "x").gui_execute(entry.content) } catch (e) { this.gui_error(e) } })
                }
        //Folder link
            } else if (entry.folder) {
                figure.find("img").attr("src", `/src/file-system/gui/folder-${this.entries(entry.id).length ? "files" : "empty"}.png`)
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
            <img src="/src/file-system/gui/${src}.png">
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
                            menu.find("li:nth-child(1)").click((ev) => { try { this.privileges(this.image.entry(npath), "w").gui_mkfile(lpath, context) } catch (e) { this.gui_error(e) } })
                            menu.find("li:nth-child(2)").click((ev) => { try { this.privileges(this.image.entry(npath), "w").gui_mkdir(lpath, context) } catch (e) { this.gui_error(e) } })
                            menu.find("li:nth-child(3)").click((ev) => { context.attr("data-hidden", context.attr("data-hidden") == "show" ? "hidden" : "show") })
                            menu.find("li:nth-child(4)").click((ev) => { try { this.gui_properties(this.image.entry(npath)) } catch (e) { this.gui_error(e) } })
                            if (npath == 0) { menu.find("li:nth-child(4)").remove() }
                    })
            }
        //Update path directory and clean icons
            let content = context.attr("data-path", path).find(".app-windows-title").text(path).end().find("figure").remove().end().find(".app-windows-content")
        //Add entries icons (and parent directory if not root)
            let entries = this.entries(folder)
            if (folder !== Entry.ROOT) { this._gui_icon("folder-parent", "../").appendTo(content).click(() => this.gui_list(this.image.entry(folder).parent.path, context)) }
            entries.sort((a, b) => {
                if ((a.folder)&&(!b.folder)) { return -1 }
                if ((!a.folder)&&(b.folder)) { return +1 }
                return a.name > b.name
            })
            entries.map(entry => this.gui_icon(entry, context))
        } catch (e) { this.gui_error(e) }
    }
